// Test-support fixtures for the story contracts. Task 4 replaces the story
// resources with the approved production content; these fixtures stay as the
// minimal valid baseline for schema and validator tests.

import type {
  AssetLayer,
  PackageManifest,
  PackageReadiness,
  SceneLayout,
  Spread,
  Story,
} from './contracts';

// Loose shape used by negative tests to corrupt a valid fixture the way
// unvalidated JSON would arrive at the schema boundary.
export type MutableSpread = {
  id: string;
  title: unknown;
  prose: Record<string, string>;
  interaction?: unknown;
};

export type MutableStory = {
  spreads: Record<string, MutableSpread>;
  routes: Array<{ id: string; spreadIds: string[] }>;
  astronauts: Array<{ id: string; grammar: unknown }>;
  version: unknown;
  endingSpreadId: unknown;
};

export function cloneStory(): MutableStory {
  return structuredClone(validStory) as unknown as MutableStory;
}

// Fixture access helpers guard noUncheckedIndexedAccess without assertions.
export function spreadOf(story: MutableStory, id: string): MutableSpread {
  const spread = story.spreads[id];
  if (spread === undefined) {
    throw new Error(`Fixture has no spread '${id}'.`);
  }
  return spread;
}

export function routeOf(story: MutableStory, index: number): { id: string; spreadIds: string[] } {
  const route = story.routes[index];
  if (route === undefined) {
    throw new Error(`Fixture has no route at index ${index}.`);
  }
  return route;
}

export function astronautOf(story: MutableStory, index: number): { id: string; grammar: unknown } {
  const astronaut = story.astronauts[index];
  if (astronaut === undefined) {
    throw new Error(`Fixture has no astronaut at index ${index}.`);
  }
  return astronaut;
}

export function storySpreadOf(story: Story, id: string): Spread {
  const spread = story.spreads[id];
  if (spread === undefined) {
    throw new Error(`Fixture has no spread '${id}'.`);
  }
  return spread;
}

export function storyAstronautOf<T>(story: { astronauts: T[] }, index: number): T {
  const astronaut = story.astronauts[index];
  if (astronaut === undefined) {
    throw new Error(`Fixture has no astronaut at index ${index}.`);
  }
  return astronaut;
}

export const validGrammar = {
  aby: {
    name: 'Aby',
    subject: 'he',
    subjectCap: 'He',
    object: 'him',
    possessive: 'his',
  },
  maya: {
    name: 'Maya',
    subject: 'she',
    subjectCap: 'She',
    object: 'her',
    possessive: 'her',
  },
  niko: {
    name: 'Niko',
    subject: 'he',
    subjectCap: 'He',
    object: 'him',
    possessive: 'his',
  },
};

// Indonesian grammar is locale-constant: scripts reuse the name and do not
// depend on gendered pronouns, per the story specification.
export const validIndonesianGrammar = {
  aby: { name: 'Aby', subject: 'dia', subjectCap: 'Dia', object: 'dia', possessive: 'miliknya' },
  maya: { name: 'Maya', subject: 'dia', subjectCap: 'Dia', object: 'dia', possessive: 'miliknya' },
  niko: { name: 'Niko', subject: 'dia', subjectCap: 'Dia', object: 'dia', possessive: 'miliknya' },
};

const ASTRONAUT_IDS = ['aby', 'maya', 'niko'] as const;

