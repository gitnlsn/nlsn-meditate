import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStrings } from '@/contexts/locale-context';
import { usePlayGames } from '@/contexts/play-games-context';

/**
 * Leaderboards and achievements, one tap from History's title.
 *
 * The same two doors as on the practice screen, so comparing takes the tab and
 * one press instead of three. They sit on the title's line and take no height,
 * which keeps the calendar where it was. Shown only when signed in: signing in
 * is a decision with an explanation, and that lives on the practice screen.
 */
export function PlayGamesShortcuts() {
  const playGames = usePlayGames();
  const strings = useStrings();
  const colors = Colors[useColorScheme() ?? 'light'];
  if (!playGames.available || !playGames.signedIn) return null;

  const button = (icon: 'list.number' | 'trophy.fill', label: string, onPress: () => void) => (
    <Pressable
      style={({ pressed }) => [styles.button, { backgroundColor: colors.chipBackground }, pressed && styles.pressed]}
      hitSlop={6}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <IconSymbol name={icon} size={20} color={colors.tint} />
    </Pressable>
  );

  return (
    <View style={styles.row}>
      {button('list.number', strings.progress.playGamesLeaderboards, playGames.showLeaderboards)}
      {button('trophy.fill', strings.progress.playGamesAchievements, playGames.showAchievements)}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  button: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.7 },
});
