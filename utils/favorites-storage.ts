import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@favorite_meditations';

export async function loadFavorites(): Promise<string[]> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  if (!json) return [];
  try {
    const parsed: unknown = JSON.parse(json);
    // Ids of meditations that no longer exist are harmless - the list screen
    // only ever looks favourites up against what is bundled.
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export async function saveFavorites(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}
