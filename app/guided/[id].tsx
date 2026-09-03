import { useEffect } from 'react';
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
import { findMeditation } from '@/constants/guided-meditations';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGuidedSessionContext } from '@/contexts/guided-session-context';
import { useStrings } from '@/contexts/locale-context';

/**
 * A view onto the guided session, not the session itself.
 *
 * The session lives in GuidedSessionProvider at the root, so leaving this screen
 * — back gesture, back button, going to look at something else — leaves the
 * voice and the bed playing. Re-opening the same meditation rejoins it rather
 * than starting it over; opening a different one ends the first.
 */
export default function GuidedPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const strings = useStrings();

  const meditation = findMeditation(id);
  const session = useGuidedSessionContext();
  const { load } = session;

  useEffect(() => {
    load(meditation);
  }, [load, meditation]);

  /*
   * `load` lands in an effect, so the first render still reports whatever was
   * playing before. Reading the session only once it points at this meditation
   * keeps another session's progress off this screen.
   */
  const isCurrent = session.meditation?.id === meditation?.id;
  const state = isCurrent ? session.state : 'idle';
  /** Whether the voice owns the caption slot, rather than the description. */
  const inSession = state === 'running' || state === 'paused';

  if (!meditation) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.missing}>
          <ThemedText>{strings.guided.notFound}</ThemedText>
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
              // Leaving is not stopping. Use the reset control to end a session.
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
            progress={isCurrent ? session.progress : 0}
            remainingSeconds={isCurrent ? session.remainingSeconds : meditation.durationSeconds}
          />
          {/*
            * The caption slot already holds a line's worth of height whether or
            * not anything is being spoken, and outside a session nothing is. So
            * it holds what this meditation is — the same description the library
            * lists it under — and lends the slot to the voice in between,
            * returning to it once the session finishes. The lead-in silence
            * fades the description out before the first line arrives, so the two
            * never swap mid-sentence.
            */}
          <Caption text={inSession ? session.currentText : meditation.description} />
          <TimerControls
            timerState={state}
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
