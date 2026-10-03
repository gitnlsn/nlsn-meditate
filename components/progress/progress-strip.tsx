import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { formatMinutes } from '@/components/progress/format';
import { ACHIEVEMENTS } from '@/constants/achievements';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHistory } from '@/contexts/history-context';
import { useStrings } from '@/contexts/locale-context';
import { computeProgress } from '@/utils/progress';

/**
 * Three numbers above the calendar, and the door to the rest.
 *
 * One row and no more, so the calendar — what History is for — still sits
 * where it always did without scrolling. Everything else about progress lives
 * on its own screen, one tap away.
 */
export function ProgressStrip() {
  const { sessions } = useHistory();
  const strings = useStrings();
  const router = useRouter();
  const colors = Colors[useColorScheme() ?? 'light'];
  const progress = useMemo(() => computeProgress(sessions), [sessions]);
  const p = strings.progress;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.strip,
        { backgroundColor: colors.chipBackground },
        pressed && styles.pressed,
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push('/progress');
      }}
      accessibilityRole="button"
      accessibilityLabel={p.openDetails}>
      <Stat label={p.totalTime} value={formatMinutes(progress.totalMinutes, strings)} />
      <Stat label={p.currentStreak} value={p.days(progress.currentStreak)} />
      <Stat label={p.badgesHeading} value={p.badgeCount(progress.unlocked.size, ACHIEVEMENTS.length)} />
      <IconSymbol name="chevron.right" size={20} color={colors.icon} />
    </Pressable>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <ThemedText style={styles.value} numberOfLines={1}>{value}</ThemedText>
      <ThemedText style={styles.label} numberOfLines={1}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 10,
    gap: 8,
    marginBottom: 24,
  },
  pressed: { opacity: 0.7 },
  stat: { flex: 1 },
  value: { fontSize: 16, fontWeight: '600', lineHeight: 22 },
  label: { fontSize: 12, lineHeight: 16, opacity: 0.6 },
});
