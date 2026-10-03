import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { lessonsFor, libraryTracksFor, type LibraryLesson } from '@/constants/library';
import { Colors } from '@/constants/theme';
import { TAB_SCREEN_EDGES, CONTENT_MAX_WIDTH } from '@/constants/layout';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLocale, useStrings } from '@/contexts/locale-context';
import { useReadLessons } from '@/contexts/library-context';

/**
 * Every lesson on one screen, sectioned by track as Guided is by category.
 *
 * With a handful of lessons per track, a screen of track cards only put a
 * second tap in front of every text. Once the tracks grow past what scrolls
 * comfortably, the cards can come back as a level above this.
 */
export default function LibraryScreen() {
  const colors = Colors[useColorScheme() ?? 'light'];
  const router = useRouter();
  const strings = useStrings();
  const { locale } = useLocale();
  const read = useReadLessons();

  const sections = libraryTracksFor(locale)
    .map((track) => ({ track, lessons: lessonsFor(locale, track.id) }))
    .filter((section) => section.lessons.length > 0);

  const renderRow = (lesson: LibraryLesson, index: number) => {
    const isRead = read.has(lesson.id);
    return (
      <Pressable
        key={lesson.id}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push(`/lesson/${lesson.id}`);
        }}
        accessibilityRole="button"
        accessibilityLabel={isRead ? strings.library.rowRead(lesson.title) : lesson.title}
        style={({ pressed }) => [
          styles.row,
          {
            backgroundColor: colors.chipBackground,
            borderColor: colors.icon + '4D',
            opacity: pressed ? 0.7 : 1,
          },
        ]}>
        <View
          style={[
            styles.marker,
            { backgroundColor: isRead ? colors.tint : colors.tint + '22' },
          ]}>
          {isRead ? (
            <IconSymbol name="checkmark" size={18} color={colors.background} />
          ) : (
            <ThemedText style={[styles.number, { color: colors.tint }]}>{index + 1}</ThemedText>
          )}
        </View>

        <View style={styles.content}>
          <ThemedText type="defaultSemiBold">{lesson.title}</ThemedText>
          <ThemedText style={styles.summary}>{lesson.summary}</ThemedText>
        </View>

        <View style={[styles.badge, { backgroundColor: colors.tint + '22' }]}>
          <ThemedText style={[styles.badgeText, { color: colors.tint }]}>
            {strings.duration.minutes(lesson.readingMinutes)}
          </ThemedText>
        </View>
      </Pressable>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={TAB_SCREEN_EDGES}>
        <ThemedText type="title" style={styles.title}>
          {strings.library.heading}
        </ThemedText>
        <ThemedText style={styles.intro}>{strings.library.intro}</ThemedText>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {sections.map(({ track, lessons }) => (
            <View key={track.id} style={styles.section}>
              <ThemedText style={styles.sectionTitle}>{track.title}</ThemedText>
              <View style={styles.sectionItems}>{lessons.map(renderRow)}</View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
  },
  title: { marginBottom: 12 },
  intro: { fontSize: 15, lineHeight: 22, opacity: 0.6, marginBottom: 20 },
  list: { paddingBottom: 24 },
  section: { marginBottom: 28 },
  // As Guided's section titles.
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
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: { fontSize: 15, fontWeight: '600', lineHeight: 20 },
  content: { flex: 1, gap: 4 },
  summary: { fontSize: 14, opacity: 0.5, lineHeight: 20 },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 12, fontWeight: '600', lineHeight: 16 },
});
