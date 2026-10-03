import type { Strings } from '@/constants/i18n';

/** Minutes as the progress block shows them: "45 min", then "3 h 20 min". */
export function formatMinutes(totalMinutes: number, strings: Strings): string {
  if (totalMinutes < 60) return strings.duration.minutes(totalMinutes);
  return strings.progress.hoursMinutes(Math.floor(totalMinutes / 60), totalMinutes % 60);
}

/** A length of time from seconds: "45 sec" under a minute, minutes after; nothing reads "0 min". */
export function formatSeconds(seconds: number, strings: Strings): string {
  if (seconds > 0 && seconds < 60) return strings.duration.seconds(Math.round(seconds));
  return formatMinutes(Math.round(seconds / 60), strings);
}
