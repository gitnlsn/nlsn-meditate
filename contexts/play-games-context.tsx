import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { PlayGamesModule } from '@/modules/play-games';
import { PLAY_GAMES_ACHIEVEMENTS, PLAY_GAMES_LEADERBOARDS } from '@/constants/play-games';
import { useHistory } from '@/contexts/history-context';
import { computeProgress } from '@/utils/progress';

interface PlayGamesState {
  /** Android with a configured build; false everywhere else. */
  available: boolean;
  signedIn: boolean;
  signIn: () => Promise<void>;
  showAchievements: () => void;
  showLeaderboards: () => void;
}

const noop = () => {};

const PlayGamesContext = createContext<PlayGamesState>({
  available: false,
  signedIn: false,
  signIn: async () => {},
  showAchievements: noop,
  showLeaderboards: noop,
});

const playGames = PlayGamesModule;
const available = !!playGames && playGames.isConfigured();

/**
 * Keeps Play Games showing the same numbers as the History tab.
 *
 * Nothing is counted for Play Games separately. Whenever the history changes,
 * or the player signs in, the whole picture is worked out again and sent:
 * three scores and every achievement earned. Google keeps the best score and
 * ignores a repeated unlock, so resending is free — and it is what carries a
 * long practice from before sign-in, sits finished offline, and a reinstall,
 * without anything here remembering what was sent before.
 */
export function PlayGamesProvider({ children }: { children: ReactNode }) {
  const { sessions, isLoading } = useHistory();
  const [signedIn, setSignedIn] = useState(false);

  // Play Games signs the player in by itself at launch; this only finds out
  // whether it did, and again on each return in case they signed in elsewhere.
  useEffect(() => {
    if (!available) return;
    const check = () => {
      playGames!.isAuthenticated().then(setSignedIn).catch(() => setSignedIn(false));
    };
    check();
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') check();
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!available || !signedIn || isLoading) return;
    const progress = computeProgress(sessions);
    const scores: [string, number][] = [
      [PLAY_GAMES_LEADERBOARDS.totalMinutes, progress.totalMinutes],
      [PLAY_GAMES_LEADERBOARDS.weekMinutes, progress.weekMinutes],
      [PLAY_GAMES_LEADERBOARDS.bestStreak, progress.bestStreak],
    ];
    const calls = [
      ...scores
        .filter(([id, score]) => id && score > 0)
        .map(([id, score]) => playGames!.submitScore(id, score)),
      ...[...progress.unlocked]
        .map((key) => PLAY_GAMES_ACHIEVEMENTS[key])
        .filter(Boolean)
        .map((id) => playGames!.unlock(id)),
    ];
    Promise.all(calls).catch((error) => {
      console.warn('[play-games] could not sync progress:', error);
    });
  }, [sessions, isLoading, signedIn]);

  const signIn = useCallback(async () => {
    if (!available) return;
    setSignedIn(await playGames!.signIn().catch(() => false));
  }, []);

  const showAchievements = useCallback(() => {
    playGames?.showAchievements().catch((error) => console.warn('[play-games]', error));
  }, []);

  const showLeaderboards = useCallback(() => {
    playGames?.showLeaderboards().catch((error) => console.warn('[play-games]', error));
  }, []);

  const value = useMemo(
    () => ({ available, signedIn, signIn, showAchievements, showLeaderboards }),
    [signedIn, signIn, showAchievements, showLeaderboards],
  );

  return <PlayGamesContext.Provider value={value}>{children}</PlayGamesContext.Provider>;
}

export function usePlayGames() {
  return useContext(PlayGamesContext);
}
