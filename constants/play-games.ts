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
  'first-sit': 'CgkI6Nbmp6kDEAIQAg',
  'first-guided': 'CgkI6Nbmp6kDEAIQAw',
  'deep-sit': 'CgkI6Nbmp6kDEAIQBA',
  explorer: 'CgkI6Nbmp6kDEAIQBQ',
  'early-bird': 'CgkI6Nbmp6kDEAIQBg',
  'night-owl': 'CgkI6Nbmp6kDEAIQBw',
  'streak-7': 'CgkI6Nbmp6kDEAIQCA',
  'streak-30': 'CgkI6Nbmp6kDEAIQCQ',
  'minutes-10': 'CgkI6Nbmp6kDEAIQCg',
  'minutes-60': 'CgkI6Nbmp6kDEAIQCw',
  'minutes-300': 'CgkI6Nbmp6kDEAIQDA',
  'minutes-600': 'CgkI6Nbmp6kDEAIQDQ',
  'minutes-1440': 'CgkI6Nbmp6kDEAIQDg',
  'minutes-3000': 'CgkI6Nbmp6kDEAIQDw',
  'minutes-6000': 'CgkI6Nbmp6kDEAIQEA',
};

export const PLAY_GAMES_LEADERBOARDS = {
  /** Lifetime minutes meditated. */
  totalMinutes: 'CgkI6Nbmp6kDEAIQEQ',
  /** Minutes since the start of the Play Games week; compared on its Weekly tab. */
  weekMinutes: 'CgkI6Nbmp6kDEAIQEg',
  /** Longest streak ever kept, in days. */
  bestStreak: 'CgkI6Nbmp6kDEAIQEw',
};
