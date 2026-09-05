import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { ROOT, GUIDED_CATEGORIES } from './config.mjs';
import { probeDuration, measureLoudness } from './ffmpeg.mjs';
import { SPEECH_DIR } from './map.mjs';

export const ENV_DIR = 'assets/audios/environments';
export const AMBIENCE_DIR = 'assets/audios/ambiences';
export const CONSTANTS_DIR = 'constants';

/** Every bed is levelled here so switching between them does not jump in volume. */
const AMBIENCE_LUFS = -30;
const AMBIENCE_TRUE_PEAK = -3;

/**
 * Candidate lengths for the fold that makes a bed loop on itself.
 *
 * The beds are repeated by the player natively now, so a file has to join back
 * to its own beginning with nobody in the app awake to help it. Cross-fading the
 * tail over the head does that — but how long the fold should be turns out to
 * depend entirely on the material, and not in any direction you could guess.
 * Measured across these beds, four seconds was the *worst* available choice for
 * both the tonal drone and the birdsong, while eight suited one and half a
 * second suited the other: uncorrelated stretches of the same recording partly
 * cancel, and how much they cancel depends on what is in them.
 *
 * So the length is not chosen, it is measured. Every candidate is folded and the
 * seam compared against the bed's own quiet floor; the one that dips least wins.
 */
const LOOP_CROSSFADES = [0.5, 1, 2, 3, 4, 6, 8];

/** The longest fold worth trying is a quarter of what there is to fold. */
const MAX_CROSSFADE_FRACTION = 0.25;

/**
 * How far past a measured fade to start cutting. `measureFades` finds where the
 * level crosses -3dB, which is partway up the ramp, so the shoulder either side
 * needs trimming too or a little of the original fade survives into the loop.
 */
const EDGE_MARGIN = 0.5;

/**
 * Beds are trimmed to this before bundling. They loop regardless, so the extra
 * minutes only cost binary size - the full-length set came to 20MB. Long enough
 * that the repeat is not obvious, short enough to ship.
 */
const MAX_AMBIENCE_SECONDS = 150;

/** Broadband, played quietly under a voice; 96k AAC is transparent enough here. */
const AMBIENCE_BITRATE = '96k';

const TITLES = {
  'cafe-environment-01': 'Café',
  'nature-01': 'Natureza',
  'nature-02': 'Floresta',
  'nature-birds-01': 'Pássaros',
  'nature-camp-fire-01': 'Fogueira',
  'nature-ocean-01': 'Oceano',
  'nature-river-01': 'Rio',
  'street-environment-01': 'Rua',
  'tonal-bed-01': 'Tons',
};

function run(bin, args) {
  return new Promise((resolve, reject) => {
    const c = spawn(bin, args);
    let err = '';
    c.stderr.on('data', (d) => (err += d));
    c.on('error', reject);
    c.on('close', (code) => (code === 0 ? resolve(err) : reject(new Error(err.slice(-1500)))));
  });
}

/**
 * Where the audio fades in and out, measured as momentary loudness relative to
 * the body of the recording. Needed because the player has to know how early to
 * start the next copy.
 */
export async function measureFades(file) {
  const stderr = await run('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', 'ebur128', '-f', 'null', '-']);

  const points = [];
  for (const line of stderr.split('\n')) {
    const m = line.match(/t:\s*([\d.]+).*?M:\s*(-?[\d.]+|-inf)/);
    if (m) points.push([Number.parseFloat(m[1]), m[2] === '-inf' ? -120 : Number.parseFloat(m[2])]);
  }
  if (!points.length) return { fadeIn: 0, fadeOut: 0, body: -120 };

  const duration = points[points.length - 1][0];
  const middle = points.filter(([t]) => t > duration * 0.3 && t < duration * 0.7).map(([, m]) => m).sort((a, b) => a - b);
  const body = middle[Math.floor(middle.length / 2)] ?? -120;

  const upIn = points.find(([, m]) => m > body - 3);
  const upOut = [...points].reverse().find(([, m]) => m > body - 3);

  return {
    body,
    fadeIn: upIn ? upIn[0] : 0,
    fadeOut: upOut ? duration - upOut[0] : 0,
  };
}

/**
 * Fold `crossfade` seconds of the tail back over the head.
 *
 * The result runs from body time `crossfade` round to body time `crossfade`, so
 * playing it end to end joins onto itself. Equal-power (`qsin`) rather than the
 * default linear curve: the two sides are uncorrelated stretches of one
 * recording, and summing them linearly dips about 3dB at exactly the point a dip
 * would be heard every time round.
 */
