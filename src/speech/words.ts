/**
 * Focus words from STORY-SPEC section 14.2 (word-audio), plus the
 * pronunciation-sensitive proper names (Aby, Maya, Niko, Lumi) which are
 * spelled the same in both locales. Only single-word entries can be spoken in
 * isolation; multi-word phrases ("star lamp") stay out of the word-level set.
 */
const ELIGIBLE_WORDS: Record<'en' | 'id', ReadonlySet<string>> = {
  en: new Set([
    'aby',
    'maya',
    'niko',
    'lumi',
    'astronaut',
    'signal',
    'flashed',
    'asteroid',
    'garden',
    'crystals',
    'narrow',
    'winding',
    'revealed',
    'starfield',
    'twinkling',
    'silvery',
    'steady',
    'trembling',
    'faint',
    'whispered',
    'guided',
    'courage',
  ]),
  id: new Set([
    'aby',
    'maya',
    'niko',
    'lumi',
    'astronaut',
    'sinyal',
    'berkedip',
    'asteroid',
    'taman',
    'kristal',
    'sempit',
    'berliku',
    'menunjukkan',
    'hamparan',
    'berkelip',
    'nada',
    'teratur',
    'bergetar',
    'redup',
    'berbisik',
    'menuntun',
    'keberanian',
  ]),
};

export interface WordSegment {
  /** The visible text, including punctuation. */
  text: string;
  /** The value spoken in isolation, punctuation stripped. */
  spoken: string;
  /** Whether the word carries an isolated pronunciation control. */
  eligible: boolean;
}

const PUNCTUATION = /[^\p{L}\p{N}’']+/gu;

/** Splits prose into word segments; punctuation stays visual-only. */
export function splitWords(prose: string): WordSegment[] {
  return prose
    .split(/\s+/)
    .filter((token) => token.length > 0)
    .map((token) => ({ text: token, spoken: token.replace(PUNCTUATION, ''), eligible: false }));
}

/** Marks segments whose spoken form is an eligible focus word or proper name. */
export function eligibleWordSegments(prose: string, locale: 'en' | 'id'): WordSegment[] {
  const eligible = ELIGIBLE_WORDS[locale];
  return splitWords(prose).map((segment) => ({
    ...segment,
    eligible: eligible.has(segment.spoken.toLowerCase()),
  }));
}
