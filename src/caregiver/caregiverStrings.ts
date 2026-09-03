export interface CaregiverStrings {
  gateTitle: string;
  gatePrompt: string;
  enter: string;
  close: string;
  settingsTitle: string;
  languageLabel: string;
  english: string;
  indonesian: string;
  soundLabel: string;
  soundOn: string;
  soundOff: string;
  textLabel: string;
  textStandard: string;
  textLarge: string;
  motionLabel: string;
  motionOn: string;
  motionOff: string;
  prepareLabel: string;
  preparing: string;
  resetLabel: string;
  resetConsequence: string;
  erase: string;
  cancel: string;
}

export const CAREGIVER_STRINGS: Record<'en' | 'id', CaregiverStrings> = {
  en: {
    gateTitle: 'For grown-ups',
    gatePrompt: 'This part is for the grown-ups who care for the reader.',
    enter: 'Open grown-up settings',
    close: 'Close grown-up settings',
    settingsTitle: 'Grown-up settings',
    languageLabel: 'Language',
    english: 'English',
    indonesian: 'Bahasa Indonesia',
    soundLabel: 'Sound',
    soundOn: 'Sound on',
    soundOff: 'Sound off',
    textLabel: 'Text size',
    textStandard: 'Standard text',
    textLarge: 'Larger text',
    motionLabel: 'Motion',
    motionOn: 'Gentle motion on',
    motionOff: 'Gentle motion off',
    prepareLabel: 'Prepare the book for offline',
    preparing: 'Saving the story…',
    resetLabel: 'Start the book over',
    resetConsequence:
      'This removes reading progress, the lantern keepsake, and the prepared story.',
    erase: 'Erase everything',
    cancel: 'Keep everything',
  },
  id: {
    gateTitle: 'Untuk orang dewasa',
    gatePrompt: 'Bagian ini untuk orang dewasa yang mendampingi pembaca.',
    enter: 'Buka pengaturan dewasa',
    close: 'Tutup pengaturan dewasa',
    settingsTitle: 'Pengaturan dewasa',
    languageLabel: 'Bahasa',
    english: 'English',
    indonesian: 'Bahasa Indonesia',
    soundLabel: 'Suara',
    soundOn: 'Suara menyala',
    soundOff: 'Suara mati',
    textLabel: 'Ukuran teks',
    textStandard: 'Teks standar',
    textLarge: 'Teks lebih besar',
    motionLabel: 'Gerakan',
    motionOn: 'Gerakan lembut menyala',
    motionOff: 'Gerakan lembut mati',
    prepareLabel: 'Siapkan buku untuk dipakai tanpa internet',
    preparing: 'Menyimpan cerita…',
    resetLabel: 'Mulai buku dari awal',
    resetConsequence:
      'Ini menghapus kemajuan membaca, kenang-kenangan lentera, dan cerita yang sudah disiapkan.',
    erase: 'Hapus semuanya',
    cancel: 'Simpan semuanya',
  },
};

export const INDONESIAN_CAREGIVER_STRINGS = CAREGIVER_STRINGS.id;