async function foldLoop(body, out, crossfade) {
  const d = crossfade.toFixed(3);
  await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y',
    '-i', body, '-i', body,
    '-filter_complex',
    `[0:a]atrim=start=${d},asetpts=N/SR/TB[rest];`
    + `[1:a]atrim=start=0:end=${d},asetpts=N/SR/TB[head];`
    + `[rest][head]acrossfade=d=${d}:c1=qsin:c2=qsin[out]`,
    '-map', '[out]', '-c:a', 'pcm_s16le', out]);
  return out;
}

/**
 * How far the loop point dips below the bed's own quiet floor, in dB.
 *
 * Measured by playing the file into itself and reading momentary loudness across
 * the join. Compared against the tenth percentile of the whole file rather than
 * its average, because these are ambient recordings: they have quiet moments
 * everywhere, and a seam is only a fault if it is quieter than they are. Zero or
 * above means the wrap is indistinguishable from the material around it.
 */
async function measureSeamDip(file) {
  const duration = await probeDuration(file);
  const stderr = await run('ffmpeg', ['-hide_banner', '-nostats',
    '-i', file, '-i', file,
    '-filter_complex', '[0][1]concat=n=2:v=0:a=1,ebur128', '-f', 'null', '-']);

  const points = [];
  for (const line of stderr.split('\n')) {
    const m = line.match(/t:\s*([\d.]+).*?M:\s*(-?[\d.]+|-inf)/);
    if (!m) continue;
    const momentary = m[2] === '-inf' ? -120 : Number.parseFloat(m[2]);
    if (momentary > -100) points.push([Number.parseFloat(m[1]), momentary]);
  }
  if (!points.length) return 0;

  const sorted = points.map(([, m]) => m).sort((a, b) => a - b);
  const floor = sorted[Math.floor(sorted.length * 0.1)];
  const seam = points.filter(([t]) => t > duration - 1 && t < duration + 1).map(([, m]) => m);
  if (!seam.length) return 0;

  return Math.min(...seam) - floor;
}

/**
 * Turn every bed into a seamless loop, and level it.
 *
 * The sources ship with a fade at each end, which is exactly wrong for a file
 * meant to repeat: a wrap would dip to silence for several seconds every time
 * round. So both fades are cut off and the tail is cross-faded back over the
 * head, leaving a file whose last sample joins its first.
 *
 * Levelling is a single linear gain, not loudnorm. loudnorm's dynamic fallback
 * lifts quiet passages, which would pump audibly across the loop point - and the
 * voice pipeline's loudnorm also forces mono, which would collapse the stereo
 * image these beds rely on. Channels and sample rate pass through untouched.
 */
