import { useEffect } from 'react';
import { setAudioModeAsync } from 'expo-audio';

/**
 * Configures the device audio session once, at app start.
 *
 * `shouldPlayInBackground` is what lets a guided session keep speaking after the
 * screen locks, which is the normal way people use this app. It needs the
 * matching native entitlement (`UIBackgroundModes: ["audio"]` on iOS) to take
 * effect, configured in app.json.
 *
 * `interruptionMode: 'mixWithOthers'` is deliberate: a meditation bed should sit
 * alongside whatever else the user has going rather than seizing audio focus.
 */
export function useAudioSession() {
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'mixWithOthers',
      allowsRecording: false,
      shouldRouteThroughEarpiece: false,
    }).catch(() => {
      // A device that refuses the session still plays in the foreground.
    });
  }, []);
}
