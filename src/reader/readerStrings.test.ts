import { describe, expect, it } from 'vitest';
import { READER_STRINGS } from './readerStrings';

const allValues = (strings: Record<string, unknown>): string[] =>
  Object.values(strings).flatMap((value) => {
    if (typeof value === 'string') {
      return [value];
    }
    return Object.values(value as Record<string, string>);
  });

describe('reader strings', () => {
  it('keeps English and Indonesian key-aligned', () => {
    expect(Object.keys(READER_STRINGS.en).sort()).toEqual(Object.keys(READER_STRINGS.id).sort());
    expect(Object.keys(READER_STRINGS.en.routeLabels).sort()).toEqual(
      Object.keys(READER_STRINGS.id.routeLabels).sort(),
    );
  });

  it('names both routes with the authored labels', () => {
    expect(READER_STRINGS.en.routeLabels['asteroid-garden']).toBe('Asteroid Garden');
    expect(READER_STRINGS.en.routeLabels['singing-starfield']).toBe('Singing Starfield');
    expect(READER_STRINGS.id.routeLabels['asteroid-garden']).toBe('Taman Asteroid');
    expect(READER_STRINGS.id.routeLabels['singing-starfield']).toBe('Hamparan Bintang Bernyanyi');
  });

  it('never pressures or blames in either locale', () => {
    const pattern = /error|wrong|fail|gagal|salah|hurry|cepat|harus/i;
    for (const strings of [READER_STRINGS.en, READER_STRINGS.id]) {
      for (const value of allValues(strings as unknown as Record<string, unknown>)) {
        expect(value).not.toMatch(pattern);
      }
    }
  });
});
