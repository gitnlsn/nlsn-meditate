import { useState, useEffect } from 'react';
import {
  loadReminderSettings,
  saveReminderSettings,
  buildReminderId,
  type ReminderSettings,
} from '@/utils/reminder-storage';
import {
  requestNotificationPermissions,
  scheduleReminder,
  cancelReminder,
} from '@/utils/notifications';

export function useReminders() {
  const [settings, setSettings] = useState<ReminderSettings>({ times: [] });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadReminderSettings().then((s) => {
      setSettings(s);
      setLoaded(true);
    });
  }, []);

  async function addReminder(hour: number, minute: number) {
    const id = buildReminderId(hour, minute);
    if (settings.times.some((t) => t.id === id)) return;
    const newTime = { id, hour, minute };
    const granted = await requestNotificationPermissions();
    if (granted) {
      await scheduleReminder(newTime);
    }
    const updated = { ...settings, times: [...settings.times, newTime] };
    setSettings(updated);
    await saveReminderSettings(updated);
  }

  async function removeReminder(id: string) {
    await cancelReminder(id);
    const updated = { ...settings, times: settings.times.filter((t) => t.id !== id) };
    setSettings(updated);
    await saveReminderSettings(updated);
  }

  return { settings, loaded, addReminder, removeReminder };
}
