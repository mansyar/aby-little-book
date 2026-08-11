import { describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE, isLocale, SUPPORTED_LOCALES } from './locale';

describe('locale', () => {
  it('supports exactly the two prototype locales', () => {
    expect(SUPPORTED_LOCALES).toEqual(['en', 'id']);
  });

  it('defaults to English', () => {
    expect(DEFAULT_LOCALE).toBe('en');
  });

  it('recognizes supported locales', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('id')).toBe(true);
  });

  it('rejects unsupported locales', () => {
    expect(isLocale('fr')).toBe(false);
    expect(isLocale('')).toBe(false);
  });
});
