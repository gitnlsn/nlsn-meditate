import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { CACHE_DIR } from './config.mjs';
import { cacheKey } from './cache.mjs';
import { probeDuration } from './ffmpeg.mjs';

/**
 * Plausible speaking rate in characters per second. Measured from a known-good
 * Luna render, whose lines ran 10.0-15.4 cps; the band is widened well past that
 * so only physically impossible pairings trip it.
 */
const MIN_CPS = 6;
const MAX_CPS = 24;

function run(bin, args) {
  return new Promise((resolve, reject) => {
    const c = spawn(bin, args);
    let stderr = '';
    c.stderr.on('data', (d) => (stderr += d));
    c.on('error', reject);
    c.on('close', (code) => (code === 0 ? resolve(stderr) : reject(new Error(stderr.slice(-1500)))));
  });
}

/**
 * Find the pauses a TTS engine leaves between sentences when it reads a whole
 * script in one pass. These are what we cut on.
 */
export async function detectSilences(file, { threshold = -40, minGap = 0.35 } = {}) {
  const stderr = await run('ffmpeg', [
    '-hide_banner', '-i', file,
    '-af', `silencedetect=noise=${threshold}dB:d=${minGap}`,
    '-f', 'null', '-',
  ]);

  const silences = [];
  let open = null;
  for (const line of stderr.split('\n')) {
    const s = line.match(/silence_start:\s*(-?[\d.]+)/);
    if (s) { open = Number.parseFloat(s[1]); continue; }
    const e = line.match(/silence_end:\s*([\d.]+)/);
    if (e && open !== null) {
      silences.push({ start: Math.max(0, open), end: Number.parseFloat(e[1]) });
      open = null;
    }
  }
  return silences;
}

/** Invert the silence list into the spans that actually contain speech. */
export function speechRegions(silences, duration, { minSpeech = 0.15 } = {}) {
  const regions = [];
  let cursor = 0;
  for (const s of silences) {
    if (s.start - cursor > minSpeech) regions.push({ start: cursor, end: s.start });
    cursor = s.end;
  }
  if (duration - cursor > minSpeech) regions.push({ start: cursor, end: duration });
  return regions;
}

/**
 * Detection splits on every pause, but a TTS engine pauses at commas too - so a
 * line can arrive as several regions. Rather than demand break tags, group the
 * regions back into exactly one span per line.
 *
 * The signal is proportion: a line that is 13% of the script's characters should
 * be about 13% of its speech time. This finds the contiguous grouping whose
 * duration shares best match the lines' character shares, which merges
 * comma-splits without ever reordering audio.
 */
export function alignRegionsToLines(regions, lines) {
  const M = regions.length;
  const N = lines.length;
  if (M < N) return null;

  const totalDur = regions.reduce((n, r) => n + (r.end - r.start), 0);
  const totalChars = lines.reduce((n, l) => n + l.length, 0);
  if (!totalDur || !totalChars) return null;

  const share = regions.map((r) => (r.end - r.start) / totalDur);
  const expected = lines.map((l) => l.length / totalChars);

  const prefix = [0];
  for (const d of share) prefix.push(prefix[prefix.length - 1] + d);

  const cost = Array.from({ length: N + 1 }, () => new Array(M + 1).fill(Infinity));
  const from = Array.from({ length: N + 1 }, () => new Array(M + 1).fill(-1));
  cost[0][0] = 0;

  for (let j = 1; j <= N; j++) {
    for (let i = j; i <= M - (N - j); i++) {
      for (let k = j - 1; k < i; k++) {
        if (cost[j - 1][k] === Infinity) continue;
        const c = cost[j - 1][k] + Math.abs(prefix[i] - prefix[k] - expected[j - 1]);
        if (c < cost[j][i]) { cost[j][i] = c; from[j][i] = k; }
      }
    }
  }
  if (cost[N][M] === Infinity) return null;

  const groups = [];
  let i = M;
  for (let j = N; j >= 1; j--) {
    const k = from[j][i];
    groups.unshift({ start: regions[k].start, end: regions[i - 1].end, merged: i - k });
    i = k;
  }
  return { groups, error: cost[N][M] };
}

