#!/usr/bin/env node
/**
 * Build guided meditation voice tracks from timed scripts.
 *
 *   node tools/meditations/build.mjs list
 *   node tools/meditations/build.mjs voices [--provider elevenlabs]
 *   node tools/meditations/build.mjs build body-scan-10 --dry-run
 *   node tools/meditations/build.mjs build body-scan-10 --preview 4
 *   node tools/meditations/build.mjs build            # every script
 *
 * Output lands in build/meditations/ as <id>.m4a plus a manifest.json.
 */
import { parseArgs } from 'node:util';
import path from 'node:path';
import { loadEnv, BUILD_DIR, ROOT } from './lib/config.mjs';
import { assertToolchain } from './lib/ffmpeg.mjs';
import { loadScript, listScripts, characterCount, estimateDuration } from './lib/script.mjs';
import { getProvider, providerNames } from './lib/providers.mjs';
import { build, writeManifest } from './lib/assemble.mjs';
import { splitIntoCache } from './lib/split.mjs';
import { mapScriptAudio, writeAudioIntoScript } from './lib/map.mjs';
import {
  processAmbiences, buildGuidedManifest, writeGuidedConstants, writeAmbienceConstants,
} from './lib/manifest.mjs';

loadEnv();

const { values: flags, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    'dry-run': { type: 'boolean', default: false },
    audio: { type: 'string' },
    'min-gap': { type: 'string' },
    threshold: { type: 'string' },
    preview: { type: 'string' },
    provider: { type: 'string' },
    voice: { type: 'string' },
    speed: { type: 'string' },
    out: { type: 'string' },
    help: { type: 'boolean', short: 'h', default: false },
  },
});

const [command = 'build', ...args] = positionals;
const outDir = flags.out ? path.resolve(flags.out) : BUILD_DIR;

const rel = (p) => path.relative(ROOT, p) || '.';
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
const mb = (b) => `${(b / 1024 / 1024).toFixed(1)} MB`;

function usage() {
  console.log(`
guided meditation audio builder

  list                       show available scripts
  voices [--provider NAME]   list voices for a provider (${providerNames.join(', ')})
  build [id...]              build scripts (all of them if no id given)
  text <id>                  emit paste-ready text with break tags, for the web UI
  split <id> --audio FILE    cut one render back into per-line clips
  map [id...]                pair per-line clips with script lines
  manifest                   level the ambience beds and generate constants/

  --dry-run                  report length and billable characters, call no API
  --preview N                build only the first N spoken lines, to audition a voice
  --voice ID                 override the script's voiceId (for A/B-ing voices)
  --speed N                  override the script's delivery speed
  --audio FILE               (split) the single render to cut up
  --min-gap SECONDS          (split) shortest gap that counts as a line break, default 1.2
  --threshold DB             (split) silence floor, default -35
  --out DIR                  output directory (default ${rel(BUILD_DIR)})
`);
}

async function cmdList() {
  const ids = await listScripts();
  if (!ids.length) return console.log('no scripts in tools/meditations/scripts/');
  for (const id of ids) {
    const script = await loadScript(id);
    const est = estimateDuration(script);
    console.log(
      `  ${id.padEnd(24)} ~${mmss(est.total).padStart(6)}  ` +
      `${String(characterCount(script)).padStart(6)} chars  ${script.voice.provider}`,
    );
  }
}

async function cmdVoices() {
  const provider = getProvider(flags.provider ?? 'elevenlabs');
  const voices = await provider.listVoices();
  console.log(`\n${provider.id} voices:\n`);
  for (const v of voices) {
    console.log(`  ${v.id.padEnd(24)} ${v.name.padEnd(20)} ${v.labels}`);
  }
  console.log('\nPut the id you want in your script as voice.voiceId.\n');
}

