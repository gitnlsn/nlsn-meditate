import fs from 'node:fs/promises';
import path from 'node:path';
import { SCRIPTS_DIR } from './config.mjs';
import { getProvider } from './providers.mjs';

/**
 * A meditation script is a list of segments, each optionally speaking a line and
 * then holding silence. Timing lives in the script rather than in the prose,
 * because no TTS engine will hold a 20 second pause for you - and because the
 * app needs to know a session's exact length up front.
 */
export async function loadScript(idOrPath) {
  const file = idOrPath.endsWith('.json')
    ? path.resolve(idOrPath)
    : path.join(SCRIPTS_DIR, `${idOrPath}.json`);

  let raw;
  try {
    raw = JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') throw new Error(`no script at ${file}`);
    throw new Error(`${file} is not valid JSON: ${err.message}`);
  }

  return normalise(raw, file);
}

export async function listScripts() {
  const entries = await fs.readdir(SCRIPTS_DIR).catch(() => []);
  return entries.filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, ''));
}

function normalise(raw, file) {
  const where = path.basename(file);
  const fail = (msg) => {
    throw new Error(`${where}: ${msg}`);
  };

  if (!raw.id) fail('missing "id"');
  if (!Array.isArray(raw.segments) || raw.segments.length === 0) fail('missing "segments"');

  const providerName = raw.voice?.provider ?? 'elevenlabs';
  const provider = getProvider(providerName);

  const voice = { provider: providerName, ...provider.defaults, ...(raw.voice ?? {}) };
  if (voice.speed <= 0.5 || voice.speed > 1.5) {
    fail(`voice.speed ${voice.speed} is outside the sane range 0.5-1.5`);
  }

  const segments = raw.segments.map((seg, i) => {
    if (seg.say != null && typeof seg.say !== 'string') fail(`segment ${i}: "say" must be a string`);
    const wait = seg.wait ?? 0;
    if (typeof wait !== 'number' || wait < 0) fail(`segment ${i}: "wait" must be a non-negative number`);
    if (!seg.say && !wait) fail(`segment ${i} does nothing - give it "say" or "wait"`);
    return { say: seg.say?.trim() || null, wait, audio: seg.audio ?? null };
  });

  return {
    id: raw.id,
    title: raw.title ?? raw.id,
    description: raw.description ?? '',
    targetDuration: raw.targetDuration ?? null,
    leadIn: raw.leadIn ?? 2,
    leadOut: raw.leadOut ?? 5,
    voice,
    provider,
    segments,
    file,
  };
}

/** Characters billed by the provider - the only thing synthesis actually costs. */
export function characterCount(script) {
  return script.segments.reduce((n, s) => n + (s.say?.length ?? 0), 0);
}

/**
 * Duration we can predict without calling the API: all the silence, plus a
 * rough estimate for speech. The real number comes from ffprobe after a build.
 */
export function estimateDuration(script) {
  const silence =
    script.leadIn + script.leadOut + script.segments.reduce((n, s) => n + s.wait, 0);
  const words = script.segments.reduce(
    (n, s) => n + (s.say ? s.say.split(/\s+/).length : 0),
    0,
  );
  // ~150 wpm at normal pace, scaled by the delivery speed we asked for.
  const speech = (words / 150) * 60 / (script.voice.speed ?? 1);
  return { silence, speech, total: silence + speech };
}
