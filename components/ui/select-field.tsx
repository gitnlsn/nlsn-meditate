import { useState } from 'react';
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

interface SelectFieldProps<T> {
  /** Names the setting: the dialog's heading, and the row's own label. */
  title: string;
  /**
   * Drop the row's label where a section heading overhead already says the same
   * word, so the screen does not read "Idioma / Idioma".
   */
  hideLabel?: boolean;
  options: SelectOption<T>[];
  value: T;
  onSelect: (value: T) => void;
}

/**
 * One row showing the current choice, opening a list of all of them.
 *
 * The shape the background-sound picker arrived in, pulled out so every
 * multiple-choice setting can wear it. A strip of chips — which is what the
 * language setting was, and what the sounds used to be — has to either fit every
 * option on one line or hide the rest off the edge of the screen; a field plus a
 * dialog costs a single line and still shows everything at once when open.
 */
export function SelectField<T extends string | null>({
  title,
  hideLabel = false,
  options,
  value,
  onSelect,
}: SelectFieldProps<T>) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const strings = useStrings();

  const [open, setOpen] = useState(false);

  // Callers pass a value that is in `options`; anything else has no title to
  // show. Normalising a stale value is the caller's job, since only it knows
  // what the sensible replacement is.
  const selected = options.find((option) => option.value === value);

  const select = (next: T) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(next);
    setOpen(false);
  };

  return (
    <>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setOpen(true);
        }}
        accessibilityRole="button"
        accessibilityLabel={`${title}: ${selected?.title ?? ''}`}
        style={({ pressed }) => [
          styles.field,
          {
            backgroundColor: colors.chipBackground,
            borderColor: colors.icon + '4D',
            opacity: pressed ? 0.7 : 1,
          },
        ]}>
        {!hideLabel && <ThemedText style={styles.label}>{title}</ThemedText>}
        {/* Without a label the value takes the row, so the chevron still lands
            on the right edge rather than trailing the text. */}
        <View style={[styles.value, hideLabel && styles.valueAlone]}>
          <ThemedText type="defaultSemiBold">{selected?.title ?? ''}</ThemedText>
          <IconSymbol name="chevron.right" size={16} color={colors.icon} />
        </View>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
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
              <Pressable style={styles.button} onPress={() => setOpen(false)}>
                <ThemedText style={[styles.buttonText, { color: colors.tint }]}>
                  {strings.picker.close}
                </ThemedText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  label: { opacity: 0.6 },
  value: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  valueAlone: { flex: 1, justifyContent: 'space-between' },

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
