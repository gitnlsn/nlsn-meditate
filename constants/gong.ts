import type { AudioAsset } from './guided-meditations';

/**
 * The start/end bell.
 *
 * Named here rather than inside the hook that strikes it, because the end gong
 * is no longer only played by the app: on Android it is the last item of the
 * timeline the playback service runs, so the service has to be told where it
 * lives too.
 */
export const GONG: AudioAsset = require('@/assets/audios/meditation-gong-jam-fx-10-10-00-11.mp3');
