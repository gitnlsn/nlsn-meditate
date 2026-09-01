import { useEffect, useRef, useCallback } from 'react';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useMeditation, useMeditationDispatch, type TimerState } from '@/contexts/meditation-context';
import { useAddSession } from '@/contexts/history-context';
import { useGong } from '@/hooks/use-gong';
import { loadAudioSettings } from '@/utils/settings-storage';

export function useTimer() {
  const { timerState, durationSeconds, elapsedSeconds } = useMeditation();
  const dispatch = useMeditationDispatch();
  const addSession = useAddSession();
  const { playGong } = useGong();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevTimerStateRef = useRef<TimerState>(timerState);

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

  useEffect(() => {
    if (timerState === 'running') {
      activateKeepAwakeAsync();
    } else {
      deactivateKeepAwake();
    }
    return () => {
      deactivateKeepAwake();
    };
  }, [timerState]);

  useEffect(() => {
    const prev = prevTimerStateRef.current;

    if (prev === 'idle' && timerState === 'running') {
      loadAudioSettings().then((s) => { if (s.playGongAtStart) playGong(); });
    }

    if (timerState === 'complete' && prev !== 'complete') {
      addSession(durationSeconds);
      loadAudioSettings().then((s) => { if (s.playGongAtEnd) playGong(); });
      dispatch({ type: 'RESET' });
    }

    prevTimerStateRef.current = timerState;
  }, [timerState, durationSeconds, addSession, playGong]);

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
