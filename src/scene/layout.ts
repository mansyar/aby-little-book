// Pure layout resolution for the scene renderer. The manifest declares the
// authored layouts; the viewport selects one; the desktop adaptation reuses
// the landscape layout rather than introducing a third authored art layout.

import type { AssetLayer, PackageManifest, SafeRegion, SceneLayout } from '../story/contracts';

export type Viewport = { width: number; height: number };

export function selectLayout(manifest: PackageManifest, viewport: Viewport): SceneLayout | null {
  const aspect = viewport.width / viewport.height;
  const preferredId = aspect < 1 ? 'phone-portrait' : 'ipad-landscape';
  return manifest.layouts.find((layout) => layout.id === preferredId) ?? null;
}

export function activeLayoutLayers(manifest: PackageManifest, layoutId: string): AssetLayer[] {
  const layout = manifest.layouts.find((candidate) => candidate.id === layoutId);
  if (layout === undefined) {
    return [];
  }
  const referenced = new Set(layout.layerIds);
  return manifest.assets
    .filter((layer) => layer.layout === layoutId && referenced.has(layer.id))
    .sort((a, b) => a.order - b.order);
}

export type SceneState = 'rest' | 'response';

/**
 * Composes the layers visible in a scene state: rest layers always; response
 * layers (authored state 'response', e.g. fx-lamp-beam, fx-shared-glow) join
 * them only when the spread's optional interaction is activated.
 */
export function layersForState(
  manifest: PackageManifest,
  layoutId: string,
  state: SceneState,
): AssetLayer[] {
  const layers = activeLayoutLayers(manifest, layoutId);
  if (state === 'response') {
    return layers;
  }
  return layers.filter((layer) => (layer.state ?? 'rest') === 'rest');
}

export function resolveAssetSrc(src: string, basePath: string = '/'): string {
  if (src.startsWith('/') || /^[a-z]+:/i.test(src)) {
    return src;
  }
  const base = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  return `${base}/${src}`;
}

export function cameraRect(manifest: PackageManifest, layoutId: string): SafeRegion | null {
  return manifest.layouts.find((layout) => layout.id === layoutId)?.camera ?? null;
}
