import { useState, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CalendarView } from '@/components/history/calendar-view';
import { SessionSummary } from '@/components/history/session-summary';
import { CalendarLegend } from '@/components/history/calendar-legend';
import { useHistory } from '@/contexts/history-context';
import { useStrings } from '@/contexts/locale-context';
import { TAB_SCREEN_EDGES } from '@/constants/layout';

export default function HistoryScreen() {
  const { sessions } = useHistory();
  const strings = useStrings();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const sessionDates = useMemo(
    () => new Set(sessions.map((s) => s.date)),
    [sessions],
  );

  const selectedSessions = useMemo(
    () => (selectedDate ? sessions.filter((s) => s.date === selectedDate) : []),
    [sessions, selectedDate],
  );

  function handlePrevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function handleNextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={TAB_SCREEN_EDGES}>
        <ThemedText type="title" style={styles.title}>{strings.history.heading}</ThemedText>
        <ThemedText style={styles.intro}>{strings.history.intro}</ThemedText>
        <CalendarView
          year={year}
          month={month}
          sessionDates={sessionDates}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />
        <CalendarLegend />
        {selectedDate && selectedSessions.length > 0 && (
          <SessionSummary date={selectedDate} sessions={selectedSessions} />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  title: {
    marginBottom: 12,
  },
  intro: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.6,
    marginBottom: 28,
  },
});
