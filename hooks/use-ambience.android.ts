import type { Ambience } from '@/constants/ambiences';

interface Options {
  ambience: Ambience | undefined;
  volume: number;
  active: boolean;
}

/**
 * Nothing, on purpose.
 *
 * The bed is not played from here on Android. It is handed to the playback
 * service along with the rest of the session, so that one thing owns everything
 * the meditation sounds — and so that it keeps looping when the screen goes off
 * and this side of the app stops running. Kept as a no-op with the same shape so
 * the screens and the session runtime do not have to know which platform they
 * are on.
 */
export function useAmbience(_options: Options) {}
