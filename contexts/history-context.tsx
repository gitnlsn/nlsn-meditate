import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  loadSessions,
  addSession as persistSession,
  type MeditationSession,
} from '@/utils/session-storage';

interface HistoryState {
  sessions: MeditationSession[];
  isLoading: boolean;
}

interface HistoryActions {
  addSession: (durationSeconds: number) => Promise<void>;
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

  const addSession = useCallback(async (durationSeconds: number) => {
    const date = new Date().toISOString().split('T')[0];
    const updated = await persistSession({ date, durationSeconds });
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
