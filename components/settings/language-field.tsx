import { SelectField, type SelectOption } from '@/components/ui/select-field';
import { LOCALES, LOCALE_NAMES } from '@/constants/i18n';
import { useLocale, useStrings } from '@/contexts/locale-context';
import type { LocalePreference } from '@/utils/locale-storage';

interface LanguageFieldProps {
  onChange: (preference: LocalePreference) => void;
  hideLabel?: boolean;
}

/**
 * Picks the app's language.
 *
 * Each language is written in its own language — someone looking for Portuguese
 * is looking for the word "Português", not for "Portuguese". The option that
 * defers to the device is the one entry here that has to be translated, since it
 * names a behaviour rather than a language, and it leads the list so it is also
 * the fallback.
 */
export function LanguageField({ onChange, hideLabel }: LanguageFieldProps) {
  const { preference } = useLocale();
  const strings = useStrings();

  const options: SelectOption<LocalePreference>[] = [
    { value: null, title: strings.settings.languageSystem },
    ...LOCALES.map((locale) => ({ value: locale, title: LOCALE_NAMES[locale] })),
  ];

  return (
    <SelectField
      title={strings.settings.language}
      hideLabel={hideLabel}
      options={options}
      value={preference}
      onSelect={onChange}
    />
  );
}
