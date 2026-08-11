export interface CompletionStrings {
  completionTitle: string;
  completionMessage: string;
  replay: string;
  keepsake: string;
}

export const COMPLETION_STRINGS: Record<'en' | 'id', CompletionStrings> = {
  en: {
    completionTitle: 'Lumi Shines Again',
    completionMessage: 'You shared the light all the way home.',
    replay: 'Read the story again',
    keepsake: 'Lumi glows on your shelf.',
  },
  id: {
    completionTitle: 'Lumi Bersinar Lagi',
    completionMessage: 'Kamu membagikan cahaya sampai ke rumah.',
    replay: 'Baca ceritanya lagi',
    keepsake: 'Lumi bersinar di rakmu.',
  },
};

export const INDONESIAN_COMPLETION_STRINGS = COMPLETION_STRINGS.id;
