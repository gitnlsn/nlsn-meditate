import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

import { useMeditation, useMeditationDispatch, type TimerState } from '@/contexts/meditation-context';
import { useNowPlayingGuidedId } from '@/contexts/guided-session-context';
import { useAddSession } from '@/contexts/history-context';
import { useAudioSettings } from '@/contexts/audio-settings-context';
import { useAmbience } from '@/hooks/use-ambience';
import { useGong } from '@/hooks/use-gong';
import { findAmbience } from '@/constants/ambiences';
import { loadAudioSettings } from '@/utils/settings-storage';

/** How often the plain timer refreshes its reading of the clock. */
const TICK_MS = 1000;

/**
 * Renders nothing; runs the session.
 *
 * Every moving part of a meditation — the clock, the bed, the gongs, the write
 * to history — used to be an effect inside the screen that displayed it, so the
 * session existed only for as long as that screen did. Leaving the tab or
 * backing out of the player unmounted the hooks, cleared the interval and
 * removed the audio players: the meditation stopped because you stopped looking
 * at it.
 *
 * Mounted once at the root, all of it outlives navigation. The screens are now
 * only views onto it, free to come and go.
 */
export function SessionRuntime() {
  const { timerState, durationSeconds } = useMeditation();
  const dispatch = useMeditationDispatch();
  const nowPlayingGuidedId = useNowPlayingGuidedId();
  const addSession = useAddSession();
  const { settings } = useAudioSettings();
  const { playGong } = useGong();

  const prevTimerStateRef = useRef<TimerState>(timerState);

  /**
   * Either kind of meditation, running. Both the bed and the display lock follow
   * this rather than the plain timer alone — as far as the device is concerned a
   * guided session and a silent one are the same thing in progress.
   */
  const isRunning = timerState === 'running' || nowPlayingGuidedId != null;

  // The bed plays while a session is running, and pauses with it.
  useAmbience({
    ambience: findAmbience(settings.ambienceId),
    volume: settings.ambienceVolume,
    active: isRunning,
  });

  useEffect(() => {
    if (timerState !== 'running') return;
    const id = setInterval(() => dispatch({ type: 'TICK' }), TICK_MS);
    return () => clearInterval(id);
  }, [timerState, dispatch]);

  /*
   * Elapsed is measured from a timestamp, so a suspended runtime costs the
   * session nothing — but the display is still showing whatever it last read.
   * Ticking on the way back in corrects it immediately instead of a beat later.
   */
  useEffect(() => {
    if (timerState !== 'running') return;
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') dispatch({ type: 'TICK' });
    });
    return () => subscription.remove();
  }, [timerState, dispatch]);

  /*
   * Hold the display open for the length of the session.
   *
   * A guided meditation used to run without this lock, so the screen went dark
   * on the device's own auto-lock — half a minute in, mid-sentence — while the
   * plain timer sat there lit. Nothing about being guided makes a session want
   * the screen less.
   */
  useEffect(() => {
    if (isRunning) {
      activateKeepAwakeAsync();
    } else {
      deactivateKeepAwake();
    }
    return () => {
      deactivateKeepAwake();
    };
  }, [isRunning]);

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
  }, [timerState, durationSeconds, addSession, playGong, dispatch]);

  return null;
}
