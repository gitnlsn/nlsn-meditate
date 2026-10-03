/**
 * The badges a practice can earn.
 *
 * Every one is a fact about the history already on the device — nothing is
 * counted separately to earn it — so a badge can never disagree with the
 * calendar, and someone who meditated for months before badges existed holds
 * all of theirs from the first launch. The rules live in utils/progress.ts; the
 * words for each, in both languages, under `progress.badges` in the catalogues.
 *
 * The keys are stored (as the record of which badges were already celebrated)
 * and mapped to Play Games ids in play-games.ts, so treat them as permanent:
 * rename the title, never the key.
 */

/** Total minutes at which a milestone badge is earned, smallest first. */
export const MILESTONE_MINUTES = [10, 60, 300, 600, 1440, 3000, 6000] as const;

export type MilestoneKey = `minutes-${(typeof MILESTONE_MINUTES)[number]}`;

export type AchievementKey =
  | 'first-sit'
  | 'first-guided'
  | 'explorer'
  | 'night-owl'
  | 'early-bird'
  | 'deep-sit'
  | 'streak-7'
  | 'streak-30'
  | MilestoneKey;

export type AchievementIcon =
  | 'leaf.fill'
  | 'headphones'
  | 'map.fill'
  | 'moon.fill'
  | 'sunrise.fill'
  | 'hourglass'
  | 'flame.fill'
  | 'star.fill';

export interface Achievement {
  key: AchievementKey;
  icon: AchievementIcon;
}

export const milestoneKey = (minutes: number) => `minutes-${minutes}` as MilestoneKey;

/** In the order the grid shows them: the first steps, then the long road. */
export const ACHIEVEMENTS: readonly Achievement[] = [
  { key: 'first-sit', icon: 'leaf.fill' },
  { key: 'first-guided', icon: 'headphones' },
  { key: 'deep-sit', icon: 'hourglass' },
  { key: 'explorer', icon: 'map.fill' },
  { key: 'early-bird', icon: 'sunrise.fill' },
  { key: 'night-owl', icon: 'moon.fill' },
  { key: 'streak-7', icon: 'flame.fill' },
  { key: 'streak-30', icon: 'flame.fill' },
  ...MILESTONE_MINUTES.map((minutes) => ({ key: milestoneKey(minutes), icon: 'star.fill' as const })),
];

/** A single sit at least this long earns `deep-sit`. */
export const DEEP_SIT_SECONDS = 30 * 60;
/** A sit ending at or after this hour earns `night-owl`... */
export const NIGHT_OWL_HOUR = 22;
/** ...and one ending before this hour, `early-bird`. */
export const EARLY_BIRD_HOUR = 7;
