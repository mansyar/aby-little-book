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
  /** Calm line when preparation fails; the story stays unprepared. */
  prepareFailed: string;
  /** Retry action after a failed preparation. */
  tryAgain: string;
  /** Leave the preparation view back to the dock. */
  backToDock: string;
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
    prepareFailed: 'The story could not be saved yet. Nothing was lost.',
    tryAgain: 'Try again',
    backToDock: 'Back to the dock',
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
    prepareFailed: 'Ceritanya belum bisa disimpan. Tidak ada yang hilang.',
    tryAgain: 'Coba lagi',
    backToDock: 'Kembali ke dermaga',
    keepsake: 'Sebuah lentera bersinar di dermagamu.',
  },
};