export async function processAmbiences({ onProgress } = {}) {
  const srcDir = path.join(ROOT, ENV_DIR);
  const outDir = path.join(ROOT, AMBIENCE_DIR);
  await fs.mkdir(outDir, { recursive: true });

  const files = (await fs.readdir(srcDir)).filter((f) => f.endsWith('.mp3')).sort();
  const results = [];

  for (const file of files) {
    const id = path.basename(file, '.mp3').replace(/-faded$/, '');
    const src = path.join(srcDir, file);
    const out = path.join(outDir, `${id}.m4a`);
    const work = path.join(outDir, `.${id}.wav`);

    const sourceFades = await measureFades(src);
    const sourceDuration = await probeDuration(src);

    // Stage 1a: cut the mastered fades off both ends and cap the length. What
    // is left is flat recording, which is the only thing that can be looped.
    const bodyStart = sourceFades.fadeIn + EDGE_MARGIN;
    const longest = LOOP_CROSSFADES[LOOP_CROSSFADES.length - 1];
    const bodyEnd = Math.min(
      sourceDuration - sourceFades.fadeOut - EDGE_MARGIN,
      bodyStart + MAX_AMBIENCE_SECONDS + longest,
    );
    const bodyLength = bodyEnd - bodyStart;
    const trimmed = bodyStart + MAX_AMBIENCE_SECONDS + longest
      < sourceDuration - sourceFades.fadeOut - EDGE_MARGIN;

    const body = path.join(outDir, `.${id}-body.wav`);
    await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y',
      '-ss', bodyStart.toFixed(3), '-to', bodyEnd.toFixed(3), '-i', src,
      '-c:a', 'pcm_s16le', body]);

    // Stage 1b: fold the tail over the head, at whichever length leaves the
    // least audible join. Levelling is a linear gain, so it cannot change which
    // fold wins - measuring here, before it, is safe and saves nine encodes.
    const candidates = LOOP_CROSSFADES.filter((x) => x <= bodyLength * MAX_CROSSFADE_FRACTION);
    const tried = [];
    const probe = path.join(outDir, `.${id}-probe.wav`);

    for (const candidate of candidates.length ? candidates : [Math.max(0.25, bodyLength / 8)]) {
      await foldLoop(body, probe, candidate);
      tried.push({ crossfade: candidate, dip: await measureSeamDip(probe) });
    }
    await fs.rm(probe, { force: true });

    const best = tried.reduce((a, b) => (b.dip > a.dip ? b : a));
    await foldLoop(body, work, best.crossfade);
    await fs.rm(body, { force: true });

    // Stage 2: level what will actually ship, then hold the ceiling.
    const level = await measureLoudness(work);
    const gain = AMBIENCE_LUFS - level.integrated;
    const ceiling = 10 ** (AMBIENCE_TRUE_PEAK / 20);

    const filters = [];
    if (Math.abs(gain) > 0.05) filters.push(`volume=${gain.toFixed(2)}dB`);
    filters.push(`alimiter=limit=${ceiling.toFixed(4)}:level=false`);

    await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', work,
      '-af', filters.join(','),
      '-c:a', 'aac', '-b:a', AMBIENCE_BITRATE, '-movflags', '+faststart', out]);

    await fs.rm(work, { force: true });

    const finalLevel = await measureLoudness(out);
    const { size } = await fs.stat(out);

    /*
     * Reported as zero, and kept only so the field does not vanish from under
     * anything still reading it. A seamless loop has no fade at either end -
     * that is what makes it seamless - so there is no longer a ramp for a player
     * to overlap the next copy with, and nothing left to measure.
     */
    results.push({
      id,
      title: TITLES[id] ?? id.replace(/-/g, ' '),
      file: path.basename(out),
      durationSeconds: Number((await probeDuration(out)).toFixed(3)),
      fadeInSeconds: 0,
      fadeOutSeconds: 0,
      loopCrossfade: Number(best.crossfade.toFixed(2)),
      /**
       * How far the wrap dips below the bed's own quiet floor, in dB. At or
       * above zero the loop point is indistinguishable from the recording.
       */
      seamDip: Number(best.dip.toFixed(1)),
      loudness: Number(finalLevel.integrated.toFixed(1)),
      gainApplied: Number(gain.toFixed(2)),
      trimmed,
      bytes: size,
    });
    onProgress?.(results[results.length - 1]);
  }

  return results;
}

/** Total wall-clock length of a session: every clip, every silence, both ends. */
function totalDuration(script, clipSeconds) {
  const speech = script.segments.reduce((n, s, i) => n + (s.say ? clipSeconds[i] : 0), 0);
  const silence = script.segments.reduce((n, s) => n + s.wait, 0) + script.leadIn + script.leadOut;
  return speech + silence;
}

/**
 * A script with no recordings yet is skipped rather than fatal, so a newly
 * written script can sit in the repo while its audio is still being produced
 * without blocking regeneration of everything else.
 */
export async function buildGuidedManifest(scripts) {
  const out = [];
  const skipped = [];

  for (const script of scripts) {
    const spoken = script.segments.filter((s) => s.say);
    const unmapped = spoken.filter((s) => !s.audio).length;
    if (unmapped) {
      skipped.push({ id: script.id, unmapped, total: spoken.length });
      continue;
    }

    const clipSeconds = [];
    for (const [i, seg] of script.segments.entries()) {
      if (!seg.say) { clipSeconds[i] = 0; continue; }
      clipSeconds[i] = await probeDuration(path.join(ROOT, SPEECH_DIR, script.id, seg.audio));
    }
    out.push({
      id: script.id,
      category: script.category,
      title: script.title,
      description: script.description,
      leadInSeconds: script.leadIn,
      leadOutSeconds: script.leadOut,
      durationSeconds: Math.round(totalDuration(script, clipSeconds)),
      segments: script.segments.map((seg, i) => ({
        text: seg.say ?? null,
        audio: seg.audio ?? null,
        audioSeconds: Number(clipSeconds[i].toFixed(3)),
        waitSeconds: seg.wait,
      })),
    });
  }
  /*
   * Sorted by section, then by length ascending. Sorting by id put the
   * twelve-minute practice at the top of the list; someone opening this screen
   * for the first time should meet the short ones first.
   */
  const order = new Map(GUIDED_CATEGORIES.map((c, i) => [c.id, i]));
  out.sort((a, b) =>
    (order.get(a.category) ?? 99) - (order.get(b.category) ?? 99) ||
    a.durationSeconds - b.durationSeconds);

  return { meditations: out, skipped };
}