async function cmdBuild() {
  const ids = args.length ? args : await listScripts();
  if (!ids.length) {
    console.log('nothing to build - add a script to tools/meditations/scripts/');
    return;
  }

  const preview = flags.preview ? Number.parseInt(flags.preview, 10) : null;
  if (preview !== null && !Number.isInteger(preview)) throw new Error('--preview needs a number');

  if (flags['dry-run']) {
    let chars = 0;
    console.log('\ndry run - no API calls\n');
    for (const id of ids) {
      const script = await loadScript(id);
      const est = estimateDuration(script);
      const c = characterCount(script);
      chars += c;
      console.log(`  ${script.id}`);
      console.log(`    estimated length  ${mmss(est.total)}  (${mmss(est.speech)} speech, ${mmss(est.silence)} silence)`);
      console.log(`    billable          ${c} characters`);
      if (script.targetDuration) {
        const drift = est.total - script.targetDuration;
        const verdict = Math.abs(drift) <= 20 ? 'ok' : 'ADJUST WAITS';
        console.log(`    vs target         ${mmss(script.targetDuration)} (${drift > 0 ? '+' : ''}${Math.round(drift)}s, ${verdict})`);
      }
    }
    console.log(`\n  total billable: ${chars} characters\n`);
    return;
  }

  await assertToolchain();

  const results = [];
  for (const id of ids) {
    const script = await loadScript(id);

    // Overrides let you audition a voice without editing the script. Both change
    // the cache key, so each variant is synthesised once and then reused.
    if (flags.voice) script.voice.voiceId = flags.voice;
    if (flags.speed) {
      const speed = Number.parseFloat(flags.speed);
      if (!Number.isFinite(speed)) throw new Error('--speed needs a number');
      script.voice.speed = speed;
    }

    if (preview !== null) {
      let seen = 0;
      script.segments = script.segments.filter((s) => (s.say ? ++seen <= preview : false));
      script.id = `${script.id}-preview`;
      script.leadOut = 1;
    }

    // A --voice build is an audition of an alternative, not the canonical asset:
    // give it its own filename so variants never overwrite each other.
    if (flags.voice) script.id = `${script.id}-${flags.voice.slice(0, 6)}`;

    process.stdout.write(`\n${script.id}\n`);
    const result = await build(script, {
      outDir,
      onProgress: ({ done, total, cached }) => {
        process.stdout.write(`\r  synth ${done}/${total}${cached ? ' (cached)' : '        '}`);
      },
    });
    process.stdout.write('\r  synth done                    \n');

    console.log(`  length     ${mmss(result.durationSeconds)} (${result.durationSeconds}s)`);
    console.log(`  loudness   ${result.loudness.integrated} LUFS, peak ${result.loudness.truePeak} dBTP`);
    console.log(`  size       ${mb(result.bytes)}`);
    console.log(`  cached     ${result.cacheHits} reused, ${result.synthesised} synthesised`);

    // The timeline is planned to the millisecond; drift means ffmpeg gave us
    // something other than what we laid out, and the cue times are suspect.
    if (Math.abs(result.assemblyDrift) > 0.5) {
      console.log(`  WARNING    assembly drifted ${result.assemblyDrift}s from the planned timeline`);
    }

    if (script.targetDuration && preview === null) {
      const drift = result.durationSeconds - script.targetDuration;
      if (Math.abs(drift) > 20) {
        console.log(`  WARNING    ${drift > 0 ? '+' : ''}${drift}s off the ${mmss(script.targetDuration)} target`);
      }
    }

    console.log(`  -> ${rel(result.file)}`);
    results.push(result);
  }

  const isVariant = preview !== null || Boolean(flags.voice);
  if (!isVariant) {
    const manifest = await writeManifest(results, outDir);
    console.log(`\nmanifest: ${rel(manifest)}\n`);
  } else {
    console.log('\nvariant build - manifest not updated\n');
  }
}

async function cmdText() {
  const [id] = args;
  if (!id) throw new Error('usage: text <script-id>');
  const script = await loadScript(id);
  const spoken = script.segments.filter((s) => s.say);

  // A uniform 2s break is only a cutting landmark - it is discarded on split,
  // and the script's real `wait` values are inserted at assembly time. It just
  // has to be long enough that no comma pause can be mistaken for it.
  console.log(`\n${spoken.length} lines. Paste everything between the rules into ElevenLabs:\n`);
  console.log('-'.repeat(70));
  console.log(spoken.map((s) => s.say).join(' <break time="2.0s" /> '));
  console.log('-'.repeat(70));
  const words = spoken.reduce((n, s) => n + s.say.length, 0);
  const tags = (spoken.length - 1) * '<break time="2.0s" /> '.length;
  console.log(`\nSpeech: ${words} characters. Break tags add ${tags} more - ElevenLabs may bill`);
  console.log(`those too, so budget up to ${words + tags}. Watch the credit counter on your first run.`);
  console.log(`Then: npm run meditations -- split ${id} --audio <downloaded.mp3>\n`);
}

