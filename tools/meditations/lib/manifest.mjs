import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { ROOT } from './config.mjs';
import { probeDuration, measureLoudness } from './ffmpeg.mjs';
import { SPEECH_DIR } from './map.mjs';

export const ENV_DIR = 'assets/audios/environments';
export const AMBIENCE_DIR = 'assets/audios/ambiences';
export const CONSTANTS_DIR = 'constants';

/** Every bed is levelled here so switching between them does not jump in volume. */
const AMBIENCE_LUFS = -30;
const AMBIENCE_TRUE_PEAK = -3;

/**
 * The player overlaps two copies of a bed so their fades cross. A bed whose tail
 * does not fade has nothing to cross with and clicks on every wrap, so any file
 * shorter than this gets one applied.
 */
const MIN_FADE_OUT = 4;

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
 * Level every bed and guarantee it has a tail to cross-fade with.
 *
 * Levelling is a single linear gain, not loudnorm. loudnorm's dynamic fallback
 * lifts quiet passages, which would flatten the very fades the overlap depends
 * on - and the voice pipeline's loudnorm also forces mono, which would collapse
 * the stereo image these beds rely on. Channels and sample rate pass through
 * untouched.
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
    const target = Math.min(sourceDuration, MAX_AMBIENCE_SECONDS);
    const trimmed = target < sourceDuration;

    // A trimmed bed ends mid-recording, so it always needs a fresh tail - the
    // fade the file shipped with now sits past the cut.
    const fadeAdded = trimmed || sourceFades.fadeOut < MIN_FADE_OUT;

    // Stage 1: cut and shape. Measuring loudness only after this matters -
    // levelling off the full-length average shipped the first 150s of the cafe
    // bed 1.6 LU under everything else.
    await run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', src,
      ...(trimmed ? ['-t', target.toFixed(3)] : []),
      ...(fadeAdded
        ? ['-af', `afade=t=out:st=${Math.max(0, target - MIN_FADE_OUT).toFixed(3)}:d=${MIN_FADE_OUT}`]
        : []),
      '-c:a', 'pcm_s16le', work]);

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
     * The player uses this to decide how early to bring in the next copy, so it
     * must be the full length of the fade. A measured value cannot give that -
     * it finds where the level crosses -3dB, which is partway down the ramp, and
     * reporting that would start the overlap late and let the bed dip. When we
     * applied the fade we know its length exactly; otherwise fall back to the
     * measurement of the fade the file arrived with.
     */
    const fadeOut = fadeAdded ? MIN_FADE_OUT : sourceFades.fadeOut;

    results.push({
      id,
      title: TITLES[id] ?? id.replace(/-/g, ' '),
      file: path.basename(out),
      durationSeconds: Number((await probeDuration(out)).toFixed(3)),
      fadeInSeconds: Number(sourceFades.fadeIn.toFixed(2)),
      fadeOutSeconds: Number(fadeOut.toFixed(2)),
      loudness: Number(finalLevel.integrated.toFixed(1)),
      gainApplied: Number(gain.toFixed(2)),
      fadeAdded,
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

export async function buildGuidedManifest(scripts) {
  const out = [];
  for (const script of scripts) {
    const clipSeconds = [];
    for (const [i, seg] of script.segments.entries()) {
      if (!seg.say) { clipSeconds[i] = 0; continue; }
      if (!seg.audio) throw new Error(`${script.id} segment ${i} has no audio - run: meditations map ${script.id}`);
      clipSeconds[i] = await probeDuration(path.join(ROOT, SPEECH_DIR, script.id, seg.audio));
    }
    out.push({
      id: script.id,
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
  return out;
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

export interface GuidedMeditation {
  id: string;
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
