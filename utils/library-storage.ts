import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@library_read_lessons';

export async function loadReadLessons(): Promise<string[]> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  if (!json) return [];
  try {
    const parsed: unknown = JSON.parse(json);
    // Ids of lessons since removed are harmless - progress is only ever counted
    // against the lessons that are bundled.
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export async function saveReadLessons(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}
