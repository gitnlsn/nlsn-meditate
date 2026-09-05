import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNavigation, usePreventRemove, type NavigationAction } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { CircularProgress } from '@/components/timer/circular-progress';
import { TimerControls } from '@/components/timer/timer-controls';
import { Caption } from '@/components/guided/caption';
import { TimeDisplay } from '@/components/timer/time-display';
import { AmbienceDisplay } from '@/components/timer/ambience-display';
import { findMeditation } from '@/constants/guided-meditations';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGuidedSessionContext } from '@/contexts/guided-session-context';
import { useStrings } from '@/contexts/locale-context';
import { CONTENT_MAX_WIDTH } from '@/constants/layout';

/**
 * A view onto the guided session, not the session itself.
 *
 * The session lives in GuidedSessionProvider at the root, so nothing about
 * unmounting this screen would stop the voice. That is why leaving asks: a
 * meditation you walked away from used to keep speaking with nothing on screen
 * pointing at where to stop it, and starting the timer then laid a second
 * session over the top of the first.
 */
export default function GuidedPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const strings = useStrings();

  /*
   * Landscape puts the ring beside the words instead of above them: sideways on
   * a phone there is no height for a ring, a caption and the controls stacked,
   * and on a tablet the caption would otherwise run the full width of the slab.
   */
  const { width, height } = useWindowDimensions();
  const landscape = width > height;

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

  /*
   * Every way out of this screen, asked the same question.
   *
   * The chevron below is only one of them — there is also the Android back
   * button and the swipe in from the edge, and a confirmation the chevron alone
   * carried would be one the other two walked straight past. Preventing the
   * removal catches all three at the navigator, and the action that was blocked
   * is held until the question is answered, so confirming leaves exactly where
   * the gesture was going.
   */
  const [pendingExit, setPendingExit] = useState<NavigationAction | null>(null);
  usePreventRemove(inSession, ({ data }) => setPendingExit(data.action));

  const leave = () => {
    const action = pendingExit;
    setPendingExit(null);
    session.stop();
    if (action) navigation.dispatch(action);
  };

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
              // Intercepted while a session is going — see usePreventRemove above.
              router.back();
            }}
            hitSlop={12}
            style={styles.back}>
            <IconSymbol name="chevron.left" size={24} color={colors.text} />
          </Pressable>
          <ThemedText style={styles.headerTitle}>{meditation.title}</ThemedText>
          <View style={styles.back} />
        </View>

        <View style={[styles.body, landscape && styles.bodyLandscape]}>
          {/* The clock is not pressable here: the meditation carries its own
              length. The bed under it is still the reader's to choose. */}
          <CircularProgress progress={isCurrent ? session.progress : 0}>
            <TimeDisplay
              remainingSeconds={isCurrent ? session.remainingSeconds : meditation.durationSeconds}
            />
            <AmbienceDisplay editable={state === 'idle'} />
          </CircularProgress>
          <View style={[styles.column, landscape ? styles.columnLandscape : styles.columnPortrait]}>
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
        </View>
      </SafeAreaView>

      <ConfirmDialog
        visible={pendingExit !== null}
        title={strings.session.endTitle}
        message={strings.session.endMessage}
        confirmLabel={strings.session.endConfirm}
        cancelLabel={strings.session.endCancel}
        onConfirm={leave}
        onCancel={() => setPendingExit(null)}
      />
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
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
  },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    fontSize: 18,
    fontWeight: '300',
    textTransform: 'uppercase',
    letterSpacing: 4,
    opacity: 0.6,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    paddingHorizontal: 24,
    gap: 32,
  },
  bodyLandscape: { flexDirection: 'row' },
  column: { alignItems: 'center', justifyContent: 'center', gap: 32 },
  columnPortrait: { width: '100%' },
  columnLandscape: { flex: 1 },
});
