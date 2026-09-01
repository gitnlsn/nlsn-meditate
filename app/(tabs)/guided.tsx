import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GUIDED_MEDITATIONS } from '@/constants/guided-meditations';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
}

export default function GuidedScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Guiadas
        </ThemedText>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {GUIDED_MEDITATIONS.map((meditation) => (
            <Pressable
              key={meditation.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/guided/${meditation.id}`);
              }}
              style={[
                styles.row,
                { backgroundColor: colors.chipBackground, borderColor: colors.icon + '4D' },
              ]}>
              <View style={styles.rowText}>
                <ThemedText type="defaultSemiBold">{meditation.title}</ThemedText>
                <ThemedText style={styles.meta}>
                  {formatDuration(meditation.durationSeconds)}
                </ThemedText>
                <ThemedText style={styles.description}>{meditation.description}</ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.icon} />
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  title: { marginBottom: 32 },
  list: { gap: 12, paddingBottom: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowText: { flex: 1, gap: 4 },
  meta: { fontSize: 13, opacity: 0.6 },
  description: { fontSize: 14, opacity: 0.5, lineHeight: 20 },
});
