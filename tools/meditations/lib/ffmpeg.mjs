import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { WORK_RATE, WORK_CHANNELS } from './config.mjs';

function run(bin, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`${bin} exited ${code}\n${stderr.slice(-2000)}`));
    });
  });
}

const ffmpeg = (args) => run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args]);
const ffmpegVerbose = (args) => run('ffmpeg', ['-hide_banner', '-y', ...args]);

export async function assertToolchain() {
  for (const bin of ['ffmpeg', 'ffprobe']) {
    try {
      await run(bin, ['-version']);
    } catch {
      throw new Error(`${bin} not found on PATH. Install it with: brew install ffmpeg`);
    }
  }
}

export async function probeDuration(file) {
  const { stdout } = await run('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    file,
  ]);
  const seconds = Number.parseFloat(stdout.trim());
  if (!Number.isFinite(seconds)) throw new Error(`could not read duration of ${file}`);
  return seconds;
}

/**
 * Decode any provider output to the common working format, trimming the
 * near-silence most TTS engines leave on both ends. Without this the `wait`
 * values in a script drift - each clip smuggles in a few hundred extra ms.
 * `start_silence` keeps a short pad so a breathy onset is not clipped.
 */
export async function decodeToWork(input, output, { trim = true } = {}) {
  const gate = 'start_periods=1:start_silence=0.08:start_threshold=-45dB';
  const filters = trim
    ? [`silenceremove=${gate}`, 'areverse', `silenceremove=${gate}`, 'areverse']
    : ['anull'];
  await ffmpeg([
    '-i', input,
    '-af', filters.join(','),
    '-ar', String(WORK_RATE), '-ac', String(WORK_CHANNELS), '-c:a', 'pcm_s16le',
    output,
  ]);
  return output;
}

/** Time-stretch without changing pitch. Used only for providers with no native speed control. */
export async function stretch(input, output, speed) {
  await ffmpeg([
    '-i', input,
    '-af', `atempo=${speed.toFixed(3)}`,
    '-ar', String(WORK_RATE), '-ac', String(WORK_CHANNELS), '-c:a', 'pcm_s16le',
    output,
  ]);
  return output;
}

export async function silence(seconds, output) {
  await ffmpeg([
    '-f', 'lavfi',
    '-i', `anullsrc=r=${WORK_RATE}:cl=${WORK_CHANNELS === 1 ? 'mono' : 'stereo'}`,
    '-t', seconds.toFixed(3),
    '-c:a', 'pcm_s16le',
    output,
  ]);
  return output;
}

export async function concat(parts, output, workDir) {
  const listFile = path.join(workDir, 'concat.txt');
  const body = parts.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join('\n');
  await fs.writeFile(listFile, body + '\n');
  await ffmpeg([
    '-f', 'concat', '-safe', '0', '-i', listFile,
    '-c:a', 'pcm_s16le',
    output,
  ]);
  return output;
}

/**
 * Two-pass EBU R128 normalisation. The measure pass makes the correction
 * linear and exact; single-pass loudnorm guesses and drifts by a dB or more,
 * which is audible when the user alternates between tracks.
 */
export async function loudnorm(input, output, { I, TP, LRA }) {
  const base = `loudnorm=I=${I}:TP=${TP}:LRA=${LRA}`;
  const { stderr } = await ffmpegVerbose([
    '-i', input,
    '-af', `${base}:print_format=json`,
    '-f', 'null', '-',
  ]);

  const match = stderr.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('loudnorm measurement pass produced no JSON');
  const m = JSON.parse(match[0]);

  const measured = [
    `measured_I=${m.input_i}`,
    `measured_TP=${m.input_tp}`,
    `measured_LRA=${m.input_lra}`,
    `measured_thresh=${m.input_thresh}`,
    `offset=${m.target_offset}`,
    'linear=true',
  ].join(':');

  await ffmpeg([
    '-i', input,
    '-af', `${base}:${measured}`,
    '-ar', String(WORK_RATE), '-ac', String(WORK_CHANNELS), '-c:a', 'pcm_s16le',
    output,
  ]);

  return output;
}

/**
 * Measure what a finished file actually sounds like. The first loudnorm pass
 * only *predicts* its output; trusting that prediction reports a number the
 * listener never hears. This measures the real thing, after AAC encoding.
 */
export async function measureLoudness(file) {
  const { stderr } = await ffmpegVerbose([
    '-i', file,
    '-af', 'loudnorm=print_format=json',
    '-f', 'null', '-',
  ]);
  const match = stderr.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`could not measure loudness of ${file}`);
  const m = JSON.parse(match[0]);
  return {
    integrated: Number(m.input_i),
    truePeak: Number(m.input_tp),
    lra: Number(m.input_lra),
  };
}

export async function encodeM4a(input, output, bitrate) {
  await ffmpeg([
    '-i', input,
    '-c:a', 'aac', '-b:a', bitrate, '-ac', String(WORK_CHANNELS),
    '-movflags', '+faststart',
    output,
  ]);
  return output;
}
