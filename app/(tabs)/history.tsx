import { useState, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CalendarView } from '@/components/history/calendar-view';
import { SessionSummary } from '@/components/history/session-summary';
import { useHistory } from '@/contexts/history-context';

export default function HistoryScreen() {
  const { sessions } = useHistory();
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
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>History</ThemedText>
        <CalendarView
          year={year}
          month={month}
          sessionDates={sessionDates}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />
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
    marginBottom: 32,
  },
});
