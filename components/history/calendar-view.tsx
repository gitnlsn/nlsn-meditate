import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

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

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthLabel = new Date(year, month).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

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
        {WEEKDAYS.map((label, i) => (
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

            return (
              <Pressable
                key={cell.dateStr}
                style={[
                  styles.cell,
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
