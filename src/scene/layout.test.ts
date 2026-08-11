// Layout selection and layer resolution for the scene renderer. Pure logic:
// the manifest declares which authored layouts exist (ipad-landscape,
// phone-portrait); the viewport picks one; desktop adaptation reuses the
// landscape layout (never a third authored art layout).

import { describe, expect, it } from 'vitest';
import type { AssetLayer } from '../story/contracts';
import { validManifest } from '../story/fixtures';
import { activeLayoutLayers, resolveAssetSrc, selectLayout } from './layout';

describe('selectLayout', () => {
  it('picks phone-portrait for narrow portrait viewports', () => {
    const layout = selectLayout(validManifest, { width: 390, height: 844 });
    expect(layout?.id).toBe('phone-portrait');
  });

  it('picks ipad-landscape for wide viewports', () => {
    const layout = selectLayout(validManifest, { width: 1180, height: 820 });
    expect(layout?.id).toBe('ipad-landscape');
  });

  it('lets the desktop adaptation reuse the landscape layout', () => {
    const layout = selectLayout(validManifest, { width: 1440, height: 900 });
    expect(layout?.id).toBe('ipad-landscape');
  });

  it('treats square viewports as landscape', () => {
    const layout = selectLayout(validManifest, { width: 800, height: 800 });
    expect(layout?.id).toBe('ipad-landscape');
  });

  it('returns null when no authored layout can be selected', () => {
    const layout = selectLayout({ ...validManifest, layouts: [] }, { width: 390, height: 844 });
    expect(layout).toBeNull();
  });
});

describe('activeLayoutLayers', () => {
  it('returns the layers of the active layout in authored order', () => {
    const layers = activeLayoutLayers(validManifest, 'ipad-landscape');
    expect(layers.map((layer) => layer.id)).toEqual(['bg-space', 'char-aby', 'fx-glow']);
  });

  it('returns an empty list when the layout references no layers', () => {
    const layouts = [{ id: 'phone-portrait' as const, layerIds: [] }];
    const layers = activeLayoutLayers({ ...validManifest, layouts }, 'phone-portrait');
    expect(layers).toEqual([]);
  });

  it('omits layers the layout does not reference', () => {
    const layouts = [{ id: 'ipad-landscape' as const, layerIds: ['bg-space', 'char-aby'] }];
    const manifest = { ...validManifest, layouts };
    const layers = activeLayoutLayers(manifest, 'ipad-landscape');
    expect(layers.map((layer) => layer.id)).toEqual(['bg-space', 'char-aby']);
    expect(layers.some((layer: AssetLayer) => layer.id === 'fx-glow')).toBe(false);
  });
});

describe('resolveAssetSrc', () => {
  it('prefixes relative asset sources with the base path', () => {
    expect(
      resolveAssetSrc('assets/layers/bg-space.webp', '/stories/the-starlight-rescue-0.1.0'),
    ).toBe('/stories/the-starlight-rescue-0.1.0/assets/layers/bg-space.webp');
  });

  it('leaves absolute sources untouched', () => {
    expect(resolveAssetSrc('/assets/layers/bg-space.webp', '/base')).toBe(
      '/assets/layers/bg-space.webp',
    );
  });

  it('defaults the base path to the site root', () => {
    expect(resolveAssetSrc('assets/layers/bg-space.webp')).toBe('/assets/layers/bg-space.webp');
  });
});