/**
 * ElevenLabs encodes the settings a render used into its filename
 * (..._sp100_s50_sb75_se0_..). Reading them back lets us catch the case where
 * the UI settings and the script disagree - which would file the clips under a
 * cache key describing audio that was never generated.
 */
function settingsFromFilename(file) {
  const name = path.basename(file);
  const num = (re) => { const m = name.match(re); return m ? Number(m[1]) : null; };
  return {
    speed: num(/_sp(\d+)[_.]/) === null ? null : num(/_sp(\d+)[_.]/) / 100,
    stability: num(/_s(\d+)[_.]/) === null ? null : num(/_s(\d+)[_.]/) / 100,
    similarityBoost: num(/_sb(\d+)[_.]/) === null ? null : num(/_sb(\d+)[_.]/) / 100,
    style: num(/_se(\d+)[_.]/) === null ? null : num(/_se(\d+)[_.]/) / 100,
  };
}

async function cmdSplit() {
  const [id] = args;
  if (!id) throw new Error('usage: split <script-id> --audio FILE');
  if (!flags.audio) throw new Error('--audio FILE is required');

  await assertToolchain();
  const script = await loadScript(id);
  const audio = path.resolve(flags.audio);

  const declared = settingsFromFilename(audio);
  const drift = Object.entries(declared).filter(
    ([k, v]) => v !== null && script.voice[k] !== undefined && Math.abs(v - script.voice[k]) > 0.005,
  );
  if (drift.length) {
    console.log('\n  WARNING  the render was made with different settings than the script declares:');
    for (const [k, v] of drift) console.log(`    ${k}: file says ${v}, script says ${script.voice[k]}`);
    console.log('    Fix one of them, or the cache will describe audio that was never generated.\n');
  }

  const result = await splitIntoCache(script, audio, {
    threshold: flags.threshold ? Number.parseFloat(flags.threshold) : undefined,
    minGap: flags['min-gap'] ? Number.parseFloat(flags['min-gap']) : undefined,
  });

  if (result.tuneFailed) {
    console.log(`\n${id}  <-  ${path.basename(audio)}`);
    console.log(`  render ${result.duration.toFixed(1)}s, but no silence setting finds ${result.expected} regions.`);
    console.log('  The render probably does not contain every line of this script.\n');
    process.exitCode = 1;
    return;
  }

  console.log(`\n${id}  <-  ${path.basename(audio)}`);
  console.log(`  render      ${result.duration.toFixed(1)}s`);
  console.log(`  detection   ${result.threshold}dB, min gap ${result.minGap}s (auto-tuned)`);
  console.log(`  regions     ${result.found}   expected ${result.expected}` +
    (result.aligned ? `   aligned (fit error ${result.alignError.toFixed(3)})` : ''));

  if (result.implausible?.length) {
    console.log(`\n  REFUSED - ${result.implausible.length} of ${result.expected} lines got audio of an impossible length.`);
    console.log('  The pauses in this render do not line up with the script, so the grouping is guesswork:');
    for (const r of result.implausible.slice(0, 8)) {
      console.log(`    line ${String(r.index).padStart(2)}  ${r.seconds.toFixed(2)}s for ${r.text.length} chars ` +
        `(${r.rate.toFixed(1)} chars/sec)  ${r.text.slice(0, 40)}`);
    }
    console.log(`\n  Regenerate with unambiguous breaks:  npm run meditations -- text ${id}`);
    console.log('  Nothing was written.\n');
    process.exitCode = 1;
    return;
  }

  if (!result.written) {
    console.log('\n  MISMATCH - not writing anything, rather than pairing the wrong audio to the wrong line.');
    console.log('  Detected speech regions:');
    result.regions.forEach((r, i) =>
      console.log(`    ${String(i).padStart(2)}  ${r.start.toFixed(2)} -> ${r.end.toFixed(2)}  (${(r.end - r.start).toFixed(2)}s)`));
    console.log('\n  Too many regions? A comma pause is being read as a line break - raise --min-gap.');
    console.log('  Too few? Lines are running together - lower --min-gap, or regenerate with');
    console.log(`  the break tags from: npm run meditations -- text ${id}\n`);
    process.exitCode = 1;
    return;
  }

  console.log('\n  matched:');
  result.written.forEach((w, i) =>
    console.log(`    ${String(i).padStart(2)}  ${w.seconds.toFixed(2).padStart(5)}s  ` +
      `${w.merged > 1 ? `[+${w.merged - 1}]` : '    '}  ${w.text.slice(0, 50)}`));
  console.log(`\n  ${result.written.length} clips written to the TTS cache.`);
  console.log(`  Now: npm run meditations -- build ${id}   (runs entirely from cache, no API calls)\n`);
}

