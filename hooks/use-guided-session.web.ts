import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

import type { AudioAsset, GuidedMeditation } from '@/constants/guided-meditations';
import type { TimerState } from '@/contexts/meditation-context';

export type GuidedPhase = 'idle' | 'lead-in' | 'speaking' | 'waiting' | 'lead-out';

interface Options {
  /** `endedAt` is the wall clock the session finished, for filing it by day. */
  onComplete?: (meditation: GuidedMeditation, endedAt: number) => void;
  /** 0..1, applied to the guide's voice. */
  volume?: number;
  /**
   * Accepted and ignored, so both implementations of this hook take the same
   * options. Where a session is played by the native service it is handed the
   * bed and the closing bell as part of the timeline; here the bed is played
   * separately by useAmbience, and nothing sounds a gong.
   */
  bed?: { source: AudioAsset; volume: number };
  gong?: AudioAsset;
}

/**
 * Plays a guided meditation: speak a line, hold the silence written after it,
 * move on. Most of a session is the silence, so the silence is the part that has
 * to be right.
 *
 * Reuses `TimerState` so the existing TimerControls component drives this
 * unchanged.
 */
export function useGuidedSession(meditation: GuidedMeditation | undefined, options: Options = {}) {
  const { onComplete, volume = 1 } = options;

  const [state, setState] = useState<TimerState>('idle');
  const [phase, setPhase] = useState<GuidedPhase>('idle');
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const playerRef = useRef<AudioPlayer | null>(null);
  const indexRef = useRef(-1);
  const phaseRef = useRef<GuidedPhase>('idle');

  // Guards against a stale `didJustFinish` advancing the sequence twice.
  const settledRef = useRef(false);

  const waitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const waitEndsAtRef = useRef(0);
  const waitRemainingRef = useRef(0);
  /** What the current silence is waiting to do, so resuming can just re-arm it. */
  const waitDoneRef = useRef<(() => void) | null>(null);

  const elapsedRef = useRef(0);
  // Kept in a ref so a changing callback identity does not tear down the
  // sequencing effects mid-session. Assigned in an effect rather than during
  // render, since the React Compiler is enabled for this project.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const total = meditation?.durationSeconds ?? 0;

  const clearWait = useCallback(() => {
    if (waitTimerRef.current) {
      clearTimeout(waitTimerRef.current);
      waitTimerRef.current = null;
    }
  }, []);

  /**
   * One player for the whole session; the source is swapped per line. Seeded
   * with the first line rather than null so the opening is already buffered when
   * the lead-in silence ends.
   */
  useEffect(() => {
    if (!meditation) return;
    const first = meditation.segments.find((s) => s.source != null)?.source ?? null;
    const player = createAudioPlayer(first);
    playerRef.current = player;
    return () => {
      playerRef.current = null;
      player.remove();
    };
  }, [meditation]);

  useEffect(() => {
    if (playerRef.current) playerRef.current.volume = volume;
  }, [volume]);

  const finish = useCallback(() => {
    clearWait();
    phaseRef.current = 'idle';
    setPhase('idle');
    indexRef.current = -1;
    setCurrentIndex(-1);
    elapsedRef.current = total;
    setElapsedSeconds(total);
    setState('complete');
    if (meditation) onCompleteRef.current?.(meditation, Date.now());
  }, [clearWait, meditation, total]);

  /**
   * Silence is scheduled from a deadline rather than a fixed timeout, so pausing
   * can convert what is left into a remainder and resume from exactly there.
   */
  const scheduleWait = useCallback((ms: number, onDone: () => void) => {
    clearWait();
    waitDoneRef.current = onDone;
    waitEndsAtRef.current = Date.now() + ms;
    waitRemainingRef.current = ms;
    if (ms <= 0) {
      onDone();
      return;
    }
    waitTimerRef.current = setTimeout(onDone, ms);
  }, [clearWait]);

  const startSegment = useCallback((index: number) => {
    const segments = meditation?.segments;
    const player = playerRef.current;
    if (!segments || !player) return;

    if (index >= segments.length) {
      // Lead-out: the closing silence after the final line.
      phaseRef.current = 'lead-out';
      setPhase('lead-out');
      scheduleWait((meditation?.leadOutSeconds ?? 0) * 1000, finish);
      return;
    }

    const segment = segments[index];
    indexRef.current = index;
    setCurrentIndex(index);

    const holdThenAdvance = () => {
      phaseRef.current = 'waiting';
      setPhase('waiting');
      scheduleWait(segment.waitSeconds * 1000, () => startSegment(index + 1));
    };

    if (segment.source == null) {
      // A wait-only beat: no line to speak, just the silence.
      holdThenAdvance();
      return;
    }

    settledRef.current = false;
    phaseRef.current = 'speaking';
    setPhase('speaking');
    player.replace(segment.source);
    player.play();
  }, [meditation, scheduleWait, finish]);

  /** Advance when the current line finishes speaking. */
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !meditation) return;

    const subscription = player.addListener('playbackStatusUpdate', (status) => {
      if (!status.didJustFinish) return;
      if (phaseRef.current !== 'speaking' || settledRef.current) return;
      settledRef.current = true;

      const index = indexRef.current;
      const segment = meditation.segments[index];
      if (!segment) return;

      phaseRef.current = 'waiting';
      setPhase('waiting');
      scheduleWait(segment.waitSeconds * 1000, () => startSegment(index + 1));
    });

    return () => subscription.remove();
  }, [meditation, scheduleWait, startSegment]);

  /**
   * Elapsed time accumulates real milliseconds rather than counting ticks. A
   * counted tick drifts whenever the JS thread stalls, which would slide the
   * progress ring out of step with audio that is keeping its own time.
   */
  useEffect(() => {
    if (state !== 'running') return;
    let last = Date.now();
    const id = setInterval(() => {
      const now = Date.now();
      elapsedRef.current = Math.min(elapsedRef.current + (now - last) / 1000, total);
      last = now;
      setElapsedSeconds(elapsedRef.current);
    }, 250);
    return () => clearInterval(id);
  }, [state, total]);

  const play = useCallback(() => {
    if (!meditation || state === 'running') return;

    if (state === 'paused') {
      if (phaseRef.current === 'speaking') {
        playerRef.current?.play();
      } else {
        // Re-arm the same continuation with only the time that was left on it.
        const onDone = waitDoneRef.current;
        if (onDone) scheduleWait(waitRemainingRef.current, onDone);
      }
      setState('running');
      return;
    }

    // Fresh start: the opening silence before the first line.
    elapsedRef.current = 0;
    setElapsedSeconds(0);
    setState('running');
    phaseRef.current = 'lead-in';
    setPhase('lead-in');
    scheduleWait(meditation.leadInSeconds * 1000, () => startSegment(0));
  }, [meditation, state, scheduleWait, startSegment]);

  const pause = useCallback(() => {
    if (state !== 'running') return;
    if (phaseRef.current === 'speaking') {
      playerRef.current?.pause();
    } else {
      waitRemainingRef.current = Math.max(0, waitEndsAtRef.current - Date.now());
      clearWait();
    }
    setState('paused');
  }, [state, clearWait]);

  const stop = useCallback(() => {
    clearWait();
    playerRef.current?.pause();
    phaseRef.current = 'idle';
    setPhase('idle');
    indexRef.current = -1;
    setCurrentIndex(-1);
    elapsedRef.current = 0;
    setElapsedSeconds(0);
    setState('idle');
  }, [clearWait]);

  /**
   * A silence outliving a suspended runtime.
   *
   * setTimeout only fires while the JS thread is alive. If the OS suspends the
   * app mid-silence — screen locked with no bed playing to keep it awake — the
   * continuation is still pending on return, holding the session at a line it
   * should already have moved past. Anything whose deadline has come and gone
   * fires on the way back in.
   */
  useEffect(() => {
    if (state !== 'running') return;

    const subscription = AppState.addEventListener('change', (next) => {
      if (next !== 'active') return;
      if (!waitTimerRef.current) return;
      if (Date.now() < waitEndsAtRef.current) return;

      const onDone = waitDoneRef.current;
      clearWait();
      onDone?.();
    });

    return () => subscription.remove();
  }, [state, clearWait]);

  useEffect(() => () => clearWait(), [clearWait]);

  const segment = currentIndex >= 0 ? meditation?.segments[currentIndex] : undefined;

  return {
    state,
    phase,
    currentIndex,
    /** The line being spoken; null through silences and before the first line. */
    currentText: phase === 'speaking' ? (segment?.text ?? null) : null,
    elapsedSeconds: Math.round(elapsedSeconds),
    remainingSeconds: Math.max(0, Math.round(total - elapsedSeconds)),
    progress: total > 0 ? Math.min(1, elapsedSeconds / total) : 0,
    durationSeconds: total,
    play,
    pause,
    stop,
  };
}
