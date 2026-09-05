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
    durationSeconds: 154,
    fadeInSeconds: 0,
    fadeOutSeconds: 0,
  },
  {
    id: "nature-01",
    title: "Natureza",
    source: require('@/assets/audios/ambiences/nature-01.m4a'),
    durationSeconds: 150,
    fadeInSeconds: 0,
    fadeOutSeconds: 0,
  },
  {
    id: "nature-02",
    title: "Floresta",
    source: require('@/assets/audios/ambiences/nature-02.m4a'),
    durationSeconds: 118.84,
    fadeInSeconds: 0,
    fadeOutSeconds: 0,
  },
  {
    id: "nature-birds-01",
    title: "Pássaros",
    source: require('@/assets/audios/ambiences/nature-birds-01.m4a'),
    durationSeconds: 20.106,
    fadeInSeconds: 0,
    fadeOutSeconds: 0,
  },
  {
    id: "nature-camp-fire-01",
    title: "Fogueira",
    source: require('@/assets/audios/ambiences/nature-camp-fire-01.m4a'),
    durationSeconds: 114.276,
    fadeInSeconds: 0,
    fadeOutSeconds: 0,
  },
  {
    id: "nature-ocean-01",
    title: "Oceano",
    source: require('@/assets/audios/ambiences/nature-ocean-01.m4a'),
    durationSeconds: 157,
    fadeInSeconds: 0,
    fadeOutSeconds: 0,
  },
  {
    id: "nature-river-01",
    title: "Rio",
    source: require('@/assets/audios/ambiences/nature-river-01.m4a'),
    durationSeconds: 41.188,
    fadeInSeconds: 0,
    fadeOutSeconds: 0,
  },
  {
    id: "street-environment-01",
    title: "Rua",
    source: require('@/assets/audios/ambiences/street-environment-01.m4a'),
    durationSeconds: 37.697,
    fadeInSeconds: 0,
    fadeOutSeconds: 0,
  },
  {
    id: "tonal-bed-01",
    title: "Tons",
    source: require('@/assets/audios/ambiences/tonal-bed-01.m4a'),
    durationSeconds: 42.536,
    fadeInSeconds: 0,
    fadeOutSeconds: 0,
  },
];

export function findAmbience(id: string | null): Ambience | undefined {
  return id ? AMBIENCES.find((a) => a.id === id) : undefined;
}
