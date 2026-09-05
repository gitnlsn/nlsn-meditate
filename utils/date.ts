/**
 * Calendar days, in the reader's own timezone.
 *
 * A session is filed under a day, and both the writer and the calendar that
 * reads it have to agree on which day that is. `toISOString()` does not: it
 * answers in UTC, so for anyone west of Greenwich the last hours of every
 * evening already belong to tomorrow. In UTC-3 that is every sit after 21:00.
 * Built from the local calendar fields instead, which is what the reader sees.
 */

/** The stored shape: "2026-03-09". `month` is 0-indexed, as Date reports it. */
export function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** The local day a moment falls on. Defaults to now. */
export function localDateString(at: number | Date = Date.now()): string {
  const d = at instanceof Date ? at : new Date(at);
  return dateKey(d.getFullYear(), d.getMonth(), d.getDate());
}
