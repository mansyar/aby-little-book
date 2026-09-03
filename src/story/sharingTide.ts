import type { Spread, Story } from './dock-contracts';
import { slice, sliceMeta } from './slice';

// The complete Sharing Tide: the approved 3-spread slice (S01-S03) plus the
// safe branch (S04), one spread pair per route (A05/A06 reed-channel,
// B05/B06 lily-cove), and the converged tail (S08/S10). Ten spreads, two
// complete routes, one calm ending. Agent-drafted EN + ID prose; fluent-adult
// review lands in Phase 7 before release.
//
// The story ships inside package the-sharing-tide-0.1.0 with no geometry
// change: every spread stages subjects from the five approved scenes
// (dock, boat, turtle, child, lake_props), so no pipeline rerun is needed.

const head: Record<string, Spread> = Object.fromEntries(slice.map((spread) => [spread.id, spread]));

const tail: Record<string, Spread> = {
  S04: {
    id: 'S04',
    title: { en: 'Which Way Across?', id: 'Lewat Jalan Mana?' },
    prose: {
      en: 'Two paths cross the night lake. Which one shall we take?',
      id: 'Ada dua jalan melintasi danau malam. Kita pilih yang mana?',
    },
    interaction: { kind: 'route-choice', target: 'lake-choice', required: true },
  },
  A05: {
    id: 'A05',
    title: { en: 'Tall Reeds', id: 'Gelagah Tinggi' },
    prose: {
      en: 'Tall reeds whisper in the dark. The little turtle hides behind a leaf.',
      id: 'Gelagah tinggi berbisik dalam gelap. Kura-kura kecil bersembunyi di balik daun.',
    },
    interaction: { kind: 'tap', target: 'turtle', required: false },
  },
  A06: {
    id: 'A06',
    title: { en: 'Shared Light', id: 'Cahaya Bersama' },
    prose: {
      en: 'We lift the lantern high. Its warm light is for everyone.',
      id: 'Kami mengangkat lentera tinggi-tinggi. Cahayanya yang hangat untuk semua.',
    },
    interaction: { kind: 'tap', target: 'lantern', required: false },
  },
  B05: {
    id: 'B05',
    title: { en: 'Lily Pads', id: 'Daun Teratai' },
    prose: {
      en: 'Green lily pads float like plates. The turtle climbs up to rest.',
      id: 'Daun teratai hijau mengapung seperti piring. Kura-kura naik untuk beristirahat.',
    },
    interaction: { kind: 'tap', target: 'turtle', required: false },
  },
  B06: {
    id: 'B06',
    title: { en: 'Cake Crumbs', id: 'Remah Kue' },
    prose: {
      en: 'We save two crumbs of cake. One for you, one for me.',
      id: 'Kita menyimpan dua remah kue. Satu untukmu, satu untukku.',
    },
    interaction: { kind: 'tap', target: 'cake', required: false },
  },
  S08: {
    id: 'S08',
    title: { en: 'The Other Shore', id: 'Tepi Seberang' },
    prose: {
      en: 'Both paths reach the far shore. Lanterns are waiting there.',
      id: 'Kedua jalan tiba di tepi seberang. Lentera-lentera menunggu di sana.',
    },
  },
  S10: {
    id: 'S10',
    title: { en: 'Home by Lantern Light', id: 'Pulang Diterangi Lentera' },
    prose: {
      en: 'We float slowly home. The lake keeps our story safe.',
      id: 'Kami pulang perlahan. Danau menjaga cerita kita.',
    },
  },
};

export const sharingTide: Story = {
  id: sliceMeta.storyId,
  title: sliceMeta.title,
  version: sliceMeta.version,
  characters: ['child', 'turtle', 'narrator'],
  startSpreadId: 'S01',
  choiceSpreadId: 'S04',
  convergenceSpreadId: 'S08',
  endingSpreadId: 'S10',
  spreads: { ...head, ...tail },
  routes: [
    {
      id: 'reed-channel',
      title: { en: 'Reed Channel', id: 'Jalur Gelagah' },
      spreadIds: ['S04', 'A05', 'A06', 'S08', 'S10'],
    },
    {
      id: 'lily-cove',
      title: { en: 'Lily Cove', id: 'Teluk Teratai' },
      spreadIds: ['S04', 'B05', 'B06', 'S08', 'S10'],
    },
  ],
};
