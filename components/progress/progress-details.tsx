import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BadgeDialog } from '@/components/progress/badge-dialog';
import { formatMinutes } from '@/components/progress/format';
import { ACHIEVEMENTS, type Achievement } from '@/constants/achievements';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHistory } from '@/contexts/history-context';
import { useStrings } from '@/contexts/locale-context';
import { usePlayGames } from '@/contexts/play-games-context';
import { computeProgress } from '@/utils/progress';

/**
 * The whole of the progress screen: how much, how steadily, what has been
 * earned, and the way out to Play Games.
 *
 * Kept off History on purpose. There the calendar is the point and gets the
 * screen; a strip of numbers above it leads here for the rest. Everything is
 * read off the same sessions the calendar draws, so the two can never tell
 * different stories.
 */
export function ProgressDetails() {
  const { sessions } = useHistory();
  const strings = useStrings();
  const colors = Colors[useColorScheme() ?? 'light'];
  const playGames = usePlayGames();
  const [opened, setOpened] = useState<Achievement | null>(null);

  const progress = useMemo(() => computeProgress(sessions), [sessions]);
  const p = strings.progress;

  return (
    <View style={styles.container}>
      <View style={styles.stats}>
        <Stat label={p.totalTime} value={formatMinutes(progress.totalMinutes, strings)} />
        <Stat label={p.currentStreak} value={p.days(progress.currentStreak)} />
        <Stat label={p.bestStreak} value={p.days(progress.bestStreak)} />
      </View>

      <View
        style={[styles.track, { backgroundColor: colors.progressTrack }]}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(progress.milestoneProgress * 100) }}>
        <View
          style={[
            styles.fill,
            { backgroundColor: colors.progressRing, width: `${progress.milestoneProgress * 100}%` },
          ]}
        />
      </View>
      <ThemedText style={styles.caption}>
        {progress.nextMilestone === null
          ? p.allMilestones
          : p.nextMilestone(formatMinutes(progress.nextMilestone, strings))}
      </ThemedText>

      <ThemedText type="defaultSemiBold" style={styles.sectionHeading}>{p.badgesHeading}</ThemedText>
      <View style={styles.grid}>
        {ACHIEVEMENTS.map((achievement) => {
          const earned = progress.unlocked.has(achievement.key);
          const title = p.badges[achievement.key].title;
          return (
            <Pressable
              key={achievement.key}
              style={styles.badge}
              onPress={() => setOpened(achievement)}
              accessibilityRole="button"
              accessibilityLabel={earned ? title : p.lockedLabel(title)}>
              <View
                style={[
                  styles.medal,
                  earned
                    ? { backgroundColor: colors.tint }
                    : { backgroundColor: colors.chipBackground, opacity: 0.5 },
                ]}>
                <IconSymbol
                  name={achievement.icon}
                  size={24}
                  color={earned ? colors.chipSelectedText : colors.icon}
                />
              </View>
              <ThemedText style={[styles.badgeTitle, !earned && styles.locked]} numberOfLines={2}>
                {title}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {playGames.available && (
        <View style={[styles.playGames, { backgroundColor: colors.chipBackground }]}>
          <ThemedText type="defaultSemiBold">{p.playGames}</ThemedText>
          <ThemedText style={styles.caption}>{p.playGamesIntro}</ThemedText>
          <View style={styles.playGamesButtons}>
            {playGames.signedIn ? (
              <>
                <PillButton icon="list.number" label={p.playGamesLeaderboards} onPress={playGames.showLeaderboards} />
                <PillButton icon="trophy.fill" label={p.playGamesAchievements} onPress={playGames.showAchievements} />
              </>
            ) : (
              <PillButton icon="trophy.fill" label={p.playGamesSignIn} onPress={playGames.signIn} />
            )}
          </View>
        </View>
      )}

      <BadgeDialog
        achievement={opened}
        earned={!!opened && progress.unlocked.has(opened.key)}
        closeLabel={strings.picker.close}
        onClose={() => setOpened(null)}
      />
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </View>
  );
}

function PillButton({
  icon,
  label,
  onPress,
}: {
  icon: 'list.number' | 'trophy.fill';
  label: string;
  onPress: () => void;
}) {
  const colors = Colors[useColorScheme() ?? 'light'];
  return (
    <Pressable
      style={[styles.pill, { backgroundColor: colors.chipSelectedBackground }]}
      onPress={onPress}
      accessibilityRole="button">
      <IconSymbol name={icon} size={18} color={colors.chipSelectedText} />
      <ThemedText style={[styles.pillText, { color: colors.chipSelectedText }]}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 28 },
  sectionHeading: { marginBottom: 12 },
  stats: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  stat: { flex: 1 },
  statValue: { fontSize: 20, fontWeight: '600', lineHeight: 26 },
  statLabel: { fontSize: 13, opacity: 0.6 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  caption: { fontSize: 14, lineHeight: 20, opacity: 0.6, marginTop: 8, marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 16 },
  badge: { width: '25%', alignItems: 'center', paddingHorizontal: 4 },
  medal: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  badgeTitle: { fontSize: 12, lineHeight: 16, textAlign: 'center' },
  locked: { opacity: 0.5 },
  playGames: { borderRadius: 20, padding: 16, marginTop: 28 },
  playGamesButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: -12 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pillText: { fontSize: 14, fontWeight: '500' },
});
