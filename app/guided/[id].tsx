import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CircularProgress } from '@/components/timer/circular-progress';
import { TimerControls } from '@/components/timer/timer-controls';
import { Caption } from '@/components/guided/caption';
import { AmbiencePicker } from '@/components/guided/ambience-picker';
import { findMeditation, type GuidedMeditation } from '@/constants/guided-meditations';
import { findAmbience } from '@/constants/ambiences';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGuidedSession } from '@/hooks/use-guided-session';
import { useAmbience } from '@/hooks/use-ambience';
import { useAddSession } from '@/contexts/history-context';
import {
  loadAudioSettings, saveAudioSettings, DEFAULT_AUDIO_SETTINGS, type AudioSettings,
} from '@/utils/settings-storage';

export default function GuidedPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const addSession = useAddSession();

  const meditation = findMeditation(id);
  const [settings, setSettings] = useState<AudioSettings>(DEFAULT_AUDIO_SETTINGS);

  useEffect(() => {
    loadAudioSettings().then(setSettings);
  }, []);

  const handleComplete = useCallback((finished: GuidedMeditation) => {
    addSession(finished.durationSeconds, {
      meditationId: finished.id,
      title: finished.title,
    });
  }, [addSession]);

  const session = useGuidedSession(meditation, {
    onComplete: handleComplete,
    volume: settings.voiceVolume,
  });

  useAmbience({
    ambience: findAmbience(settings.ambienceId),
    volume: settings.ambienceVolume,
    active: session.state === 'running',
  });

  // Persisting happens here rather than inside a state updater: React may invoke
  // an updater more than once, which would turn one tap into several writes.
  const selectAmbience = useCallback((ambienceId: string | null) => {
    const next = { ...settings, ambienceId };
    setSettings(next);
    saveAudioSettings(next);
  }, [settings]);

  if (!meditation) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.missing}>
          <ThemedText>Meditação não encontrada.</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              session.stop();
              router.back();
            }}
            hitSlop={12}
            style={styles.back}>
            <IconSymbol name="chevron.left" size={24} color={colors.text} />
          </Pressable>
          <ThemedText style={styles.headerTitle}>{meditation.title}</ThemedText>
          <View style={styles.back} />
        </View>

        <View style={styles.body}>
          <CircularProgress
            progress={session.progress}
            remainingSeconds={session.remainingSeconds}
          />
          <Caption text={session.currentText} />
          <TimerControls
            timerState={session.state}
            onPlay={session.play}
            onPause={session.pause}
            onReset={session.stop}
          />
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.footerLabel}>Som de fundo</ThemedText>
          <AmbiencePicker selectedId={settings.ambienceId} onSelect={selectAmbience} />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    fontSize: 18,
    fontWeight: '300',
    textTransform: 'uppercase',
    letterSpacing: 4,
    opacity: 0.6,
  },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 32 },
  footer: { gap: 12, paddingBottom: 16 },
  footerLabel: {
    fontSize: 13,
    opacity: 0.5,
    paddingHorizontal: 24,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});
