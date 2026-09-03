import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  GUIDED_MEDITATIONS, meditationsByCategory, type GuidedMeditation,
} from '@/constants/guided-meditations';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFavorites, useToggleFavorite } from '@/contexts/favorites-context';
import { useNowPlayingGuidedId } from '@/contexts/guided-session-context';

const FAVORITES_TITLE = 'Favoritas';

function formatDuration(seconds: number): string {
  return `${Math.round(seconds / 60)} min`;
}

export default function GuidedScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { favorites } = useFavorites();
  const toggleFavorite = useToggleFavorite();
  /*
   * A session survives leaving the player now, so the library has to say which
   * one is still going. Without it a meditation you backed out of keeps playing
   * with nothing on screen pointing at where to stop it.
   */
  const playingId = useNowPlayingGuidedId();

  const onTint = colorScheme === 'dark' ? Colors.dark.background : '#FFFFFF';

  /*
   * A favourite moves into the top section rather than appearing twice. In a
   * library this small, seeing the same card in two places on one screen reads
   * as a bug; a section that empties out is easier to follow than a duplicate.
   */
  const sections = useMemo(() => {
    const favourited = GUIDED_MEDITATIONS
      .filter((m) => favorites.has(m.id))
      .sort((a, b) => a.durationSeconds - b.durationSeconds);

    const rest = meditationsByCategory()
      .map(({ category, items }) => ({
        title: category.title,
        items: items.filter((m) => !favorites.has(m.id)),
      }))
      .filter((section) => section.items.length > 0);

    return favourited.length
      ? [{ title: FAVORITES_TITLE, items: favourited }, ...rest]
      : rest;
  }, [favorites]);

  const renderRow = (meditation: GuidedMeditation) => {
    const isFavorite = favorites.has(meditation.id);
    const isPlaying = playingId === meditation.id;
    return (
      <Pressable
        key={meditation.id}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push(`/guided/${meditation.id}`);
        }}
        accessibilityRole="button"
        accessibilityLabel={
          isPlaying ? `${meditation.title}, em reprodução` : meditation.title
        }
        style={({ pressed }) => [
          styles.row,
          {
            backgroundColor: colors.chipBackground,
            borderColor: isPlaying ? colors.tint : colors.icon + '4D',
            opacity: pressed ? 0.7 : 1,
          },
        ]}>
        <View style={[styles.play, { backgroundColor: colors.tint }]}>
          {/* The triangle is nudged right to sit optically centred; the two bars
              of the pause glyph already are. */}
          <IconSymbol
            name={isPlaying ? 'pause.fill' : 'play.fill'}
            size={18}
            color={onTint}
            style={isPlaying ? undefined : styles.playIcon}
          />
        </View>

        <View style={styles.content}>
          <ThemedText type="defaultSemiBold">{meditation.title}</ThemedText>
          <ThemedText style={styles.description}>{meditation.description}</ThemedText>
        </View>

        {/* Badge and heart share one right-hand column. Inline with the title
            they each ate into it, and every title wrapped to two lines. */}
        <View style={styles.side}>
          <View style={[styles.badge, { backgroundColor: colors.tint + '22' }]}>
            <ThemedText style={[styles.badgeText, { color: colors.tint }]}>
              {formatDuration(meditation.durationSeconds)}
            </ThemedText>
          </View>

          {/* Nested inside the row's Pressable: the inner one claims the touch,
              so tapping the heart does not also open the meditation. */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleFavorite(meditation.id);
            }}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={
              isFavorite
                ? `Remover ${meditation.title} das favoritas`
                : `Adicionar ${meditation.title} às favoritas`
            }
            style={styles.favorite}>
            <IconSymbol
              name={isFavorite ? 'heart.fill' : 'heart'}
              size={20}
              color={isFavorite ? colors.tint : colors.icon}
            />
          </Pressable>
        </View>
      </Pressable>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Guiadas
        </ThemedText>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {sections.map((section) => (
            <View key={section.title} style={styles.section}>
              <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
              <View style={styles.sectionItems}>{section.items.map(renderRow)}</View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  title: { marginBottom: 24 },
  list: { paddingBottom: 24 },
  section: { marginBottom: 28 },
  sectionTitle: {
    fontSize: 13,
    opacity: 0.5,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
  },
  sectionItems: { gap: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 12,
    borderWidth: 1,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 14,
  },
  play: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { marginLeft: 2 },
  content: { flex: 1, gap: 4 },
  // Stretches to the row's height so the badge pins to the title's line and the
  // heart to the bottom, whatever the description's length.
  side: { alignSelf: 'stretch', alignItems: 'flex-end', justifyContent: 'space-between' },
  badge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 12, fontWeight: '600', lineHeight: 16 },
  description: { fontSize: 14, opacity: 0.5, lineHeight: 20 },
  favorite: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
