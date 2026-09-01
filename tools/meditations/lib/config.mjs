import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

export const TOOL_DIR = path.resolve(here, '..');
export const ROOT = path.resolve(TOOL_DIR, '..', '..');
export const SCRIPTS_DIR = path.join(TOOL_DIR, 'scripts');
export const BUILD_DIR = path.join(ROOT, 'build', 'meditations');
export const CACHE_DIR = path.join(ROOT, 'build', '.tts-cache');

/**
 * Intermediate working format. Everything is decoded to this before concat so
 * the ffmpeg concat demuxer never has to reconcile mismatched streams.
 */
export const WORK_RATE = 48000;
export const WORK_CHANNELS = 1;

/**
 * Mastering targets. Quieter than the -14 LUFS streaming standard on purpose:
 * this is listened to in the dark, often on the way to sleep.
 */
export const VOICE_LUFS = -17;
export const VOICE_TRUE_PEAK = -1.5;
export const VOICE_LRA = 7;

export const AAC_BITRATE = '96k';

/** Concurrent TTS requests. Providers rate-limit; 3 is polite and still fast. */
export const SYNTH_CONCURRENCY = 3;

/**
 * .env.local is already gitignored by this repo, so API keys land somewhere safe
 * by default. Missing file is not an error - the key may come from the shell.
 */
export function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    try {
      process.loadEnvFile(path.join(ROOT, file));
    } catch {
      // not present; fall through to process.env
    }
  }
}

/**
 * Sections in the order they appear in the app. Attention practices first:
 * they are the usual entry point, and the compassion ones ask more of someone
 * who has not sat before.
 */
export const GUIDED_CATEGORIES = [
  { id: 'atencao', title: 'Atenção Plena' },
  { id: 'compaixao', title: 'Compaixão' },
  { id: 'dificeis', title: 'Momentos Difíceis' },
  { id: 'sono', title: 'Sono' },
];

export const CATEGORY_IDS = GUIDED_CATEGORIES.map((c) => c.id);
