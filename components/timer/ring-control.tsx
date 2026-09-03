import { useEffect, type ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/** Matches TimerHint, which fades on the same event for the same reason. */
const FADE_IN_MS = 600;
const FADE_OUT_MS = 400;

/**
 * Corner radius as a share of the pill's height.
 *
 * The app rounds its controls to about this much — a SelectField row is 12
 * against a height of 52 — so the two read as the same kind of thing. Half would
 * make a stadium, which is what a chip or a status badge looks like: these are
 * inputs, and inside a circle a second full curve competes with the ring rather
 * than sitting in it. Turn this up for rounder.
 */
const RADIUS_RATIO = 0.25;

interface RingControlProps {
  /** What a screen reader announces while the press is available. */
  accessibilityLabel: string;
  /**
   * Opens this control's picker. Omitted where the value is not the reader's to
   * choose — the clock on the guided player, whose meditations carry their own
   * lengths.
   */
  onPress?: () => void;
  /**
   * Whether that press is available now. Both of these settings belong to the
   * session you are about to start rather than the one you are in, so they are
   * offered while idle and withdrawn for the rest of it.
   */
  editable?: boolean;
  /** The content's line height; with the padding it gives the pill its shape. */
  lineHeight: number;
  paddingHorizontal: number;
  paddingVertical: number;
  /** Caps the pill, for content that can run wider than the ring. */
  maxWidth?: number;
  children: ReactNode;
}

/**
 * Something in the middle of the ring that can be pressed to change it.
 *
 * What it holds already *is* the value — the clock is the length, the name is
 * the bed — so it is the thing to press to change it; what bare text does not do
 * is say so. While idle it sits on a soft pill and reads as a control, and on
 * the first press of play the pill fades and leaves the text alone in the ring.
 * That is the rule TimerHint follows, for the same reason: this screen's
 * emptiness is worth having during a session, not before one starts.
 *
 * The padding stays whether the pill is showing or not, so nothing shifts under
 * the reader when it goes.
 */
export function RingControl({
  accessibilityLabel,
  onPress,
  editable = false,
  lineHeight,
  paddingHorizontal,
  paddingVertical,
  maxWidth,
  children,
}: RingControlProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const pressable = onPress != null && editable;
  const radius = Math.round((lineHeight + paddingVertical * 2) * RADIUS_RATIO);

  const pill = useSharedValue(pressable ? 1 : 0);
  useEffect(() => {
    pill.value = withTiming(pressable ? 1 : 0, {
      duration: pressable ? FADE_IN_MS : FADE_OUT_MS,
    });
  }, [pressable, pill]);
  const pillStyle = useAnimatedStyle(() => ({ opacity: pill.value }));

  return (
    <Pressable
      onPress={onPress}
      disabled={!pressable}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={pressable ? accessibilityLabel : undefined}
      accessibilityState={onPress ? { disabled: !pressable } : undefined}
      style={({ pressed }) => [
        styles.press,
        { paddingHorizontal, paddingVertical, maxWidth, opacity: pressed ? 0.6 : 1 },
      ]}>
      {/* Behind the text rather than around it: a wrapper carrying the animated
          opacity would fade the value along with its background. */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          pillStyle,
          { backgroundColor: colors.chipBackground, borderRadius: radius },
        ]}
      />
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
