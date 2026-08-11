// Decode layer for the scene renderer. Loads only the active layout's
// layers, prefers Image.decode() where supported (so navigation can wait
// for destination assets before committing), and falls back to the load
// event on platforms without it.

import type { PackageManifest } from '../story/contracts';
import { activeLayoutLayers, resolveAssetSrc } from './layout';

export interface ImageLike {
  decode?: () => Promise<void>;
  onload: ((event?: unknown) => void) | null;
  onerror: ((event?: unknown) => void) | null;
  src: string;
}

function defaultFactory(): ImageLike {
  // The DOM Image is structurally a superset; the narrow handler shapes let
  // tests drive load/error without real network or decode support.
  return new Image() as unknown as ImageLike;
}

export function supportsDecode(factory: () => ImageLike = defaultFactory): boolean {
  return typeof factory().decode === 'function';
}

export function decodeImage(
  src: string,
  basePath = '/',
  factory: () => ImageLike = defaultFactory,
): Promise<void> {
  const image = factory();
  image.src = resolveAssetSrc(src, basePath);
  if (typeof image.decode === 'function') {
    return Promise.resolve(image.decode());
  }
  return new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`Could not decode image: ${image.src}`));
  });
}

export async function predecodeScene(
  manifest: PackageManifest,
  layoutId: string,
  basePath = '/',
  factory: () => ImageLike = defaultFactory,
): Promise<void> {
  const layers = activeLayoutLayers(manifest, layoutId);
  await Promise.all(layers.map((layer) => decodeImage(layer.src, basePath, factory)));
}