const HEADER = `/**
 * GENERATED FILE - do not edit by hand.
 * Regenerate with: npm run meditations -- manifest
 */
`;

export async function writeGuidedConstants(meditations) {
  const body = meditations.map((m) => {
    const segs = m.segments.map((s) => {
      const source = s.audio
        ? `require('@/${SPEECH_DIR}/${m.id}/${s.audio}')`
        : 'null';
      return `      {\n` +
        `        text: ${s.text === null ? 'null' : JSON.stringify(s.text)},\n` +
        `        source: ${source},\n` +
        `        audioSeconds: ${s.audioSeconds},\n` +
        `        waitSeconds: ${s.waitSeconds},\n` +
        `      },`;
    }).join('\n');

    return `  {\n` +
      `    id: ${JSON.stringify(m.id)},\n` +
      `    category: ${JSON.stringify(m.category)},\n` +
      `    title: ${JSON.stringify(m.title)},\n` +
      `    description: ${JSON.stringify(m.description)},\n` +
      `    durationSeconds: ${m.durationSeconds},\n` +
      `    leadInSeconds: ${m.leadInSeconds},\n` +
      `    leadOutSeconds: ${m.leadOutSeconds},\n` +
      `    segments: [\n${segs}\n    ],\n` +
      `  },`;
  }).join('\n');

  const source = `${HEADER}
/** A bundled asset, as returned by require(). expo-audio accepts this directly. */
export type AudioAsset = number;

export interface GuidedSegment {
  /** The spoken line, or null for a silence-only beat. Also used for captions. */
  text: string | null;
  source: AudioAsset | null;
  audioSeconds: number;
  /** Silence held after this segment. */
  waitSeconds: number;
}

export type GuidedCategoryId = ${GUIDED_CATEGORIES.map((c) => JSON.stringify(c.id)).join(' | ')};

export interface GuidedCategory {
  id: GuidedCategoryId;
  title: string;
}

/** Section order for the list screen. */
export const GUIDED_CATEGORIES: GuidedCategory[] = [
${GUIDED_CATEGORIES.map((c) => `  { id: ${JSON.stringify(c.id)}, title: ${JSON.stringify(c.title)} },`).join('\n')}
];

export interface GuidedMeditation {
  id: string;
  category: GuidedCategoryId;
  title: string;
  description: string;
  durationSeconds: number;
  leadInSeconds: number;
  leadOutSeconds: number;
  segments: GuidedSegment[];
}

export const GUIDED_MEDITATIONS: GuidedMeditation[] = [
${body}
];

export function findMeditation(id: string): GuidedMeditation | undefined {
  return GUIDED_MEDITATIONS.find((m) => m.id === id);
}

/** The list screen's sections, already ordered, with empty ones dropped. */
export function meditationsByCategory(): { category: GuidedCategory; items: GuidedMeditation[] }[] {
  return GUIDED_CATEGORIES
    .map((category) => ({
      category,
      items: GUIDED_MEDITATIONS.filter((m) => m.category === category.id),
    }))
    .filter((section) => section.items.length > 0);
}
`;

  const file = path.join(ROOT, CONSTANTS_DIR, 'guided-meditations.ts');
  await fs.writeFile(file, source);
  return file;
}

export async function writeAmbienceConstants(ambiences) {
  const body = ambiences.map((a) => `  {\n` +
    `    id: ${JSON.stringify(a.id)},\n` +
    `    title: ${JSON.stringify(a.title)},\n` +
    `    source: require('@/${AMBIENCE_DIR}/${a.file}'),\n` +
    `    durationSeconds: ${a.durationSeconds},\n` +
    `    fadeInSeconds: ${a.fadeInSeconds},\n` +
    `    fadeOutSeconds: ${a.fadeOutSeconds},\n` +
    `  },`).join('\n');

  const source = `${HEADER}
import type { AudioAsset } from './guided-meditations';

export interface Ambience {
  id: string;
  title: string;
  source: AudioAsset;
  durationSeconds: number;
  fadeInSeconds: number;
  /**
   * How long the tail takes to fade. The player starts the next copy this many
   * seconds before the end so the two fades cross into a continuous bed.
   */
  fadeOutSeconds: number;
}

export const AMBIENCES: Ambience[] = [
${body}
];

export function findAmbience(id: string | null): Ambience | undefined {
  return id ? AMBIENCES.find((a) => a.id === id) : undefined;
}
`;

  const file = path.join(ROOT, CONSTANTS_DIR, 'ambiences.ts');
  await fs.writeFile(file, source);
  return file;
}
