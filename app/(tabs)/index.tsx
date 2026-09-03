import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CircularProgress } from '@/components/timer/circular-progress';
import { TimerControls } from '@/components/timer/timer-controls';
import { AmbienceField } from '@/components/audio/ambience-field';
import { useTimer } from '@/hooks/use-timer';

/**
 * A view onto the timer, not the timer itself. The clock and the background bed
 * run in SessionRuntime at the root, so leaving this tab leaves the session
 * running and coming back rejoins it where it is.
 */
export default function TimerScreen() {
  const { timerState, remainingSeconds, progress, play, pause, reset } = useTimer();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.body}>
          <ThemedText style={styles.subtitle}>Meditate</ThemedText>
          <CircularProgress progress={progress} remainingSeconds={remainingSeconds} />
          <TimerControls
            timerState={timerState}
            onPlay={play}
            onPause={pause}
            onReset={reset}
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
  // The timer keeps the centre of the screen; the picker sits out of the way.
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 48,
  },
  footer: { paddingHorizontal: 24, paddingBottom: 16 },
  subtitle: {
    fontSize: 18,
    fontWeight: '300',
    textTransform: 'uppercase',
    letterSpacing: 4,
    opacity: 0.6,
  },
});
