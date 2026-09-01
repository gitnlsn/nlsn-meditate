import { useState, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { DurationInput } from '@/components/settings/duration-input';
import { ClockPickerModal } from '@/components/settings/clock-picker-modal';
import { TimePickerModal } from '@/components/settings/time-picker-modal';
import {
  loadAudioSettings, saveAudioSettings, DEFAULT_AUDIO_SETTINGS, type AudioSettings,
} from '@/utils/settings-storage';
import { useReminders } from '@/hooks/use-reminders';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useMeditation, useMeditationDispatch } from '@/contexts/meditation-context';

function formatTime(hour: number, minute: number): string {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const tintColor = Colors[colorScheme].tint;
  const { durationSeconds } = useMeditation();
  const dispatch = useMeditationDispatch();
  const currentMinutes = durationSeconds / 60;

  const [pickerVisible, setPickerVisible] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(DEFAULT_AUDIO_SETTINGS);
  const { settings: reminderSettings, addReminder, removeReminder } = useReminders();

  useEffect(() => {
    loadAudioSettings().then(setAudioSettings);
  }, []);

  function toggle(key: keyof AudioSettings) {
    const updated = { ...audioSettings, [key]: !audioSettings[key] };
    setAudioSettings(updated);
    saveAudioSettings(updated);
  }

  function onTimeConfirmed(hour: number, minute: number) {
    addReminder(hour, minute);
    setShowTimePicker(false);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <ThemedText type="title" style={styles.title}>Settings</ThemedText>
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Session Length</ThemedText>
            <DurationInput
              minutes={currentMinutes}
              onPress={() => setPickerVisible(true)}
            />
          </ThemedView>
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Sound</ThemedText>
            <View style={styles.row}>
              <ThemedText>Play gong at start</ThemedText>
              <Switch
                value={audioSettings.playGongAtStart}
                onValueChange={() => toggle('playGongAtStart')}
                trackColor={{ true: tintColor }}
              />
            </View>
            <View style={styles.row}>
              <ThemedText>Play gong at end</ThemedText>
              <Switch
                value={audioSettings.playGongAtEnd}
                onValueChange={() => toggle('playGongAtEnd')}
                trackColor={{ true: tintColor }}
              />
            </View>
          </ThemedView>
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Reminders</ThemedText>
            {reminderSettings.times.map((time) => (
              <View key={time.id} style={styles.row}>
                <ThemedText>{formatTime(time.hour, time.minute)}</ThemedText>
                <Pressable onPress={() => removeReminder(time.id)}>
                  <IconSymbol name="xmark.circle.fill" size={22} color={Colors[colorScheme].icon} />
                </Pressable>
              </View>
            ))}
            <Pressable style={styles.addButton} onPress={() => setShowTimePicker(true)}>
              <IconSymbol name="plus.circle.fill" size={22} color={tintColor} />
              <ThemedText style={{ color: tintColor }}>Add Reminder</ThemedText>
            </Pressable>
          </ThemedView>
          <ThemedText style={styles.version}>
            v{Constants.expoConfig?.version ?? '1.0.0'}
          </ThemedText>
        </ScrollView>
      </SafeAreaView>
      <TimePickerModal
        visible={showTimePicker}
        onConfirm={onTimeConfirmed}
        onCancel={() => setShowTimePicker(false)}
      />
      <ClockPickerModal
        visible={pickerVisible}
        currentMinutes={currentMinutes}
        onConfirm={(minutes) => {
          dispatch({ type: 'SET_DURATION', payload: minutes * 60 });
          setPickerVisible(false);
        }}
        onCancel={() => setPickerVisible(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  title: {
    marginBottom: 32,
  },
  section: {
    gap: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  version: {
    textAlign: 'center',
    opacity: 0.4,
    fontSize: 13,
    marginTop: 16,
    marginBottom: 32,
  },
});
