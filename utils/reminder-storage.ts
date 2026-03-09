import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@reminder_settings';

export interface ReminderTime {
  id: string;
  hour: number;
  minute: number;
}

export interface ReminderSettings {
  times: ReminderTime[];
}

const DEFAULT_SETTINGS: ReminderSettings = {
  times: [],
};

export function buildReminderId(hour: number, minute: number): string {
  const hh = String(hour).padStart(2, '0');
  const mm = String(minute).padStart(2, '0');
  return `reminder-${hh}-${mm}`;
}

export async function loadReminderSettings(): Promise<ReminderSettings> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  if (!json) return DEFAULT_SETTINGS;
  return JSON.parse(json) as ReminderSettings;
}

export async function saveReminderSettings(settings: ReminderSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
