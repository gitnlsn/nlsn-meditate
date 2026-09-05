import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@meditation_sessions';

export interface MeditationSession {
  date: string; // "2026-03-09", the local day the sit ended on
  durationSeconds: number;
  /**
   * Set for guided sessions only. Optional so records written before guided
   * meditations existed stay valid — readers must tolerate both being absent.
   */
  meditationId?: string;
  title?: string;
  /**
   * Stable identity for one sit, so writing it twice is harmless. A session can
   * now be reported by two routes — the live completion, and the record the
   * playback service wrote at the moment the timeline ended — and both may
   * arrive. Optional, like the fields above: records written before this
   * existed have none, and nothing may assume otherwise.
   */
  sessionId?: string;
  /** Epoch ms the sit ended. `date` is derived from it; kept so the day a
   * record belongs to stays answerable if the question ever changes. */
  endedAt?: number;
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

/**
 * Append a sit, unless it is already there.
 *
 * The same completion can be reported more than once — the service records it
 * natively the instant the timeline ends, and the app may also notice on its
 * own way back in. Keying on `sessionId` makes the second report a no-op
 * instead of a second entry in the calendar.
 */
export async function addSession(session: MeditationSession): Promise<MeditationSession[]> {
  const sessions = await loadSessions();
  if (session.sessionId && sessions.some((s) => s.sessionId === session.sessionId)) {
    return sessions;
  }
  sessions.push(session);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  return sessions;
}
