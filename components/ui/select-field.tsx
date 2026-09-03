import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SelectDialog, type SelectOption } from '@/components/ui/select-dialog';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type { SelectOption };

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

  const [open, setOpen] = useState(false);

  // Callers pass a value that is in `options`; anything else has no title to
  // show. Normalising a stale value is the caller's job, since only it knows
  // what the sensible replacement is.
  const selected = options.find((option) => option.value === value);

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

      <SelectDialog
        visible={open}
        title={title}
        options={options}
        value={value}
        onSelect={onSelect}
        onClose={() => setOpen(false)}
      />
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
});
