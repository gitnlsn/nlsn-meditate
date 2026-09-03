import { useCallback } from 'react';
import { useMeditation, useMeditationDispatch } from '@/contexts/meditation-context';

/**
 * The timer as a screen sees it: current state plus the three controls.
 *
 * Deliberately side-effect free. Ticking, the keep-awake lock, the gongs and
 * writing the finished session to history all used to live here, which tied the
 * running session to whichever screen happened to have mounted the hook —
 * leaving the tab stopped the clock. They now run once at the root, in
 * SessionRuntime, so a session outlives any screen that shows it.
 */
export function useTimer() {
  const { timerState, durationSeconds, elapsedSeconds } = useMeditation();
  const dispatch = useMeditationDispatch();

  const play = useCallback(() => dispatch({ type: 'PLAY' }), [dispatch]);
  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), [dispatch]);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), [dispatch]);

  return {
    timerState,
    durationSeconds,
    elapsedSeconds: Math.floor(elapsedSeconds),
    // Ceiling, so a fresh 10:00 session reads 10:00 rather than 09:59.
    remainingSeconds: Math.max(0, Math.ceil(durationSeconds - elapsedSeconds)),
    progress: durationSeconds > 0 ? Math.min(1, elapsedSeconds / durationSeconds) : 0,
    play,
    pause,
    reset,
  };
}
