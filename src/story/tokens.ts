import type { AstronautGrammar, Locale, Story } from './contracts';

// Tokens use the authored snake_case spellings from the story specification.
export const PROSE_TOKENS = ['name', 'subject', 'subject_cap', 'object', 'possessive'] as const;
export type ProseToken = (typeof PROSE_TOKENS)[number];

const TOKEN_TO_GRAMMAR: Record<ProseToken, keyof AstronautGrammar> = {
  name: 'name',
  subject: 'subject',
  subject_cap: 'subjectCap',
  object: 'object',
  possessive: 'possessive',
};

const TOKEN_PATTERN = /\{([a-zA-Z_]+)\}/g;

// Resolves {name}, {subject}, {subject_cap}, {object}, and {possessive} tokens
// against an astronaut's grammar. Any remaining placeholder throws so that no
// unresolved token can ever reach rendering or pronunciation.
export function resolveTokens(text: string, grammar: AstronautGrammar): string {
  let resolved = text;
  for (const token of PROSE_TOKENS) {
    resolved = resolved.replaceAll(`{${token}}`, grammar[TOKEN_TO_GRAMMAR[token]]);
  }
  const leftover = resolved.match(TOKEN_PATTERN);
  if (leftover !== null) {
    throw new Error(`Unknown token: ${leftover[0]}`);
  }
  return resolved;
}

// Prose lines use the same resolution; the name documents the caller intent.
export function resolveProse(text: string, grammar: AstronautGrammar): string {
  return resolveTokens(text, grammar);
}

export function findAstronautGrammar(
  story: Story,
  astronautId: string,
  locale: Locale,
): AstronautGrammar {
  const astronaut = story.astronauts.find((candidate) => candidate.id === astronautId);
  if (astronaut === undefined) {
    throw new Error(`Unknown astronaut: ${astronautId}`);
  }
  return astronaut.grammar[locale];
}
