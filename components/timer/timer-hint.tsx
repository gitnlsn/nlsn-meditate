import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';

interface TimerHintProps {
  text: string;
  /** False from the moment a session starts, including while paused. */
  visible: boolean;
}

/**
 * A line of orientation on the timer screen that leaves before it is in the way.
 *
 * The timer screen is the one place in this app where emptiness is the point,
 * and text you read every session soon reads as clutter. So the hint is only
 * there before a session: it fades out on the first press of play and does not
 * come back for a pause. The view keeps its height either way, so the ring never
 * jumps when the words go.
 */
export function TimerHint({ text, visible }: TimerHintProps) {
  const opacity = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: visible ? 600 : 400 });
  }, [visible, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.container, style]} pointerEvents="none">
      <ThemedText style={styles.text}>{text}</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // One line's worth, held while the text is faded out.
  container: {
    minHeight: 20,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    opacity: 0.5,
  },
});
