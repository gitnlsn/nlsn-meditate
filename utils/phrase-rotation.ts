/** How long one phrase stays put before the next one takes over. */
export const ROTATION_DAYS = 14;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The rotation's day zero. Any fixed date works; this one is a Monday, so a
 * phrase changes over at the start of a week rather than mid-week.
 */
const EPOCH = new Date(2026, 0, 5);

/**
 * Which phrase this fortnight gets.
 *
 * Derived from the date rather than stored or drawn at random. Nothing to
 * persist, nothing to migrate, and the same phrase shows on every device in the
 * same fortnight — a phrase that changed on relaunch would read as a glitch
 * rather than as a rhythm.
 */
export function rotatingIndex(count: number, now: Date = new Date()): number {
  if (count <= 0) return 0;

  /*
   * Counted between local midnights, so the changeover lands at midnight where
   * the user is. Rounding absorbs the hour a daylight-saving shift adds or
   * removes, which plain division would leave as an off-by-one for half a year.
   */
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((today.getTime() - EPOCH.getTime()) / DAY_MS);

  const period = Math.floor(days / ROTATION_DAYS);
  // Dates before the epoch give a negative period; wrap it back into range.
  return ((period % count) + count) % count;
}
