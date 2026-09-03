import { useWindowDimensions } from 'react-native';

export const RING_MAX_SIZE = 280;
const RING_MIN_SIZE = 160;
/**
 * How much of the shorter screen edge the ring may take before it crowds out
 * the controls below it. Landscape on a phone is the case that bites: the
 * shorter edge is then the height, and 280 leaves nothing for anything else.
 */
const SHORTER_EDGE_SHARE = 0.55;

/**
 * The ring's size, and how far everything inside it has shrunk to fit.
 *
 * A hook rather than a prop threaded down from CircularProgress: what sits in
 * the middle of the ring is passed in as children, so the ring cannot hand its
 * size to things it does not construct. Both ends read the same window and so
 * reach the same answer.
 */
export function useRingMetrics() {
  const { width, height } = useWindowDimensions();
  const size = Math.round(
    Math.max(RING_MIN_SIZE, Math.min(RING_MAX_SIZE, Math.min(width, height) * SHORTER_EDGE_SHARE)),
  );
  return { size, scale: size / RING_MAX_SIZE };
}
