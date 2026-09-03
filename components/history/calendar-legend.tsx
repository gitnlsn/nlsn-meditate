import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStrings } from '@/contexts/locale-context';

/**
 * A key for the calendar's three marks.
 *
 * Each swatch is drawn the way the calendar draws it — same dot size, same ring
 * width, same fill — inside a box of one fixed size, so the labels line up
 * even though the marks they stand for are different shapes. Guessing at
 * what a green dot means is the sort of small friction that makes a screen feel
 * unfinished.
 */
export function CalendarLegend() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const strings = useStrings();

  const items = [
    {
      label: strings.history.legendSession,
      swatch: <View style={[styles.dot, { backgroundColor: colors.calendarDot }]} />,
    },
    {
      label: strings.history.legendToday,
      swatch: <View style={[styles.ring, { borderColor: colors.calendarToday }]} />,
    },
    {
      label: strings.history.legendSelected,
      swatch: <View style={[styles.fill, { backgroundColor: colors.calendarSelectedDay }]} />,
    },
  ];

  return (
    <View style={styles.container}>
      {items.map((item) => (
        <View key={item.label} style={styles.item}>
          <View style={styles.swatch}>{item.swatch}</View>
          <ThemedText style={[styles.label, { color: colors.icon }]}>{item.label}</ThemedText>
        </View>
      ))}
    </View>
  );
}

const SWATCH = 16;

const styles = StyleSheet.create({
  // Wraps rather than shrinking: Portuguese labels are long enough that three
  // across does not fit a narrow phone, and truncated key text explains nothing.
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
    columnGap: 16,
    paddingTop: 20,
  },
  item: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: {
    width: SWATCH,
    height: SWATCH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Matches the calendar's own dot.
  dot: { width: 5, height: 5, borderRadius: 2.5 },
  ring: {
    width: SWATCH,
    height: SWATCH,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  fill: { width: SWATCH, height: SWATCH, borderRadius: 5 },
  label: { fontSize: 13 },
});
