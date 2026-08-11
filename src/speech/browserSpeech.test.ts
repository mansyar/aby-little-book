import { describe, expect, it, vi } from 'vitest';
import { browserSpeechProvider, selectSpeechProvider } from './browserSpeech';
import { clipSpeechProvider } from './clipSpeech';

function fakeSynth() {
  const spoken: Array<{ text: string; lang: string }> = [];
  const cancelled = vi.fn();
  const utterances: Array<{ text: string; lang: string; onend: (() => void) | null }> = [];
  const synth = {
    speaking: false,
    speak: vi.fn((utterance: { text: string; lang: string; onend: (() => void) | null }) => {
      spoken.push({ text: utterance.text, lang: utterance.lang });
      utterances.push(utterance);
      synth.speaking = true;
    }),
    cancel: vi.fn(() => {
      cancelled();
      synth.speaking = false;
    }),
    getVoices: vi.fn(() => []),
  };
  return { synth, spoken, cancelled, utterances };
}

describe('browserSpeechProvider', () => {
  it('speaks a word in isolation with the requested language', () => {
    const { synth, spoken } = fakeSynth();
    const provider = browserSpeechProvider({
      synth,
      utter: (text, lang) => ({ text, lang, onend: null }),
    });
    provider.speak({ text: 'signal', lang: 'en' });
    expect(synth.speak).toHaveBeenCalledOnce();
    expect(spoken).toEqual([{ text: 'signal', lang: 'en' }]);
  });

  it('cancels any active utterance before starting a new one (never overlaps)', () => {
    const { synth, cancelled, utterances } = fakeSynth();
    const provider = browserSpeechProvider({
      synth,
      utter: (text, lang) => ({ text, lang, onend: null }),
    });
    provider.speak({ text: 'first', lang: 'en' });
    provider.speak({ text: 'second', lang: 'id' });
    expect(cancelled).toHaveBeenCalledOnce();
    expect(utterances).toHaveLength(2);
    expect(utterances[1]?.text).toBe('second');
  });

  it('reports speaking state and notifies on end', () => {
    const { synth, utterances } = fakeSynth();
    const provider = browserSpeechProvider({
      synth,
      utter: (text, lang) => ({ text, lang, onend: null }),
    });
    expect(provider.speaking).toBe(false);
    provider.speak({ text: 'lumi', lang: 'id' });
    expect(provider.speaking).toBe(true);
    const onEnd = vi.fn();
    provider.onEnd = onEnd;
    utterances[0]?.onend?.();
    expect(onEnd).toHaveBeenCalledOnce();
    expect(provider.speaking).toBe(false);
  });

  it('cancels without error when nothing is speaking', () => {
    const { synth, cancelled } = fakeSynth();
    const provider = browserSpeechProvider({
      synth,
      utter: (text, lang) => ({ text, lang, onend: null }),
    });
    provider.cancel();
    expect(cancelled).toHaveBeenCalledOnce();
  });

  it('reports unsupported when the platform has no speech synthesis', () => {
    const provider = browserSpeechProvider({
      synth: null,
      utter: (text, lang) => ({ text, lang, onend: null }),
    });
    expect(provider.supported).toBe(false);
    expect(() => provider.speak({ text: 'signal', lang: 'en' })).not.toThrow();
  });
});

describe('selectSpeechProvider', () => {
  it('prefers the browser provider when speech is available', () => {
    const browser = browserSpeechProvider({
      synth: fakeSynth().synth,
      utter: (text, lang) => ({ text, lang, onend: null }),
    });
    const clips = clipSpeechProvider({ clips: new Map() });
    expect(selectSpeechProvider(browser, clips)).toBe(browser);
  });

  it('falls back to reviewed clips only when the browser cannot speak', () => {
    const browser = browserSpeechProvider({
      synth: null,
      utter: () => ({ text: '', lang: '', onend: null }),
    });
    const clips = clipSpeechProvider({ clips: new Map([['signal', '/audio/signal.webm']]) });
    expect(selectSpeechProvider(browser, clips)).toBe(clips);
  });

  it('returns no provider when neither browser speech nor clips are available', () => {
    const browser = browserSpeechProvider({
      synth: null,
      utter: () => ({ text: '', lang: '', onend: null }),
    });
    const clips = clipSpeechProvider({ clips: new Map() });
    expect(selectSpeechProvider(browser, clips)).toBeNull();
  });
});
