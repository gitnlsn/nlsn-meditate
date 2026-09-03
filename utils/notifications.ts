import * as Notifications from 'expo-notifications';

import { deviceLocale, stringsFor } from '@/constants/i18n';
import type { Strings } from '@/constants/i18n';
import { loadLocalePreference } from './locale-storage';
import type { ReminderTime } from './reminder-storage';

type NotificationCopy = Strings['notification'];

/**
 * Reminder copy in the user's language.
 *
 * Read from storage rather than a React context: reminders are scheduled at
 * launch and from the settings screen, and the OS delivers them when the app is
 * not running at all, so there is no context to read from at the moment that
 * matters. A language change reschedules them with the new wording.
 */
async function notificationCopy(): Promise<NotificationCopy> {
  const preference = await loadLocalePreference();
  return stringsFor(preference ?? deviceLocale()).notification;
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleReminder(
  time: ReminderTime,
  /** Resolved once by the caller when scheduling a batch. */
  copy?: NotificationCopy,
): Promise<void> {
  const content = copy ?? (await notificationCopy());
  await Notifications.scheduleNotificationAsync({
    identifier: time.id,
    content: {
      title: content.title,
      body: content.body,
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
  const copy = await notificationCopy();
  for (const time of times) {
    await scheduleReminder(time, copy);
  }
}
