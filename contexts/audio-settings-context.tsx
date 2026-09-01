import {
  createContext, useCallback, useContext, useEffect, useState, type ReactNode,
} from 'react';

import {
  loadAudioSettings, saveAudioSettings, DEFAULT_AUDIO_SETTINGS, type AudioSettings,
} from '@/utils/settings-storage';

interface AudioSettingsState {
  settings: AudioSettings;
  isLoading: boolean;
}

const AudioSettingsStateContext = createContext<AudioSettingsState>({
  settings: DEFAULT_AUDIO_SETTINGS,
  isLoading: true,
});
const AudioSettingsUpdateContext = createContext<(patch: Partial<AudioSettings>) => void>(() => {});

/**
 * One copy of the audio settings for the whole app.
 *
 * The timer screen, the guided player and the settings screen all read and
 * write these. Each keeping its own useState copy meant changing the background
 * sound in one place left the others showing a stale value until they remounted.
 */
export function AudioSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AudioSettings>(DEFAULT_AUDIO_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAudioSettings().then((loaded) => {
      setSettings(loaded);
      setIsLoading(false);
    });
  }, []);

  // Persisting here rather than in an effect keyed on `settings`: this only runs
  // from a user action, so the initial load never writes back what it just read.
  const update = useCallback((patch: Partial<AudioSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveAudioSettings(next);
  }, [settings]);

  return (
    <AudioSettingsStateContext.Provider value={{ settings, isLoading }}>
      <AudioSettingsUpdateContext.Provider value={update}>
        {children}
      </AudioSettingsUpdateContext.Provider>
    </AudioSettingsStateContext.Provider>
  );
}

export function useAudioSettings() {
  return useContext(AudioSettingsStateContext);
}

export function useUpdateAudioSettings() {
  return useContext(AudioSettingsUpdateContext);
}
