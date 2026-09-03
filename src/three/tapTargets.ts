import type { TapTarget } from '../scene/package.js';
import type { StorySpreadId } from './staging.js';

// Curated tap targets: one per interactive spread, anchored at the staged
// scene offset with a touch-height lift so the button floats over its
// subject instead of the waterline. These are UI copy (bilingual labels) and
// tuning constants, not package data: the builders do not emit tap targets
// yet, so the offsets below are the browser-verified stand-ins promoted from
// the slice harness. When builders emit tap targets, this module becomes a
// fallback, not the source.
export const TAP_TARGETS_BY_SPREAD: Record<StorySpreadId, TapTarget[]> = {
  S01: [{ id: 'boat', label: { en: 'Boat', id: 'Perahu' }, position: { x: 2.2, y: 1.0, z: 0.5 } }],
  S02: [
    {
      id: 'turtle',
      label: { en: 'Turtle', id: 'Kura-kura' },
      position: { x: 0.8, y: 0.6, z: 0.6 },
    },
  ],
  S03: [{ id: 'cake', label: { en: 'Cake', id: 'Kue' }, position: { x: 0.8, y: 1.0, z: 0.4 } }],
  S04: [],
  S08: [],
  S10: [],
  A05: [
    {
      id: 'turtle',
      label: { en: 'Turtle', id: 'Kura-kura' },
      position: { x: -0.8, y: 0.6, z: 0.5 },
    },
  ],
  A06: [
    {
      id: 'lantern',
      label: { en: 'Lantern', id: 'Lentera' },
      position: { x: 0, y: 0.2, z: 2.1 },
    },
  ],
  B05: [
    {
      id: 'turtle',
      label: { en: 'Turtle', id: 'Kura-kura' },
      position: { x: -0.8, y: 0, z: 0.5 },
    },
  ],
  B06: [{ id: 'cake', label: { en: 'Cake', id: 'Kue' }, position: { x: 0, y: 0, z: 0.9 } }],
};
