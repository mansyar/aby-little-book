import { describe, expect, it } from 'vitest';
import { assertUiStringParity } from '../app/strings';
import {
  BOOKSHELF_STRINGS,
  type BookshelfStrings,
  INDONESIAN_BOOKSHELF_STRINGS,
} from './bookshelfStrings';

// The shelf is the child's doorway into the book: calm, local, and honest
// about the book's state in both locales. No blame words anywhere.

function allValues(strings: BookshelfStrings): string[] {
  return Object.values(strings as unknown as Record<string, string>);
}

const BLAME_PATTERN = /error|wrong|fail|gagal|salah/i;

describe('bookshelf strings', () => {
  it('keeps English and Indonesian key-aligned', () => {
    expect(assertUiStringParity(BOOKSHELF_STRINGS.en, BOOKSHELF_STRINGS.id)).toEqual([]);
    expect(INDONESIAN_BOOKSHELF_STRINGS).toEqual(BOOKSHELF_STRINGS.id);
  });

  it('never blames the child in either locale', () => {
    for (const strings of [BOOKSHELF_STRINGS.en, BOOKSHELF_STRINGS.id]) {
      for (const value of allValues(strings)) {
        expect(value).not.toMatch(BLAME_PATTERN);
      }
    }
  });

  it('labels every card state with a calm action or status', () => {
    expect(BOOKSHELF_STRINGS.en.prepare).toMatch(/prepare|get ready/i);
    expect(BOOKSHELF_STRINGS.en.preparing).toMatch(/sav|prepar/i);
    expect(BOOKSHELF_STRINGS.en.open).toMatch(/open|read/i);
    expect(BOOKSHELF_STRINGS.en.continueLabel).toMatch(/continue/i);
    expect(BOOKSHELF_STRINGS.en.readAgain).toMatch(/again|once more/i);
    expect(BOOKSHELF_STRINGS.id.readAgain).toMatch(/lagi/i);
  });
});
