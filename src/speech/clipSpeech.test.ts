import { describe, expect, it } from 'vitest';
import { clipSpeechProvider } from './clipSpeech';

describe('clipSpeechProvider', () => {
  it('is supported only when every requested clip is present', () => {
    const provider = clipSpeechProvider({ clips: new Map([['signal', '/audio/signal.webm']]) });
    expect(provider.supported).toBe(true);
    const missing = clipSpeechProvider({ clips: new Map() });
    expect(missing.supported).toBe(false);
  });

  it('keeps the provider boundary inert until clips are activated', () => {
    const provider = clipSpeechProvider({ clips: new Map() });
    expect(provider.activated).toBe(false);
    // The boundary must not start playing anything on its own.
    expect(() => provider.speak({ text: 'signal', lang: 'en' })).not.toThrow();
    expect(provider.speaking).toBe(false);
  });

  it('reports a clip as ready only when its word is covered', () => {
    const provider = clipSpeechProvider({ clips: new Map([['sinyal', '/audio/sinyal.webm']]) });
    expect(provider.hasClip('sinyal')).toBe(true);
    expect(provider.hasClip('keberanian')).toBe(false);
  });
});
