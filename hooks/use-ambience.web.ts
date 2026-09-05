import { useEffect, useRef } from 'react';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

import type { Ambience } from '@/constants/ambiences';

interface Options {
  ambience: Ambience | undefined;
  volume: number;
  active: boolean;
}

/**
 * A continuous background bed.
 *
 * The beds are mastered to loop on themselves — their tail is cross-faded back
 * over their head — so repeating one is the player's job, not this hook's. It
 * used to overlap two copies of the file and cross their fades by hand, polling
 * four times a second to know when to bring the next one in. That poll is
 * exactly what a locked screen stops, which is how a meditation ended up with
 * its bed fading out and never returning.
 *
 * Nothing here runs on a timer any more. On Android the bed is not played from
 * here at all; the playback service owns it, along with the rest of the session.
 */
export function useAmbience({ ambience, volume, active }: Options) {
  const playerRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    if (!ambience) return;

    const player = createAudioPlayer(ambience.source);
    player.loop = true;
    player.volume = volume;
    playerRef.current = player;

    return () => {
      playerRef.current = null;
      player.pause();
      player.remove();
    };
    // volume is applied by its own effect; re-creating the player on a volume
    // change would restart the bed mid-session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ambience]);

  useEffect(() => {
    if (playerRef.current) playerRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    if (active) player.play();
    else player.pause();
  }, [ambience, active]);
}
