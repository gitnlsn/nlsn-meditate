import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@audio_settings';

export interface AudioSettings {
  playGongAtStart: boolean;
  playGongAtEnd: boolean;
  /** id of the chosen background bed, or null for silence. */
  ambienceId: string | null;
  /** 0..1, applied to the background bed. */
  ambienceVolume: number;
  /** 0..1, applied to the guide's voice. */
  voiceVolume: number;
}

/**
 * The bed a session opens with.
 *
 * A default of silence meant a first session played nothing at all, which reads
 * as the audio being broken rather than as a choice. Forest is the least
 * particular of the beds — no traffic, no voices, nothing that pulls attention
 * to itself. Anyone who wants silence can still pick it.
 *
 * Only new installs see this: loadAudioSettings merges stored settings over the
 * defaults, so someone who has already chosen silence keeps it.
 */
export const DEFAULT_AMBIENCE_ID = 'nature-02';

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  playGongAtStart: false,
  playGongAtEnd: false,
  ambienceId: DEFAULT_AMBIENCE_ID,
  ambienceVolume: 0.6,
  voiceVolume: 1,
};

export async function loadAudioSettings(): Promise<AudioSettings> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  if (!json) return DEFAULT_AUDIO_SETTINGS;
  try {
    // Merged over the defaults, not returned raw: anyone who saved settings
    // before a field existed would otherwise read it back as undefined.
    return { ...DEFAULT_AUDIO_SETTINGS, ...(JSON.parse(json) as Partial<AudioSettings>) };
  } catch {
    return DEFAULT_AUDIO_SETTINGS;
  }
}

export async function saveAudioSettings(settings: AudioSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
