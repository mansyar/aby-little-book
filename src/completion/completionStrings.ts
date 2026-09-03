export interface CompletionStrings {
  completionTitle: string;
  completionMessage: string;
  replay: string;
  keepsake: string;
}

export const COMPLETION_STRINGS: Record<'en' | 'id', CompletionStrings> = {
  en: {
    completionTitle: 'The Lantern Glows On',
    completionMessage: 'You shared the cake and the light all the way home.',
    replay: 'Float the story again',
    keepsake: 'A lantern glows on your dock.',
  },
  id: {
    completionTitle: 'Lentera Tetap Bersinar',
    completionMessage: 'Kamu berbagi kue dan cahaya sampai ke rumah.',
    replay: 'Berlayar lagi',
    keepsake: 'Sebuah lentera bersinar di dermagamu.',
  },
};

export const INDONESIAN_COMPLETION_STRINGS = COMPLETION_STRINGS.id;
