import { useEffect, useRef, useCallback } from 'react';
import { useMeditation, useMeditationDispatch } from '@/contexts/meditation-context';

export function useTimer() {
  const { timerState, durationSeconds, elapsedSeconds } = useMeditation();
  const dispatch = useMeditationDispatch();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const remainingSeconds = durationSeconds - elapsedSeconds;
  const progress = durationSeconds > 0 ? elapsedSeconds / durationSeconds : 0;

  useEffect(() => {
    if (timerState === 'running') {
      intervalRef.current = setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerState, dispatch]);

  const play = useCallback(() => dispatch({ type: 'PLAY' }), [dispatch]);
  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), [dispatch]);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), [dispatch]);

  return {
    timerState,
    durationSeconds,
    elapsedSeconds,
    remainingSeconds,
    progress,
    play,
    pause,
    reset,
  };
}
