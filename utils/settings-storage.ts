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

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  playGongAtStart: false,
  playGongAtEnd: false,
  ambienceId: null,
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
