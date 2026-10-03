import {
  DEEP_SIT_SECONDS,
  EARLY_BIRD_HOUR,
  MILESTONE_MINUTES,
  NIGHT_OWL_HOUR,
  milestoneKey,
  type AchievementKey,
} from '@/constants/achievements';
import { GUIDED_MEDITATIONS, type GuidedCategoryId } from '@/constants/guided-meditations';
import { localDateString } from '@/utils/date';
import type { MeditationSession } from '@/utils/session-storage';

/**
 * Everything the progress screen and the leaderboards say about a practice,
 * worked out from the history alone.
 *
 * Pure and recomputed on every change rather than kept as running counters:
 * the history is small, and a number derived from the calendar cannot drift
 * away from it — not across a reinstall, not across a sit recorded twice, not
 * across a rule changing in a later version.
 */
export interface Progress {
  totalSeconds: number;
  totalMinutes: number;
  /** Days in the streak still going, or 0 if it has lapsed. */
  currentStreak: number;
  bestStreak: number;
  /** Minutes in the current Play Games week — see `weekStart`. */
  weekMinutes: number;
  /**
   * Seconds sat on each day of the reader's own week, Sunday first — the
   * calendar's week, not Play Games'. What the week chart draws.
   */
  weekDays: number[];
  /** Index into `weekDays` of today. */
  todayIndex: number;
  sessionCount: number;
  averageSeconds: number;
  longestSeconds: number;
  /** The next milestone not yet reached, or null once all are. */
  nextMilestone: number | null;
  /** 0–1 of the way from the previous milestone to the next. */
  milestoneProgress: number;
  unlocked: Set<AchievementKey>;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * How many days a streak may skip.
 *
 * A strict streak punishes one bad day with the loss of months, and the usual
 * response to that is to stop altogether — the opposite of what it is for. So
 * one missed day is forgiven, as long as no other was forgiven within the
 * previous week. Two missed days in a row still end it.
 */
const GRACE_WINDOW_DAYS = 7;

export function computeProgress(sessions: MeditationSession[], now: number = Date.now()): Progress {
  const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  const totalMinutes = Math.floor(totalSeconds / 60);

  const { current, best } = streaks(new Set(sessions.map((s) => s.date)), now);

  const since = weekStart(now);
  const weekSeconds = sessions
    .filter((s) => endedAt(s) >= since)
    .reduce((sum, s) => sum + s.durationSeconds, 0);

  const nextMilestone = MILESTONE_MINUTES.find((m) => totalMinutes < m) ?? null;
  const previous = [...MILESTONE_MINUTES].reverse().find((m) => totalMinutes >= m) ?? 0;
  const milestoneProgress = nextMilestone === null
    ? 1
    : (totalMinutes - previous) / (nextMilestone - previous);

  const today = new Date(now);
  const todayIndex = today.getDay();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = localDateString(new Date(today.getFullYear(), today.getMonth(), today.getDate() - todayIndex + i, 12));
    return sessions.filter((s) => s.date === day).reduce((sum, s) => sum + s.durationSeconds, 0);
  });

  return {
    totalSeconds,
    totalMinutes,
    weekDays,
    todayIndex,
    sessionCount: sessions.length,
    averageSeconds: sessions.length ? totalSeconds / sessions.length : 0,
    longestSeconds: sessions.reduce((max, s) => Math.max(max, s.durationSeconds), 0),
    currentStreak: current,
    bestStreak: best,
    weekMinutes: Math.floor(weekSeconds / 60),
    nextMilestone,
    milestoneProgress,
    unlocked: unlockedAchievements(sessions, totalMinutes, best),
  };
}

