/**
 * The shape every locale has to fill.
 *
 * Declared explicitly rather than inferred from one catalogue, so adding a
 * string means the compiler names every language still missing it. Anything
 * with a variable in it is a function: joining fragments at the call site bakes
 * one language's word order into the code, and Portuguese does not share
 * English's.
 *
 * What is deliberately *not* here: the guided meditations themselves — their
 * titles, descriptions and spoken lines — and the categories that group them.
 * Those are recorded in Portuguese and stay that way until the English voice
 * segments exist; translating the labels while the audio speaks Portuguese
 * would be a worse lie than leaving them.
 */
export type Locale = 'pt' | 'en';

/** The languages on offer, each written in its own language. */
export const LOCALE_NAMES: Record<Locale, string> = {
  pt: 'Português',
  en: 'English',
};

export const LOCALES = Object.keys(LOCALE_NAMES) as Locale[];

export interface Strings {
  tabs: {
    timer: string;
    guided: string;
    history: string;
    settings: string;
  };

  timer: {
    heading: string;
    /** Labels the duration row in the timer's footer. */
    sessionLength: string;
    /**
     * Shown only while idle, and gone for the rest of the session. One of
     * these is picked per fortnight — see rotatingIndex. Non-empty by type, so
     * there is always something to show; keep each to a single line, since the
     * slot reserves one line's height and a wrap nudges the ring down.
     *
     * The two catalogues are parallel: index n means the same thing in both.
     */
    hints: readonly [string, ...string[]];
  };

  guided: {
    heading: string;
    intro: string;
    favorites: string;
    notFound: string;
    /** Accessibility label for the row of the meditation currently playing. */
    rowPlaying: (title: string) => string;
    favoriteAdd: (title: string) => string;
    favoriteRemove: (title: string) => string;
  };

  ambience: {
    label: string;
    silence: string;
    /**
     * Bed names by id. The generated manifest carries Portuguese titles, so a
     * missing entry falls back to that rather than showing an id.
     */
    names: Record<string, string>;
  };

  history: {
    heading: string;
    /** Sits between the title and the calendar, orienting the screen. */
    intro: string;
    legendSession: string;
    legendToday: string;
    legendSelected: string;
    /** Single letters for the column heads, Sunday first. */
    weekdayInitials: readonly [string, string, string, string, string, string, string];
    /** Full names, Sunday first, as they appear mid-sentence in a date. */
    weekdays: readonly string[];
    months: readonly string[];
    monthYear: (month: string, year: number) => string;
    fullDate: (weekday: string, day: number, month: string) => string;
    sessionCount: (count: number) => string;
  };

  settings: {
    heading: string;
    sound: string;
    gongAtStart: string;
    gongAtEnd: string;
    reminders: string;
    addReminder: string;
    removeReminder: (time: string) => string;
    language: string;
    /** Follow the device's own language rather than a fixed choice. */
    languageSystem: string;
  };

  picker: {
    selectDuration: string;
    selectTime: string;
    cancel: string;
    close: string;
    ok: string;
  };

  duration: {
    minutes: (minutes: number) => string;
    seconds: (seconds: number) => string;
    minutesSeconds: (minutes: number, seconds: number) => string;
  };

  /** 24-hour in Portuguese, 12-hour with a meridiem in English. */
  clock: (hour: number, minute: number) => string;

  notification: {
    title: string;
    body: string;
  };
}
