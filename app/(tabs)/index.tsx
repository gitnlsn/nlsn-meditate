import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CircularProgress } from '@/components/timer/circular-progress';
import { TimerControls } from '@/components/timer/timer-controls';
import { TimerHint } from '@/components/timer/timer-hint';
import { AmbienceField } from '@/components/audio/ambience-field';
import { useTimer } from '@/hooks/use-timer';
import { rotatingIndex } from '@/utils/phrase-rotation';
import { useStrings } from '@/contexts/locale-context';
import { TAB_SCREEN_EDGES, CONTENT_MAX_WIDTH } from '@/constants/layout';

/**
 * A view onto the timer, not the timer itself. The clock and the background bed
 * run in SessionRuntime at the root, so leaving this tab leaves the session
 * running and coming back rejoins it where it is.
 */
export default function TimerScreen() {
  const { timerState, remainingSeconds, progress, play, pause, reset } = useTimer();
  const s = useStrings();

  /*
   * Landscape stands the screen's parts side by side rather than stacking them:
   * on a phone turned sideways there is no room for a ring and everything else
   * down one column, and on a tablet a single centred column leaves the width
   * empty. Read from the window rather than the device, so a foldable changes
   * layout at the moment it opens.
   */
  const { width, height } = useWindowDimensions();
  const landscape = width > height;

  // A different line each fortnight, the same one on every device. Read from
  // the date, so there is nothing stored and nothing to keep in sync.
  const hint = s.timer.hints[rotatingIndex(s.timer.hints.length)];

  const header = (
    <View style={styles.header}>
      <ThemedText style={styles.subtitle}>{s.timer.heading}</ThemedText>
      <TimerHint text={hint} visible={timerState === 'idle'} />
    </View>
  );
  const ring = <CircularProgress progress={progress} remainingSeconds={remainingSeconds} />;
  const controls = (
    <TimerControls timerState={timerState} onPlay={play} onPause={pause} onReset={reset} />
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={TAB_SCREEN_EDGES}>
        {landscape ? (
          <View style={[styles.body, styles.bodyLandscape]}>
            {ring}
            <View style={styles.sideColumn}>
              {header}
              {controls}
            </View>
          </View>
        ) : (
          <View style={[styles.body, styles.bodyPortrait]}>
            {header}
            {ring}
            {controls}
          </View>
        )}

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
  // The timer keeps the centre of the screen; the picker sits out of the way.
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    paddingHorizontal: 24,
  },
  bodyPortrait: { gap: 48 },
  bodyLandscape: { flexDirection: 'row', gap: 32 },
  sideColumn: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 32 },
  header: { alignItems: 'center', gap: 12 },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '300',
    textTransform: 'uppercase',
    letterSpacing: 4,
    opacity: 0.6,
  },
});
