import { describe, expect, it } from 'vitest';
import { shellStrings } from './strings';

describe('shellStrings', () => {
  it('provides English strings for the default locale', () => {
    const strings = shellStrings('en');
    expect(strings.appName).toBe('Aby Little Book');
    expect(strings.initializing).toMatch(/getting ready/i);
  });

  it('provides Indonesian strings without leaving placeholders', () => {
    const strings = shellStrings('id');
    expect(strings.appName).toBe('Aby Little Book');
    expect(strings.initializing).toMatch(/menyiapkan/i);
    expect(Object.values(strings)).not.toContain('');
  });

  it('keeps error messages calm and non-blaming in both locales', () => {
    for (const locale of ['en', 'id'] as const) {
      const strings = shellStrings(locale);
      expect(strings.errorTitle).not.toMatch(/error|wrong|fail|gagal|salah/i);
      expect(strings.errorMessage).not.toMatch(/you (broke|failed)|anda (gagal|salah)/i);
    }
  });
});
