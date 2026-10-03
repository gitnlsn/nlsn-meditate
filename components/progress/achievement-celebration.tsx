import { useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';

import { BadgeDialog } from '@/components/progress/badge-dialog';
import { ACHIEVEMENTS, type AchievementKey } from '@/constants/achievements';
import { useHistory } from '@/contexts/history-context';
import { useStrings } from '@/contexts/locale-context';
import { loadSeenAchievements, saveSeenAchievements } from '@/utils/achievement-storage';
import { computeProgress } from '@/utils/progress';

/**
 * Announces each badge once, the first time the app sees it earned.
 *
 * Mounted at the root beside SessionRuntime rather than on any screen: a sit
 * the playback service finished while the app slept only reaches the history
 * when the app comes back, and the announcement should meet the person
 * wherever they land. Several earned at once queue up, one dialog each, in the
 * grid's order.
 */
export function AchievementCelebration() {
  const { sessions, isLoading } = useHistory();
  const strings = useStrings();
  const [queue, setQueue] = useState<AchievementKey[]>([]);
  const seen = useRef<Set<AchievementKey> | null>(null);

  useEffect(() => {
    if (isLoading) return;
    let cancelled = false;
    (async () => {
      const unlocked = computeProgress(sessions).unlocked;
      if (seen.current === null) {
        const stored = await loadSeenAchievements();
        if (cancelled) return;
        // First run with badges: take everything already earned as known.
        seen.current = stored ?? new Set(unlocked);
        if (!stored) await saveSeenAchievements(seen.current);
      }
      const known = seen.current;
      const fresh = ACHIEVEMENTS.map((a) => a.key).filter((key) => unlocked.has(key) && !known.has(key));
      if (fresh.length === 0 || cancelled) return;
      for (const key of fresh) known.add(key);
      await saveSeenAchievements(known);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setQueue((q) => [...q, ...fresh]);
    })();
    return () => {
      cancelled = true;
    };
  }, [sessions, isLoading]);

  const current = ACHIEVEMENTS.find((a) => a.key === queue[0]) ?? null;

  return (
    <BadgeDialog
      achievement={current}
      earned
      heading={strings.progress.unlockedTitle}
      closeLabel={strings.progress.unlockedClose}
      onClose={() => setQueue((q) => q.slice(1))}
    />
  );
}
