import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import type { MeditationSession } from '@/utils/session-storage';

interface SessionSummaryProps {
  date: string;
  sessions: MeditationSession[];
}

export function SessionSummary({ date, sessions }: SessionSummaryProps) {
  if (sessions.length === 0) return null;

  const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold">{formattedDate}</ThemedText>
      <ThemedText>
        {formatDuration(totalSeconds)}
        {sessions.length > 1 ? ` · ${sessions.length} sessions` : ''}
      </ThemedText>
    </View>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs} sec`;
  if (secs === 0) return `${mins} min`;
  return `${mins} min ${secs} sec`;
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    gap: 4,
  },
});
