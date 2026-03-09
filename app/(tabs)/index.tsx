import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CircularProgress } from '@/components/timer/circular-progress';
import { TimerControls } from '@/components/timer/timer-controls';
import { useTimer } from '@/hooks/use-timer';

export default function TimerScreen() {
  const { timerState, remainingSeconds, progress, play, pause, reset } = useTimer();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText style={styles.subtitle}>Meditate</ThemedText>
        <CircularProgress progress={progress} remainingSeconds={remainingSeconds} />
        <TimerControls
          timerState={timerState}
          onPlay={play}
          onPause={pause}
          onReset={reset}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 48,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '300',
    textTransform: 'uppercase',
    letterSpacing: 4,
    opacity: 0.6,
  },
});
