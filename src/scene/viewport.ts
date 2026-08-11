// Viewport classification for the reader composition. Desktop is an
// adaptation of the iPad-landscape art layout (never a third authored art
// layout); narrow portrait viewports use the phone-portrait art.

export type ViewportClass = 'ipad-landscape' | 'phone-portrait' | 'desktop';

export type ViewportInfo = {
  width: number;
  height: number;
  pointer: 'fine' | 'coarse';
};

export function classifyViewport(viewport: ViewportInfo): ViewportClass {
  if (viewport.height > viewport.width) {
    return 'phone-portrait';
  }
  return viewport.pointer === 'fine' ? 'desktop' : 'ipad-landscape';
}
