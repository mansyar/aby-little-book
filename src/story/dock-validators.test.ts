import { describe, expect, it } from 'vitest';
import type { Story } from './dock-contracts';
import { validateDockRouteGraph } from './dock-validators';

function prose(en: string, id: string): { en: string; id: string } {
  return { en, id };
}

function validStory(): Story {
  const spreads: Story['spreads'] = {};
  for (let index = 1; index <= 10; index += 1) {
    const id = `S${String(index).padStart(2, '0')}`;
    spreads[id] = {
      id,
      title: prose('Lanterns', 'Lentera'),
      prose: prose('Still water.', 'Air tenang.'),
    };
  }
  const choice = spreads.S04;
  if (choice !== undefined) {
    choice.interaction = { kind: 'route-choice', target: 'channel', required: true };
  }
  const routeSpreads = ['S04', 'S05', 'S06', 'S07', 'S08', 'S09', 'S10'];
  return {
    id: 'the-sharing-tide',
    title: prose('The Sharing Tide', 'Air Berbagi'),
    version: '0.1.0',
    characters: ['child', 'turtle'],
    startSpreadId: 'S01',
    choiceSpreadId: 'S04',
    convergenceSpreadId: 'S08',
    endingSpreadId: 'S10',
    spreads,
    routes: [
      { id: 'reed-channel', spreadIds: routeSpreads },
      { id: 'lily-cove', spreadIds: routeSpreads },
    ],
  };
}

describe('dock route graph validator', () => {
  it('accepts a converging ten-spread story', () => {
    expect(validateDockRouteGraph(validStory())).toEqual([]);
  });

  it('rejects a route that skips convergence or the ending', () => {
    const story = validStory();
    story.routes[0] = { id: 'reed-channel', spreadIds: ['S04', 'S05', 'S09', 'S10'] };
    const codes = validateDockRouteGraph(story).map((diagnostic) => diagnostic.code);
    expect(codes).toContain('route-missing-convergence');
    const badEnding = validStory();
    badEnding.routes[1] = { id: 'lily-cove', spreadIds: ['S04', 'S08', 'S09'] };
    expect(validateDockRouteGraph(badEnding).map((diagnostic) => diagnostic.code)).toContain(
      'route-missing-ending',
    );
  });

  it('rejects unknown spread references and revisits', () => {
    const story = validStory();
    story.routes[0] = { id: 'reed-channel', spreadIds: ['S04', 'S99', 'S04', 'S08', 'S10'] };
    const codes = validateDockRouteGraph(story).map((diagnostic) => diagnostic.code);
    expect(codes).toContain('route-unknown-spread');
    expect(codes).toContain('route-cycle');
  });

  it('requires the route choice at the choice spread', () => {
    const story = validStory();
    const choice = story.spreads.S04;
    if (choice !== undefined) {
      choice.interaction = { kind: 'tap', target: 'turtle', required: false };
    }
    expect(validateDockRouteGraph(story).map((diagnostic) => diagnostic.code)).toContain(
      'choice-interaction-missing',
    );
  });
});
