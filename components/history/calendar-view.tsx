import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStrings } from '@/contexts/locale-context';

interface CalendarViewProps {
  year: number;
  month: number; // 0-indexed
  sessionDates: Set<string>;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function CalendarView({
  year,
  month,
  sessionDates,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: CalendarViewProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const strings = useStrings();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  /*
   * Month and weekday names are read from the catalogue rather than through
   * toLocaleDateString. Hermes does not always ship full ICU data, and when it
   * does not the formatter quietly answers in English whatever locale it is
   * handed — a translation that fails silently is worse than none.
   */
  const monthLabel = strings.history.monthYear(strings.history.months[month], year);
  const todayStr = todayDateString();

  const cells: { day: number; inMonth: boolean; dateStr: string }[] = [];

  // Previous month fill
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    cells.push({ day: d, inMonth: false, dateStr: formatDate(y, m, d) });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, inMonth: true, dateStr: formatDate(year, month, d) });
  }

  // Next month fill
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const m = month === 11 ? 0 : month + 1;
    const y = month === 11 ? year + 1 : year;
    cells.push({ day: d, inMonth: false, dateStr: formatDate(y, m, d) });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onPrevMonth} hitSlop={12}>
          <ThemedText style={styles.arrow}>{'‹'}</ThemedText>
        </Pressable>
        <ThemedText type="defaultSemiBold">{monthLabel}</ThemedText>
        <Pressable onPress={onNextMonth} hitSlop={12}>
          <ThemedText style={styles.arrow}>{'›'}</ThemedText>
        </Pressable>
      </View>

      <View style={styles.weekdayRow}>
        {strings.history.weekdayInitials.map((label, i) => (
          <View key={i} style={styles.cell}>
            <ThemedText style={[styles.weekdayLabel, { color: colors.icon }]}>{label}</ThemedText>
          </View>
        ))}
      </View>

      {Array.from({ length: 6 }, (_, row) => (
        <View key={row} style={styles.weekRow}>
          {cells.slice(row * 7, row * 7 + 7).map((cell) => {
            const isSelected = cell.dateStr === selectedDate;
            const hasSession = sessionDates.has(cell.dateStr);
            const isToday = cell.dateStr === todayStr;

            return (
              <Pressable
                key={cell.dateStr}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                style={[
                  styles.cell,
                  // Every cell carries the border; only today's is visible, so
                  // ringing a day never nudges its number off centre.
                  isToday && { borderColor: colors.calendarToday },
                  isSelected && { backgroundColor: colors.calendarSelectedDay },
                ]}
                onPress={() => onSelectDate(cell.dateStr)}>
                <ThemedText
                  style={[
                    styles.dayText,
                    !cell.inMonth && { opacity: 0.3 },
                    isSelected && { color: '#fff' },
                  ]}>
                  {cell.day}
                </ThemedText>
                {hasSession && (
                  <View
                    style={[styles.dot, { backgroundColor: isSelected ? '#fff' : colors.calendarDot }]}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Today in the same shape the session records use. Built from the local
 * calendar rather than toISOString, which would answer in UTC and land on the
 * wrong day for anyone west of Greenwich for part of every evening.
 */
function todayDateString(): string {
  const now = new Date();
  return formatDate(now.getFullYear(), now.getMonth(), now.getDate());
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  arrow: {
    fontSize: 24,
    lineHeight: 28,
    paddingHorizontal: 8,
  },
  weekdayRow: {
    flexDirection: 'row',
  },
  weekdayLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  weekRow: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  dayText: {
    fontSize: 15,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 2,
  },
});
