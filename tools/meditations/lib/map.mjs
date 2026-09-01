import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT } from './config.mjs';

export const SPEECH_DIR = 'assets/audios/speeches-luna';

/** Below this, a filename is not confidently the recording of a line. */
const CONFIDENCE_FLOOR = 0.6;

/**
 * Filenames are hand-slugged and drift from the script - accents dropped,
 * occasional typos ("madibula", "amoreca"), and a voice/script prefix. Strip
 * everything incidental so only the words carry the comparison.
 */
function normalise(text, scriptId = '') {
  let s = text
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  // "luna-calma-apenas-fique-aqui" -> "apenas fique aqui"
  s = s.replace(/^luna /, '');
  const prefix = scriptId.split('-')[0]?.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  if (prefix && s.startsWith(prefix + ' ')) s = s.slice(prefix.length + 1);

  return s;
}

function bigrams(s) {
  const g = new Map();
  for (let i = 0; i < s.length - 1; i++) {
    const k = s.slice(i, i + 2);
    g.set(k, (g.get(k) ?? 0) + 1);
  }
  return g;
}

/**
 * How alike two strings are, over character bigrams.
 *
 * Two measures, because filenames fail in two different ways. Dice handles
 * typos and small drifts ("amoreca" for "amoleça"). But long lines get their
 * filenames abbreviated - "Se for muito, volte para você mesmo. Isso também é a
 * prática." was saved as `se-for-muito-volte-para-voce-mesmo` - and Dice
 * punishes that by length alone, scoring a correct file 0.73. Overlap measures
 * how much of the *shorter* string is contained in the longer, which is what
 * truncation actually looks like, so it stays high.
 *
 * Overlap is discounted slightly so a whole-line match always outranks a
 * prefix match when both are available.
 */
function similarity(a, b) {
  const A = bigrams(a);
  const B = bigrams(b);

  let shared = 0;
  let sizeA = 0;
  let sizeB = 0;
  for (const n of A.values()) sizeA += n;
  for (const [k, n] of B) {
    sizeB += n;
    shared += Math.min(n, A.get(k) ?? 0);
  }
  if (sizeA + sizeB === 0) return 0;

  const dice = (2 * shared) / (sizeA + sizeB);
  const overlap = shared / Math.min(sizeA, sizeB);
  return Math.max(dice, overlap * 0.95);
}

/**
 * Pair every spoken line with its recording, one file per line.
 *
 * Assignment is globally greedy - take the highest-scoring pair anywhere, claim
 * both sides, repeat - rather than per-line best match. Per-line matching lets a
 * short generic line ("E solte.") steal the file belonging to a longer line that
 * contains it, and the theft is silent.
 */
export async function mapScriptAudio(script) {
  const dir = path.join(ROOT, SPEECH_DIR, script.id);

  let files;
  try {
    files = (await fs.readdir(dir)).filter((f) => f.endsWith('.mp3')).sort();
  } catch {
    throw new Error(`no audio directory at ${SPEECH_DIR}/${script.id}`);
  }

  const lines = script.segments
    .map((seg, index) => ({ index, say: seg.say }))
    .filter((l) => l.say);

  const pairs = [];
  for (const line of lines) {
    for (const file of files) {
      pairs.push({
        line,
        file,
        score: similarity(normalise(line.say), normalise(path.basename(file, '.mp3'), script.id)),
      });
    }
  }
  pairs.sort((a, b) => b.score - a.score);

  const byLine = new Map();
  const takenFiles = new Set();
  for (const p of pairs) {
    if (byLine.has(p.line.index) || takenFiles.has(p.file)) continue;
    if (p.score < CONFIDENCE_FLOOR) continue;
    byLine.set(p.line.index, p);
    takenFiles.add(p.file);
  }

  return {
    dir,
    matched: lines.map((line) => ({
      line,
      file: byLine.get(line.index)?.file ?? null,
      score: byLine.get(line.index)?.score ?? 0,
    })),
    spare: files.filter((f) => !takenFiles.has(f)),
  };
}

/** Write the resolved filenames back into the script, keeping it the one source of truth. */
export async function writeAudioIntoScript(script, matched) {
  const raw = JSON.parse(await fs.readFile(script.file, 'utf8'));
  for (const m of matched) {
    raw.segments[m.line.index].audio = m.file;
  }
  await fs.writeFile(script.file, JSON.stringify(raw, null, 2) + '\n');
}
