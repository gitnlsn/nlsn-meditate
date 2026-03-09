import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@audio_settings';

export interface AudioSettings {
  playGongAtStart: boolean;
  playGongAtEnd: boolean;
}

const DEFAULT_SETTINGS: AudioSettings = {
  playGongAtStart: false,
  playGongAtEnd: false,
};

export async function loadAudioSettings(): Promise<AudioSettings> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  if (!json) return DEFAULT_SETTINGS;
  return JSON.parse(json) as AudioSettings;
}

export async function saveAudioSettings(settings: AudioSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
