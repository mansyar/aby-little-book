import { useCallback, useEffect, useState } from 'react';
import type { SpeechProvider } from './speech';
import type { WordSegment } from './words';

export interface UsePronunciationResult {
  /** The word currently being spoken, or null when idle. */
  speakingWord: string | null;
  /** True when no speech provider can speak; reading stays unblocked. */
  unavailable: boolean;
  /** Speaks one tapped word in isolation; cancels any active word first. */
  speakWord: (segment: WordSegment, lang: 'en' | 'id') => void;
  /** Cancels active pronunciation; the reader calls this on navigation commit. */
  cancel: () => void;
}

/**
 * Owns isolated word pronunciation against the focused SpeechProvider
 * contract: one word at a time, cancellation on navigation, and a calm
 * unblocked experience when speech is unavailable.
 */
export function usePronunciation({
  provider,
}: {
  provider: SpeechProvider;
}): UsePronunciationResult {
  const [speakingWord, setSpeakingWord] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(!provider.supported);

  useEffect(() => {
    provider.onEnd = () => {
      setSpeakingWord(null);
    };
  }, [provider]);

  const speakWord = useCallback(
    (segment: WordSegment, lang: 'en' | 'id') => {
      if (!provider.supported) {
        setUnavailable(true);
        return;
      }
      setSpeakingWord((current) => {
        if (current !== null) {
          provider.cancel();
        }
        provider.speak({ text: segment.spoken, lang });
        return segment.spoken;
      });
    },
    [provider],
  );

  const cancel = useCallback(() => {
    provider.cancel();
    setSpeakingWord(null);
  }, [provider]);

  return { speakingWord, unavailable, speakWord, cancel };
}
