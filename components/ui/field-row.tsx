import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface FieldRowProps {
  /** Names the setting, and reads as the row's label. */
  title: string;
  /** The current choice, shown on the right. */
  value: string;
  /**
   * Drop the row's label where a section heading overhead already says the same
   * word, so the screen does not read "Idioma / Idioma".
   */
  hideLabel?: boolean;
  /** Greyed and inert — the setting exists but cannot be changed right now. */
  disabled?: boolean;
  onPress: () => void;
}

/**
 * One settings row: a label, the current value, and a chevron.
 *
 * Pulled out of SelectField once the timer screen needed a row that opens the
 * clock face rather than a list. The two sit against each other in that screen's
 * footer, so they have to be the same row and not two that merely resemble one
 * another; what differs between them is only what a press opens.
 */
export function FieldRow({
  title,
  value,
  hideLabel = false,
  disabled = false,
  onPress,
}: FieldRowProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${value}`}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.field,
        {
          backgroundColor: colors.chipBackground,
          borderColor: colors.icon + '4D', // 30% opacity
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        },
      ]}>
      {!hideLabel && <ThemedText style={styles.label}>{title}</ThemedText>}
      {/* Without a label the value takes the row, so the chevron still lands
          on the right edge rather than trailing the text. */}
      <View style={[styles.value, hideLabel && styles.valueAlone]}>
        <ThemedText type="defaultSemiBold">{value}</ThemedText>
        <IconSymbol name="chevron.right" size={16} color={colors.icon} />
      </View>
    </Pressable>
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
