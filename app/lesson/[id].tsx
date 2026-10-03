import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { findLesson, type LibrarySource } from '@/constants/library';
import { findMeditation, type GuidedMeditation } from '@/constants/guided-meditations';
import { Colors } from '@/constants/theme';
import { CONTENT_MAX_WIDTH } from '@/constants/layout';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLocale, useStrings } from '@/contexts/locale-context';
import { useReadLessons, useToggleRead } from '@/contexts/library-context';

/**
 * A lesson to read: the text, then something to try on the next sit, then
 * what it rests on. Marking it read is left to the reader rather than inferred
 * from scrolling — a short lesson fits on one screen and would count as read
 * the moment it opened.
 */
export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const strings = useStrings();
  const { locale } = useLocale();
  const read = useReadLessons();
  const toggleRead = useToggleRead();
  const lesson = findLesson(locale, id);
  const isRead = lesson ? read.has(lesson.id) : false;

  const onTint = colorScheme === 'dark' ? Colors.dark.background : '#FFFFFF';

  const related = (lesson?.related ?? [])
    .map((meditationId) => findMeditation(meditationId, locale))
    .filter((meditation): meditation is GuidedMeditation => meditation !== undefined);

  const openSource = (source: LibrarySource) => {
    if (!source.url) return;
    openBrowserAsync(source.url, { presentationStyle: WebBrowserPresentationStyle.AUTOMATIC });
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            hitSlop={12}
            style={styles.back}
            accessibilityRole="button">
            <IconSymbol name="chevron.left" size={24} color={colors.text} />
          </Pressable>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {lesson ? (
            <>
              <ThemedText type="title" style={styles.title}>{lesson.title}</ThemedText>
              <ThemedText style={styles.meta}>
                {strings.library.readingTime(lesson.readingMinutes)}
              </ThemedText>

              {lesson.body.map((paragraph, index) => (
                <ThemedText key={index} style={styles.paragraph}>{paragraph}</ThemedText>
              ))}

              <View style={[styles.practice, { backgroundColor: colors.tint + '1A' }]}>
                <ThemedText style={[styles.sectionTitle, { color: colors.tint }]}>
                  {strings.library.practiceHeading}
                </ThemedText>
                <ThemedText style={styles.paragraphTight}>{lesson.practice}</ThemedText>
              </View>

              {related.length > 0 && (
                <>
                  <ThemedText style={styles.sectionTitle}>
                    {strings.library.relatedHeading}
                  </ThemedText>
                  <View style={styles.related}>
                    {related.map((meditation) => (
                      <Pressable
                        key={meditation.id}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          router.push(`/guided/${meditation.id}`);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={meditation.title}
                        style={({ pressed }) => [
                          styles.relatedRow,
                          {
                            backgroundColor: colors.chipBackground,
                            borderColor: colors.icon + '4D',
                            opacity: pressed ? 0.7 : 1,
                          },
                        ]}>
                        <View style={[styles.play, { backgroundColor: colors.tint }]}>
                          <IconSymbol
                            name="play.fill"
                            size={14}
                            color={onTint}
                            style={styles.playIcon}
                          />
                        </View>
                        <ThemedText type="defaultSemiBold" style={styles.relatedTitle}>
                          {meditation.title}
                        </ThemedText>
                        <ThemedText style={[styles.relatedMinutes, { color: colors.tint }]}>
                          {strings.duration.minutes(Math.round(meditation.durationSeconds / 60))}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}

              <ThemedText style={styles.sectionTitle}>{strings.library.sourcesHeading}</ThemedText>
              <View style={styles.sources}>
                {lesson.sources.map((source) => (
                  <Pressable
                    key={source.label}
                    disabled={!source.url}
                    onPress={() => openSource(source)}
                    accessibilityRole={source.url ? 'link' : 'text'}
                    style={({ pressed }) => [styles.source, { opacity: pressed ? 0.6 : 1 }]}>
                    <ThemedText
                      style={[styles.sourceText, source.url ? { color: colors.tint } : null]}>
                      {source.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>

              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  toggleRead(lesson.id);
                }}
                accessibilityRole="button"
                accessibilityState={{ checked: isRead }}
                style={({ pressed }) => [
                  styles.readButton,
                  isRead
                    ? { borderColor: colors.tint, borderWidth: 1 }
                    : { backgroundColor: colors.tint },
                  { opacity: pressed ? 0.7 : 1 },
                ]}>
                {isRead && <IconSymbol name="checkmark" size={18} color={colors.tint} />}
                <ThemedText
                  type="defaultSemiBold"
                  style={{ color: isRead ? colors.tint : onTint }}>
                  {isRead ? strings.library.markedRead : strings.library.markRead}
                </ThemedText>
              </Pressable>
            </>
          ) : (
            <ThemedText>{strings.library.notFound}</ThemedText>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
  },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
  },
  title: { marginBottom: 12, lineHeight: 38 },
  meta: { fontSize: 13, opacity: 0.5, marginBottom: 24 },
  paragraph: { fontSize: 17, lineHeight: 27, marginBottom: 18 },
  paragraphTight: { fontSize: 16, lineHeight: 24 },
  practice: { borderRadius: 12, padding: 16, gap: 8, marginTop: 8, marginBottom: 28 },
  sectionTitle: {
    fontSize: 13,
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  related: { gap: 10, marginTop: 8, marginBottom: 28 },
  relatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  play: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Nudged right to sit optically centred, as on Guided's rows.
  playIcon: { marginLeft: 2 },
  relatedTitle: { flex: 1 },
  relatedMinutes: { fontSize: 12, fontWeight: '600' },
  sources: { gap: 10, marginTop: 8, marginBottom: 32 },
  source: { paddingVertical: 2 },
  sourceText: { fontSize: 13, lineHeight: 19, opacity: 0.8 },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
  },
});
