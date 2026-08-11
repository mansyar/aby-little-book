import { describe, expect, it } from 'vitest';
import { cloneStory, validStory } from './fixtures';
import {
  astronautSchema,
  grammarSchema,
  interactionSchema,
  localizedTextSchema,
  proseLineSchema,
  spreadSchema,
  storySchema,
} from './contracts';

describe('story document contract', () => {
  it('accepts a complete valid story document', () => {
    expect(storySchema.safeParse(validStory).success).toBe(true);
  });

  it('requires prose in both locales for every spread', () => {
    const broken = cloneStory();
    broken.spreads.S01.prose = { en: 'High above Earth.' };
    expect(spreadSchema.safeParse(broken.spreads.S01).success).toBe(false);
    expect(storySchema.safeParse(broken).success).toBe(false);
  });

  it('rejects prose that is not a non-empty localized string', () => {
    expect(proseLineSchema.safeParse({ en: 'Only English', id: '' }).success).toBe(false);
    expect(localizedTextSchema.safeParse({ en: 42, id: 'x' }).success).toBe(false);
  });

  it('rejects a spread identifier outside the authored pattern', () => {
    const broken = cloneStory();
    broken.spreads.S01.id = 'S1';
    expect(spreadSchema.safeParse(broken.spreads.S01).success).toBe(false);
  });

  it('rejects an unknown interaction kind', () => {
    const broken = cloneStory();
    broken.spreads.S01.interaction = { kind: 'mini-game', target: 'signal', required: false };
    expect(interactionSchema.safeParse(broken.spreads.S01.interaction).success).toBe(false);
    expect(storySchema.safeParse(broken).success).toBe(false);
  });

  it('requires the route choice to be a required interaction', () => {
    const broken = cloneStory();
    broken.spreads.S03.interaction = { kind: 'route-choice', target: 'route-map', required: false };
    expect(interactionSchema.safeParse(broken.spreads.S03.interaction).success).toBe(false);
  });

  it('rejects a non-semantic version', () => {
    const broken = cloneStory();
    broken.version = '1.0';
    expect(storySchema.safeParse(broken).success).toBe(false);
  });

  it('rejects an astronaut whose grammar lacks a required pronoun', () => {
    const broken = cloneStory();
    broken.astronauts[0] = {
      id: 'aby',
      grammar: {
        en: { name: 'Aby', subject: 'he', subjectCap: 'He', object: 'him' },
        id: { name: 'Aby', subject: 'dia', subjectCap: 'Dia', object: 'dia', possessive: 'miliknya' },
      },
    };
    expect(grammarSchema.safeParse(broken.astronauts[0].grammar).success).toBe(false);
    expect(astronautSchema.safeParse(broken.astronauts[0]).success).toBe(false);
    expect(storySchema.safeParse(broken).success).toBe(false);
  });

  it('rejects an unknown astronaut id', () => {
    const broken = cloneStory();
    broken.astronauts[0].id = 'zoe';
    expect(astronautSchema.safeParse(broken.astronauts[0]).success).toBe(false);
    expect(storySchema.safeParse(broken).success).toBe(false);
  });

  it('rejects a story with fewer than two routes', () => {
    const broken = cloneStory();
    broken.routes = [validStory.routes[0]];
    expect(storySchema.safeParse(broken).success).toBe(false);
  });
});
