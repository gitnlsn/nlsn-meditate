import AsyncStorage from '@react-native-async-storage/async-storage';

import { LOCALES, type Locale } from '@/constants/i18n';

const STORAGE_KEY = '@locale_preference';

/** null means "whatever the device is set to", which is also the default. */
export type LocalePreference = Locale | null;

export async function loadLocalePreference(): Promise<LocalePreference> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  return LOCALES.includes(stored as Locale) ? (stored as Locale) : null;
}

export async function saveLocalePreference(preference: LocalePreference): Promise<void> {
  if (preference === null) {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return;
  }
  await AsyncStorage.setItem(STORAGE_KEY, preference);
}
