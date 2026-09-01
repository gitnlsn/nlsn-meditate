import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { MeditationProvider } from '@/contexts/meditation-context';
import { HistoryProvider } from '@/contexts/history-context';
import { loadReminderSettings } from '@/utils/reminder-storage';
import { scheduleAllReminders } from '@/utils/notifications';
import { useAudioSession } from '@/hooks/use-audio-session';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useAudioSession();

  useEffect(() => {
    loadReminderSettings().then((settings) => {
      if (settings.times.length > 0) {
        scheduleAllReminders(settings.times);
      }
    });
  }, []);

  return (
    <MeditationProvider>
      <HistoryProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="guided/[id]" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </HistoryProvider>
    </MeditationProvider>
  );
}
