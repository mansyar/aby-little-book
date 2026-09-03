// WebGL capability probe for the hybrid renderer contract (see spec.md):
// Three.js scenes mount only where this returns true; otherwise the shell
// keeps the poster fallback with the full DOM story. Probe once and cache the
// answer at the call site — creating a context is not free. The DOM shell
// itself never requires WebGL, so jsdom and WebGL-less browsers always render
// landmarks, headings, and localized prose.
export function isWebGLAvailable(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }
  try {
    const canvas = document.createElement('canvas');
    return canvas.getContext('webgl2') !== null || canvas.getContext('webgl') !== null;
  } catch {
    return false;
  }
}
