import { Pressable, ScrollView, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { AMBIENCES } from '@/constants/ambiences';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface AmbiencePickerProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

/**
 * Chooses the background bed. Follows the chip pattern from DurationPicker so
 * the two read as the same control.
 *
 * Scrolls horizontally rather than wrapping: there are nine beds, and a wrapped
 * grid would push the transport controls off a small screen.
 */
export function AmbiencePicker({ selectedId, onSelect }: AmbiencePickerProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const options = [{ id: null, title: 'Silêncio' }, ...AMBIENCES];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {options.map((option) => {
        const selected = option.id === selectedId;
        return (
          <Pressable
            key={option.id ?? 'silence'}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(option.id);
            }}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? colors.chipSelectedBackground : colors.chipBackground,
              },
            ]}>
            <ThemedText
              style={[
                styles.chipText,
                { color: selected ? colors.chipSelectedText : colors.chipText },
              ]}>
              {option.title}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
