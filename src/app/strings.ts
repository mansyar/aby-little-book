import type { Locale } from './locale';

// Type alias (not interface) so the tables stay assignable to Record<string, string>
// for the parity guard; interfaces do not get implicit index signatures.
export type ShellStrings = {
  appName: string;
  initializing: string;
  errorTitle: string;
  errorMessage: string;
};

export const ENGLISH_STRINGS: ShellStrings = {
  appName: 'Aby Little Book',
  initializing: 'Getting ready…',
  errorTitle: 'Something went quiet',
  errorMessage: 'Please close the book and open it again.',
};

export const INDONESIAN_STRINGS: ShellStrings = {
  appName: 'Aby Little Book',
  initializing: 'Menyiapkan…',
  errorTitle: 'Ada yang menjadi sunyi',
  errorMessage: 'Silakan tutup dan buka kembali bukunya.',
};

export function shellStrings(locale: Locale): ShellStrings {
  return locale === 'id' ? INDONESIAN_STRINGS : ENGLISH_STRINGS;
}

export interface ParityDiagnostic {
  severity: 'error';
  code: string;
  message: string;
}

// Build-time guard: every UI string key must exist in both locales so a
// missing translation can never silently render as an empty label.
export function assertUiStringParity<T extends string>(
  en: Readonly<Record<T, string>>,
  id: Readonly<Record<T, string>>,
): ParityDiagnostic[] {
  const diagnostics: ParityDiagnostic[] = [];
  for (const key of Object.keys(en) as T[]) {
    if (id[key] === undefined) {
      diagnostics.push({
        severity: 'error',
        code: 'ui-key-missing',
        message: `Indonesian strings are missing key '${key}'.`,
      });
    }
  }
  for (const key of Object.keys(id) as T[]) {
    if (en[key] === undefined) {
      diagnostics.push({
        severity: 'error',
        code: 'ui-key-missing',
        message: `English strings are missing key '${key}'.`,
      });
    }
  }
  return diagnostics;
}
