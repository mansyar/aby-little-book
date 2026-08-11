import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { SpeechProvider } from './speech';
import { usePronunciation } from './usePronunciation';

function providerStub(overrides: Partial<SpeechProvider> = {}): SpeechProvider {
  return {
    supported: true,
    speak: vi.fn(),
    cancel: vi.fn(),
    speaking: false,
    onEnd: null,
    ...overrides,
  };
}

function segment(word: string) {
  return { text: word, spoken: word, eligible: false };
}

describe('usePronunciation', () => {
  it('speaks a tapped word in isolation through the provider', () => {
    const provider = providerStub();
    const { result } = renderHook(() => usePronunciation({ provider }));
    act(() => {
      result.current.speakWord(segment('signal'), 'en');
    });
    expect(provider.speak).toHaveBeenCalledExactlyOnceWith({ text: 'signal', lang: 'en' });
    expect(result.current.speakingWord).toBe('signal');
  });

  it('cancels the previous word before speaking a new one (non-overlap)', () => {
    const provider = providerStub();
    const { result } = renderHook(() => usePronunciation({ provider }));
    act(() => {
      result.current.speakWord(segment('first'), 'en');
    });
    act(() => {
      result.current.speakWord(segment('second'), 'en');
    });
    expect(provider.cancel).toHaveBeenCalledOnce();
    expect(provider.speak).toHaveBeenCalledTimes(2);
  });

  it('returns to idle when the provider reports the word finished', () => {
    const provider = providerStub();
    const { result } = renderHook(() => usePronunciation({ provider }));
    act(() => {
      result.current.speakWord(segment('lumi'), 'id');
    });
    expect(result.current.speakingWord).toBe('lumi');
    act(() => {
      provider.onEnd?.();
    });
    expect(result.current.speakingWord).toBeNull();
  });

  it('cancels active pronunciation on demand (navigation commit)', () => {
    const provider = providerStub();
    const { result } = renderHook(() => usePronunciation({ provider }));
    act(() => {
      result.current.speakWord(segment('signal'), 'en');
    });
    act(() => {
      result.current.cancel();
    });
    expect(provider.cancel).toHaveBeenCalledOnce();
    expect(result.current.speakingWord).toBeNull();
  });

  it('keeps reading unblocked when speech is unavailable', () => {
    const provider = providerStub({ supported: false, speak: vi.fn() });
    const { result } = renderHook(() => usePronunciation({ provider }));
    expect(result.current.unavailable).toBe(true);
    act(() => {
      result.current.speakWord(segment('signal'), 'en');
    });
    expect(provider.speak).not.toHaveBeenCalled();
    expect(result.current.speakingWord).toBeNull();
  });
});
