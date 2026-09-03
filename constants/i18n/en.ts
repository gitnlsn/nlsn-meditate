import type { Strings } from './types';

export const en: Strings = {
  tabs: {
    timer: 'Timer',
    guided: 'Guided',
    history: 'History',
    settings: 'Settings',
  },

  timer: {
    heading: 'Meditate',
    hints: [
      'Begin when you are ready.',
      'Take one deep breath.',
      'Nothing needs to happen now.',
      'This time is yours.',
      'Let your shoulders drop.',
      'There is no hurry.',
      'Arrive in your own time.',
      'Feel your weight where you sit.',
      'Just being here is enough.',
      'Unclench your jaw.',
      'A few minutes is enough.',
      'Close your eyes when you like.',
      'The rest can wait.',
      'Start slowly.',
      'You do not need an empty mind.',
      'Notice the air coming and going.',
      'Sit however is comfortable.',
      'One day at a time.',
      'No session is wasted.',
      'Let the silence do the work.',
      'Come back whenever you drift.',
      'No goal, no score.',
      'Notice your feet on the floor.',
      'One breath is already a start.',
      'Slow down before you begin.',
      'Do not judge what shows up.',
      'Stay as long as you can.',
      'Listen to what is already here.',
      'Begin again as often as you need.',
      'Just sit and breathe.',
    ],
  },

  guided: {
    heading: 'Guided',
    intro: 'Practices with a guiding voice. Tap the heart to keep your favourites.',
    favorites: 'Favourites',
    notFound: 'Meditation not found.',
    rowPlaying: (title) => `${title}, now playing`,
    favoriteAdd: (title) => `Add ${title} to favourites`,
    favoriteRemove: (title) => `Remove ${title} from favourites`,
  },

  ambience: {
    label: 'Background sound',
    silence: 'Silence',
    names: {
      'cafe-environment-01': 'Café',
      'nature-01': 'Nature',
      'nature-02': 'Forest',
      'nature-birds-01': 'Birds',
      'nature-camp-fire-01': 'Campfire',
      'nature-ocean-01': 'Ocean',
      'nature-river-01': 'River',
      'street-environment-01': 'Street',
      'tonal-bed-01': 'Tones',
    },
  },

  history: {
    heading: 'History',
    intro: 'Every session you finish is marked here. Tap a day to see it.',
    legendSession: 'Day you meditated',
    legendToday: 'Today',
    legendSelected: 'Selected day',
    weekdayInitials: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    weekdays: [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
    ],
    months: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ],
    monthYear: (month, year) => `${month} ${year}`,
    fullDate: (weekday, day, month) => `${weekday}, ${month} ${day}`,
    sessionCount: (count) => (count === 1 ? '1 session' : `${count} sessions`),
  },

  settings: {
    heading: 'Settings',
    sessionLength: 'Session length',
    sound: 'Sound',
    gongAtStart: 'Play gong at start',
    gongAtEnd: 'Play gong at end',
    reminders: 'Reminders',
    addReminder: 'Add reminder',
    removeReminder: (time) => `Remove the ${time} reminder`,
    language: 'Language',
    languageSystem: 'System',
  },

  picker: {
    selectDuration: 'Select duration',
    selectTime: 'Select time',
    cancel: 'Cancel',
    close: 'Close',
    ok: 'OK',
  },

  duration: {
    minutes: (minutes) => `${minutes} min`,
    seconds: (seconds) => `${seconds} sec`,
    minutesSeconds: (minutes, seconds) => `${minutes} min ${seconds} sec`,
  },

  clock: (hour, minute) => {
    const meridiem = hour < 12 ? 'AM' : 'PM';
    const twelve = hour % 12 === 0 ? 12 : hour % 12;
    return `${twelve}:${String(minute).padStart(2, '0')} ${meridiem}`;
  },

  notification: {
    title: 'Meditation reminder',
    body: 'Time to meditate 🧘',
  },
};
