export interface LampStrings {
  label: string;
  hint: string;
  response: string;
}

const EN: LampStrings = {
  label: 'Star lamp',
  hint: 'Tap the lamp',
  response: 'The lamp glows warm.',
};

const ID: LampStrings = {
  label: 'Lampu bintang',
  hint: 'Sentuh lampunya',
  response: 'Lampu menyala hangat.',
};

export const LAMP_STRINGS: Record<'en' | 'id', LampStrings> = { en: EN, id: ID };

export const INDONESIAN_LAMP_STRINGS: LampStrings = ID;
