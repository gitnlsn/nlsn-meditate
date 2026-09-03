import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';

const MAX_FONT_SIZE = 48;
const LINE_HEIGHT_RATIO = 56 / 48;

interface TimeDisplayProps {
  remainingSeconds: number;
  /** Shrinks with the ring it sits inside, so the clock never outgrows it. */
  scale?: number;
}

export function TimeDisplay({ remainingSeconds, scale = 1 }: TimeDisplayProps) {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const fontSize = Math.round(MAX_FONT_SIZE * Math.min(1, scale));

  return (
    <ThemedText
      style={[styles.time, { fontSize, lineHeight: Math.round(fontSize * LINE_HEIGHT_RATIO) }]}>
      {formatted}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  time: {
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
  },
});
