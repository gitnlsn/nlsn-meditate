import { useMemo } from 'react';

import type { SelectOption } from '@/components/ui/select-dialog';
import { AMBIENCES } from '@/constants/ambiences';
import { useAudioSettings, useUpdateAudioSettings } from '@/contexts/audio-settings-context';
import { DEFAULT_AMBIENCE_ID } from '@/utils/settings-storage';
import { useStrings } from '@/contexts/locale-context';

/**
 * The beds on offer, which one is playing, and how to change it.
 *
 * Shared because the bed is picked from two places now — a row in settings, and
 * the ring on the timer and guided screens — and the rules below are the kind
 * that go quietly wrong when a second copy of them drifts.
 */
export function useAmbienceOptions() {
  const { settings } = useAudioSettings();
  const update = useUpdateAudioSettings();
  const strings = useStrings();

  const options = useMemo<SelectOption<string | null>[]>(() => {
    /*
     * The bed manifest is generated with Portuguese titles, so a name the
     * catalogue has not been taught falls back to what the manifest carries
     * rather than surfacing an id.
     */
    const nameOf = (id: string, fallback: string) => strings.ambience.names[id] ?? fallback;

    /*
     * Silence sits at the end. It is the one option that is the absence of the
     * others, and leading with it framed the whole list as opting out of
     * something — the beds are the point, so they come first.
     */
    return [
      ...AMBIENCES.map((ambience) => ({
        value: ambience.id,
        title: nameOf(ambience.id, ambience.title),
      })),
      { value: null, title: strings.ambience.silence },
    ];
  }, [strings]);

  /*
   * A bed dropped from the manifest since it was chosen would leave the row with
   * nothing to show, so a stored id we no longer recognise reads as the default.
   * Silence is a real choice and passes through untouched.
   */
  const stored = settings.ambienceId;
  const value =
    stored === null || AMBIENCES.some((a) => a.id === stored) ? stored : DEFAULT_AMBIENCE_ID;

  const selected = options.find((option) => option.value === value);

  return {
    options,
    value,
    /** The playing bed's name, ready to show. */
    title: selected?.title ?? '',
    select: (ambienceId: string | null) => update({ ambienceId }),
  };
}
