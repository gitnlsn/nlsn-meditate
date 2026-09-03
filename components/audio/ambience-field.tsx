import { SelectField, type SelectOption } from '@/components/ui/select-field';
import { AMBIENCES } from '@/constants/ambiences';
import { useAudioSettings, useUpdateAudioSettings } from '@/contexts/audio-settings-context';
import { DEFAULT_AMBIENCE_ID } from '@/utils/settings-storage';
import { useStrings } from '@/contexts/locale-context';

interface AmbienceFieldProps {
  /** Overrides the field's own label where a screen wants different wording. */
  label?: string;
  hideLabel?: boolean;
}

/**
 * Picks the background bed.
 *
 * Only the options and where they are stored; the row-and-dialog shape it wears
 * lives in SelectField, which the language setting wears too.
 */
export function AmbienceField({ label, hideLabel }: AmbienceFieldProps) {
  const { settings } = useAudioSettings();
  const update = useUpdateAudioSettings();
  const strings = useStrings();

  /*
   * The bed manifest is generated with Portuguese titles, so a name the
   * catalogue has not been taught falls back to what the manifest carries
   * rather than surfacing an id.
   */
  const nameOf = (id: string, fallback: string) => strings.ambience.names[id] ?? fallback;

  /*
   * Silence sits at the end. It is the one option that is the absence of the
   * others, and leading with it framed the whole list as opting out of something
   * — the beds are the point, so they come first.
   */
  const options: SelectOption<string | null>[] = [
    ...AMBIENCES.map((ambience) => ({
      value: ambience.id,
      title: nameOf(ambience.id, ambience.title),
    })),
    { value: null, title: strings.ambience.silence },
  ];

  /*
   * A bed dropped from the manifest since it was chosen would leave the row with
   * nothing to show, so a stored id we no longer recognise reads as the default.
   * Silence is a real choice and passes through untouched.
   */
  const stored = settings.ambienceId;
  const value = stored === null || AMBIENCES.some((a) => a.id === stored)
    ? stored
    : DEFAULT_AMBIENCE_ID;

  return (
    <SelectField
      title={label ?? strings.ambience.label}
      hideLabel={hideLabel}
      options={options}
      value={value}
      onSelect={(ambienceId) => update({ ambienceId })}
    />
  );
}
