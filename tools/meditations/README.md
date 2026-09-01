# Guided meditation audio pipeline

Turns a timed JSON script into a mastered voice-only `.m4a`, plus a manifest the
app can read.

Voice tracks are rendered **without background sound**. Ambience (rain, forest,
bells) ships as separate looping stems and is mixed at playback time, so one rain
bed serves every meditation and users can pick their own.

## Setup

Requires `ffmpeg` (`brew install ffmpeg`) and an API key in `.env.local`, which
this repo already gitignores:

```
OPENAI_API_KEY=sk-...
# or
ELEVENLABS_API_KEY=...
```

## Use

```bash
npm run meditations:list                       # scripts and their estimated lengths
npm run meditations -- voices                  # list voices (--provider openai|elevenlabs)
npm run meditations -- build body-scan-10 --dry-run   # length + billable chars, no API calls
npm run meditations -- build body-scan-10 --preview 4 # first 4 lines only, to audition a voice
npm run meditations:build                      # build every script
```

Output goes to `build/meditations/` (gitignored). Copy what you want to bundle:

```bash
mkdir -p assets/audios/guided
cp build/meditations/body-scan-10.m4a build/meditations/manifest.json assets/audios/guided/
```

Bundle one or two; serve the rest from a CDN and cache with `expo-file-system`.
A dozen 10-minute tracks is ~20 MB of binary you do not want in the store build.

## Script format

```json
{
  "id": "body-scan-10",
  "title": "Body Scan",
  "targetDuration": 600,
  "leadIn": 3,
  "leadOut": 8,
  "voice": { "provider": "openai", "voiceId": "shimmer", "speed": 0.88 },
  "segments": [
    { "say": "Let your eyes close, softly.", "wait": 8 },
    { "wait": 20 }
  ]
}
```

`wait` is the silence *after* the line, in seconds. Timing lives here rather
than in the prose because no TTS engine will hold a 20-second pause for you, and
because the app needs a session's exact length up front. A segment may be
`wait`-only for a long rest.

`targetDuration` is optional; the build warns if the result lands more than 20s
away from it, so you know which waits to adjust.

### Switching to ElevenLabs

Run `npm run meditations -- voices --provider elevenlabs`, then:

```json
"voice": {
  "provider": "elevenlabs",
  "voiceId": "<id from the voices command>",
  "model": "eleven_multilingual_v2",
  "stability": 0.55,
  "speed": 0.88
}
```

ElevenLabs slows delivery server-side, which changes phrasing and breath.
OpenAI has no speed parameter, so the pipeline time-stretches with `atempo`
instead — same length, but the delivery itself is not re-phrased. Where budget
allows, ElevenLabs is the better master.

## What the build does

1. **Synthesise** each spoken line separately, cached by a hash of the text and
   every voice setting. Editing one line re-synthesises one line.
2. **Trim** the near-silence TTS leaves on both ends, keeping an 80ms pad. Without
   this every clip smuggles in a few hundred ms and the `wait` values drift.
3. **Assemble** speech and exactly-generated silence into one timeline, recording
   where each line lands.
4. **Master** with two-pass EBU R128 loudnorm to -17 LUFS / -1.5 dBTP. Quieter
   than the -14 LUFS streaming standard on purpose: this is heard in the dark.
5. **Encode** to mono AAC 96k. Nobody needs stereo narration in their head, and
   mono halves the size.

The reported loudness is measured from the finished file, not predicted.

## Manifest

`build/meditations/manifest.json` carries id, title, exact `durationSeconds`,
file size, and `cues` — the start and end time of every spoken line. The cues are
there so the app can show the current instruction on screen without you having to
time captions by hand.
