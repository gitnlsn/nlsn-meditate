import * as Notifications from 'expo-notifications';
import type { ReminderTime } from './reminder-storage';

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleReminder(time: ReminderTime): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    identifier: time.id,
    content: {
      title: 'Meditation Reminder',
      body: 'Time to meditate 🧘',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: time.hour,
      minute: time.minute,
    },
  });
}

export async function cancelReminder(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleAllReminders(times: ReminderTime[]): Promise<void> {
  await cancelAllReminders();
  for (const time of times) {
    await scheduleReminder(time);
  }
}
