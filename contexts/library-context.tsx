import {
  createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode,
} from 'react';

import { loadReadLessons, saveReadLessons } from '@/utils/library-storage';

const ReadLessonsContext = createContext<Set<string>>(new Set());
const ToggleReadContext = createContext<(id: string) => void>(() => {});

/** Which Library lessons have been read. Persisted as favourites are. */
export function LibraryProvider({ children }: { children: ReactNode }) {
  const [read, setRead] = useState<Set<string>>(new Set());

  // What is on disk, or null before the first read - see FavoritesProvider.
  const persisted = useRef<string | null>(null);

  useEffect(() => {
    loadReadLessons().then((ids) => {
      setRead(new Set(ids));
      persisted.current = JSON.stringify(ids);
    });
  }, []);

  useEffect(() => {
    if (persisted.current === null) return;
    const ids = [...read];
    const serialized = JSON.stringify(ids);
    if (serialized === persisted.current) return;
    persisted.current = serialized;
    saveReadLessons(ids);
  }, [read]);

  const toggleRead = useCallback((id: string) => {
    setRead((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <ReadLessonsContext.Provider value={read}>
      <ToggleReadContext.Provider value={toggleRead}>
        {children}
      </ToggleReadContext.Provider>
    </ReadLessonsContext.Provider>
  );
}

export function useReadLessons() {
  return useContext(ReadLessonsContext);
}

export function useToggleRead() {
  return useContext(ToggleReadContext);
}
