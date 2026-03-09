import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';

interface TimeDisplayProps {
  remainingSeconds: number;
}

export function TimeDisplay({ remainingSeconds }: TimeDisplayProps) {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return <ThemedText style={styles.time}>{formatted}</ThemedText>;
}

const styles = StyleSheet.create({
  time: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
  },
});
