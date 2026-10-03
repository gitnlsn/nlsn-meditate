import { Modal, Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { DIALOG_MAX_WIDTH } from '@/constants/layout';
import type { Achievement } from '@/constants/achievements';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStrings } from '@/contexts/locale-context';

interface BadgeDialogProps {
  /** The badge to show, or null for the dialog to be closed. */
  achievement: Achievement | null;
  earned: boolean;
  /** A heading above the badge — set when announcing one just earned. */
  heading?: string;
  closeLabel: string;
  onClose: () => void;
}

/**
 * One badge, large, with what it is for.
 *
 * Serves both the announcement of a badge just earned and a tap on one in the
 * grid, so the two look like the same object. The shell is ConfirmDialog's.
 */
export function BadgeDialog({ achievement, earned, heading, closeLabel, onClose }: BadgeDialogProps) {
  const colors = Colors[useColorScheme() ?? 'light'];
  const strings = useStrings();
  if (!achievement) return null;
  const words = strings.progress.badges[achievement.key];

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.dialog, { backgroundColor: colors.background }]}
          onPress={(event) => event.stopPropagation()}>
          {heading && <ThemedText style={styles.heading}>{heading}</ThemedText>}
          <View
            style={[
              styles.medal,
              { backgroundColor: earned ? colors.tint : colors.chipBackground },
            ]}>
            <IconSymbol
              name={achievement.icon}
              size={44}
              color={earned ? colors.chipSelectedText : colors.icon}
            />
          </View>
          <ThemedText style={styles.title}>{words.title}</ThemedText>
          <ThemedText style={styles.description}>{words.description}</ThemedText>
          <Pressable
            style={styles.button}
            accessibilityRole="button"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onClose();
            }}>
            <ThemedText style={[styles.buttonText, { color: colors.tint }]}>{closeLabel}</ThemedText>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    borderRadius: 28,
    padding: 24,
    width: '100%',
    maxWidth: DIALOG_MAX_WIDTH,
    alignItems: 'center',
  },
  heading: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 2,
    opacity: 0.6,
    marginBottom: 20,
  },
  medal: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 6, textAlign: 'center' },
  description: { fontSize: 15, lineHeight: 22, opacity: 0.7, textAlign: 'center' },
  button: { marginTop: 20, paddingHorizontal: 12, paddingVertical: 8 },
  buttonText: { fontSize: 16, fontWeight: '500' },
});
