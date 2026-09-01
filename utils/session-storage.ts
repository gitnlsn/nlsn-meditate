import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@meditation_sessions';

export interface MeditationSession {
  date: string; // "2026-03-09" (ISO date)
  durationSeconds: number;
  /**
   * Set for guided sessions only. Optional so records written before guided
   * meditations existed stay valid — readers must tolerate both being absent.
   */
  meditationId?: string;
  title?: string;
}

export async function loadSessions(): Promise<MeditationSession[]> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  if (!json) return [];
  try {
    return JSON.parse(json) as MeditationSession[];
  } catch {
    return [];
  }
}

export async function addSession(session: MeditationSession): Promise<MeditationSession[]> {
  const sessions = await loadSessions();
  sessions.push(session);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  return sessions;
}
