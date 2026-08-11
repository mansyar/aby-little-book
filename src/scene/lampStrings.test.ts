import { describe, expect, it } from 'vitest';
import { assertUiStringParity } from '../app/strings';
import { INDONESIAN_LAMP_STRINGS, LAMP_STRINGS, type LampStrings } from './lampStrings';

describe('lampStrings', () => {
  it('provides calm localized strings for the star lamp interaction', () => {
    const en: LampStrings = LAMP_STRINGS.en;
    expect(en.label).toBe('Star lamp');
    expect(en.hint).toMatch(/tap|touch|lamp/i);
    expect(en.response).not.toBe('');
    const id: LampStrings = LAMP_STRINGS.id;
    expect(id.label).toBe('Lampu bintang');
    expect(id.hint).toMatch(/sentuh|lampu/i);
    expect(id.response).not.toBe('');
  });

  it('keeps English and Indonesian lamp strings key-aligned', () => {
    expect(assertUiStringParity(LAMP_STRINGS.en, LAMP_STRINGS.id)).toEqual([]);
    expect(assertUiStringParity(INDONESIAN_LAMP_STRINGS, LAMP_STRINGS.id)).toEqual([]);
  });

  it('never blames the child in any lamp string', () => {
    for (const strings of [LAMP_STRINGS.en, LAMP_STRINGS.id]) {
      for (const value of Object.values(strings)) {
        expect(value).not.toMatch(/error|wrong|fail|gagal|salah/i);
      }
    }
  });
});
