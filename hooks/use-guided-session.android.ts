import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { MeditationSessionModule } from '@/modules/meditation-session';
import type { AudioAsset, GuidedMeditation } from '@/constants/guided-meditations';
import type { TimerState } from '@/contexts/meditation-context';
import { assetUri, guidedTimeline } from '@/utils/timeline';

export type GuidedPhase = 'idle' | 'lead-in' | 'speaking' | 'waiting' | 'lead-out';

interface Options {
  onComplete?: (meditation: GuidedMeditation, endedAt: number) => void;
  /** 0..1, applied to the guide's voice. */
  volume?: number;
  /** The bed, handed to the service so it loops for as long as the sit does. */
  bed?: { source: AudioAsset; volume: number };
  /** Sounded at the very end, as the last item of the timeline. */
  gong?: AudioAsset;
}

/**
 * A guided meditation, played by the native service.
 *
 * The counterpart of the JavaScript sequencer this replaces on Android, and
 * deliberately much less: it hands the whole timeline over once and then only
 * listens. Nothing here has to still be running for the meditation to reach its
 * end, which is the entire reason it exists — on a locked Android screen, this
 * side of the app is asleep, and the version that sequenced lines with
 * `setTimeout` simply stopped partway through.
 *
 * Same shape as the JavaScript version, so the screens cannot tell which one
 * they are looking at.
 */
export function useGuidedSession(meditation: GuidedMeditation | undefined, options: Options = {}) {
  const { onComplete, volume = 1, bed, gong } = options;

  const [state, setState] = useState<TimerState>('idle');
  const [positionMs, setPositionMs] = useState(0);
  const [cueIndex, setCueIndex] = useState(-1);

  // Kept in a ref so a changing callback identity does not resubscribe the
  // event listeners mid-session. Assigned in an effect rather than during
  // render, since the React Compiler is enabled for this project.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const meditationRef = useRef(meditation);
  useEffect(() => {
    meditationRef.current = meditation;
  }, [meditation]);

  // Read inside the rehydration effect, which must not re-run just because the
  // session it is guarding against moved on a tick.
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  /** Back to nothing playing, without telling the service anything. */
  const reset = useCallback(() => {
    setPositionMs(0);
    setCueIndex(-1);
    setState('idle');
  }, []);

  /*
   * Come back to a session already in progress.
   *
   * The meditation outlives the app that started it, so a JavaScript runtime
   * rebuilt underneath it — after a long lock, or memory pressure — returns
   * knowing nothing while the voice carries on. Asking the service what it is
   * playing is the difference between the screen telling the truth and offering
   * a play button over a session that is already halfway through.
   */
  useEffect(() => {
    const module = MeditationSessionModule;
    if (!module) return;

    /*
     * Nothing loaded yet is not the same as nothing wanted.
     *
     * On a fresh runtime the provider has no meditation until a screen asks for
     * one, and treating that moment as "the reader moved on" would end the very
     * session being rejoined. Leaving is not stopping here either — the reset
     * control is what ends a meditation.
     */
    if (!meditation) return;

    let abandoned = false;
    module.getState()
      .then((running) => {
        if (abandoned) return;

        if (!running) {
          if (stateRef.current !== 'idle') reset();
          return;
        }

        if (running.meditationId === meditation.id) {
          // The same meditation, still going. Pick it up where it is.
          if (__DEV__) console.log(`[meditation] rejoining ${running.meditationId} at ${running.positionMs}ms`);
          setState(running.state);
          setPositionMs(running.positionMs);
          setCueIndex(running.cueIndex);
          return;
        }

        // Something else is playing, and the reader has moved on from it.
        if (__DEV__) console.log(`[meditation] ending ${running.meditationId} to load ${meditation.id}`);
        module.stop();
        reset();
      })
      .catch((error) => console.warn('[meditation] could not rejoin session:', error));

    return () => {
      abandoned = true;
    };
  }, [meditation, reset]);

  const total = meditation?.durationSeconds ?? 0;

  useEffect(() => {
    const module = MeditationSessionModule;
    if (!module) return;

    const subscriptions = [
      module.addListener('onProgress', ({ positionMs: at }) => setPositionMs(at)),
      module.addListener('onItemChanged', ({ cueIndex: cue }) => setCueIndex(cue)),
      module.addListener('onError', ({ message }) => {
        console.warn('[meditation] session failed:', message);
      }),
      module.addListener('onCompleted', ({ endedAt }) => {
        setState('complete');
        setCueIndex(-1);
        const current = meditationRef.current;
        if (current) onCompleteRef.current?.(current, endedAt);
      }),
    ];

    return () => {
      for (const subscription of subscriptions) subscription.remove();
    };
  }, []);

  /*
   * Position updates are only worth sending while somebody is looking. In the
   * background they would wake the JavaScript thread four times a second to
   * move a ring nobody can see — the exact dependency the service was built to
   * remove.
   */
  useEffect(() => {
    const module = MeditationSessionModule;
    if (!module) return;

    const subscription = AppState.addEventListener('change', (next) => {
      module.setProgressUpdates(next === 'active');
    });
    return () => {
      subscription.remove();
    };
  }, []);

  const play = useCallback(() => {
    const module = MeditationSessionModule;
    if (!module || !meditation || state === 'running') return;

    if (state === 'paused') {
      module.resume();
      setState('running');
      return;
    }

    setPositionMs(0);
    setCueIndex(-1);
    setState('running');

    // The bed goes down with the timeline rather than being played alongside
    // it from here: one service owns everything the session makes a sound with,
    // so the bed cannot outlive the meditation or die before it does.
    Promise.all([
      guidedTimeline(meditation, gong),
      bed ? assetUri(bed.source) : Promise.resolve(undefined),
    ])
      .then(([items, bedUri]) =>
        module.start({
          sessionId: String(Date.now()),
          durationSeconds: meditation.durationSeconds,
          items,
          voiceVolume: volume,
          ...(bedUri && { bedUri, bedVolume: bed?.volume ?? 0.6 }),
          meditationId: meditation.id,
          title: meditation.title,
        }),
      )
      .catch((error) => {
        console.warn('[meditation] could not start guided session:', error);
        setState('idle');
      });
  }, [meditation, state, volume, bed, gong]);

  const pause = useCallback(() => {
    if (state !== 'running') return;
    MeditationSessionModule?.pause();
    setState('paused');
  }, [state]);

  const stop = useCallback(() => {
    if (__DEV__) console.log('[meditation] guided stop()');
    MeditationSessionModule?.stop();
    reset();
  }, [reset]);

  const elapsedSeconds = Math.min(positionMs / 1000, total);
  const segment = cueIndex >= 0 ? meditation?.segments[cueIndex] : undefined;

  const phase: GuidedPhase =
    state === 'idle' || state === 'complete'
      ? 'idle'
      : segment
        ? 'speaking'
        : elapsedSeconds < (meditation?.leadInSeconds ?? 0)
          ? 'lead-in'
          : elapsedSeconds >= total - (meditation?.leadOutSeconds ?? 0)
            ? 'lead-out'
            : 'waiting';

  return {
    state,
    phase,
    currentIndex: cueIndex,
    /** The line being spoken; null through silences and before the first line. */
    currentText: segment?.text ?? null,
    elapsedSeconds: Math.round(elapsedSeconds),
    remainingSeconds: Math.max(0, Math.round(total - elapsedSeconds)),
    progress: total > 0 ? Math.min(1, elapsedSeconds / total) : 0,
    durationSeconds: total,
    play,
    pause,
    stop,
  };
}
