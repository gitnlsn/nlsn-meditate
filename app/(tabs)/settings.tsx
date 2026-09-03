import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LanguageField } from '@/components/settings/language-field';
import { AmbienceField } from '@/components/audio/ambience-field';
import { TimePickerModal } from '@/components/settings/time-picker-modal';
import { type AudioSettings } from '@/utils/settings-storage';
import { useAudioSettings, useUpdateAudioSettings } from '@/contexts/audio-settings-context';
import { useReminders } from '@/hooks/use-reminders';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useSetLocale, useStrings } from '@/contexts/locale-context';
import { scheduleAllReminders } from '@/utils/notifications';
import type { LocalePreference } from '@/utils/locale-storage';
import { TAB_SCREEN_EDGES, CONTENT_MAX_WIDTH } from '@/constants/layout';

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const tintColor = Colors[colorScheme].tint;
  const [showTimePicker, setShowTimePicker] = useState(false);
  const { settings: audioSettings } = useAudioSettings();
  const updateAudioSettings = useUpdateAudioSettings();
  const { settings: reminderSettings, addReminder, removeReminder } = useReminders();
  const strings = useStrings();
  const setLocale = useSetLocale();

  function toggle(key: 'playGongAtStart' | 'playGongAtEnd') {
    updateAudioSettings({ [key]: !audioSettings[key] } as Partial<AudioSettings>);
  }

  /*
   * Reminders already sitting in the OS queue keep the wording they were
   * scheduled with, so a language change has to write them again. The store is
   * awaited first: scheduleAllReminders reads the language back off disk, and
   * would otherwise reschedule in the language just replaced.
   */
  async function onLanguageChange(preference: LocalePreference) {
    await setLocale(preference);
    if (reminderSettings.times.length > 0) {
      await scheduleAllReminders(reminderSettings.times);
    }
  }

  function onTimeConfirmed(hour: number, minute: number) {
    addReminder(hour, minute);
    setShowTimePicker(false);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={TAB_SCREEN_EDGES}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <ThemedText type="title" style={styles.title}>{strings.settings.heading}</ThemedText>
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>{strings.settings.sound}</ThemedText>
            <AmbienceField />
            <View style={styles.row}>
              <ThemedText>{strings.settings.gongAtStart}</ThemedText>
              <Switch
                value={audioSettings.playGongAtStart}
                onValueChange={() => toggle('playGongAtStart')}
                trackColor={{ true: tintColor }}
              />
            </View>
            <View style={styles.row}>
              <ThemedText>{strings.settings.gongAtEnd}</ThemedText>
              <Switch
                value={audioSettings.playGongAtEnd}
                onValueChange={() => toggle('playGongAtEnd')}
                trackColor={{ true: tintColor }}
              />
            </View>
          </ThemedView>
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>{strings.settings.reminders}</ThemedText>
            {reminderSettings.times.map((time) => (
              <View key={time.id} style={styles.row}>
                <ThemedText>{strings.clock(time.hour, time.minute)}</ThemedText>
                <Pressable
                  onPress={() => removeReminder(time.id)}
                  accessibilityRole="button"
                  accessibilityLabel={strings.settings.removeReminder(
                    strings.clock(time.hour, time.minute),
                  )}>
                  <IconSymbol name="xmark.circle.fill" size={22} color={Colors[colorScheme].icon} />
                </Pressable>
              </View>
            ))}
            <Pressable style={styles.addButton} onPress={() => setShowTimePicker(true)}>
              <IconSymbol name="plus.circle.fill" size={22} color={tintColor} />
              <ThemedText style={{ color: tintColor }}>{strings.settings.addReminder}</ThemedText>
            </Pressable>
          </ThemedView>
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {strings.settings.language}
            </ThemedText>
            <LanguageField onChange={onLanguageChange} hideLabel />
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
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
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
