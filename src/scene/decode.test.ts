// Decode layer: loads only the active layout's layers and prefers the
// Image.decode() API where supported, falling back to the load event so
// navigation can wait for destination assets where the platform allows.

import { describe, expect, it, vi } from 'vitest';
import type { SceneLayout } from '../story/contracts';
import { validManifest } from '../story/fixtures';
import { decodeImage, type ImageLike, predecodeScene, supportsDecode } from './decode';

function fakeImage(
  fields: Partial<ImageLike> = {},
): ImageLike & { decode: ReturnType<typeof vi.fn> } {
  const image: ImageLike = {
    decode: vi.fn().mockResolvedValue(undefined),
    onload: null,
    onerror: null,
    src: '',
    ...fields,
  };
  return image as ImageLike & { decode: ReturnType<typeof vi.fn> };
}

function noDecode(): ImageLike {
  const image = fakeImage();
  delete (image as Partial<ImageLike>).decode;
  return image;
}

describe('supportsDecode', () => {
  it('is true when the image factory exposes decode()', () => {
    expect(supportsDecode(() => fakeImage())).toBe(true);
  });

  it('is false when the image factory does not expose decode()', () => {
    expect(supportsDecode(noDecode)).toBe(false);
  });
});

describe('decodeImage', () => {
  it('awaits decode() when supported', async () => {
    const image = fakeImage();
    await decodeImage('assets/layers/bg-space.webp', '/base', () => image);
    expect(image.decode).toHaveBeenCalledOnce();
  });

  it('resolves through the load event when decode() is unavailable', async () => {
    const image = noDecode();
    const promise = decodeImage('assets/layers/bg-space.webp', '/base', () => image);
    expect(image.onload).not.toBeNull();
    image.onload?.();
    await promise;
  });

  it('rejects through the error event when decode() is unavailable', async () => {
    const image = noDecode();
    const promise = decodeImage('assets/layers/bg-space.webp', '/base', () => image);
    image.onerror?.();
    await expect(promise).rejects.toThrow();
  });

  it('rejects when decode() rejects', async () => {
    const image = fakeImage({ decode: vi.fn().mockRejectedValue(new Error('decoded badly')) });
    await expect(decodeImage('assets/layers/bg-space.webp', '/base', () => image)).rejects.toThrow(
      'decoded badly',
    );
  });
});

describe('predecodeScene', () => {
  it('decodes every layer of the active layout', async () => {
    const images: Array<ImageLike & { decode: ReturnType<typeof vi.fn> }> = [];
    const factory = (): ImageLike => {
      const image = fakeImage();
      images.push(image);
      return image;
    };
    await predecodeScene(validManifest, 'ipad-landscape', '/base', factory);
    expect(images).toHaveLength(3);
    expect(images.map((image) => image.src)).toEqual([
      '/base/assets/layers/ipad-landscape/bg-space.webp',
      '/base/assets/layers/ipad-landscape/char-aby.webp',
      '/base/assets/layers/ipad-landscape/fx-glow.webp',
    ]);
  });

  it('never decodes layers outside the active layout', async () => {
    const images: Array<ImageLike & { decode: ReturnType<typeof vi.fn> }> = [];
    const factory = (): ImageLike => {
      const image = fakeImage();
      images.push(image);
      return image;
    };
    const landscape = validManifest.layouts.find((entry) => entry.id === 'ipad-landscape');
    const layouts = [{ ...(landscape as SceneLayout), layerIds: ['bg-space'] }];
    await predecodeScene({ ...validManifest, layouts }, 'ipad-landscape', '/base', factory);
    expect(images).toHaveLength(1);
    expect(images[0]?.src).toBe('/base/assets/layers/ipad-landscape/bg-space.webp');
  });
});
