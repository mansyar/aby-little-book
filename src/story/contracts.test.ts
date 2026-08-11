import { describe, expect, it } from 'vitest';
import {
  astronautSchema,
  grammarSchema,
  interactionSchema,
  localizedTextSchema,
  proseLineSchema,
  spreadSchema,
  storySchema,
} from './contracts';
import { astronautOf, cloneStory, routeOf, spreadOf, validStory } from './fixtures';

describe('story document contract', () => {
  it('accepts a complete valid story document', () => {
    expect(storySchema.safeParse(validStory).success).toBe(true);
  });

  it('requires prose in both locales for every spread', () => {
    const broken = cloneStory();
    spreadOf(broken, 'S01').prose = { en: 'High above Earth.' };
    expect(spreadSchema.safeParse(spreadOf(broken, 'S01')).success).toBe(false);
    expect(storySchema.safeParse(broken).success).toBe(false);
  });

  it('rejects prose that is not a non-empty localized string', () => {
    expect(proseLineSchema.safeParse({ en: 'Only English', id: '' }).success).toBe(false);
    expect(localizedTextSchema.safeParse({ en: 42, id: 'x' }).success).toBe(false);
  });

  it('rejects a spread identifier outside the authored pattern', () => {
    const broken = cloneStory();
    spreadOf(broken, 'S01').id = 'S1';
    expect(spreadSchema.safeParse(spreadOf(broken, 'S01')).success).toBe(false);
  });

  it('rejects an unknown interaction kind', () => {
    const broken = cloneStory();
    spreadOf(broken, 'S01').interaction = { kind: 'mini-game', target: 'signal', required: false };
    expect(interactionSchema.safeParse(spreadOf(broken, 'S01').interaction).success).toBe(false);
    expect(storySchema.safeParse(broken).success).toBe(false);
  });

  it('requires the route choice to be a required interaction', () => {
    const broken = cloneStory();
    spreadOf(broken, 'S03').interaction = {
      kind: 'route-choice',
      target: 'route-map',
      required: false,
    };
    expect(interactionSchema.safeParse(spreadOf(broken, 'S03').interaction).success).toBe(false);
  });

  it('rejects a non-semantic version', () => {
    const broken = cloneStory();
    broken.version = '1.0';
    expect(storySchema.safeParse(broken).success).toBe(false);
  });

  it('rejects an astronaut whose grammar lacks a required pronoun', () => {
    const broken = cloneStory();
    broken.astronauts.splice(0, 1, {
      id: 'aby',
      grammar: {
        en: { name: 'Aby', subject: 'he', subjectCap: 'He', object: 'him' },
        id: {
          name: 'Aby',
          subject: 'dia',
          subjectCap: 'Dia',
          object: 'dia',
          possessive: 'miliknya',
        },
      },
    });
    expect(grammarSchema.safeParse(astronautOf(broken, 0).grammar).success).toBe(false);
    expect(astronautSchema.safeParse(astronautOf(broken, 0)).success).toBe(false);
    expect(storySchema.safeParse(broken).success).toBe(false);
  });

  it('rejects an unknown astronaut id', () => {
    const broken = cloneStory();
    astronautOf(broken, 0).id = 'zoe';
    expect(astronautSchema.safeParse(astronautOf(broken, 0)).success).toBe(false);
    expect(storySchema.safeParse(broken).success).toBe(false);
  });

  it('rejects a story with fewer than two routes', () => {
    const broken = cloneStory();
    broken.routes = [routeOf(validStory, 0)];
    expect(storySchema.safeParse(broken).success).toBe(false);
  });
});
