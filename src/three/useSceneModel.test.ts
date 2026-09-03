import { act, renderHook, waitFor } from '@testing-library/react';
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
    expect(loadAsync).toHaveBeenCalledWith('/stories/pkg/dock.glb', expect.any(Function));
    expect(result.current.group?.children).toHaveLength(1);
  });

  it('reports failed when a scene cannot load', async () => {
    loadAsync.mockRejectedValueOnce(new Error('missing'));
    const { result } = renderHook(() =>
      useSceneModel([{ glb: '/stories/pkg/dock.glb', offset: [0, 0, 0] }]),
    );
    await waitFor(() => expect(result.current.status).toBe('failed'));
  });

  function progressOf(state: { status: string; progress?: number }): number {
    return state.status === 'loading' ? (state.progress ?? -1) : -1;
  }

  function fakeProgress(loaded: number, total: number): ProgressEvent {
    return { lengthComputable: true, loaded, total } as ProgressEvent;
  }

  it('reports honest download progress averaged across staged scenes', async () => {
    const resolvers: Array<(value: { scene: Group }) => void> = [];
    const reporters: Array<(event: ProgressEvent) => void> = [];
    loadAsync.mockReset();
    loadAsync.mockImplementation((_url: string, onProgress?: (event: ProgressEvent) => void) => {
      if (onProgress) {
        reporters.push(onProgress);
      }
      return new Promise<{ scene: Group }>((resolve) => {
        resolvers.push(resolve);
      });
    });
    const { result } = renderHook(() =>
      useSceneModel([
        { glb: '/stories/pkg/dock.glb', offset: [0, 0, 0] },
        { glb: '/stories/pkg/boat.glb', offset: [1, 0, 0] },
      ]),
    );
    expect(result.current.status).toBe('loading');
    expect(progressOf(result.current)).toBe(0);
    expect(loadAsync).toHaveBeenCalledWith('/stories/pkg/dock.glb', expect.any(Function));

    act(() => {
      reporters[0]?.(fakeProgress(50, 100));
    });
    expect(progressOf(result.current)).toBeCloseTo(0.25);

    act(() => {
      reporters[0]?.(fakeProgress(100, 100));
      reporters[1]?.(fakeProgress(30, 100));
    });
    expect(progressOf(result.current)).toBeCloseTo(0.65);

    await act(async () => {
      resolvers[0]?.({ scene: new Group() });
      resolvers[1]?.({ scene: new Group() });
    });
    await waitFor(() => expect(result.current.status).toBe('ready'));
  });

  it('counts unknown-size files only when they finish', async () => {
    const resolvers: Array<(value: { scene: Group }) => void> = [];
    const reporters: Array<(event: ProgressEvent) => void> = [];
    loadAsync.mockReset();
    loadAsync.mockImplementation((_url: string, onProgress?: (event: ProgressEvent) => void) => {
      if (onProgress) {
        reporters.push(onProgress);
      }
      return new Promise<{ scene: Group }>((resolve) => {
        resolvers.push(resolve);
      });
    });
    const { result } = renderHook(() =>
      useSceneModel([{ glb: '/stories/pkg/dock.glb', offset: [0, 0, 0] }]),
    );
    act(() => {
      reporters[0]?.({ lengthComputable: false, loaded: 999, total: 0 } as ProgressEvent);
    });
    expect(progressOf(result.current)).toBe(0);
    await act(async () => {
      resolvers[0]?.({ scene: new Group() });
    });
    await waitFor(() => expect(result.current.status).toBe('ready'));
  });
});
