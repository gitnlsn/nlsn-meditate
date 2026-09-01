import { useCallback } from 'react';
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
import { AmbienceField } from '@/components/audio/ambience-field';
import { findMeditation, type GuidedMeditation } from '@/constants/guided-meditations';
import { findAmbience } from '@/constants/ambiences';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGuidedSession } from '@/hooks/use-guided-session';
import { useAmbience } from '@/hooks/use-ambience';
import { useAddSession } from '@/contexts/history-context';
import { useAudioSettings } from '@/contexts/audio-settings-context';

export default function GuidedPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const addSession = useAddSession();

  const meditation = findMeditation(id);
  const { settings } = useAudioSettings();

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
          <AmbienceField />
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
  footer: { paddingHorizontal: 24, paddingBottom: 16 },
});
