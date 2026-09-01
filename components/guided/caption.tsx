import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';

interface CaptionProps {
  /** The line currently being spoken, or null through a silence. */
  text: string | null;
}

/**
 * The spoken line, faded in and out.
 *
 * A hard cut between lines is jarring on a screen someone is meditating in
 * front of, and the gaps here are long, so the text crossfades rather than
 * blinking. The view keeps its height whether or not there is a line, so the
 * layout never jumps.
 */
export function Caption({ text }: CaptionProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(text ? 1 : 0, { duration: text ? 600 : 900 });
  }, [text, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.container, style]} pointerEvents="none">
      <ThemedText style={styles.text}>{text ?? ''}</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 72,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  text: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '300',
    textAlign: 'center',
  },
});
