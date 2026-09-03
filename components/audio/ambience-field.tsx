import { SelectField } from '@/components/ui/select-field';
import { useAmbienceOptions } from '@/hooks/use-ambience-options';
import { useStrings } from '@/contexts/locale-context';

interface AmbienceFieldProps {
  /** Overrides the field's own label where a screen wants different wording. */
  label?: string;
  hideLabel?: boolean;
}

/**
 * Picks the background bed, as a settings row.
 *
 * Only which options and where they are stored — see useAmbienceOptions — worn
 * in the row-and-dialog shape that the language setting wears too. The timer and
 * guided screens pick the same bed from inside the ring instead; see
 * AmbienceDisplay.
 */
export function AmbienceField({ label, hideLabel }: AmbienceFieldProps) {
  const { options, value, select } = useAmbienceOptions();
  const strings = useStrings();

  return (
    <SelectField
      title={label ?? strings.ambience.label}
      hideLabel={hideLabel}
      options={options}
      value={value}
      onSelect={select}
    />
  );
}
