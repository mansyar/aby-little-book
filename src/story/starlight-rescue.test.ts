import { describe, expect, it } from 'vitest';
import { storySchema } from './contracts';
import { STORY_PACKAGE_ID, STORY_RESOURCE_VERSION, story } from './starlight-rescue';
import { resolveProse } from './tokens';
import { validateRouteGraph } from './validators';

describe('the Starlight Rescue production story', () => {
  it('is a complete valid story document', () => {
    expect(storySchema.safeParse(story).success).toBe(true);
  });

  it('has a valid route graph with both routes converging', () => {
    expect(validateRouteGraph(story)).toEqual([]);
  });

  it('exposes versioned package metadata that matches the story', () => {
    expect(story.id).toBe('the-starlight-rescue');
    expect(story.version).toBe(STORY_RESOURCE_VERSION);
    expect(STORY_PACKAGE_ID).toBe(`the-starlight-rescue-${STORY_RESOURCE_VERSION}`);
  });

  it('leaves no placeholder identifiers in any resolved prose', () => {
    for (const astronaut of story.astronauts) {
      for (const locale of ['en', 'id'] as const) {
        for (const spread of Object.values(story.spreads)) {
          const resolved = resolveProse(spread.prose[locale], astronaut.grammar[locale]);
          expect(resolved).not.toMatch(/\{[a-zA-Z_]+\}/);
          expect(resolved).not.toMatch(/TODO|lorem|placeholder|tbd/i);
        }
      }
    }
  });

  it('contains the approved production structure', () => {
    expect(Object.keys(story.spreads)).toHaveLength(13);
    expect(story.astronauts).toHaveLength(3);
    expect(story.routes).toHaveLength(2);
    for (const route of story.routes) {
      expect(route.spreadIds).toHaveLength(10);
      expect(route.spreadIds[0]).toBe(story.startSpreadId);
      expect(route.spreadIds[route.spreadIds.length - 1]).toBe(story.endingSpreadId);
      expect(route.spreadIds).toContain(story.choiceSpreadId);
      expect(route.spreadIds).toContain(story.convergenceSpreadId);
    }
  });
});
