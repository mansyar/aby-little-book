export interface PrepareStrings {
  title: string;
  preparing: string;
  ready: string;
  errorMessage: string;
  retry: string;
}

const EN: PrepareStrings = {
  title: 'Preparing the book',
  preparing: 'Saving the story for quiet places…',
  ready: 'The book is ready to read anywhere.',
  errorMessage: 'Some pages could not be saved. Would you like to try again?',
  retry: 'Try again',
};

const ID: PrepareStrings = {
  title: 'Menyiapkan buku',
  preparing: 'Menyimpan cerita untuk tempat-tempat yang sunyi…',
  ready: 'Buku siap dibaca di mana saja.',
  errorMessage: 'Beberapa halaman belum tersimpan. Mau dicoba sekali lagi?',
  retry: 'Coba lagi',
};

export const PREPARE_STRINGS: Record<'en' | 'id', PrepareStrings> = { en: EN, id: ID };
