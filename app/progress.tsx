import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ProgressDetails } from '@/components/progress/progress-details';
import { Colors } from '@/constants/theme';
import { CONTENT_MAX_WIDTH } from '@/constants/layout';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStrings } from '@/contexts/locale-context';

/**
 * Reached from the strip above History's calendar.
 *
 * Laid out like the tab screens — large title, a line under it — rather than
 * the guided player's small centred header: this is a page to read, like
 * History, not a session in progress. The back chevron gets a line of its own
 * above the title, since nothing on a tab screen sits beside it.
 */
export default function ProgressScreen() {
  const router = useRouter();
  const colors = Colors[useColorScheme() ?? 'light'];
  const strings = useStrings();

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
          <ThemedText type="title" style={styles.title}>{strings.progress.heading}</ThemedText>
          <ThemedText style={styles.intro}>{strings.progress.intro}</ThemedText>
          <ProgressDetails />
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
  // Title and intro as History's, so the two pages read as siblings.
  title: { marginBottom: 12 },
  intro: { fontSize: 15, lineHeight: 22, opacity: 0.6, marginBottom: 28 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
  },
});
