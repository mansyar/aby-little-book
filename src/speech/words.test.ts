import { describe, expect, it } from 'vitest';
import { eligibleWordSegments, splitWords } from './words';

describe('splitWords', () => {
  it('splits prose into visual segments while keeping punctuation', () => {
    const segments = splitWords('High above Earth, {name} watched the stars blink.');
    expect(segments.map((segment) => segment.text)).toEqual([
      'High',
      'above',
      'Earth,',
      '{name}',
      'watched',
      'the',
      'stars',
      'blink.',
    ]);
  });

  it('strips punctuation from the spoken value only', () => {
    const segments = splitWords('“Help!” whispered Lumi.');
    expect(segments.map((segment) => segment.spoken)).toEqual(['Help', 'whispered', 'Lumi']);
  });

  it('treats curly quotes and periods as punctuation', () => {
    const segments = splitWords('The way is new, but someone needs me.');
    expect(segments.at(-1)).toEqual({ text: 'me.', spoken: 'me', eligible: false });
  });
});

describe('eligibleWordSegments', () => {
  it('marks focus words and proper names as eligible in English', () => {
    const segments = eligibleWordSegments('Aby watched a tiny signal flash. Courage!', 'en');
    expect(segments.filter((segment) => segment.eligible).map((segment) => segment.spoken)).toEqual(
      ['Aby', 'signal', 'Courage'],
    );
  });

  it('marks focus words and names as eligible in Indonesian', () => {
    const segments = eligibleWordSegments('Aby melihat sinyal kecil. Keberanian!', 'id');
    expect(segments.filter((segment) => segment.eligible).map((segment) => segment.spoken)).toEqual(
      ['Aby', 'sinyal', 'Keberanian'],
    );
  });

  it('leaves ordinary words ineligible', () => {
    const segments = eligibleWordSegments('the stars blink', 'en');
    expect(segments.every((segment) => !segment.eligible)).toBe(true);
  });
});
