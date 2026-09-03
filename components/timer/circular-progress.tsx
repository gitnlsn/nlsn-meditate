import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useRingMetrics } from './ring-metrics';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const STROKE_WIDTH = 12;
/** Between the clock and the bed's name, at the ring's full size. */
const CENTRE_GAP = 8;

interface CircularProgressProps {
  progress: number;
  /**
   * What sits in the middle. Passed in rather than named here, because the two
   * screens that draw this ring put different things inside it — the guided
   * player's clock is not the reader's to set. Children read their own size from
   * useRingMetrics.
   */
  children?: ReactNode;
}

export function CircularProgress({ progress, children }: CircularProgressProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const { size, scale } = useRingMetrics();
  const radius = (size - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedProps = useAnimatedProps(() => {
    const offset = circumference * (1 - withTiming(progress, { duration: 1000, easing: Easing.linear }));
    return {
      strokeDashoffset: offset,
    };
  }, [progress, circumference]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.progressTrack}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.progressRing}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
        />
      </Svg>
      {/*
        * Deliberately unconstrained: the clock is sized to fit the ring already,
        * and a width cap here would try to wrap a string with nowhere to break.
        * What can run long — the bed's name — holds itself in.
        */}
      <View style={[styles.centre, { gap: Math.round(CENTRE_GAP * scale) }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    transform: [{ rotate: '-90deg' }],
  },
  centre: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
