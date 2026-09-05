import { useCallback } from 'react';

import { useMeditationDispatch, useTimerState } from '@/contexts/meditation-context';

/**
 * Whether the timer holds a session someone is in the middle of, and how to end
 * it — for the tab bar, which is the only way out of that screen.
 *
 * The guided player intercepts its own removal, because it is a screen with a
 * back button and a navigator that can be told to hold the gesture. The timer
 * is a tab: there is nothing to intercept, only a press on one of the other
 * three, so its half of the question is asked from the layout instead. This
 * reads the state string and nothing else, so a running session's tick does not
 * re-render the bar it is asked from.
 *
 * Ending is discarding — no history is written, matching the reset control,
 * which has always thrown away a session stopped short.
 */
export function useSessionGuard() {
  const timerState = useTimerState();
  const dispatch = useMeditationDispatch();

  const endTimer = useCallback(() => dispatch({ type: 'RESET' }), [dispatch]);

  return {
    /** Running or paused — a session, as opposed to one already finished. */
    timerActive: timerState === 'running' || timerState === 'paused',
    endTimer,
  };
}
