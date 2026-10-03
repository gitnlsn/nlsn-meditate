import type { AchievementKey } from '@/constants/achievements';

/**
 * The ids Play Console gave each achievement and leaderboard.
 *
 * Fill these in from Play Console → Play Games Services → Achievements /
 * Leaderboards (each row's "ID", like "CgkI…EAIQAQ"). An empty id is skipped,
 * so the app runs before setup is finished and an achievement can be added on
 * one side ahead of the other. See docs/play-games-setup.md.
 */
export const PLAY_GAMES_ACHIEVEMENTS: Record<AchievementKey, string> = {
  'first-sit': '',
  'first-guided': '',
  'deep-sit': '',
  explorer: '',
  'early-bird': '',
  'night-owl': '',
  'streak-7': '',
  'streak-30': '',
  'minutes-10': '',
  'minutes-60': '',
  'minutes-300': '',
  'minutes-600': '',
  'minutes-1440': '',
  'minutes-3000': '',
  'minutes-6000': '',
};

export const PLAY_GAMES_LEADERBOARDS = {
  /** Lifetime minutes meditated. */
  totalMinutes: '',
  /** Minutes since the start of the Play Games week; compared on its Weekly tab. */
  weekMinutes: '',
  /** Longest streak ever kept, in days. */
  bestStreak: '',
};
