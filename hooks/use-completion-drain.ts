import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';

import { MeditationSessionModule } from '@/modules/meditation-session';
import { useAddSession } from '@/contexts/history-context';

/**
 * Collects the sits the playback service saw through to their end.
 *
 * The service writes a session down the moment its timeline finishes, because
 * that is precisely the moment the app is least likely to be awake to notice —
 * the screen is off, and Android may since have reclaimed the app altogether.
 * Those records wait until the app runs again, and this brings them in.
 *
 * Drained on launch, whenever the app comes back to the foreground, and as soon
 * as a session ends while somebody is watching, so history is never stale in
 * front of the user. Each record carries a session id, so draining the same one
 * twice records it once.
 *
 * Only sessions that actually finished are ever in here. A sit cut short leaves
 * nothing behind, which is what should appear in the calendar for it: nothing.
 */
export function useCompletionDrain() {
  const addSession = useAddSession();

  const drain = useCallback(async () => {
    const module = MeditationSessionModule;
    if (!module) return;

    const completions = await module.drainCompletions().catch((error) => {
      console.warn('[meditation] could not drain finished sessions:', error);
      return [];
    });
    if (completions.length) {
      console.log('[meditation] recording', completions.length, 'finished session(s)');
    }
    for (const completed of completions) {
      await addSession({
        durationSeconds: completed.durationSeconds,
        endedAt: completed.endedAt,
        sessionId: completed.sessionId,
        ...(completed.meditationId && {
          meta: { meditationId: completed.meditationId, title: completed.title ?? '' },
        }),
      });
    }
  }, [addSession]);

  useEffect(() => {
    drain();

    const module = MeditationSessionModule;
    const subscriptions = [
      AppState.addEventListener('change', (next) => {
        if (next === 'active') drain();
      }),
      ...(module ? [module.addListener('onCompleted', () => { drain(); })] : []),
    ];

    return () => {
      for (const subscription of subscriptions) subscription.remove();
    };
  }, [drain]);
}
