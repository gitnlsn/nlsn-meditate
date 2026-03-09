import { StyleSheet, Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import type { TimerState } from '@/contexts/meditation-context';

interface TimerControlsProps {
  timerState: TimerState;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
}

export function TimerControls({ timerState, onPlay, onPause, onReset }: TimerControlsProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const handlePlayPause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (timerState === 'running') {
      onPause();
    } else {
      onPlay();
    }
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onReset();
  };

  const showReset = timerState !== 'idle';

  return (
    <View style={styles.container}>
      <View style={styles.resetPlaceholder}>
        {showReset && (
          <Pressable
            onPress={handleReset}
            style={[styles.resetButton, { backgroundColor: colors.progressTrack }]}
          >
            <IconSymbol name="arrow.counterclockwise" size={24} color={colors.text} />
          </Pressable>
        )}
      </View>
      <Pressable
        onPress={handlePlayPause}
        style={[styles.playButton, { backgroundColor: colors.tint }]}
      >
        <IconSymbol
          name={timerState === 'running' ? 'pause.fill' : 'play.fill'}
          size={28}
          color={colorScheme === 'dark' ? Colors.dark.background : '#FFFFFF'}
        />
      </Pressable>
      <View style={styles.resetPlaceholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetPlaceholder: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
