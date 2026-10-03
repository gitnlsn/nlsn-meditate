import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

export const TOOL_DIR = path.resolve(here, '..');
export const ROOT = path.resolve(TOOL_DIR, '..', '..');
export const SCRIPTS_DIR = path.join(TOOL_DIR, 'scripts');

/**
 * The languages the meditations are recorded in, matching the app's locales.
 * Portuguese is the original: its scripts sit at the top of scripts/, and each
 * other language keeps translations of the same ids in a folder of its own.
 */
export const LOCALES = ['pt', 'en'];
export const SOURCE_LOCALE = 'pt';

export function scriptsDir(locale) {
  return locale === SOURCE_LOCALE ? SCRIPTS_DIR : path.join(SCRIPTS_DIR, locale);
}

/**
 * Where each language's per-line clips are bundled from. The Portuguese ones
 * were rendered by hand in the ElevenLabs web UI, hence the voice in the name;
 * the English ones are synthesised by the `synth` command.
 */
export const SPEECH_DIRS = {
  pt: 'assets/audios/speeches-luna',
  en: 'assets/audios/speeches-en',
};

/**
 * Loudness of synthesised clips, as one gain per script. Matches the
 * hand-rendered Portuguese set (measured at -23.5 LUFS), so switching language
 * does not change how loud the voice sits over the ambience.
 */
export const SPEECH_LUFS = -23.5;
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

/**
 * Concurrent TTS requests. ElevenLabs' free plan allows two at a time; three
 * drew a stream of 429s that the retry loop papered over.
 */
export const SYNTH_CONCURRENCY = 2;

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
  { id: 'atencao', title: { pt: 'Atenção Plena', en: 'Mindfulness' } },
  { id: 'compaixao', title: { pt: 'Compaixão', en: 'Compassion' } },
  { id: 'dificeis', title: { pt: 'Momentos Difíceis', en: 'Difficult Moments' } },
  { id: 'sono', title: { pt: 'Sono', en: 'Sleep' } },
];

export const CATEGORY_IDS = GUIDED_CATEGORIES.map((c) => c.id);
