import { describe, expect, it } from 'vitest';
import { assertUiStringParity, ENGLISH_STRINGS, INDONESIAN_STRINGS } from './strings';

describe('UI string parity', () => {
  it('keeps English and Indonesian key sets identical', () => {
    expect(assertUiStringParity(ENGLISH_STRINGS, INDONESIAN_STRINGS)).toEqual([]);
  });

  it('reports an English key missing from Indonesian', () => {
    const id = { ...INDONESIAN_STRINGS } as Record<string, string>;
    delete id.initializing;
    const diagnostics = assertUiStringParity(ENGLISH_STRINGS, id);
    expect(
      diagnostics.some((d) => d.code === 'ui-key-missing' && d.message.includes('initializing')),
    ).toBe(true);
  });

  it('reports an Indonesian key missing from English', () => {
    const en = { ...ENGLISH_STRINGS } as Record<string, string>;
    delete en.errorMessage;
    const diagnostics = assertUiStringParity(en, INDONESIAN_STRINGS);
    expect(
      diagnostics.some((d) => d.code === 'ui-key-missing' && d.message.includes('errorMessage')),
    ).toBe(true);
  });
});
