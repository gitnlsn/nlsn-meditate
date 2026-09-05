import {
  createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode,
} from 'react';

import type { GuidedMeditation } from '@/constants/guided-meditations';
import { useGuidedSession } from '@/hooks/use-guided-session';
import { useAddSession } from '@/contexts/history-context';
import { useAudioSettings } from '@/contexts/audio-settings-context';
import { useMeditationDispatch } from '@/contexts/meditation-context';

type Session = ReturnType<typeof useGuidedSession>;

interface GuidedSessionContextValue extends Session {
  /** The meditation currently loaded, running or not. */
  meditation: GuidedMeditation | undefined;
  /**
   * Point the session at a meditation. Adopting the one already loaded is a
   * no-op, so re-opening the player rejoins a session in progress instead of
   * restarting it. Switching to a different one ends whatever was playing.
   */
  load: (next: GuidedMeditation | undefined) => void;
}

/** Ending the guided session, and pointing it somewhere else. */
interface GuidedControls {
  stop: () => void;
  load: (next: GuidedMeditation | undefined) => void;
}

const GuidedSessionContext = createContext<GuidedSessionContextValue | null>(null);
const NowPlayingContext = createContext<string | undefined>(undefined);
const GuidedControlsContext = createContext<GuidedControls | null>(null);

/**
 * Holds the guided session for the whole app rather than for one screen.
 *
 * The player screen used to own both the session state and the audio player, so
 * navigating back unmounted the hook, removed the player and dropped the
 * meditation mid-sentence. Owning it here means the screen is only a view of a
 * session that is running somewhere else — you can leave it, browse the library,
 * and come back to the same voice at the same place.
 */
export function GuidedSessionProvider({ children }: { children: ReactNode }) {
  const [meditation, setMeditation] = useState<GuidedMeditation | undefined>(undefined);
  const addSession = useAddSession();
  const { settings } = useAudioSettings();

  const handleComplete = useCallback((finished: GuidedMeditation) => {
    addSession(finished.durationSeconds, {
      meditationId: finished.id,
      title: finished.title,
    });
  }, [addSession]);

  const session = useGuidedSession(meditation, {
    onComplete: handleComplete,
    volume: settings.voiceVolume,
  });

  const { stop, play: playSession } = session;

  /*
   * One meditation at a time.
   *
   * Both sessions outlive the screens that show them, which is what lets you
   * leave a meditation running and come back to it — and also what let two of
   * them run at once: a timer left going on its tab kept ticking underneath a
   * guided voice, gonged over it, and wrote itself to history. Starting here
   * ends the timer, and useTimer's play ends this session, so whichever one you
   * begin is the only one playing. The prompt on leaving a session usually gets
   * there first; this catches the paths it cannot see, a deep link into a
   * player among them.
   */
  const meditationDispatch = useMeditationDispatch();
  const play = useCallback(() => {
    meditationDispatch({ type: 'RESET' });
    playSession();
  }, [meditationDispatch, playSession]);

  /*
   * What is loaded, tracked outside render state as well.
   *
   * `load` is called from an effect on the player screen, and child effects run
   * before the parent's, so the `meditation` this render closed over can be a
   * step behind. The ref is written the moment a load is accepted, which also
   * makes the duplicate call a remount produces a no-op.
   */
  const loadedIdRef = useRef<string | undefined>(undefined);

  const load = useCallback((next: GuidedMeditation | undefined) => {
    if (loadedIdRef.current === next?.id) return;
    loadedIdRef.current = next?.id;
    stop();
    setMeditation(next);
  }, [stop]);

  const value: GuidedSessionContextValue = { ...session, play, meditation, load };

  /*
   * Ending the session, published on its own.
   *
   * Both of these keep their identity for the life of the provider, so a
   * subscriber that only ever needs to stop the session — the timer's play, the
   * confirmations on the way out of a screen — is not dragged into the four
   * re-renders a second the full session makes.
   */
  const controls = useMemo<GuidedControls>(() => ({ stop, load }), [stop, load]);

  /*
   * The id of what is playing, published separately from the session itself.
   *
   * A running session re-renders this provider four times a second. Anything
   * that only needs to know *whether* something is playing — the library's
   * row marker, the root's background bed — subscribes to this bare string
   * instead, so a whole list is not rebuilt on every progress update.
   */
  const nowPlayingId = session.state === 'running' ? meditation?.id : undefined;

  return (
    <GuidedSessionContext.Provider value={value}>
      <GuidedControlsContext.Provider value={controls}>
        <NowPlayingContext.Provider value={nowPlayingId}>
          {children}
        </NowPlayingContext.Provider>
      </GuidedControlsContext.Provider>
    </GuidedSessionContext.Provider>
  );
}

/** The full session. Only worth using on a screen that shows its progress. */
export function useGuidedSessionContext(): GuidedSessionContextValue {
  const value = useContext(GuidedSessionContext);
  if (!value) {
    throw new Error('useGuidedSessionContext must be used inside a GuidedSessionProvider');
  }
  return value;
}

/** The id of the guided meditation playing right now, if any. */
export function useNowPlayingGuidedId(): string | undefined {
  return useContext(NowPlayingContext);
}

/** Stopping the guided session, or pointing it at another meditation. */
export function useGuidedControls(): GuidedControls {
  const value = useContext(GuidedControlsContext);
  if (!value) {
    throw new Error('useGuidedControls must be used inside a GuidedSessionProvider');
  }
  return value;
}
