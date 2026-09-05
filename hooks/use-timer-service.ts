import { useEffect, useRef } from 'react';

import { MeditationSessionModule } from '@/modules/meditation-session';
import { GONG } from '@/constants/gong';
import type { Ambience } from '@/constants/ambiences';
import type { TimerState } from '@/contexts/meditation-context';
import { assetUri, timerTimeline } from '@/utils/timeline';

/** A sit already in progress, as the service reports it. */
export interface RunningSession {
  sessionId: string;
  durationSeconds: number;
  elapsedSeconds: number;
  running: boolean;
}

interface Options {
  /** Called to rejoin a sit the service is already part-way through. */
  restore: (session: RunningSession) => void;
  timerState: TimerState;
  durationSeconds: number;
  sessionId: string | null;
  ambience: Ambience | undefined;
  ambienceVolume: number;
  gongAtEnd: boolean;
}

/**
 * A plain silent sit, run by the playback service.
 *
 * Nothing is spoken, so it may look like there is no audio to hand over — but
 * that is exactly why it needs to. The end of a silent sit used to be noticed by
 * a JavaScript interval, which stops the moment the screen locks, so the bell
 * did not ring at ten minutes; it rang whenever the phone was next picked up.
 * Given to the service as a stretch of silence followed by the gong, the end of
 * the sit becomes something the system arrives at on its own.
 *
 * Does nothing where there is no service, and the app keeps its old behaviour.
 */
export function useTimerService({
  restore,
  timerState,
  durationSeconds,
  sessionId,
  ambience,
  ambienceVolume,
  gongAtEnd,
}: Options) {
  const previousRef = useRef<TimerState>(timerState);

  // Read inside the start effect only, so changing the bed mid-sit does not
  // restart the session that is already running with it.
  const latest = useRef({ durationSeconds, sessionId, ambience, ambienceVolume, gongAtEnd });
  useEffect(() => {
    latest.current = { durationSeconds, sessionId, ambience, ambienceVolume, gongAtEnd };
  }, [durationSeconds, sessionId, ambience, ambienceVolume, gongAtEnd]);

  /*
   * Rejoin a silent sit that outlived the app.
   *
   * Asked once, on the way in. A session with no meditation id is a plain
   * timer, and finding one means the service is still counting down a sit this
   * clock has forgotten.
   */
  useEffect(() => {
    const module = MeditationSessionModule;
    if (!module) return;

    let abandoned = false;
    module.getState()
      .then((running) => {
        if (abandoned || !running || running.meditationId) return;
        if (__DEV__) console.log(`[meditation] rejoining timer at ${running.positionMs}ms`);
        previousRef.current = running.state;
        restore({
          sessionId: running.sessionId,
          durationSeconds: running.durationSeconds,
          elapsedSeconds: running.positionMs / 1000,
          running: running.state === 'running',
        });
      })
      .catch((error) => console.warn('[meditation] could not rejoin timer:', error));

    return () => {
      abandoned = true;
    };
  }, [restore]);

  useEffect(() => {
    const module = MeditationSessionModule;
    if (!module) return;

    const previous = previousRef.current;
    previousRef.current = timerState;
    if (previous === timerState) return;
    if (__DEV__) console.log(`[meditation] timer ${previous} -> ${timerState}`);

    if (timerState === 'running') {
      if (previous === 'paused') {
        module.resume();
        return;
      }
      const { durationSeconds: seconds, sessionId: id, ambience: bed, ambienceVolume: bedVolume, gongAtEnd: gong } = latest.current;
      Promise.all([
        timerTimeline(seconds, gong ? GONG : undefined),
        bed ? assetUri(bed.source) : Promise.resolve(undefined),
      ])
        .then(([items, bedUri]) =>
          module.start({
            sessionId: id ?? String(Date.now()),
            durationSeconds: seconds,
            items,
            voiceVolume: 1,
            ...(bedUri && { bedUri, bedVolume }),
          }),
        )
        .catch((error) => console.warn('[meditation] could not start timer session:', error));
      return;
    }

    if (timerState === 'paused') {
      module.pause();
      return;
    }

    /*
     * A sit that ran out is left alone to finish.
     *
     * The clock reaches its duration while the service is still sounding the
     * gong that comes after it, so stopping here on the way through 'complete'
     * would cut the bell off mid-strike. Only a sit the reader ended early is
     * stopped — and that arrives as 'idle' without passing through 'complete'.
     */
    if (timerState === 'complete') return;
    if (previous === 'complete') return;

    module.stop();
  }, [timerState]);
}
