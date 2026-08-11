export interface BookshelfStrings {
  /** The shelf heading shown above the book card. */
  shelfTitle: string;
  /** Action for a new, unprepared book. */
  prepare: string;
  /** Status while the book is being saved for offline. */
  preparing: string;
  /** Action for a prepared, never-opened book. */
  open: string;
  /** Action for a reading in progress. */
  continueLabel: string;
  /** Action for a completed reading. */
  readAgain: string;
  /** Door to the caregiver controls. */
  caregiver: string;
  /** Begin action on the portal preview. */
  begin: string;
  /** Lumi keepsake line shown on the shelf after completion. */
  keepsake: string;
}

export const BOOKSHELF_STRINGS: Record<'en' | 'id', BookshelfStrings> = {
  en: {
    shelfTitle: 'Your bookshelf',
    prepare: 'Prepare the book',
    preparing: 'Saving the story…',
    open: 'Open the book',
    continueLabel: 'Continue reading',
    readAgain: 'Read again',
    caregiver: 'For grown-ups',
    begin: 'Begin',
    keepsake: 'Lumi glows on your shelf.',
  },
  id: {
    shelfTitle: 'Rak bukumu',
    prepare: 'Siapkan bukunya',
    preparing: 'Menyimpan cerita…',
    open: 'Buka bukunya',
    continueLabel: 'Lanjutkan membaca',
    readAgain: 'Baca lagi',
    caregiver: 'Untuk orang dewasa',
    begin: 'Mulai',
    keepsake: 'Lumi bersinar di rakmu.',
  },
};

export const INDONESIAN_BOOKSHELF_STRINGS = BOOKSHELF_STRINGS.id;
