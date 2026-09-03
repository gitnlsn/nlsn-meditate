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
}

type MeditationAction =
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'TICK' }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'COMPLETE' };

const initialState: MeditationState = {
  timerState: 'idle',
  durationSeconds: 600,
  elapsedSeconds: 0,
  baseElapsedSeconds: 0,
  startedAt: null,
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
        };
      }
      return { ...state, elapsedSeconds: elapsed };
    }
    case 'PLAY':
      if (state.timerState === 'running') return state;
      return { ...state, timerState: 'running', startedAt: Date.now() };
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
      return {
        ...state,
        timerState: 'idle',
        elapsedSeconds: 0,
        baseElapsedSeconds: 0,
        startedAt: null,
      };
    case 'COMPLETE':
      return { ...state, timerState: 'complete', startedAt: null };
    default:
      return state;
  }
}

const MeditationContext = createContext<MeditationState>(initialState);
const MeditationDispatchContext = createContext<Dispatch<MeditationAction>>(() => {});

export function MeditationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(meditationReducer, initialState);

  return (
    <MeditationContext.Provider value={state}>
      <MeditationDispatchContext.Provider value={dispatch}>
        {children}
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
