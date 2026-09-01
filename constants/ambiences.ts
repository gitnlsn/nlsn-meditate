/**
 * GENERATED FILE - do not edit by hand.
 * Regenerate with: npm run meditations -- manifest
 */

import type { AudioAsset } from './guided-meditations';

export interface Ambience {
  id: string;
  title: string;
  source: AudioAsset;
  durationSeconds: number;
  fadeInSeconds: number;
  /**
   * How long the tail takes to fade. The player starts the next copy this many
   * seconds before the end so the two fades cross into a continuous bed.
   */
  fadeOutSeconds: number;
}

export const AMBIENCES: Ambience[] = [
  {
    id: "cafe-environment-01",
    title: "Café",
    source: require('@/assets/audios/ambiences/cafe-environment-01.m4a'),
    durationSeconds: 150,
    fadeInSeconds: 2.4,
    fadeOutSeconds: 4,
  },
  {
    id: "nature-01",
    title: "Natureza",
    source: require('@/assets/audios/ambiences/nature-01.m4a'),
    durationSeconds: 150,
    fadeInSeconds: 3.1,
    fadeOutSeconds: 4,
  },
  {
    id: "nature-02",
    title: "Floresta",
    source: require('@/assets/audios/ambiences/nature-02.m4a'),
    durationSeconds: 125.54,
    fadeInSeconds: 2.3,
    fadeOutSeconds: 4,
  },
  {
    id: "nature-birds-01",
    title: "Pássaros",
    source: require('@/assets/audios/ambiences/nature-birds-01.m4a'),
    durationSeconds: 29.106,
    fadeInSeconds: 2.3,
    fadeOutSeconds: 5.2,
  },
  {
    id: "nature-camp-fire-01",
    title: "Fogueira",
    source: require('@/assets/audios/ambiences/nature-camp-fire-01.m4a'),
    durationSeconds: 126.776,
    fadeInSeconds: 1.6,
    fadeOutSeconds: 4,
  },
  {
    id: "nature-ocean-01",
    title: "Oceano",
    source: require('@/assets/audios/ambiences/nature-ocean-01.m4a'),
    durationSeconds: 150,
    fadeInSeconds: 3.7,
    fadeOutSeconds: 4,
  },
  {
    id: "nature-river-01",
    title: "Rio",
    source: require('@/assets/audios/ambiences/nature-river-01.m4a'),
    durationSeconds: 54.088,
    fadeInSeconds: 2.8,
    fadeOutSeconds: 6.1,
  },
  {
    id: "street-environment-01",
    title: "Rua",
    source: require('@/assets/audios/ambiences/street-environment-01.m4a'),
    durationSeconds: 43.397,
    fadeInSeconds: 0.7,
    fadeOutSeconds: 4,
  },
  {
    id: "tonal-bed-01",
    title: "Tons",
    source: require('@/assets/audios/ambiences/tonal-bed-01.m4a'),
    durationSeconds: 54.236,
    fadeInSeconds: 3.1,
    fadeOutSeconds: 4,
  },
];

export function findAmbience(id: string | null): Ambience | undefined {
  return id ? AMBIENCES.find((a) => a.id === id) : undefined;
}
