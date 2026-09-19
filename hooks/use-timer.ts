import { useCallback } from 'react';
import { useMeditation, useMeditationDispatch } from '@/contexts/meditation-context';
import { useGuidedControls } from '@/contexts/guided-session-context';

/**
 * The timer as a screen sees it: current state plus the three controls.
 *
 * Free of the session's own side effects. Ticking, the keep-awake lock, the
 * gongs and writing the finished session to history all used to live here,
 * which tied the running session to whichever screen happened to have mounted
 * the hook — leaving the tab stopped the clock. They now run once at the root,
 * in SessionRuntime, so a session outlives any screen that shows it.
 *
 * The one thing play does beyond dispatching is end a guided meditation, and
 * that is not this session's business but the app's: both sessions outlive
 * their screens, so without it a voice left playing on the other tab carries on
 * underneath this one. Play is the single door a timer session starts through,
 * which makes it the place the rule holds.
 */
export function useTimer() {
  const { timerState, durationSeconds, elapsedSeconds } = useMeditation();
  const dispatch = useMeditationDispatch();
  const { stop: stopGuided } = useGuidedControls();

  const play = useCallback(() => {
    if (__DEV__) console.log(`[meditation] timer play pressed while ${timerState}`);
    /*
     * Resuming is not starting.
     *
     * Ending the guided session on the way in is what keeps two meditations
     * from sounding at once, and it belongs on a fresh start. A resume rejoins
     * the sit already sitting in the playback service, and the service holds
     * one session at a time — so the only thing there is to end on this path is
     * the very sit being resumed.
     */
    if (timerState !== 'paused') stopGuided();
    dispatch({ type: 'PLAY' });
  }, [timerState, stopGuided, dispatch]);
  const pause = useCallback(() => {
    if (__DEV__) console.log(`[meditation] timer pause pressed while ${timerState}`);
    dispatch({ type: 'PAUSE' });
  }, [timerState, dispatch]);
  const reset = useCallback(() => {
    if (__DEV__) console.log(`[meditation] timer reset pressed while ${timerState}`);
    dispatch({ type: 'RESET' });
  }, [timerState, dispatch]);

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
