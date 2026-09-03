import { describe, expect, it } from 'vitest';
import { assertUiStringParity } from '../app/strings';
import {
  COMPLETION_STRINGS,
  type CompletionStrings,
  INDONESIAN_COMPLETION_STRINGS,
} from './completionStrings';

// Completion is a calm arrival, not a prize. No reward-like language, no
// escalation, no failure — in either locale.

function allValues(strings: CompletionStrings): string[] {
  return Object.values(strings as unknown as Record<string, string>);
}

const REWARD_PATTERN = /point|star score|score|reward|hadiah|poin|skor/i;
const BLAME_PATTERN = /error|wrong|fail|gagal|salah/i;

describe('completion strings', () => {
  it('keeps English and Indonesian key-aligned', () => {
    expect(assertUiStringParity(COMPLETION_STRINGS.en, COMPLETION_STRINGS.id)).toEqual([]);
    expect(INDONESIAN_COMPLETION_STRINGS).toEqual(COMPLETION_STRINGS.id);
  });

  it('contains no reward, score, or blame language', () => {
    for (const strings of [COMPLETION_STRINGS.en, COMPLETION_STRINGS.id]) {
      for (const value of allValues(strings)) {
        expect(value).not.toMatch(REWARD_PATTERN);
        expect(value).not.toMatch(BLAME_PATTERN);
      }
    }
  });

  it('names the keepsake and the replay action', () => {
    expect(COMPLETION_STRINGS.en.keepsake).toMatch(/lantern|dock/i);
    expect(COMPLETION_STRINGS.en.replay).toMatch(/again|once more/i);
    expect(COMPLETION_STRINGS.id.replay).toMatch(/lagi/i);
  });
});
