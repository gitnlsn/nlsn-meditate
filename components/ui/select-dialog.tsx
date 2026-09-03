import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStrings } from '@/contexts/locale-context';
import { DIALOG_MAX_WIDTH } from '@/constants/layout';

export interface SelectOption<T> {
  value: T;
  title: string;
}

interface SelectDialogProps<T> {
  visible: boolean;
  /** Heads the dialog, and names the setting being chosen. */
  title: string;
  options: SelectOption<T>[];
  value: T;
  onSelect: (value: T) => void;
  onClose: () => void;
}

/**
 * Every option at once, with the current one ticked.
 *
 * Separate from the row that usually opens it because the timer screen opens the
 * same list from inside the ring: what differs between the two is only what you
 * press to get here.
 */
export function SelectDialog<T extends string | null>({
  visible,
  title,
  options,
  value,
  onSelect,
  onClose,
}: SelectDialogProps<T>) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const strings = useStrings();

  const select = (next: T) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(next);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.dialog, { backgroundColor: colors.background }]}
          onPress={(event) => event.stopPropagation()}>
          <ThemedText style={styles.dialogTitle}>{title}</ThemedText>

          <ScrollView style={styles.options}>
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <Pressable
                  key={String(option.value)}
                  onPress={() => select(option.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  style={({ pressed }) => [styles.option, { opacity: pressed ? 0.6 : 1 }]}>
                  <ThemedText style={isSelected ? undefined : styles.optionIdle}>
                    {option.title}
                  </ThemedText>
                  {isSelected && <IconSymbol name="checkmark" size={18} color={colors.tint} />}
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.buttonRow}>
            <Pressable style={styles.button} onPress={onClose}>
              <ThemedText style={[styles.buttonText, { color: colors.tint }]}>
                {strings.picker.close}
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
    // Keeps its phone width and gains a margin on anything larger, rather than
    // stretching across a tablet. On a screen turned sideways the margin is what
    // stops the dialog reaching the edges.
    width: '100%',
    maxWidth: DIALOG_MAX_WIDTH,
    maxHeight: '90%',
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  // Shrinks within the dialog rather than growing past it; ten beds already
  // overflow a small phone, and a phone in landscape has far less to give.
  options: { flexShrink: 1 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  optionIdle: { opacity: 0.7 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    marginTop: 12,
  },
  button: { paddingHorizontal: 12, paddingVertical: 8 },
  buttonText: { fontSize: 16, fontWeight: '500' },
});
