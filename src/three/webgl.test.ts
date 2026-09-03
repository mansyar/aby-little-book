import { afterEach, describe, expect, it, vi } from 'vitest';
import { isWebGLAvailable } from './webgl';

type GetContext = typeof HTMLCanvasElement.prototype.getContext;

function stubGetContext(implementation: (contextId: string) => unknown): void {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    implementation as GetContext,
  );
}

describe('isWebGLAvailable', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns false when the browser offers no WebGL context', () => {
    stubGetContext(() => null);
    expect(isWebGLAvailable()).toBe(false);
  });

  it('returns true when a WebGL2 context can be created', () => {
    stubGetContext((contextId) => (contextId === 'webgl2' ? {} : null));
    expect(isWebGLAvailable()).toBe(true);
  });

  it('falls back to WebGL1 when WebGL2 is missing', () => {
    stubGetContext((contextId) => (contextId === 'webgl' ? {} : null));
    expect(isWebGLAvailable()).toBe(true);
  });

  it('returns false without a document (server rendering)', () => {
    vi.stubGlobal('document', undefined);
    expect(isWebGLAvailable()).toBe(false);
  });

  it('returns false when context creation throws', () => {
    stubGetContext(() => {
      throw new Error('blocked');
    });
    expect(isWebGLAvailable()).toBe(false);
  });
});
