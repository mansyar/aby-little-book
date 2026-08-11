import { describe, expect, it } from 'vitest';
import { cloneStory, validStory } from './fixtures';
import type { Story } from './contracts';
import { validateRouteGraph } from './validators';

function errorCodes(story: Story): string[] {
  return validateRouteGraph(story)
    .filter((diagnostic) => diagnostic.severity === 'error')
    .map((diagnostic) => diagnostic.code);
}

describe('route graph validation', () => {
  it('accepts both complete converging routes', () => {
    expect(validateRouteGraph(validStory)).toEqual([]);
  });

  it('requires exactly ten spreads per route', () => {
    const broken = cloneStory();
    broken.routes[0].spreadIds = broken.routes[0].spreadIds.slice(0, 9);
    expect(errorCodes(broken as unknown as Story)).toContain('route-spread-count');
  });

  it('rejects a route referencing an unknown spread', () => {
    const broken = cloneStory();
    broken.routes[1].spreadIds = ['S01', 'S02', 'S03', 'B04', 'B05', 'B06', 'S07', 'S08', 'S09', 'Z99'];
    expect(errorCodes(broken as unknown as Story)).toContain('route-unknown-spread');
  });

  it('rejects a route with a dead end that never reaches the ending', () => {
    const broken = cloneStory();
    broken.routes[0].spreadIds = ['S01', 'S02', 'S03', 'A04', 'A05', 'A06', 'S07', 'S08', 'S09'];
    expect(errorCodes(broken as unknown as Story)).toContain('route-missing-ending');
  });

  it('rejects a route that skips the convergence spread', () => {
    const broken = cloneStory();
    broken.routes[1].spreadIds = ['S01', 'S02', 'S03', 'B04', 'B05', 'B06', 'S08', 'S09', 'S10', 'B04'];
    expect(errorCodes(broken as unknown as Story)).toContain('route-missing-convergence');
  });

  it('rejects a route containing a cycle', () => {
    const broken = cloneStory();
    broken.routes[0].spreadIds = ['S01', 'S02', 'S03', 'A04', 'A05', 'A06', 'A04', 'S07', 'S08', 'S09'];
    expect(errorCodes(broken as unknown as Story)).toContain('route-cycle');
  });

  it('requires both routes to share the same converged ending', () => {
    const broken = cloneStory();
    broken.endingSpreadId = 'S09';
    expect(errorCodes(broken as unknown as Story)).toContain('route-end-mismatch');
  });

  it('requires the choice spread to define the route-choice interaction', () => {
    const broken = cloneStory();
    delete broken.spreads.S03.interaction;
    expect(errorCodes(broken as unknown as Story)).toContain('choice-interaction-missing');
  });

  it('requires exactly the three authored astronauts', () => {
    const broken = cloneStory();
    broken.astronauts = broken.astronauts.slice(0, 2);
    expect(errorCodes(broken as unknown as Story)).toContain('astronaut-roster');
  });

  it('forbids gendered pronoun tokens in Indonesian prose', () => {
    const broken = cloneStory();
    broken.spreads.S01.prose.id = '{subject_cap} memandang bintang-bintang.';
    expect(errorCodes(broken as unknown as Story)).toContain('id-pronoun-token');
  });
});
