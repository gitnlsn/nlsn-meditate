import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@meditation_sessions';

export interface MeditationSession {
  date: string; // "2026-03-09" (ISO date)
  durationSeconds: number;
}

export async function loadSessions(): Promise<MeditationSession[]> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  if (!json) return [];
  return JSON.parse(json) as MeditationSession[];
}

export async function addSession(session: MeditationSession): Promise<MeditationSession[]> {
  const sessions = await loadSessions();
  sessions.push(session);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  return sessions;
}
