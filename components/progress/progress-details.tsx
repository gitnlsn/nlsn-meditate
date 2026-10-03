import { useMemo, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BadgeDialog } from '@/components/progress/badge-dialog';
import { formatMinutes, formatSeconds } from '@/components/progress/format';
import { WeekChart } from '@/components/progress/week-chart';
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
      {/* How much: the total, and how far it is from the next milestone. */}
      <Card>
        <ThemedText style={styles.statLabel}>{p.totalTime}</ThemedText>
        <ThemedText style={styles.hero}>{formatMinutes(progress.totalMinutes, strings)}</ThemedText>
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
      </Card>

      {/* How steadily. */}
      <View style={styles.row}>
        <Card style={styles.grow}>
          <Stat icon label={p.currentStreak} value={p.days(progress.currentStreak)} />
        </Card>
        <Card style={styles.grow}>
          <Stat label={p.bestStreak} value={p.days(progress.bestStreak)} />
        </Card>
      </View>

      {/*
        * Comparing is the reason to sign in, so it sits right under the
        * numbers being compared. Once signed in it is only the two ways in;
        * the sentence is for those deciding.
        */}
      {playGames.available && (playGames.signedIn ? (
        <View style={styles.row}>
          <PillButton grow icon="list.number" label={p.playGamesLeaderboards} onPress={playGames.showLeaderboards} />
          <PillButton grow icon="trophy.fill" label={p.playGamesAchievements} onPress={playGames.showAchievements} />
        </View>
      ) : (
        <Card style={styles.playGamesCard}>
          <ThemedText style={styles.playGamesIntro}>{p.playGamesIntro}</ThemedText>
          <PillButton icon="trophy.fill" label={p.playGamesSignIn} onPress={playGames.signIn} />
        </Card>
      ))}

      {/* When. */}
      <Card>
        <WeekChart days={progress.weekDays} todayIndex={progress.todayIndex} />
      </Card>

      {/* What a sit tends to look like. */}
      <Card style={styles.row}>
        <Stat label={p.sessions} value={String(progress.sessionCount)} />
        <Stat label={p.averageSession} value={formatSeconds(progress.averageSeconds, strings)} />
        <Stat label={p.longestSession} value={formatSeconds(progress.longestSeconds, strings)} />
      </Card>

      {/*
        * Signed in, the Achievements button already shows these same badges
        * on Google's own screen, so the grid would only repeat it. It stays for
        * everyone else — iOS, and anyone who has not signed in — for whom it
        * is the only place badges can be seen.
        */}
      {!playGames.signedIn && (
        <>
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
        </>
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

/** A surface grouping what belongs together, so the screen reads in sections. */
function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const colors = Colors[useColorScheme() ?? 'light'];
  return <View style={[styles.card, { backgroundColor: colors.chipBackground }, style]}>{children}</View>;
}

function Stat({ label, value, icon = false }: { label: string; value: string; icon?: boolean }) {
  const colors = Colors[useColorScheme() ?? 'light'];
  return (
    <View style={styles.stat}>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
      <View style={styles.statValueRow}>
        {icon && <IconSymbol name="flame.fill" size={20} color={colors.tint} />}
        <ThemedText style={styles.statValue}>{value}</ThemedText>
      </View>
    </View>
  );
}

function PillButton({
  icon,
  label,
  onPress,
  grow = false,
}: {
  icon: 'list.number' | 'trophy.fill';
  label: string;
  onPress: () => void;
  /** Share a row evenly with its neighbours instead of hugging the label. */
  grow?: boolean;
}) {
  const colors = Colors[useColorScheme() ?? 'light'];
  return (
    <Pressable
      style={[styles.pill, grow && styles.grow, { backgroundColor: colors.chipSelectedBackground }]}
      onPress={onPress}
      accessibilityRole="button">
      <IconSymbol name={icon} size={18} color={colors.chipSelectedText} />
      <ThemedText style={[styles.pillText, { color: colors.chipSelectedText }]}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 28, gap: 12 },
  card: { borderRadius: 20, padding: 16 },
  row: { flexDirection: 'row', gap: 12 },
  grow: { flex: 1 },
  sectionHeading: { marginTop: 16 },
  stat: { flex: 1, gap: 2 },
  statValueRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statValue: { fontSize: 20, fontWeight: '600', lineHeight: 26 },
  statLabel: { fontSize: 13, opacity: 0.6 },
  hero: { fontSize: 34, fontWeight: '600', lineHeight: 42, marginBottom: 12 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  caption: { fontSize: 14, lineHeight: 20, opacity: 0.6, marginTop: 8 },
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
  playGamesCard: { gap: 12, alignItems: 'flex-start' },
  playGamesIntro: { fontSize: 14, lineHeight: 20, opacity: 0.7 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pillText: { fontSize: 14, fontWeight: '500' },
});
