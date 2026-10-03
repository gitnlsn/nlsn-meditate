import type { Strings } from '@/constants/i18n';

/** Minutes as the progress block shows them: "45 min", then "3 h 20 min". */
export function formatMinutes(totalMinutes: number, strings: Strings): string {
  if (totalMinutes < 60) return strings.duration.minutes(totalMinutes);
  return strings.progress.hoursMinutes(Math.floor(totalMinutes / 60), totalMinutes % 60);
}
