import { renderHook, waitFor } from '@testing-library/react';
import { Group } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { useSceneModel } from './useSceneModel.js';

const loadAsync = vi.fn();
const setDecoderPath = vi.fn();
const disposeDraco = vi.fn();

vi.mock('three/addons/loaders/GLTFLoader.js', () => ({
  GLTFLoader: class {
    setDRACOLoader = vi.fn();
    loadAsync = loadAsync;
  },
}));

vi.mock('three/addons/loaders/DRACOLoader.js', () => ({
  DRACOLoader: class {
    setDecoderPath = setDecoderPath;
    dispose = disposeDraco;
  },
}));

describe('useSceneModel', () => {
  it('loads staged scenes and reports ready with a positioned group', async () => {
    const dock = new Group();
    dock.name = 'dock';
    loadAsync.mockResolvedValueOnce({ scene: dock });
    const { result } = renderHook(() =>
      useSceneModel([{ glb: '/stories/pkg/dock.glb', offset: [0, 0, 0] }]),
    );
    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(setDecoderPath).toHaveBeenCalledWith('/draco/');
    expect(loadAsync).toHaveBeenCalledWith('/stories/pkg/dock.glb');
    expect(result.current.group?.children).toHaveLength(1);
  });

  it('reports failed when a scene cannot load', async () => {
    loadAsync.mockRejectedValueOnce(new Error('missing'));
    const { result } = renderHook(() =>
      useSceneModel([{ glb: '/stories/pkg/dock.glb', offset: [0, 0, 0] }]),
    );
    await waitFor(() => expect(result.current.status).toBe('failed'));
  });
});
