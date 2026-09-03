import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStrings } from '@/contexts/locale-context';

const MAX_FONT_SIZE = 48;
const LINE_HEIGHT_RATIO = 56 / 48;
const MAX_PADDING_X = 20;
const MAX_PADDING_Y = 8;

interface TimeDisplayProps {
  remainingSeconds: number;
  /** Shrinks with the ring it sits inside, so the clock never outgrows it. */
  scale?: number;
  /**
   * Opens the duration picker. Omitted where the length is not the reader's to
   * choose — the guided player, whose meditations carry their own.
   */
  onPress?: () => void;
  /**
   * Whether that press is available now. Choosing a duration resets the timer,
   * so it is offered while idle and withdrawn for the rest of the session.
   */
  editable?: boolean;
}

/**
 * The clock in the middle of the ring, and — before a session — the way to set
 * how long it runs.
 *
 * The number already *is* the duration, so it is the thing to press to change
 * it; what a bare number does not do is say so. While idle it sits on a soft
 * pill and reads as a control, and on the first press of play the pill fades and
 * leaves the number alone in the ring. That is the rule TimerHint follows for
 * the same reason: this screen's emptiness is worth having during a session, not
 * before one starts.
 *
 * The padding stays whether the pill is showing or not, so the clock never
 * shifts under the reader when it goes.
 */
export function TimeDisplay({
  remainingSeconds,
  scale = 1,
  onPress,
  editable = false,
}: TimeDisplayProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const strings = useStrings();

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const clamped = Math.min(1, scale);
  const fontSize = Math.round(MAX_FONT_SIZE * clamped);
  const paddingHorizontal = Math.round(MAX_PADDING_X * clamped);
  const paddingVertical = Math.round(MAX_PADDING_Y * clamped);

  const pressable = onPress != null && editable;

  const pill = useSharedValue(pressable ? 1 : 0);
  useEffect(() => {
    pill.value = withTiming(pressable ? 1 : 0, { duration: pressable ? 600 : 400 });
  }, [pressable, pill]);
  const pillStyle = useAnimatedStyle(() => ({ opacity: pill.value }));

  return (
    <Pressable
      onPress={onPress}
      disabled={!pressable}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={
        pressable
          ? `${strings.timer.sessionLength}: ${strings.duration.minutes(minutes)}`
          : undefined
      }
      accessibilityState={onPress ? { disabled: !pressable } : undefined}
      style={({ pressed }) => [
        styles.press,
        { paddingHorizontal, paddingVertical, opacity: pressed ? 0.6 : 1 },
      ]}>
      {/* Behind the number rather than around it: a wrapper carrying the
          animated opacity would fade the clock along with its background. */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          pillStyle,
          { backgroundColor: colors.chipBackground, borderRadius: fontSize },
        ]}
      />
      <ThemedText
        style={[styles.time, { fontSize, lineHeight: Math.round(fontSize * LINE_HEIGHT_RATIO) }]}>
        {formatted}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // The padding is there whether the pill is showing or not, so the number
  // never shifts when the background goes.
  press: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: {
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
  },
});
