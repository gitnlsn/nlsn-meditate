/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#5B8A72';
const tintColorDark = '#8FBC8F';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#F7F8FA',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    progressRing: '#5B8A72',
    progressTrack: '#D6E4DD',
    chipBackground: '#E8EDE9',
    chipSelectedBackground: '#5B8A72',
    chipText: '#11181C',
    chipSelectedText: '#FFFFFF',
    calendarDot: '#5B8A72',
    calendarSelectedDay: '#5B8A72',
  },
  dark: {
    text: '#ECEDEE',
    background: '#1A1F25',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    progressRing: '#8FBC8F',
    progressTrack: '#2E3A32',
    chipBackground: '#2A3530',
    chipSelectedBackground: '#8FBC8F',
    chipText: '#ECEDEE',
    chipSelectedText: '#1A1F25',
    calendarDot: '#8FBC8F',
    calendarSelectedDay: '#8FBC8F',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