async function extract(source, region, output, pad) {
  const start = Math.max(0, region.start - pad);
  await run('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-i', source,
    '-ss', start.toFixed(3), '-to', (region.end + pad).toFixed(3),
    '-c:a', 'libmp3lame', '-b:a', '128k',
    output,
  ]);
  return output;
}

/**
 * Cut one continuous render into per-line clips and file them in the TTS cache
 * under the keys the build expects, so `build` then runs entirely from cache.
 *
 * Only works when the render's pause structure matches the script's line
 * structure. When the counts disagree we stop and show both, rather than
 * silently pairing the wrong audio to the wrong line.
 */
/**
 * The right silence threshold depends on the render's noise floor, and the right
 * gap depends on how the voice phrases - neither is knowable up front. So sweep
 * them and keep the setting that yields at least one region per line with the
 * fewest spare regions, since every spare one is a merge the alignment has to
 * guess at.
 */
export async function autoTune(audioFile, duration, wanted) {
  const attempts = [];
  for (const threshold of [-30, -35, -25, -40]) {
    for (const minGap of [0.15, 0.2, 0.25, 0.3, 0.4, 0.5]) {
      const silences = await detectSilences(audioFile, { threshold, minGap });
      const regions = speechRegions(silences, duration);
      attempts.push({ threshold, minGap, regions, count: regions.length });
    }
  }
  const viable = attempts.filter((a) => a.count >= wanted);
  if (!viable.length) return { best: null, attempts };
  viable.sort((a, b) => a.count - b.count || b.minGap - a.minGap);
  return { best: viable[0], attempts };
}

export async function splitIntoCache(script, audioFile, opts = {}) {
  const { pad = 0.05, dryRun = false } = opts;

  const duration = await probeDuration(audioFile);
  const spoken = script.segments.filter((s) => s.say);

  let threshold = opts.threshold;
  let minGap = opts.minGap;
  let silences;
  let regions;

  if (threshold == null || minGap == null) {
    const { best } = await autoTune(audioFile, duration, spoken.length);
    if (!best) {
      return {
        duration, silences: [], regions: [],
        expected: spoken.length, found: 0, tuneFailed: true,
      };
    }
    ({ threshold, minGap, regions } = best);
    silences = await detectSilences(audioFile, { threshold, minGap });
  } else {
    silences = await detectSilences(audioFile, { threshold, minGap });
    regions = speechRegions(silences, duration);
  }

  const result = {
    duration, silences, regions, threshold, minGap,
    expected: spoken.length, found: regions.length,
  };

  // Exact match needs no alignment; more regions than lines means pauses inside
  // lines, which the proportional alignment can group back together.
  let spans = regions;
  if (regions.length !== spoken.length) {
    const aligned = alignRegionsToLines(regions, spoken.map((s) => s.say));
    if (!aligned) return result;
    spans = aligned.groups;
    result.aligned = true;
    result.alignError = aligned.error;
  }
  result.spans = spans;

  // A best-fit grouping is still only a guess. Speech has a physical rate, so
  // check each pairing against it: a 42-character line cannot occupy 0.29s.
  // Without this the DP reports success while pairing lines to the wrong audio.
  const rates = spans.map((sp, i) => ({
    index: i,
    text: spoken[i].say,
    seconds: sp.end - sp.start,
    rate: spoken[i].say.length / (sp.end - sp.start),
  }));
  const implausible = rates.filter((r) => r.rate < MIN_CPS || r.rate > MAX_CPS);
  result.rates = rates;
  result.implausible = implausible;
  if (implausible.length) return result;

  if (dryRun) return result;

  await fs.mkdir(CACHE_DIR, { recursive: true });
  const written = [];
  for (const [i, region] of spans.entries()) {
    const seg = spoken[i];
    const key = cacheKey(seg.say, script.voice);
    const out = path.join(CACHE_DIR, `${key}.mp3`);
    await extract(audioFile, region, out, pad);
    written.push({
      text: seg.say, seconds: region.end - region.start, merged: region.merged ?? 1, file: out,
    });
  }
  result.written = written;
  return result;
}