async function cmdMap() {
  const ids = args.length ? args : await listScripts();
  let blocked = 0;

  for (const id of ids) {
    const script = await loadScript(id);
    const { matched, spare } = await mapScriptAudio(script);

    const unmatched = matched.filter((m) => !m.file);
    const weak = matched.filter((m) => m.file && m.score < 0.9);

    console.log(`\n${id}  ${matched.length} lines`);
    for (const m of matched) {
      if (!m.file) {
        console.log(`  MISSING       ${m.line.say.slice(0, 56)}`);
      } else if (m.score < 0.9) {
        console.log(`  ~ ${m.score.toFixed(2)}  ${m.line.say.slice(0, 40).padEnd(40)} <- ${path.basename(m.file, '.mp3')}`);
      }
    }
    console.log(`  ${matched.length - unmatched.length}/${matched.length} matched` +
      (weak.length ? `, ${weak.length} below 0.90 (shown above - check them)` : ', all above 0.90'));
    if (spare.length) console.log(`  spare files, not used: ${spare.map((f) => path.basename(f, '.mp3')).join(', ')}`);

    if (unmatched.length) {
      console.log(`  NOT WRITTEN - ${unmatched.length} line(s) have no confident match.`);
      blocked++;
      continue;
    }
    await writeAudioIntoScript(script, matched);
    console.log(`  -> wrote audio filenames into ${rel(script.file)}`);
  }

  if (blocked) process.exitCode = 1;
  console.log('');
}

async function cmdManifest() {
  await assertToolchain();

  console.log('\nambience beds');
  const ambiences = await processAmbiences({
    onProgress: (a) => console.log(
      `  ${a.id.padEnd(24)} ${String(a.durationSeconds).padStart(7)}s  ${String(a.loudness).padStart(6)} LUFS  ` +
      `fade-out ${a.fadeOutSeconds.toFixed(1).padStart(4)}s  ` +
      `${a.gainApplied >= 0 ? '+' : ''}${a.gainApplied}dB  ${(a.bytes / 1024 / 1024).toFixed(1)}MB` +
      `${a.trimmed ? '  trimmed' : ''}${a.fadeAdded ? '  fade added' : ''}`),
  });

  const ids = await listScripts();
  const scripts = [];
  for (const id of ids) scripts.push(await loadScript(id));
  const { meditations, skipped } = await buildGuidedManifest(scripts);

  console.log('\nguided meditations');
  for (const m of meditations) {
    const spoken = m.segments.filter((s) => s.audio !== null).length;
    console.log(`  ${m.id.padEnd(16)} ${String(m.durationSeconds).padStart(4)}s  ${m.segments.length} segments (${spoken} spoken)`);
  }

  if (skipped.length) {
    console.log('\nnot yet recorded - left out of the manifest');
    for (const s of skipped) {
      console.log(`  ${s.id.padEnd(16)} ${s.unmapped} of ${s.total} lines have no audio` +
        `   (npm run meditations -- text ${s.id})`);
    }
  }

  const a = await writeAmbienceConstants(ambiences);
  const g = await writeGuidedConstants(meditations);
  console.log(`\n  -> ${rel(g)}\n  -> ${rel(a)}\n`);
}

const commands = {
  list: cmdList, voices: cmdVoices, build: cmdBuild,
  text: cmdText, split: cmdSplit, map: cmdMap, manifest: cmdManifest,
};

try {
  if (flags.help || command === 'help') usage();
  else if (commands[command]) await commands[command]();
  else {
    console.error(`unknown command "${command}"`);
    usage();
    process.exitCode = 1;
  }
} catch (err) {
  console.error(`\nerror: ${err.message}\n`);
  process.exitCode = 1;
}
