import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { formatSeconds } from '@/components/progress/format';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStrings } from '@/contexts/locale-context';

const PLOT_HEIGHT = 112;
/** Keeps an empty day visible as a stub on the baseline, so the week reads as seven days. */
const STUB = 4;

interface WeekChartProps {
  /** Seconds per day, Sunday first. */
  days: number[];
  todayIndex: number;
}

/**
 * Minutes per day this week, as seven bars.
 *
 * One series, so no legend: the heading names it. One label at a time rather
 * than a number over every bar — today's by default, or whichever day was
 * tapped — so the bars stay the thing being read.
 */
export function WeekChart({ days, todayIndex }: WeekChartProps) {
  const strings = useStrings();
  const colors = Colors[useColorScheme() ?? 'light'];
  const [selected, setSelected] = useState(todayIndex);
  const p = strings.progress;

  // Never scale to less than ten minutes, so a single short sit does not draw
  // as a full-height bar.
  const max = Math.max(600, ...days);
  const total = days.reduce((sum, d) => sum + d, 0);

  return (
    <View>
      <View style={styles.heading}>
        <ThemedText type="defaultSemiBold" style={styles.title} numberOfLines={1}>{p.thisWeek}</ThemedText>
        <ThemedText style={styles.total}>{p.weekTotal(formatSeconds(total, strings))}</ThemedText>
      </View>

      <View style={styles.plot}>
        {days.map((seconds, i) => {
          const isSelected = i === selected;
          const height = seconds > 0 ? Math.max(STUB, (seconds / max) * PLOT_HEIGHT) : STUB;
          const value = formatSeconds(seconds, strings);
          return (
            <Pressable
              key={i}
              style={styles.column}
              onPress={() => setSelected(i)}
              accessibilityRole="button"
              accessibilityLabel={p.dayBar(strings.history.weekdays[i], value)}>
              <ThemedText style={[styles.value, !isSelected && styles.hidden]} numberOfLines={1}>
                {seconds > 0 ? value : ''}
              </ThemedText>
              <View
                style={[
                  styles.bar,
                  {
                    height,
                    backgroundColor: seconds > 0 ? colors.progressRing : colors.progressTrack,
                    opacity: seconds > 0 && !isSelected ? 0.75 : 1,
                  },
                ]}
              />
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.baseline, { backgroundColor: colors.progressTrack }]} />
      <View style={styles.labels}>
        {strings.history.weekdayInitials.map((initial, i) => (
          <ThemedText key={i} style={[styles.day, i === todayIndex && styles.today]}>
            {initial}
          </ThemedText>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // Centred, not baseline: Android measures a baseline-aligned row short
    // and clips the heading to its first word.
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  // The title takes the room it needs; the total gives way first.
  title: { flexGrow: 1, flexShrink: 0 },
  total: { fontSize: 14, opacity: 0.6, flexShrink: 1, textAlign: 'right' },
  plot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: PLOT_HEIGHT + 22,
    // The 2px gap between neighbouring bars comes from the columns' padding.
  },
  column: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: 1 },
  value: { fontSize: 12, lineHeight: 16, marginBottom: 4, opacity: 0.7 },
  hidden: { opacity: 0 },
  bar: {
    width: '56%',
    maxWidth: 28,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  baseline: { height: 1 },
  labels: { flexDirection: 'row', marginTop: 6 },
  day: { flex: 1, textAlign: 'center', fontSize: 12, opacity: 0.5 },
  today: { fontWeight: '700', opacity: 1 },
});
