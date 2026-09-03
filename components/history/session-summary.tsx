import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useStrings } from '@/contexts/locale-context';
import type { Strings } from '@/constants/i18n';
import type { MeditationSession } from '@/utils/session-storage';

interface SessionSummaryProps {
  date: string;
  sessions: MeditationSession[];
}

export function SessionSummary({ date, sessions }: SessionSummaryProps) {
  const strings = useStrings();

  if (sessions.length === 0) return null;

  const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);

  // Noon rather than midnight: a date parsed at midnight and then read back
  // through the local calendar can slide to the previous day across a DST edge.
  const day = new Date(date + 'T12:00:00');
  const formattedDate = strings.history.fullDate(
    strings.history.weekdays[day.getDay()],
    day.getDate(),
    strings.history.months[day.getMonth()],
  );

  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold">{formattedDate}</ThemedText>
      <ThemedText>
        {formatDuration(totalSeconds, strings)}
        {sessions.length > 1 ? ` · ${strings.history.sessionCount(sessions.length)}` : ''}
      </ThemedText>
    </View>
  );
}

function formatDuration(seconds: number, strings: Strings): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return strings.duration.seconds(secs);
  if (secs === 0) return strings.duration.minutes(mins);
  return strings.duration.minutesSeconds(mins, secs);
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    gap: 4,
  },
});
