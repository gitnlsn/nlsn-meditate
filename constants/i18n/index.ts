import { pt } from './pt';
import { en } from './en';
import { type Locale, type Strings } from './types';

export { LOCALES, LOCALE_NAMES, type Locale, type Strings } from './types';

const CATALOGUES: Record<Locale, Strings> = { pt, en };

export function stringsFor(locale: Locale): Strings {
  return CATALOGUES[locale];
}

/**
 * What the device asks for, narrowed to a language we have.
 *
 * Read through Intl rather than a native localization module: the app already
 * relies on Intl for its date formatting, and adding a native dependency for
 * one string would force a rebuild on every developer. If Intl is missing
 * entirely we fall back to Portuguese — the guided meditations speak it, so it
 * is the safer wrong guess.
 */
export function deviceLocale(): Locale {
  try {
    const tag = Intl.DateTimeFormat().resolvedOptions().locale ?? '';
    return tag.toLowerCase().startsWith('pt') ? 'pt' : 'en';
  } catch {
    return 'pt';
  }
}
