import { Modal, Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DIALOG_MAX_WIDTH } from '@/constants/layout';

interface ConfirmDialogProps {
  visible: boolean;
  /** The question, asked in one line. */
  title: string;
  /** What confirming does, and what it costs. */
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * A question with two answers, in the app's own language rather than the
 * system's.
 *
 * Alert.alert would be less code, but it arrives as the operating system's
 * dialog — its typeface, its corners, its chrome — on top of a screen the whole
 * app has been keeping quiet and rounded. Asking someone mid-meditation whether
 * they mean to stop is the last place to hand the question to something that
 * looks like a different app.
 *
 * The shell is SelectDialog's: same overlay, same fade, same card, so the two
 * read as one dialog asked two ways.
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const press = (action: () => void) => () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    action();
  };

  return (
    // Dismissing without answering is staying: the Android back button and a
    // press outside both mean the session carries on.
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable
          style={[styles.dialog, { backgroundColor: colors.background }]}
          onPress={(event) => event.stopPropagation()}>
          <ThemedText style={styles.dialogTitle}>{title}</ThemedText>
          <ThemedText style={styles.message}>{message}</ThemedText>

          <View style={styles.buttonRow}>
            <Pressable
              style={styles.button}
              onPress={press(onCancel)}
              accessibilityRole="button">
              <ThemedText style={[styles.buttonText, styles.cancelText]}>
                {cancelLabel}
              </ThemedText>
            </Pressable>
            <Pressable
              style={styles.button}
              onPress={press(onConfirm)}
              accessibilityRole="button">
              <ThemedText style={[styles.buttonText, { color: colors.tint }]}>
                {confirmLabel}
              </ThemedText>
            </Pressable>
          </View>
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
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  dialog: {
    borderRadius: 28,
    padding: 24,
    width: '100%',
    maxWidth: DIALOG_MAX_WIDTH,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  message: { fontSize: 15, lineHeight: 22, opacity: 0.7 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
    // Keeps the two answers apart: side by side at a thumb's width they are one
    // slip away from each other, and one of them ends the meditation.
    gap: 8,
  },
  button: { paddingHorizontal: 12, paddingVertical: 8 },
  buttonText: { fontSize: 16, fontWeight: '500' },
  // The dimmer of the two is staying, which is also what a press outside does.
  cancelText: { opacity: 0.7 },
});
