import type { Locale } from './locale';

export interface ShellStrings {
  appName: string;
  initializing: string;
  errorTitle: string;
  errorMessage: string;
}

const ENGLISH_STRINGS: ShellStrings = {
  appName: 'Aby Little Book',
  initializing: 'Getting ready…',
  errorTitle: 'Something went quiet',
  errorMessage: 'Please close the book and open it again.',
};

const INDONESIAN_STRINGS: ShellStrings = {
  appName: 'Aby Little Book',
  initializing: 'Menyiapkan…',
  errorTitle: 'Ada yang menjadi sunyi',
  errorMessage: 'Silakan tutup dan buka kembali bukunya.',
};

export function shellStrings(locale: Locale): ShellStrings {
  return locale === 'id' ? INDONESIAN_STRINGS : ENGLISH_STRINGS;
}
