import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';

export type TimerState = 'idle' | 'running' | 'paused' | 'complete';

interface MeditationState {
  timerState: TimerState;
  durationSeconds: number;
  /** Elapsed seconds, fractional while running. What the UI reads. */
  elapsedSeconds: number;
  /** Elapsed banked by earlier runs; the live run is measured on top of this. */
  baseElapsedSeconds: number;
  /** Wall clock (ms) the current run started, or null when not running. */
  startedAt: number | null;
  /**
   * Identity for this sit, held across pauses. What makes recording it twice
   * harmless, whoever reports it.
   */
  sessionId: string | null;
  /**
   * Wall clock (ms) the sit actually ended, set with `complete`.
   *
   * Not the same as when we noticed. A session can run out with the screen
   * locked and only be observed on the way back in, and history is filed by the
   * day the sit ended, not the day we heard about it.
   */
  completedAt: number | null;
}

type MeditationAction =
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'TICK' }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  /** `at` is when the sit ended; omit it only when that is now. */
  | { type: 'COMPLETE'; at?: number }
  /** Rejoin a sit the playback service is already part-way through. */
  | { type: 'RESTORE'; payload: { sessionId: string; durationSeconds: number; elapsedSeconds: number; running: boolean } };

const initialState: MeditationState = {
  timerState: 'idle',
  durationSeconds: 600,
  elapsedSeconds: 0,
  baseElapsedSeconds: 0,
  startedAt: null,
  sessionId: null,
  completedAt: null,
};

/**
 * Elapsed is read off the wall clock rather than accumulated a tick at a time.
 *
 * Counting ticks makes the timer only as reliable as the JS thread: every
 * interval the runtime skips — a stalled frame, a backgrounded app, a locked
 * screen — is a second the session silently loses. Measuring from a start
 * timestamp means a gap of any length costs nothing; the next tick after it
 * simply reports the truth, and a session whose duration ran out while the app
 * was away completes on the way back in.
 */
function elapsedAt(state: MeditationState, now: number): number {
  if (state.startedAt == null) return state.baseElapsedSeconds;
  return state.baseElapsedSeconds + (now - state.startedAt) / 1000;
}

function meditationReducer(state: MeditationState, action: MeditationAction): MeditationState {
  switch (action.type) {
    case 'SET_DURATION':
      return {
        ...state,
        durationSeconds: action.payload,
        timerState: 'idle',
        elapsedSeconds: 0,
        baseElapsedSeconds: 0,
        startedAt: null,
        sessionId: null,
        completedAt: null,
      };
    case 'TICK': {
      if (state.timerState !== 'running') return state;
      const elapsed = elapsedAt(state, Date.now());
      if (elapsed >= state.durationSeconds) {
        return {
          ...state,
          timerState: 'complete',
          elapsedSeconds: state.durationSeconds,
          baseElapsedSeconds: state.durationSeconds,
          startedAt: null,
          // Where the clock ran out, not where we happened to look.
          completedAt:
            (state.startedAt ?? Date.now()) +
            (state.durationSeconds - state.baseElapsedSeconds) * 1000,
        };
      }
      return { ...state, elapsedSeconds: elapsed };
    }
    case 'PLAY': {
      if (state.timerState === 'running') return state;
      const now = Date.now();
      return {
        ...state,
        timerState: 'running',
        startedAt: now,
        // A resume rejoins the sit it paused; only a fresh start is a new one.
        sessionId: state.timerState === 'paused' ? state.sessionId : String(now),
        completedAt: null,
      };
    }
    case 'PAUSE': {
      if (state.timerState !== 'running') return state;
      const elapsed = elapsedAt(state, Date.now());
      return {
        ...state,
        timerState: 'paused',
        elapsedSeconds: elapsed,
        baseElapsedSeconds: elapsed,
        startedAt: null,
      };
    }
    case 'RESET':
      /*
       * Nothing to clear is not a change. Starting a guided meditation resets
       * the timer unconditionally — one session at a time — and most of the
       * time there is no timer to end; returning the same state keeps that
       * guard from re-rendering the app for nothing.
       */
      if (state.timerState === 'idle' && state.elapsedSeconds === 0) return state;
      return {
        ...state,
        timerState: 'idle',
        elapsedSeconds: 0,
        baseElapsedSeconds: 0,
        startedAt: null,
      };
    /*
     * The clock, rebuilt around a sit that never stopped.
     *
     * A silent session is held by the playback service, so it survives the app
     * being torn down and put back together — and comes back to a timer that
     * remembers nothing. Rather than show an idle clock over a meditation still
     * running, the elapsed time is read back off the service and the start
     * timestamp reconstructed from it, which is all `elapsedAt` needs.
     */
    case 'RESTORE': {
      const { sessionId, durationSeconds, elapsedSeconds, running } = action.payload;
      return {
        ...state,
        durationSeconds,
        timerState: running ? 'running' : 'paused',
        elapsedSeconds,
        baseElapsedSeconds: running ? 0 : elapsedSeconds,
        startedAt: running ? Date.now() - elapsedSeconds * 1000 : null,
        sessionId,
        completedAt: null,
      };
    }
    case 'COMPLETE':
      return { ...state, timerState: 'complete', startedAt: null };
    default:
      return state;
  }
}

const MeditationContext = createContext<MeditationState>(initialState);
const MeditationDispatchContext = createContext<Dispatch<MeditationAction>>(() => {});

/**
 * Whether the timer is running, published apart from the rest of the state.
 *
 * A running session dispatches a TICK every second, so anything subscribing to
 * the whole state re-renders every second with it. The tab bar only needs to
 * know which of the four states the timer is in — a bare string that changes
 * on a transition and at no other time.
 */
const TimerStatusContext = createContext<TimerState>('idle');

export function MeditationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(meditationReducer, initialState);

  return (
    <MeditationContext.Provider value={state}>
      <MeditationDispatchContext.Provider value={dispatch}>
        <TimerStatusContext.Provider value={state.timerState}>
          {children}
        </TimerStatusContext.Provider>
      </MeditationDispatchContext.Provider>
    </MeditationContext.Provider>
  );
}

export function useMeditation() {
  return useContext(MeditationContext);
}

export function useMeditationDispatch() {
  return useContext(MeditationDispatchContext);
}

/** The timer's state alone, for anything that must not re-render on every tick. */
export function useTimerState() {
  return useContext(TimerStatusContext);
}
