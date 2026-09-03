import { Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useStrings } from '@/contexts/locale-context';

interface DurationInputProps {
  minutes: number;
  onPress: () => void;
}

export function DurationInput({ minutes, onPress }: DurationInputProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const strings = useStrings();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: colors.chipBackground,
          borderColor: colors.icon + '4D', // 30% opacity
        },
      ]}
    >
      <ThemedText style={styles.text}>{strings.duration.minutes(minutes)}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  text: {
    fontSize: 16,
  },
});
