import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';

export type TimerState = 'idle' | 'running' | 'paused' | 'complete';

interface MeditationState {
  timerState: TimerState;
  durationSeconds: number;
  elapsedSeconds: number;
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
};

function meditationReducer(state: MeditationState, action: MeditationAction): MeditationState {
  switch (action.type) {
    case 'SET_DURATION':
      return { ...state, durationSeconds: action.payload, elapsedSeconds: 0, timerState: 'idle' };
    case 'TICK':
      if (state.elapsedSeconds + 1 >= state.durationSeconds) {
        return { ...state, elapsedSeconds: state.durationSeconds, timerState: 'complete' };
      }
      return { ...state, elapsedSeconds: state.elapsedSeconds + 1 };
    case 'PLAY':
      return { ...state, timerState: 'running' };
    case 'PAUSE':
      return { ...state, timerState: 'paused' };
    case 'RESET':
      return { ...state, timerState: 'idle', elapsedSeconds: 0 };
    case 'COMPLETE':
      return { ...state, timerState: 'complete' };
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
