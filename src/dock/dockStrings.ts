export interface DockStrings {
  /** The dock heading shown above the boat card. */
  dockTitle: string;
  /** Action for a new, unprepared story. */
  prepare: string;
  /** Status while the story is being saved for offline. */
  preparing: string;
  /** Action for a prepared, never-opened story. */
  open: string;
  /** Action for a reading in progress. */
  continueLabel: string;
  /** Action for a completed reading. */
  readAgain: string;
  /** Door to the caregiver controls. */
  caregiver: string;
  /** Lantern keepsake line shown on the dock after completion. */
  keepsake: string;
}

export const DOCK_STRINGS: Record<'en' | 'id', DockStrings> = {
  en: {
    dockTitle: 'The Starlit Dock',
    prepare: 'Prepare the boat',
    preparing: 'Saving the story for offline.',
    open: 'Climb into the boat',
    continueLabel: 'Keep floating',
    readAgain: 'Float again',
    caregiver: 'For grown-ups',
    keepsake: 'A lantern glows on your dock.',
  },
  id: {
    dockTitle: 'Dermaga Bintang',
    prepare: 'Siapkan perahu',
    preparing: 'Menyimpan cerita untuk luring.',
    open: 'Naik ke perahu',
    continueLabel: 'Lanjut berlayar',
    readAgain: 'Berlayar lagi',
    caregiver: 'Untuk orang dewasa',
    keepsake: 'Sebuah lentera bersinar di dermagamu.',
  },
};
