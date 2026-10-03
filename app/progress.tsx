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

/** Reached from the strip above History's calendar. Header as the guided player's. */
export default function ProgressScreen() {
  const router = useRouter();
  const colors = Colors[useColorScheme() ?? 'light'];
  const strings = useStrings();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
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
          <ThemedText style={styles.headerTitle}>{strings.progress.heading}</ThemedText>
          <View style={styles.back} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <ProgressDetails />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
  },
  back: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    fontSize: 18,
    fontWeight: '300',
    textTransform: 'uppercase',
    letterSpacing: 4,
    opacity: 0.6,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
  },
});
