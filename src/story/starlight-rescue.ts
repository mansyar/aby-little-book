// The Starlight Rescue — the production story resource for the Initial Private
// MVP. Authoritative content: docs/STORY-SPEC.md (Draft 1, 2026-08-11).
// Structure: exactly 10 spreads per route, three authored astronauts (Aby,
// Maya, Niko), one route choice at S03 between the asteroid-garden and
// singing-starfield routes, converging at S07 and sharing the S10 ending.
// Story text is validated data (Zod contracts), never React code.

import type { Story } from './contracts';

export const STORY_ID = 'the-starlight-rescue';
export const STORY_RESOURCE_VERSION = '0.1.0';
export const STORY_PACKAGE_ID = `${STORY_ID}-${STORY_RESOURCE_VERSION}`;

export const story: Story = {
  id: STORY_ID,
  title: {
    en: 'The Starlight Rescue',
    id: 'Penyelamatan Cahaya Bintang',
  },
  version: STORY_RESOURCE_VERSION,
  startSpreadId: 'S01',
  choiceSpreadId: 'S03',
  convergenceSpreadId: 'S07',
  endingSpreadId: 'S10',
  astronauts: [
    {
      id: 'aby',
      grammar: {
        en: { name: 'Aby', subject: 'he', subjectCap: 'He', object: 'him', possessive: 'his' },
        id: {
          name: 'Aby',
          subject: 'dia',
          subjectCap: 'Dia',
          object: 'dia',
          possessive: 'miliknya',
        },
      },
    },
    {
      id: 'maya',
      grammar: {
        en: { name: 'Maya', subject: 'she', subjectCap: 'She', object: 'her', possessive: 'her' },
        id: {
          name: 'Maya',
          subject: 'dia',
          subjectCap: 'Dia',
          object: 'dia',
          possessive: 'miliknya',
        },
      },
    },
    {
      id: 'niko',
      grammar: {
        en: { name: 'Niko', subject: 'he', subjectCap: 'He', object: 'him', possessive: 'his' },
        id: {
          name: 'Niko',
          subject: 'dia',
          subjectCap: 'Dia',
          object: 'dia',
          possessive: 'miliknya',
        },
      },
    },
  ],
  spreads: {
    S01: {
      id: 'S01',
      title: { en: 'A Tiny Signal', id: 'Sinyal Kecil' },
      prose: {
        en: 'High above Earth, {name} watched the stars blink. Then a tiny light flashed, “Help!”',
        id: 'Jauh di atas Bumi, {name} memandang bintang-bintang berkelip. Lalu, sebuah cahaya kecil berkedip, “Tolong!”',
      },
      interaction: { kind: 'find-tap', target: 'signal', required: false },
    },
    S02: {
      id: 'S02',
      title: { en: 'The Star Lamp', id: 'Lampu Bintang' },
      prose: {
        en: '{subject_cap} packed {possessive} star lamp and took a slow breath. “The way is new, but someone needs me.”',
        id: '{name} menyiapkan lampu bintangnya dan menarik napas pelan. “Jalannya baru, tetapi ada yang membutuhkanku.”',
      },
      interaction: { kind: 'reveal', target: 'star-lamp', required: false },
    },
    S03: {
      id: 'S03',
      title: { en: 'Two Ways Through Space', id: 'Dua Jalan Menembus Angkasa' },
      prose: {
        en: 'The map glowed with two gentle paths. “Every way leads to the signal,” {name} said.',
        id: 'Peta itu menyala dengan dua jalan lembut. “Semua jalan menuju sinyal itu,” kata {name}.',
      },
      interaction: { kind: 'route-choice', target: 'route-map', required: true },
    },
    A04: {
      id: 'A04',
      title: { en: 'The Glowing Garden', id: 'Taman Bercahaya' },
      prose: {
        en: 'Flowers of crystal opened along the path, lighting the way with soft colors.',
        id: 'Bunga-bunga kristal bermekaran di sepanjang jalan, menerangi perjalanan dengan warna-warna lembut.',
      },
      interaction: { kind: 'find-tap', target: 'crystal', required: false },
    },
    A05: {
      id: 'A05',
      title: { en: 'The Winding Gap', id: 'Celah Berliku' },
      prose: {
        en: '{subject_cap} followed the glowing markings through the winding gap, one careful step at a time.',
        id: '{name} mengikuti tanda bercahaya melewati celah berliku, selangkah demi selangkah.',
      },
      interaction: { kind: 'find-tap', target: 'markings', required: false },
    },
    A06: {
      id: 'A06',
      title: { en: 'Lights Point Ahead', id: 'Cahaya Menunjuk ke Depan' },
      prose: {
        en: 'The garden lights leaned together, all pointing toward a quiet moon in the dark.',
        id: 'Cahaya-cahaya taman itu saling berdekatan, semua menunjuk ke sebuah bulan tenang di kegelapan.',
      },
      interaction: { kind: 'chain-reveal', target: 'garden-light', required: false },
    },
    B04: {
      id: 'B04',
      title: { en: 'The Singing Stars', id: 'Bintang-Bintang Bernyanyi' },
      prose: {
        en: 'A bright star traced a long arc across the sky, humming one clear note.',
        id: 'Sebuah bintang terang melintas membentuk lengkung panjang, bersenandung satu nada yang jernih.',
      },
      interaction: { kind: 'reveal', target: 'bright-star', required: false },
    },
    B05: {
      id: 'B05',
      title: { en: 'The Steady Song', id: 'Nyanyian yang Teratur' },
      prose: {
        en: 'The star sang its steady song, and another star answered, then another.',
        id: 'Bintang itu menyanyikan lagunya yang teratur, dan bintang lain menjawab, lalu bintang lainnya lagi.',
      },
      interaction: { kind: 'chain-reveal', target: 'pattern-star', required: false },
    },
    B06: {
      id: 'B06',
      title: { en: 'A Note Far Away', id: 'Sebuah Nada dari Jauh' },
      prose: {
        en: 'The song rippled across the quiet, and far away, a light point blinked on the moon.',
        id: 'Nyanyian itu bergetar melintasi keheningan, dan jauh di sana, setitik cahaya menyala di bulan.',
      },
      interaction: { kind: 'find-tap', target: 'ripple', required: false },
    },
    S07: {
      id: 'S07',
      title: { en: 'Lumi', id: 'Lumi' },
      prose: {
        en: 'A small round friend sat curled on the moon, glowing very faintly. “My light went out,” Lumi said.',
        id: 'Seorang teman kecil berbentuk bulat duduk meringkuk di bulan, bercahaya sangat redup. “Cahayaku padam,” kata Lumi.',
      },
      interaction: { kind: 'character-response', target: 'lumi', required: false },
    },
    S08: {
      id: 'S08',
      title: { en: 'Share the Light', id: 'Berbagi Cahaya' },
      prose: {
        en: '{subject_cap} held up {possessive} star lamp, and warm light wrapped around Lumi. “Stay near my light, Lumi. We can go together.”',
        id: '{name} mengangkat lampu bintangnya, dan cahaya hangat menyelimuti Lumi. “Tetaplah dekat cahayaku, Lumi. Kita bisa pergi bersama.”',
      },
      interaction: { kind: 'reveal', target: 'star-lamp', required: false },
    },
    S09: {
      id: 'S09',
      title: { en: 'The Warm Moon', id: 'Bulan yang Hangat' },
      prose: {
        en: 'Lumi’s family glowed on the warm golden moon, their lights greeting the traveler from far away.',
        id: 'Keluarga Lumi bercahaya di bulan hangat keemasan itu, cahaya mereka menyambut sang penjelajah dari kejauhan.',
      },
      interaction: { kind: 'chain-reveal', target: 'family-light', required: false },
    },
    S10: {
      id: 'S10',
      title: { en: 'Lumi Shines Again', id: 'Lumi Bersinar Kembali' },
      prose: {
        en: 'Lumi shone bright and warm, brighter than before. The courage of {name} had been one small light, shared all the way home.',
        id: 'Lumi bersinar terang dan hangat, lebih terang dari sebelumnya. Keberanian {name} adalah satu cahaya kecil, yang dibagikan sepanjang jalan pulang.',
      },
      interaction: { kind: 'character-response', target: 'lumi', required: false },
    },
  },
  routes: [
    {
      id: 'asteroid-garden',
      spreadIds: ['S01', 'S02', 'S03', 'A04', 'A05', 'A06', 'S07', 'S08', 'S09', 'S10'],
    },
    {
      id: 'singing-starfield',
      spreadIds: ['S01', 'S02', 'S03', 'B04', 'B05', 'B06', 'S07', 'S08', 'S09', 'S10'],
    },
  ],
};