export const validStory: Story = {
  id: 'the-starlight-rescue',
  title: { en: 'The Starlight Rescue', id: 'Penyelamatan Cahaya Bintang' },
  version: '0.1.0',
  astronauts: ASTRONAUT_IDS.map((id) => ({
    id,
    grammar: {
      en: validGrammar[id],
      id: validIndonesianGrammar[id],
    },
  })),
  startSpreadId: 'S01',
  choiceSpreadId: 'S03',
  convergenceSpreadId: 'S07',
  endingSpreadId: 'S10',
  spreads: {
    S01: {
      id: 'S01',
      title: { en: 'A Tiny Signal', id: 'Sinyal Kecil' },
      prose: {
        en: 'High above Earth, {name} watched the stars blink. Then a tiny light flashed, \u201CHelp!\u201D',
        id: 'Jauh di atas Bumi, {name} memandang bintang-bintang berkelip. Lalu, sebuah cahaya kecil berkedip, \u201CTolong!\u201D',
      },
      interaction: { kind: 'find-tap', target: 'signal', required: false },
    },
    S02: {
      id: 'S02',
      title: { en: 'The Star Lamp', id: 'Lampu Bintang' },
      prose: {
        en: '{name} packed {possessive} star lamp and took a slow breath. \u201CThe way is new, but someone needs me.\u201D',
        id: '{name} membawa lampu bintang dan menarik napas perlahan. \u201CJalannya masih asing, tetapi ada yang membutuhkan bantuanku.\u201D',
      },
      interaction: { kind: 'reveal', target: 'star-lamp', required: false },
    },
    S03: {
      id: 'S03',
      title: { en: 'Two Ways Through Space', id: 'Dua Jalan di Angkasa' },
      prose: {
        en: 'The map showed two ways: a glowing asteroid garden and a singing starfield. Which way should {name} go?',
        id: 'Peta menunjukkan dua jalan: taman asteroid bercahaya dan hamparan bintang bernyanyi. Jalan mana yang sebaiknya dipilih {name}?',
      },
      interaction: { kind: 'route-choice', target: 'route-map', required: true },
    },
    A04: {
      id: 'A04',
      title: { en: 'The Glowing Garden', id: 'Taman Bercahaya' },
      prose: {
        en: '{name} floated into a garden of round, glowing stones. Tiny crystals opened like flowers along the way.',
        id: '{name} melayang memasuki taman batu bulat yang bercahaya. Kristal-kristal kecil terbuka seperti bunga di sepanjang jalan.',
      },
      interaction: { kind: 'find-tap', target: 'crystal', required: false },
    },
    A05: {
      id: 'A05',
      title: { en: 'The Winding Gap', id: 'Celah Berliku' },
      prose: {
        en: 'The straight way grew too narrow, so {name} paused and looked closely.',
        id: 'Jalan lurus semakin sempit, jadi {name} berhenti dan memperhatikan sekeliling.',
      },
      interaction: { kind: 'find-tap', target: 'markings', required: false },
    },
    A06: {
      id: 'A06',
      title: { en: 'Lights Point Ahead', id: 'Cahaya Menunjukkan Jalan' },
      prose: {
        en: 'Beyond the gap, the garden lights pointed toward a quiet moon.',
        id: 'Di balik celah, cahaya taman menunjuk ke arah bulan yang sunyi.',
      },
      interaction: { kind: 'chain-reveal', target: 'garden-light', required: false },
    },
    B04: {
      id: 'B04',
      title: { en: 'The Singing Stars', id: 'Bintang-Bintang Bernyanyi' },
      prose: {
        en: '{name} entered a wide field of twinkling stars. Each moving light made one soft, silvery note.',
        id: '{name} memasuki hamparan luas berisi bintang-bintang berkelip.',
      },
      interaction: { kind: 'reveal', target: 'bright-star', required: false },
    },
    B05: {
      id: 'B05',
      title: { en: 'The Steady Song', id: 'Lagu yang Teratur' },
      prose: {
        en: 'The notes came from every side, so {name} stopped and listened.',
        id: 'Nada terdengar dari segala arah, jadi {name} berhenti dan mendengarkan.',
      },
      interaction: { kind: 'chain-reveal', target: 'pattern-star', required: false },
    },
    B06: {
      id: 'B06',
      title: { en: 'A Note Far Away', id: 'Nada dari Kejauhan' },
      prose: {
        en: 'At the end of the song, a quiet moon appeared. From there came one small, trembling note.',
        id: 'Di ujung lagu, tampak sebuah bulan yang sunyi.',
      },
      interaction: { kind: 'find-tap', target: 'ripple', required: false },
    },
    S07: {
      id: 'S07',
      title: { en: 'Lumi', id: 'Lumi' },
      prose: {
        en: '{name} found Lumi curled on a little moon, with only a faint glow. \u201CMy light went out,\u201D Lumi whispered.',
        id: '{name} menemukan Lumi meringkuk di bulan kecil dengan cahaya yang redup. \u201CCahayaku padam,\u201D bisik Lumi.',
      },
      interaction: { kind: 'character-response', target: 'lumi', required: false },
    },
    S08: {
      id: 'S08',
      title: { en: 'Share the Light', id: 'Berbagi Cahaya' },
      prose: {
        en: '{name} held out the warm star lamp. \u201CStay near my light, Lumi. We can go together.\u201D',
        id: '{name} mengangkat lampu bintang yang hangat. \u201CTetaplah dekat cahayaku, Lumi. Kita bisa pergi bersama.\u201D',
      },
      interaction: { kind: 'reveal', target: 'star-lamp', required: false },
    },
    S09: {
      id: 'S09',
      title: { en: 'The Warm Moon', id: 'Bulan yang Hangat' },
      prose: {
        en: "Step by step, {name}'s lamp guided them to a warm, golden moon. Little lights were waiting there for Lumi.",
        id: 'Selangkah demi selangkah, lampu {name} menuntun mereka ke bulan keemasan yang hangat.',
      },
      interaction: { kind: 'chain-reveal', target: 'family-light', required: false },
    },
    S10: {
      id: 'S10',
      title: { en: 'Lumi Shines Again', id: 'Lumi Bersinar Kembali' },
      prose: {
        en: "When Lumi saw the waiting family, Lumi's light shone bright again. {name} smiled; courage had been one small light, shared all the way home.",
        id: 'Saat melihat keluarganya menunggu, cahaya Lumi kembali bersinar terang. {name} tersenyum; keberanian adalah satu cahaya kecil yang dibagikan sepanjang jalan pulang.',
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

export const validAssetLayers: AssetLayer[] = [
  {
    id: 'bg-space',
    role: 'background',
    order: 0,
    src: 'assets/layers/bg-space.webp',
    width: 2048,
    height: 1536,
    sha256: 'a'.repeat(64),
  },
  {
    id: 'char-aby',
    role: 'character',
    order: 1,
    src: 'assets/layers/char-aby.webp',
    width: 2048,
    height: 1536,
    sha256: 'b'.repeat(64),
  },
  {
    id: 'fx-glow',
    role: 'effect',
    order: 2,
    src: 'assets/layers/fx-glow.webp',
    width: 2048,
    height: 1536,
    sha256: 'c'.repeat(64),
    safeRegion: { x: 0.1, y: 0.2, width: 0.4, height: 0.3 },
  },
];

export const validLayouts: SceneLayout[] = [
  { id: 'ipad-landscape', layerIds: ['bg-space', 'char-aby', 'fx-glow'] },
  { id: 'phone-portrait', layerIds: ['bg-space', 'char-aby', 'fx-glow'] },
];

export const validManifest: PackageManifest = {
  packageId: 'the-starlight-rescue-0.1.0',
  storyId: 'the-starlight-rescue',
  storyVersion: '0.1.0',
  layouts: validLayouts,
  assets: validAssetLayers,
  totalBytes: 2048 * 1536 * 3,
};

export const validReadiness: PackageReadiness = {
  ready: true,
  packageId: 'the-starlight-rescue-0.1.0',
  storyVersion: '0.1.0',
  missingAssets: [],
  failedHashes: [],
};
