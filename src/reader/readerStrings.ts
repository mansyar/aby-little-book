// Reader-level strings: the authored route choice at S03 and reading labels.
// Route labels come from the story spec (paired adaptations, never subtitled).

export type RouteLabels = Record<'asteroid-garden' | 'singing-starfield', string>;

export type ReaderStrings = {
  choiceTitle: string;
  choicePrompt: string;
  routeLabels: RouteLabels;
  readingStatus: string;
};

const EN: ReaderStrings = {
  choiceTitle: 'Two Ways Through Space',
  choicePrompt: 'Which way should the astronaut go?',
  routeLabels: {
    'asteroid-garden': 'Asteroid Garden',
    'singing-starfield': 'Singing Starfield',
  },
  readingStatus: 'Reading…',
};

const ID: ReaderStrings = {
  choiceTitle: 'Dua Jalan Menembus Angkasa',
  choicePrompt: 'Jalan mana yang sebaiknya dipilih astronot?',
  routeLabels: {
    'asteroid-garden': 'Taman Asteroid',
    'singing-starfield': 'Hamparan Bintang Bernyanyi',
  },
  readingStatus: 'Membaca…',
};

export const READER_STRINGS: Record<'en' | 'id', ReaderStrings> = { en: EN, id: ID };
