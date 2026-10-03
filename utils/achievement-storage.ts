import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AchievementKey } from '@/constants/achievements';

const STORAGE_KEY = '@achievements_seen';

/**
 * The badges already celebrated, so each is announced once.
 *
 * Null when nothing has ever been written — the first launch of a version with
 * badges. That case is told apart from an empty list on purpose: it is the
 * moment to quietly accept everything already earned, rather than greet
 * someone with months of practice by a queue of announcements.
 */
export async function loadSeenAchievements(): Promise<Set<AchievementKey> | null> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  if (json === null) return null;
  try {
    return new Set(JSON.parse(json) as AchievementKey[]);
  } catch {
    return new Set();
  }
}

export async function saveSeenAchievements(seen: Set<AchievementKey>): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...seen]));
}
