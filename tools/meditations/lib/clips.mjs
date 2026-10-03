import fs from 'node:fs/promises';
import path from 'node:path';
import { BUILD_DIR, ROOT, SPEECH_DIRS, SPEECH_LUFS, SYNTH_CONCURRENCY } from './config.mjs';
import { cacheKey, readCache, writeCache } from './cache.mjs';
import { synthWithRetry } from './providers.mjs';
import { decodeToWork, concat, measureLoudness, encodeClip } from './ffmpeg.mjs';
import { mapLimit } from './assemble.mjs';
import { writeAudioIntoScript } from './map.mjs';

/** Never push a clip closer to full scale than this, whatever the loudness target asks. */
const CLIP_TRUE_PEAK = -1.5;

/** "Let your jaw hang loose." -> "let-your-jaw-hang-loose" */
function slug(text, max = 48) {
  const words = text
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(' ');
  let out = '';
  for (const w of words) {
    if (out && out.length + w.length + 1 > max) break;
    out = out ? `${out}-${w}` : w;
  }
  return out;
}

/**
 * Render a script into the per-line clips the app bundles, with no hands in the
 * loop: synthesise every spoken line, trim the silence TTS leaves around it,
 * bring the whole script to one loudness, and write the filenames back into the
 * script so `manifest` can pick them up.
 *
 * Each line is synthesised alone, so a re-worded line costs one line - but with
 * its neighbours passed as context, so the voice still reads the script as one
 * continuous text rather than resetting its pitch at every line.
 *
 * The gain is one number for the whole script, not per clip: a meditation is
 * meant to get quieter as it settles, and levelling every line would flatten
 * exactly that.
 */
export async function synthClips(script, { onProgress, dryRun = false } = {}) {
  const spoken = script.segments
    .map((seg, index) => ({ ...seg, index }))
    .filter((seg) => seg.say);

  const jobs = spoken.map((seg, n) => ({
    ...seg,
    name: `${String(n + 1).padStart(2, '0')}-${slug(seg.say)}.mp3`,
    context: {
      previousText: spoken[n - 1]?.say ?? null,
      nextText: spoken[n + 1]?.say ?? null,
    },
  }));

  // What a run would bill: every line whose exact render is not cached yet.
  for (const job of jobs) {
    job.key = cacheKey(job.say, script.voice, job.context);
    job.cached = await readCache(job.key, script.provider.ext);
  }
  const billable = jobs.filter((j) => !j.cached).reduce((n, j) => n + j.say.length, 0);
  if (dryRun) return { billable, lines: jobs.length };

  let done = 0;
  await mapLimit(jobs, SYNTH_CONCURRENCY, async (job) => {
    if (!job.cached) {
      const buffer = await synthWithRetry(script.provider, job.say, script.voice, { context: job.context });
      job.cached = await writeCache(job.key, script.provider.ext, buffer);
    }
    onProgress?.({ done: ++done, total: jobs.length });
  });

  const workDir = path.join(BUILD_DIR, '.work', `clips-${script.locale}-${script.id}`);
  await fs.rm(workDir, { recursive: true, force: true });
  await fs.mkdir(workDir, { recursive: true });

  for (const job of jobs) {
    job.work = await decodeToWork(job.cached, path.join(workDir, job.name.replace(/\.mp3$/, '.wav')));
  }

  // Measured over the speech alone, the way it will be heard back to back.
  const all = await concat(jobs.map((j) => j.work), path.join(workDir, 'all.wav'), workDir);
  const before = await measureLoudness(all);
  const gain = Math.min(SPEECH_LUFS - before.integrated, CLIP_TRUE_PEAK - before.truePeak);

  const outDir = path.join(ROOT, SPEECH_DIRS[script.locale], script.id);
  await fs.mkdir(outDir, { recursive: true });
  for (const job of jobs) await encodeClip(job.work, path.join(outDir, job.name), gain);

  // Clips from an earlier wording of the script would otherwise ship forever.
  const keep = new Set(jobs.map((j) => j.name));
  const stale = (await fs.readdir(outDir)).filter((f) => f.endsWith('.mp3') && !keep.has(f));
  for (const f of stale) await fs.rm(path.join(outDir, f));

  await writeAudioIntoScript(script, jobs.map((j) => ({ line: { index: j.index }, file: j.name })));
  await fs.rm(workDir, { recursive: true, force: true });

  return {
    billable,
    lines: jobs.length,
    gain: Number(gain.toFixed(1)),
    loudness: Number((before.integrated + gain).toFixed(1)),
    stale: stale.length,
    dir: outDir,
  };
}
