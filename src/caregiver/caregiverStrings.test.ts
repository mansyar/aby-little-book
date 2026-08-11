import { describe, expect, it } from 'vitest';
import { assertUiStringParity } from '../app/strings';
import {
  CAREGIVER_STRINGS,
  type CaregiverStrings,
  INDONESIAN_CAREGIVER_STRINGS,
} from './caregiverStrings';

// Caregiver surfaces speak to grown-ups: concise, respectful, transparent.
// Destructive consequences are stated plainly; no blame anywhere.

function allValues(strings: CaregiverStrings): string[] {
  return Object.values(strings as unknown as Record<string, string>);
}

const BLAME_PATTERN = /error|wrong|fail|gagal|salah/i;

describe('caregiver strings', () => {
  it('keeps English and Indonesian key-aligned', () => {
    expect(assertUiStringParity(CAREGIVER_STRINGS.en, CAREGIVER_STRINGS.id)).toEqual([]);
    expect(INDONESIAN_CAREGIVER_STRINGS).toEqual(CAREGIVER_STRINGS.id);
  });

  it('never blames the reader or caregiver', () => {
    for (const strings of [CAREGIVER_STRINGS.en, CAREGIVER_STRINGS.id]) {
      for (const value of allValues(strings)) {
        expect(value).not.toMatch(BLAME_PATTERN);
      }
    }
  });

  it('states reset consequences plainly in both locales', () => {
    expect(CAREGIVER_STRINGS.en.resetConsequence).toMatch(/progress/i);
    expect(CAREGIVER_STRINGS.en.resetConsequence).toMatch(/keepsake|removed|erase|delete/i);
    expect(CAREGIVER_STRINGS.id.resetConsequence).toMatch(/kemajuan|progres/i);
  });

  it('labels the destructive action unambiguously', () => {
    expect(CAREGIVER_STRINGS.en.erase).toMatch(/erase|remove/i);
    expect(CAREGIVER_STRINGS.en.cancel).toMatch(/keep|cancel|back/i);
  });
});
