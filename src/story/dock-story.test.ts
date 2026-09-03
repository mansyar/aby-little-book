import { describe, expect, it } from 'vitest';
import { interactionSchema, proseLineSchema, spreadSchema, storySchema } from './dock-contracts';

function prose(en: string, id: string): { en: string; id: string } {
  return { en, id };
}

function validSpread(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'S01',
    title: prose('Lanterns on the water', 'Lentera di atas air'),
    prose: prose('The night lake is still and dark.', 'Danau malam itu tenang dan gelap.'),
    ...overrides,
  };
}

function spreadEntries(count: number): Record<string, unknown> {
  const entries: Record<string, unknown> = {};
  for (let index = 1; index <= count; index += 1) {
    const id = `S${String(index).padStart(2, '0')}`;
    entries[id] = { ...validSpread(), id };
  }
  return entries;
}

function validStory(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'the-sharing-tide',
    title: prose('The Sharing Tide', 'Air Berbagi'),
    version: '0.1.0',
    characters: ['child', 'turtle'],
    startSpreadId: 'S01',
    choiceSpreadId: 'S04',
    convergenceSpreadId: 'S08',
    endingSpreadId: 'S10',
    spreads: spreadEntries(10),
    routes: [
      { id: 'reed-channel', spreadIds: ['S04', 'S05', 'S06', 'S07', 'S08', 'S09', 'S10'] },
      { id: 'lily-cove', spreadIds: ['S04', 'S05', 'S06', 'S07', 'S08', 'S09', 'S10'] },
    ],
    ...overrides,
  };
}

describe('dock story contract', () => {
  it('accepts a complete ten-spread converging story', () => {
    expect(storySchema.safeParse(validStory()).success).toBe(true);
  });

  it('requires prose in both locales for every spread', () => {
    expect(spreadSchema.safeParse(validSpread({ prose: { en: 'Still water.' } })).success).toBe(
      false,
    );
    expect(proseLineSchema.safeParse({ en: 'Still water.', id: '' }).success).toBe(false);
  });

  it('rejects a third sentence in either locale', () => {
    const threeSentences = 'One. Two. Three.';
    expect(
      spreadSchema.safeParse(validSpread({ prose: prose(threeSentences, 'Satu.') })).success,
    ).toBe(false);
    expect(
      spreadSchema.safeParse(validSpread({ prose: prose('One.', 'Satu. Dua. Tiga.') })).success,
    ).toBe(false);
  });

  it('rejects placeholder text', () => {
    for (const placeholder of ['TODO write prose', 'Lorem ipsum', 'Cerita {{title}}', 'XXX']) {
      expect(
        spreadSchema.safeParse(validSpread({ prose: prose(placeholder, 'Satu.') })).success,
      ).toBe(false);
    }
  });

  it('requires exactly two routes', () => {
    const oneRoute = validStory({ routes: [{ id: 'reed-channel', spreadIds: ['S04'] }] });
    expect(storySchema.safeParse(oneRoute).success).toBe(false);
  });

  it('caps the cast at three known characters', () => {
    const crowded = validStory({ characters: ['child', 'turtle', 'narrator', 'heron'] });
    expect(storySchema.safeParse(crowded).success).toBe(false);
    const stranger = validStory({ characters: ['child', 'robot'] });
    expect(storySchema.safeParse(stranger).success).toBe(false);
  });

  it('accepts guided tap and boarding interactions but rejects games', () => {
    expect(
      interactionSchema.safeParse({ kind: 'tap', target: 'turtle', required: false }).success,
    ).toBe(true);
    expect(
      interactionSchema.safeParse({ kind: 'board', target: 'boat', required: true }).success,
    ).toBe(true);
    expect(
      interactionSchema.safeParse({ kind: 'mini-game', target: 'balls', required: false }).success,
    ).toBe(false);
  });

  it('rejects a non-semantic version', () => {
    expect(storySchema.safeParse(validStory({ version: '1.0' })).success).toBe(false);
  });
});
