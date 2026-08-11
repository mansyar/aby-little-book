// Viewport classification: the reader maps viewport shape + pointer type to
// one of the authored presentation modes. Desktop is an adaptation of the
// iPad-landscape art layout (never a third authored art layout).

import { describe, expect, it } from 'vitest';
import { classifyViewport } from './viewport';

describe('classifyViewport', () => {
  it('classifies narrow portrait viewports as phone-portrait', () => {
    expect(classifyViewport({ width: 390, height: 844, pointer: 'coarse' })).toBe('phone-portrait');
  });

  it('classifies wide coarse-pointer viewports as ipad-landscape', () => {
    expect(classifyViewport({ width: 1180, height: 820, pointer: 'coarse' })).toBe(
      'ipad-landscape',
    );
  });

  it('classifies wide fine-pointer viewports as desktop', () => {
    expect(classifyViewport({ width: 1440, height: 900, pointer: 'fine' })).toBe('desktop');
  });

  it('treats square viewports as landscape', () => {
    expect(classifyViewport({ width: 800, height: 800, pointer: 'coarse' })).toBe('ipad-landscape');
  });

  it('classifies desktop as an adaptation of the landscape art layout', () => {
    const viewport = classifyViewport({ width: 1440, height: 900, pointer: 'fine' });
    expect(viewport).not.toBe('phone-portrait');
  });
});
