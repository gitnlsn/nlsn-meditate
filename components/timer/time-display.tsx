import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { RingControl } from '@/components/timer/ring-control';
import { useRingMetrics } from '@/components/timer/ring-metrics';
import { useStrings } from '@/contexts/locale-context';

const MAX_FONT_SIZE = 48;
const LINE_HEIGHT_RATIO = 56 / 48;
const MAX_PADDING_X = 20;
const MAX_PADDING_Y = 8;

interface TimeDisplayProps {
  remainingSeconds: number;
  /** Opens the duration picker. Omitted by the guided player. */
  onPress?: () => void;
  /** Whether that press is available now — see RingControl. */
  editable?: boolean;
}

/** The clock in the middle of the ring, and the way to set how long it runs. */
export function TimeDisplay({ remainingSeconds, onPress, editable }: TimeDisplayProps) {
  const strings = useStrings();
  const { scale } = useRingMetrics();

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const fontSize = Math.round(MAX_FONT_SIZE * scale);

  return (
    <RingControl
      accessibilityLabel={`${strings.timer.sessionLength}: ${strings.duration.minutes(minutes)}`}
      onPress={onPress}
      editable={editable}
      radius={fontSize}
      paddingHorizontal={Math.round(MAX_PADDING_X * scale)}
      paddingVertical={Math.round(MAX_PADDING_Y * scale)}>
      <ThemedText
        style={[styles.time, { fontSize, lineHeight: Math.round(fontSize * LINE_HEIGHT_RATIO) }]}>
        {formatted}
      </ThemedText>
    </RingControl>
  );
}

const styles = StyleSheet.create({
  time: {
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
  },
});
