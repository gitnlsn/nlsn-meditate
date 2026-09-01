import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { CACHE_DIR } from './config.mjs';

/**
 * Segments are cached by the exact inputs that produce them, so editing one line
 * of a script re-synthesises one line. Iterating on a long meditation would
 * otherwise cost a full re-render every time.
 */
export function cacheKey(text, voice) {
  const material = JSON.stringify({
    text,
    provider: voice.provider,
    voiceId: voice.voiceId,
    model: voice.model,
    stability: voice.stability,
    similarityBoost: voice.similarityBoost,
    style: voice.style,
    speed: voice.speed,
    instructions: voice.instructions,
  });
  return crypto.createHash('sha256').update(material).digest('hex').slice(0, 32);
}

export async function readCache(key, ext) {
  const file = path.join(CACHE_DIR, `${key}.${ext}`);
  try {
    await fs.access(file);
    return file;
  } catch {
    return null;
  }
}

export async function writeCache(key, ext, buffer) {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  const file = path.join(CACHE_DIR, `${key}.${ext}`);
  await fs.writeFile(file, buffer);
  return file;
}
