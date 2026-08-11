import { describe, expect, it } from 'vitest';
import { validStory } from './fixtures';
import { findAstronautGrammar, resolveTokens, resolveProse } from './tokens';

const aby = validStory.astronauts[0];
const maya = validStory.astronauts[1];
const niko = validStory.astronauts[2];

describe('token resolution', () => {
  it('resolves the name token for each astronaut', () => {
    const text = 'High above Earth, {name} watched the stars blink.';
    expect(resolveTokens(text, aby.grammar.en)).toBe('High above Earth, Aby watched the stars blink.');
    expect(resolveTokens(text, maya.grammar.en)).toBe('High above Earth, Maya watched the stars blink.');
    expect(resolveTokens(text, niko.grammar.en)).toBe('High above Earth, Niko watched the stars blink.');
  });

  it('resolves gendered pronouns to match the astronaut', () => {
    const text = '{subject_cap} packed {possessive} star lamp.';
    expect(resolveTokens(text, aby.grammar.en)).toBe('He packed his star lamp.');
    expect(resolveTokens(text, maya.grammar.en)).toBe('She packed her star lamp.');
    expect(resolveTokens(text, niko.grammar.en)).toBe('He packed his star lamp.');
  });

  it('resolves object and possessive tokens', () => {
    const text = 'Someone needs {object}. {name} helps {possessive} friend.';
    expect(resolveTokens(text, maya.grammar.en)).toBe('Someone needs her. Maya helps her friend.');
  });

  it('resolves the name token in Indonesian for every astronaut', () => {
    const text = 'Jauh di atas Bumi, {name} memandang bintang-bintang berkelip.';
    expect(resolveTokens(text, aby.grammar.id)).toBe('Jauh di atas Bumi, Aby memandang bintang-bintang berkelip.');
    expect(resolveTokens(text, niko.grammar.id)).toBe('Jauh di atas Bumi, Niko memandang bintang-bintang berkelip.');
  });

  it('throws on an unknown token so placeholders cannot reach rendering', () => {
    expect(() => resolveTokens('Hello {bogus}', aby.grammar.en)).toThrow(/unknown token/i);
  });
});

describe('personalized prose', () => {
  it('personalizes English prose per astronaut', () => {
    const prose = validStory.spreads.S02.prose.en;
    expect(resolveProse(prose, aby.grammar.en)).toBe(
      'Aby packed his star lamp and took a slow breath. \u201CThe way is new, but someone needs me.\u201D',
    );
    expect(resolveProse(prose, maya.grammar.en)).toBe(
      'Maya packed her star lamp and took a slow breath. \u201CThe way is new, but someone needs me.\u201D',
    );
  });

  it('leaves no placeholder identifiers in resolved prose', () => {
    for (const astronaut of [aby, maya, niko]) {
      for (const locale of ['en', 'id'] as const) {
        for (const spread of Object.values(validStory.spreads)) {
          const resolved = resolveProse(spread.prose[locale], astronaut.grammar[locale]);
          expect(resolved).not.toMatch(/\{[a-zA-Z_]+\}/);
        }
      }
    }
  });

  it('looks up grammar by astronaut id', () => {
    expect(findAstronautGrammar(validStory, 'maya', 'en').subject).toBe('she');
  });
});
