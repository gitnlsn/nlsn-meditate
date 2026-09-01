import { useCallback, useEffect, useRef } from 'react';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

import type { Ambience } from '@/constants/ambiences';

/** How often to check whether it is time to bring in the next copy. */
const POLL_MS = 250;

interface Options {
  ambience: Ambience | undefined;
  volume: number;
  active: boolean;
}

/**
 * A continuous background bed, looped by overlapping two copies of the file.
 *
 * The beds are mastered with a fade at each end, so starting a second copy while
 * the first is still fading lets the two cross into each other. A single looping
 * player cannot do this — it would drop to silence at every wrap.
 *
 * The handover is driven by polling the active player's position rather than a
 * scheduled timer. A timer set once per cycle drifts, keeps firing while paused,
 * and has to be torn down and recomputed on every interruption; a poll simply
 * observes where playback actually is, so it self-corrects and pausing it is
 * enough to pause the whole mechanism.
 */
export function useAmbience({ ambience, volume, active }: Options) {
  const playersRef = useRef<AudioPlayer[]>([]);
  const activeRef = useRef(0);
  /**
   * seekTo is async, so between deciding to hand over and the incoming player
   * actually reaching 0 it is still sitting at the end of its previous cycle.
   * Without this latch the next poll would see that and hand over again.
   */
  const handingOverRef = useRef(false);

  // Two players per bed, alternating.
  useEffect(() => {
    if (!ambience) return;

    const players = [createAudioPlayer(ambience.source), createAudioPlayer(ambience.source)];
    for (const p of players) p.volume = volume;
    playersRef.current = players;
    activeRef.current = 0;
    handingOverRef.current = false;

    return () => {
      playersRef.current = [];
      for (const p of players) {
        p.pause();
        p.remove();
      }
    };
    // volume is applied by its own effect; re-creating players on a volume
    // change would restart the bed mid-session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ambience]);

  useEffect(() => {
    for (const p of playersRef.current) p.volume = volume;
  }, [volume]);

  const stop = useCallback(() => {
    for (const p of playersRef.current) {
      p.pause();
    }
  }, []);

  useEffect(() => {
    if (!ambience || !active) {
      stop();
      return;
    }

    const players = playersRef.current;
    if (players.length !== 2) return;

    players[activeRef.current].play();

    const id = setInterval(() => {
      if (handingOverRef.current) return;

      const current = players[activeRef.current];
      if (!current?.playing) return;

      const handoverAt = ambience.durationSeconds - ambience.fadeOutSeconds;
      if (current.currentTime < handoverAt) return;

      // Bring in the other copy from the top; its fade-in rises as this one falls.
      // The outgoing player is left running so its tail completes the crossfade.
      handingOverRef.current = true;
      const next = (activeRef.current + 1) % 2;
      const nextPlayer = players[next];

      nextPlayer
        .seekTo(0)
        .then(() => {
          nextPlayer.play();
          activeRef.current = next;
        })
        .catch(() => {})
        .finally(() => {
          handingOverRef.current = false;
        });
    }, POLL_MS);

    return () => {
      clearInterval(id);
      stop();
    };
  }, [ambience, active, stop]);
}
