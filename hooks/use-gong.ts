import { useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';

export function useGong() {
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/audios/meditation-gong-jam-fx-10-10-00-11.mp3')
      );
      if (mounted) {
        soundRef.current = sound;
      } else {
        await sound.unloadAsync();
      }
    }

    load();

    return () => {
      mounted = false;
      soundRef.current?.unloadAsync();
    };
  }, []);

  const playGong = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.replayAsync();
    }
  }, []);

  return { playGong };
}
