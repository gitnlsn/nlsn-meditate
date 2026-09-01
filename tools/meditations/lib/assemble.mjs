import fs from 'node:fs/promises';
import path from 'node:path';
import {
  BUILD_DIR, AAC_BITRATE, VOICE_LUFS, VOICE_TRUE_PEAK, VOICE_LRA, SYNTH_CONCURRENCY,
} from './config.mjs';
import { cacheKey, readCache, writeCache } from './cache.mjs';
import { synthWithRetry } from './providers.mjs';
import {
  probeDuration, decodeToWork, stretch, silence, concat, loudnorm, encodeM4a, measureLoudness,
} from './ffmpeg.mjs';

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

/** Fetch (or reuse) the raw provider audio for every spoken segment. */
async function synthesise(script, { onProgress }) {
  const spoken = script.segments
    .map((seg, index) => ({ ...seg, index }))
    .filter((seg) => seg.say);

  let hits = 0;
  let misses = 0;

  const files = await mapLimit(spoken, SYNTH_CONCURRENCY, async (seg) => {
    const key = cacheKey(seg.say, script.voice);
    const cached = await readCache(key, script.provider.ext);
    if (cached) {
      hits++;
      onProgress?.({ done: hits + misses, total: spoken.length, cached: true });
      return { index: seg.index, file: cached };
    }
    const buffer = await synthWithRetry(script.provider, seg.say, script.voice);
    const file = await writeCache(key, script.provider.ext, buffer);
    misses++;
    onProgress?.({ done: hits + misses, total: spoken.length, cached: false });
    return { index: seg.index, file };
  });

  return { files: new Map(files.map((f) => [f.index, f.file])), hits, misses };
}

export async function build(script, { outDir = BUILD_DIR, onProgress } = {}) {
  const workDir = path.join(outDir, '.work', script.id);
  await fs.rm(workDir, { recursive: true, force: true });
  await fs.mkdir(workDir, { recursive: true });
  await fs.mkdir(outDir, { recursive: true });

  const { files, hits, misses } = await synthesise(script, { onProgress });

  const needsStretch = !script.provider.supportsSpeed && script.voice.speed !== 1;

  // Decode every clip to the common working format, trimming dead air so the
  // script's `wait` values are the pauses the listener actually hears.
  const speech = new Map();
  for (const [index, source] of files) {
    let wav = path.join(workDir, `seg-${String(index).padStart(3, '0')}.wav`);
    await decodeToWork(source, wav);
    if (needsStretch) {
      const slowed = path.join(workDir, `seg-${String(index).padStart(3, '0')}-slow.wav`);
      await stretch(wav, slowed, script.voice.speed);
      wav = slowed;
    }
    speech.set(index, { file: wav, duration: await probeDuration(wav) });
  }

  // Lay out the timeline, recording where each line lands so the app can show
  // captions or highlight the current instruction later.
  const parts = [];
  const cues = [];
  let cursor = 0;
  let silenceCount = 0;

  const addSilence = async (seconds) => {
    if (seconds <= 0) return;
    const file = path.join(workDir, `sil-${String(silenceCount++).padStart(3, '0')}.wav`);
    await silence(seconds, file);
    parts.push(file);
    cursor += seconds;
  };

  await addSilence(script.leadIn);

  for (const [index, seg] of script.segments.entries()) {
    if (seg.say) {
      const clip = speech.get(index);
      cues.push({
        index,
        text: seg.say,
        startSeconds: Number(cursor.toFixed(3)),
        endSeconds: Number((cursor + clip.duration).toFixed(3)),
      });
      parts.push(clip.file);
      cursor += clip.duration;
    }
    await addSilence(seg.wait);
  }

  await addSilence(script.leadOut);

  const joined = await concat(parts, path.join(workDir, 'joined.wav'), workDir);
  const mastered = await loudnorm(joined, path.join(workDir, 'mastered.wav'), {
    I: VOICE_LUFS, TP: VOICE_TRUE_PEAK, LRA: VOICE_LRA,
  });

  const outFile = path.join(outDir, `${script.id}.m4a`);
  await encodeM4a(mastered, outFile, AAC_BITRATE);

  const duration = await probeDuration(outFile);
  const loudness = await measureLoudness(outFile);
  const { size } = await fs.stat(outFile);

  await fs.rm(workDir, { recursive: true, force: true });
  await fs.rmdir(path.join(outDir, '.work')).catch(() => {});

  const drift = duration - cursor;

  return {
    id: script.id,
    title: script.title,
    plannedSeconds: Number(cursor.toFixed(3)),
    assemblyDrift: Number(drift.toFixed(3)),
    description: script.description,
    file: outFile,
    durationSeconds: Math.round(duration),
    exactDuration: duration,
    bytes: size,
    cues,
    voice: { provider: script.voice.provider, voiceId: script.voice.voiceId, speed: script.voice.speed },
    loudness,
    cacheHits: hits,
    synthesised: misses,
  };
}

/**
 * The manifest is what the app reads: id, title, duration and cue points for
 * every built session. Regenerated from whatever is currently in outDir.
 */
export async function writeManifest(results, outDir = BUILD_DIR) {
  const manifestPath = path.join(outDir, 'manifest.json');

  let existing = [];
  try {
    existing = JSON.parse(await fs.readFile(manifestPath, 'utf8')).meditations ?? [];
  } catch {
    // first build
  }

  const byId = new Map(existing.map((m) => [m.id, m]));
  for (const r of results) {
    byId.set(r.id, {
      id: r.id,
      title: r.title,
      description: r.description,
      file: path.basename(r.file),
      durationSeconds: r.durationSeconds,
      bytes: r.bytes,
      voice: r.voice,
      cues: r.cues,
    });
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    meditations: [...byId.values()].sort((a, b) => a.id.localeCompare(b.id)),
  };

  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  return manifestPath;
}