function unlockedAchievements(
  sessions: MeditationSession[],
  totalMinutes: number,
  bestStreak: number,
): Set<AchievementKey> {
  const unlocked = new Set<AchievementKey>();
  if (sessions.length > 0) unlocked.add('first-sit');

  const sitCategories = new Set<GuidedCategoryId>();
  for (const s of sessions) {
    if (s.meditationId) {
      unlocked.add('first-guided');
      const category = CATEGORY_OF.get(s.meditationId);
      if (category) sitCategories.add(category);
    }
    if (s.durationSeconds >= DEEP_SIT_SECONDS) unlocked.add('deep-sit');
    // Only records that carry the moment they ended can say what hour it was;
    // older ones know their day and nothing finer.
    if (s.endedAt !== undefined) {
      const hour = new Date(s.endedAt).getHours();
      if (hour >= NIGHT_OWL_HOUR) unlocked.add('night-owl');
      if (hour < EARLY_BIRD_HOUR) unlocked.add('early-bird');
    }
  }
  if (ALL_CATEGORIES.size > 0 && [...ALL_CATEGORIES].every((c) => sitCategories.has(c))) {
    unlocked.add('explorer');
  }

  if (bestStreak >= 7) unlocked.add('streak-7');
  if (bestStreak >= 30) unlocked.add('streak-30');

  for (const minutes of MILESTONE_MINUTES) {
    if (totalMinutes >= minutes) unlocked.add(milestoneKey(minutes));
  }
  return unlocked;
}

/*
 * Which section each meditation belongs to. Read from every language, since a
 * translation keeps its original's id and the history stores only the id.
 * Explorer asks for every section that actually has a meditation in it, so a
 * section added later raises the bar rather than being unreachable.
 */
const CATEGORY_OF = new Map<string, GuidedCategoryId>(
  Object.values(GUIDED_MEDITATIONS).flat().map((m) => [m.id, m.category]),
);
const ALL_CATEGORIES = new Set(CATEGORY_OF.values());

/**
 * The current and longest streaks over a set of "YYYY-MM-DD" days.
 *
 * Walks the calendar day by day from the first sit to today. A missed day
 * between two sits is bridged if no grace was spent in the week before it; any
 * other gap ends the run. The days counted are the days sat — a forgiven day
 * keeps the streak alive but does not add to it.
 */
export function streaks(days: Set<string>, now: number = Date.now()): { current: number; best: number } {
  if (days.size === 0) return { current: 0, best: 0 };

  const today = startOfLocalDay(now);
  const first = startOfLocalDay(parseDay([...days].sort()[0]));

  let best = 0;
  let run = 0;
  let missedInRow = 0;
  let lastGrace = -Infinity; // index of the day last forgiven

  // Noon on each day, so stepping by 24h never lands on the wrong date across
  // a DST change. Stops before today: today is not over, so not having sat
  // yet can never be what ends a streak.
  let i = 0;
  for (let t = first + DAY_MS / 2; t < today; t += DAY_MS, i++) {
    if (days.has(localDateString(t))) {
      run++;
      missedInRow = 0;
      best = Math.max(best, run);
      continue;
    }
    missedInRow++;
    if (missedInRow === 1 && i - lastGrace >= GRACE_WINDOW_DAYS) {
      lastGrace = i;
    } else {
      // Two days in a row, or a second grace inside the week: the run is over,
      // and the next one starts with its grace unspent.
      run = 0;
      lastGrace = -Infinity;
    }
  }

  if (days.has(localDateString(today + DAY_MS / 2))) {
    run++;
    best = Math.max(best, run);
  }
  return { current: run, best };
}

/**
 * When the current Play Games week began: the most recent Sunday 00:00 in
 * Pacific time, which is when its weekly leaderboards reset. Counting the
 * "this week" score from the same moment keeps the number a player submits
 * and the board it is compared on describing the same week.
 */
export function weekStart(now: number = Date.now()): number {
  const parts = pacificParts(now);
  // Midnight of the Pacific day, located by shifting from `now`.
  const msIntoDay = ((parts.hour * 60 + parts.minute) * 60 + parts.second) * 1000;
  return now - msIntoDay - parts.weekday * DAY_MS;
}

function pacificParts(at: number) {
  const fields = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(new Date(at));
  const get = (type: string) => fields.find((f) => f.type === type)?.value ?? '0';
  return {
    weekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday')),
    hour: Number(get('hour')),
    minute: Number(get('minute')),
    second: Number(get('second')),
  };
}

/** When a sit ended, or for records older than that field, noon of its day. */
function endedAt(s: MeditationSession): number {
  return s.endedAt ?? parseDay(s.date) + DAY_MS / 2;
}

function parseDay(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).getTime();
}

function startOfLocalDay(at: number): number {
  const d = new Date(at);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}
