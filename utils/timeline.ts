import { Asset } from 'expo-asset';

import type { TimelineItem } from '@/modules/meditation-session';
import type { AudioAsset, GuidedMeditation } from '@/constants/guided-meditations';

/**
 * Where a bundled asset actually lives, as a URI the native player can open.
 *
 * `require()` hands back an opaque number; the service needs a path. Resolved
 * once when a session starts, in the foreground, so nothing has to be looked up
 * later — by the time the meditation is running, the app may not be awake to
 * look anything up.
 */
export async function assetUri(source: AudioAsset): Promise<string> {
  const asset = Asset.fromModule(source);
  if (!asset.localUri) await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  if (__DEV__) console.log('[meditation] asset', asset.name, '->', uri);
  return uri;
}

/**
 * A guided meditation, flattened into the shape the service plays.
 *
 * The silences between lines become items of the timeline rather than waits to
 * be timed. That is the whole change: a wait needs someone awake to notice it
 * elapse, and a stretch of timeline does not.
 */
export async function guidedTimeline(
  meditation: GuidedMeditation,
  gong?: AudioAsset,
): Promise<TimelineItem[]> {
  const items: TimelineItem[] = [];

  const hold = (seconds: number) => {
    if (seconds > 0) items.push({ kind: 'silence', ms: Math.round(seconds * 1000) });
  };

  hold(meditation.leadInSeconds);

  for (const [index, segment] of meditation.segments.entries()) {
    if (segment.source != null) {
      items.push({
        kind: 'clip',
        uri: await assetUri(segment.source),
        ms: Math.round(segment.audioSeconds * 1000),
        cueIndex: index,
      });
    }
    hold(segment.waitSeconds);
  }

  hold(meditation.leadOutSeconds);

  if (gong) {
    items.push({ kind: 'gong', uri: await assetUri(gong), ms: GONG_MS });
  }

  return items;
}

/**
 * A plain silent sit: nothing but the held time, and the bell that ends it.
 *
 * It goes through the same service as a guided meditation for the same reason —
 * so that the end of the sit is something the OS reaches, rather than something
 * the app has to still be awake to notice.
 */
export async function timerTimeline(
  durationSeconds: number,
  gong?: AudioAsset,
): Promise<TimelineItem[]> {
  const items: TimelineItem[] = [
    { kind: 'silence', ms: Math.round(durationSeconds * 1000) },
  ];
  if (gong) items.push({ kind: 'gong', uri: await assetUri(gong), ms: GONG_MS });
  return items;
}

/**
 * Nominal length of the closing bell, used only to lay out the timeline. The
 * player reads the file's real duration; this just has to be close enough that
 * the progress ring does not lurch at the very end.
 */
const GONG_MS = 4000;
