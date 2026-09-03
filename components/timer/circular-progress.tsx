import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { TimeDisplay } from './time-display';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const MAX_SIZE = 280;
const MIN_SIZE = 160;
/** How much of the shorter screen edge the ring may take before it crowds out
 * the controls below it. Landscape on a phone is the case that bites: the
 * shorter edge is then the height, and 280 leaves nothing for anything else. */
const SHORTER_EDGE_SHARE = 0.55;
const STROKE_WIDTH = 12;

interface CircularProgressProps {
  progress: number;
  remainingSeconds: number;
}

export function CircularProgress({ progress, remainingSeconds }: CircularProgressProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const { width, height } = useWindowDimensions();
  const size = Math.round(
    Math.max(MIN_SIZE, Math.min(MAX_SIZE, Math.min(width, height) * SHORTER_EDGE_SHARE)),
  );
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
      <View style={styles.timeContainer}>
        <TimeDisplay remainingSeconds={remainingSeconds} scale={size / MAX_SIZE} />
      </View>
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
  timeContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
