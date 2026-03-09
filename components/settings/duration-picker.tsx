import { StyleSheet, Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useMeditation, useMeditationDispatch } from '@/contexts/meditation-context';

const PRESETS = [5, 10, 15, 20, 30];

export function DurationPicker() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { durationSeconds } = useMeditation();
  const dispatch = useMeditationDispatch();
  const selectedMinutes = durationSeconds / 60;

  const handleSelect = (minutes: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch({ type: 'SET_DURATION', payload: minutes * 60 });
  };

  return (
    <View style={styles.container}>
      {PRESETS.map((minutes) => {
        const isSelected = minutes === selectedMinutes;
        return (
          <Pressable
            key={minutes}
            onPress={() => handleSelect(minutes)}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected
                  ? colors.chipSelectedBackground
                  : colors.chipBackground,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.chipText,
                { color: isSelected ? colors.chipSelectedText : colors.chipText },
              ]}
            >
              {minutes} min
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
