import { useEffect, useRef, useCallback } from 'react';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

import { GONG } from '@/constants/gong';

/**
 * The start/end bell. Held loaded for the lifetime of the consumer so the strike
 * is immediate — a gong that arrives half a second late is worse than none.
 *
 * The audio session itself is configured once at app start by useAudioSession.
 */
export function useGong() {
  const playerRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    const player = createAudioPlayer(GONG);
    playerRef.current = player;
    return () => {
      playerRef.current = null;
      player.remove();
    };
  }, []);

  const playGong = useCallback(async () => {
    const player = playerRef.current;
    if (!player) return;
    await player.seekTo(0);
    player.play();
  }, []);

  return { playGong };
}
