import type { Spread } from './dock-contracts';

// Slice-first prose: the opening linear run (dock boarding, turtle meeting,
// first sharing beat). Agent-drafted; fluent-adult EN/ID review is a Phase 8
// gate before private release. Full 10-spread assembly lands in Phase 6.

export const sliceMeta = {
  storyId: 'the-sharing-tide',
  title: { en: 'The Sharing Tide', id: 'Air Pasang Berbagi' },
  version: '0.1.0',
} as const;

export const slice: Spread[] = [
  {
    id: 'S01',
    title: { en: 'Lanterns on the Water', id: 'Lentera di Atas Air' },
    prose: {
      en: 'The night lake is still. A little boat waits by the dock.',
      id: 'Danau malam itu tenang. Sebuah perahu kecil menunggu di dermaga.',
    },
    interaction: { kind: 'board', target: 'boat', required: true },
  },
  {
    id: 'S02',
    title: { en: 'A Shy New Friend', id: 'Teman Baru yang Pemalu' },
    prose: {
      en: 'Someone peeks from behind a lily leaf. It is a shy baby turtle.',
      id: 'Seseorang mengintip dari balik daun teratai. Ia bayi penyu yang pemalu.',
    },
  },
  {
    id: 'S03',
    title: { en: 'Half for You', id: 'Separuh untuk Kamu' },
    prose: {
      en: 'The child breaks the warm cake in two. Half for you, little turtle.',
      id: 'Anak itu membagi dua kue hangat. Separuh untukmu, Penyu kecil.',
    },
    interaction: { kind: 'tap', target: 'cake', required: false },
  },
];
