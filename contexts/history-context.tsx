import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  loadSessions,
  addSession as persistSession,
  type MeditationSession,
} from '@/utils/session-storage';
import { localDateString } from '@/utils/date';

interface HistoryState {
  sessions: MeditationSession[];
  isLoading: boolean;
}

/** Extra detail recorded for guided sessions; plain timer sessions omit it. */
export interface SessionMeta {
  meditationId: string;
  title: string;
}

/** One finished sit, as the thing that finished it reports it. */
export interface FinishedSession {
  durationSeconds: number;
  /**
   * Epoch ms the sit ended, which is not always when we heard about it. A
   * session can end with the screen locked and only be reported on the way back
   * in, so stamping the arrival would file a late-evening sit under the
   * following day. Defaults to now, for a completion observed as it happens.
   */
  endedAt?: number;
  /** Stable identity, so the same sit reported twice is recorded once. */
  sessionId?: string;
  meta?: SessionMeta;
}

interface HistoryActions {
  addSession: (session: FinishedSession) => Promise<void>;
}

const HistoryStateContext = createContext<HistoryState>({ sessions: [], isLoading: true });
const HistoryActionsContext = createContext<HistoryActions>({
  addSession: async () => {},
});

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessions().then((loaded) => {
      setSessions(loaded);
      setIsLoading(false);
    });
  }, []);

  const addSession = useCallback(async (session: FinishedSession) => {
    const { durationSeconds, endedAt = Date.now(), sessionId, meta } = session;
    const updated = await persistSession({
      date: localDateString(endedAt),
      durationSeconds,
      endedAt,
      ...(sessionId && { sessionId }),
      ...meta,
    });
    setSessions(updated);
  }, []);

  return (
    <HistoryStateContext.Provider value={{ sessions, isLoading }}>
      <HistoryActionsContext.Provider value={{ addSession }}>
        {children}
      </HistoryActionsContext.Provider>
    </HistoryStateContext.Provider>
  );
}

export function useHistory() {
  return useContext(HistoryStateContext);
}

export function useAddSession() {
  return useContext(HistoryActionsContext).addSession;
}
