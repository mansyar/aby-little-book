// Test-support fixtures for the story contracts. The valid story is the
// approved production resource (src/story/starlight-rescue.ts) so that every
// contract, token, route, and asset test exercises the real content; these
// helpers stay as the loose mutation baseline for negative tests.

import type {
  AssetLayer,
  PackageManifest,
  PackageReadiness,
  SceneLayout,
  Spread,
  Story,
} from './contracts';
import { story as starlightStory } from './starlight-rescue';

// Loose shape used by negative tests to corrupt a valid fixture the way
// unvalidated JSON would arrive at the schema boundary.
export type MutableSpread = {
  id: string;
  title: unknown;
  prose: Record<string, string>;
  interaction?: unknown;
};

export type MutableStory = {
  spreads: Record<string, MutableSpread>;
  routes: Array<{ id: string; spreadIds: string[] }>;
  astronauts: Array<{ id: string; grammar: unknown }>;
  version: unknown;
  endingSpreadId: unknown;
};

export function cloneStory(): MutableStory {
  return structuredClone(validStory) as unknown as MutableStory;
}

// Fixture access helpers guard noUncheckedIndexedAccess without assertions.
export function spreadOf(story: MutableStory, id: string): MutableSpread {
  const spread = story.spreads[id];
  if (spread === undefined) {
    throw new Error(`Fixture has no spread '${id}'.`);
  }
  return spread;
}

export function routeOf(
  story: { routes: Array<{ id: string; spreadIds: string[] }> },
  index: number,
): { id: string; spreadIds: string[] } {
  const route = story.routes[index];
  if (route === undefined) {
    throw new Error(`Fixture has no route at index ${index}.`);
  }
  return route;
}

export function astronautOf(story: MutableStory, index: number): { id: string; grammar: unknown } {
  const astronaut = story.astronauts[index];
  if (astronaut === undefined) {
    throw new Error(`Fixture has no astronaut at index ${index}.`);
  }
  return astronaut;
}

export function storySpreadOf(story: Story, id: string): Spread {
  const spread = story.spreads[id];
  if (spread === undefined) {
    throw new Error(`Fixture has no spread '${id}'.`);
  }
  return spread;
}

export function storyAstronautOf<T>(story: { astronauts: T[] }, index: number): T {
  const astronaut = story.astronauts[index];
  if (astronaut === undefined) {
    throw new Error(`Fixture has no astronaut at index ${index}.`);
  }
  return astronaut;
}

export const validStory: Story = starlightStory;

export const validAssetLayers: AssetLayer[] = [
  {
    id: 'bg-space',
    role: 'background',
    order: 0,
    src: 'assets/layers/bg-space.webp',
    width: 2048,
    height: 1536,
    sha256: 'a'.repeat(64),
  },
  {
    id: 'char-aby',
    role: 'character',
    order: 1,
    src: 'assets/layers/char-aby.webp',
    width: 2048,
    height: 1536,
    sha256: 'b'.repeat(64),
  },
  {
    id: 'fx-glow',
    role: 'effect',
    order: 2,
    src: 'assets/layers/fx-glow.webp',
    width: 2048,
    height: 1536,
    sha256: 'c'.repeat(64),
    safeRegion: { x: 0.1, y: 0.2, width: 0.4, height: 0.3 },
  },
];

export const validLayouts: SceneLayout[] = [
  {
    id: 'ipad-landscape',
    layerIds: ['bg-space', 'char-aby', 'fx-glow'],
    camera: { x: 0, y: 0, width: 1, height: 0.75 },
    panel: { position: 'side', region: { x: 0.55, y: 0.08, width: 0.4, height: 0.84 } },
  },
  {
    id: 'phone-portrait',
    layerIds: ['bg-space', 'char-aby', 'fx-glow'],
    camera: { x: 0.15, y: 0, width: 0.7, height: 1 },
    panel: { position: 'bottom', region: { x: 0.05, y: 0.72, width: 0.9, height: 0.26 } },
  },
];

export const validManifest: PackageManifest = {
  packageId: 'the-starlight-rescue-0.1.0',
  storyId: 'the-starlight-rescue',
  storyVersion: '0.1.0',
  layouts: validLayouts,
  assets: validAssetLayers,
  totalBytes: 2048 * 1536 * 3,
};

export const validReadiness: PackageReadiness = {
  ready: true,
  packageId: 'the-starlight-rescue-0.1.0',
  storyVersion: '0.1.0',
  missingAssets: [],
  failedHashes: [],
};
