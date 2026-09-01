import {
  createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode,
} from 'react';

import { loadFavorites, saveFavorites } from '@/utils/favorites-storage';

interface FavoritesState {
  favorites: Set<string>;
  isLoading: boolean;
}

const FavoritesStateContext = createContext<FavoritesState>({
  favorites: new Set(),
  isLoading: true,
});
const FavoritesToggleContext = createContext<(id: string) => void>(() => {});

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  /*
   * What is currently on disk, or null before the first read.
   *
   * A plain "have I hydrated yet" flag is not enough: it gets set before React
   * flushes the state update, so the persist effect then fires once and writes
   * back exactly what it just read. Comparing against the stored value instead
   * means a first launch that touches nothing writes nothing.
   */
  const persisted = useRef<string | null>(null);

  useEffect(() => {
    loadFavorites().then((ids) => {
      setFavorites(new Set(ids));
      persisted.current = JSON.stringify(ids);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (persisted.current === null) return;
    const ids = [...favorites];
    const serialized = JSON.stringify(ids);
    if (serialized === persisted.current) return;
    persisted.current = serialized;
    saveFavorites(ids);
  }, [favorites]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <FavoritesStateContext.Provider value={{ favorites, isLoading }}>
      <FavoritesToggleContext.Provider value={toggleFavorite}>
        {children}
      </FavoritesToggleContext.Provider>
    </FavoritesStateContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesStateContext);
}

export function useToggleFavorite() {
  return useContext(FavoritesToggleContext);
}
