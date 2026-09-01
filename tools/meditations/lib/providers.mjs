/**
 * TTS provider adapters. Each exposes:
 *   id             - name used in script JSON and cache keys
 *   supportsSpeed  - true if the API can slow the delivery itself. Provider-side
 *                    slowing changes prosody and phrasing; ffmpeg time-stretching
 *                    only slows playback, so we prefer native where available.
 *   ext            - container the API returns
 *   synth(text, voice) -> Buffer
 */

async function post(url, init, label) {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err = new Error(`${label} ${res.status}: ${body.slice(0, 500)}`);
    err.status = res.status;
    throw err;
  }
  return Buffer.from(await res.arrayBuffer());
}

const elevenlabs = {
  id: 'elevenlabs',
  supportsSpeed: true,
  ext: 'mp3',
  envKey: 'ELEVENLABS_API_KEY',
  defaults: {
    model: 'eleven_multilingual_v2',
    stability: 0.55,
    similarityBoost: 0.75,
    style: 0.0,
    speed: 0.88,
  },
  async synth(text, voice) {
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) throw new Error('ELEVENLABS_API_KEY is not set (put it in .env.local)');
    if (!voice.voiceId) throw new Error('script voice.voiceId is required for elevenlabs');

    const settings = {
      stability: voice.stability,
      similarity_boost: voice.similarityBoost,
      style: voice.style,
      use_speaker_boost: false,
    };
    // Only send speed when it differs; older API versions reject the field.
    if (voice.speed && voice.speed !== 1) settings.speed = voice.speed;

    return post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice.voiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: { 'xi-api-key': key, 'content-type': 'application/json' },
        body: JSON.stringify({ text, model_id: voice.model, voice_settings: settings }),
      },
      'elevenlabs',
    );
  },
  async listVoices() {
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) throw new Error('ELEVENLABS_API_KEY is not set (put it in .env.local)');
    const res = await fetch('https://api.elevenlabs.io/v2/voices?page_size=100', {
      headers: { 'xi-api-key': key },
    });
    if (!res.ok) throw new Error(`elevenlabs ${res.status}: ${await res.text()}`);
    const { voices = [] } = await res.json();
    return voices.map((v) => ({
      id: v.voice_id,
      name: v.name,
      labels: Object.values(v.labels ?? {}).join(', '),
    }));
  },
};

const openai = {
  id: 'openai',
  supportsSpeed: false, // gpt-4o-mini-tts steers delivery via `instructions`, not a speed param
  ext: 'mp3',
  envKey: 'OPENAI_API_KEY',
  defaults: {
    model: 'gpt-4o-mini-tts',
    voiceId: 'shimmer',
    speed: 0.9,
    instructions:
      'Speak as a meditation guide: unhurried, warm and low, almost whispered. ' +
      'Let each phrase settle before the next. Never sound bright or announcerly.',
  },
  async synth(text, voice) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('OPENAI_API_KEY is not set (put it in .env.local)');

    const body = {
      model: voice.model,
      voice: voice.voiceId,
      input: text,
      response_format: 'mp3',
    };
    if (voice.instructions) body.instructions = voice.instructions;

    return post(
      'https://api.openai.com/v1/audio/speech',
      {
        method: 'POST',
        headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
        body: JSON.stringify(body),
      },
      'openai',
    );
  },
  async listVoices() {
    return ['alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'nova', 'onyx', 'sage', 'shimmer']
      .map((name) => ({ id: name, name, labels: 'built-in' }));
  },
};

const PROVIDERS = { elevenlabs, openai };

export function getProvider(name) {
  const provider = PROVIDERS[name];
  if (!provider) {
    throw new Error(`unknown provider "${name}". Available: ${Object.keys(PROVIDERS).join(', ')}`);
  }
  return provider;
}

export const providerNames = Object.keys(PROVIDERS);

/** Retries transient failures (429s and 5xx) with exponential backoff. */
export async function synthWithRetry(provider, text, voice, attempts = 4) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await provider.synth(text, voice);
    } catch (err) {
      lastError = err;
      const retryable = !err.status || err.status === 429 || err.status >= 500;
      if (!retryable || i === attempts - 1) throw err;
      const waitMs = 1000 * 2 ** i;
      process.stderr.write(`  retry in ${waitMs}ms (${err.message.slice(0, 80)})\n`);
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }
  throw lastError;
}
