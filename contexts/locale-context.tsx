import {
  createContext, useCallback, useContext, useEffect, useState, type ReactNode,
} from 'react';

import {
  deviceLocale, stringsFor, type Locale, type Strings,
} from '@/constants/i18n';
import {
  loadLocalePreference, saveLocalePreference, type LocalePreference,
} from '@/utils/locale-storage';

interface LocaleState {
  /** The language actually in use, after resolving a device default. */
  locale: Locale;
  /** What the user chose, or null while following the device. */
  preference: LocalePreference;
  strings: Strings;
}

const FALLBACK = deviceLocale();

const LocaleStateContext = createContext<LocaleState>({
  locale: FALLBACK,
  preference: null,
  strings: stringsFor(FALLBACK),
});
type SetLocale = (preference: LocalePreference) => Promise<void>;

const SetLocaleContext = createContext<SetLocale>(async () => {});

/**
 * The app's language.
 *
 * Starts on the device's language and switches the moment a stored preference
 * loads, rather than holding the first paint behind a disk read — a title in
 * the wrong language for one frame is cheaper than a blank screen.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<LocalePreference>(null);

  useEffect(() => {
    loadLocalePreference().then(setPreference);
  }, []);

  const locale = preference ?? deviceLocale();

  // Returns the write, so a caller that has to act on the *stored* language —
  // rescheduling notifications, which read it back off disk — can wait for it.
  const update = useCallback<SetLocale>((next) => {
    setPreference(next);
    return saveLocalePreference(next);
  }, []);

  return (
    <LocaleStateContext.Provider value={{ locale, preference, strings: stringsFor(locale) }}>
      <SetLocaleContext.Provider value={update}>
        {children}
      </SetLocaleContext.Provider>
    </LocaleStateContext.Provider>
  );
}

export function useLocale(): LocaleState {
  return useContext(LocaleStateContext);
}

/** Just the strings, which is all most components want. */
export function useStrings(): Strings {
  return useContext(LocaleStateContext).strings;
}

export function useSetLocale(): SetLocale {
  return useContext(SetLocaleContext);
}
