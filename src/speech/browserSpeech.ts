import type { SpeakRequest, SpeechProvider } from './speech';

export interface UtteranceLike {
  text: string;
  lang: string;
  onend: (() => void) | null;
}

export interface SpeechSynthesisLike {
  speak(utterance: UtteranceLike): void;
  cancel(): void;
}

export interface BrowserSpeechOptions {
  /** The platform speech synthesis object; null when unavailable. */
  synth: SpeechSynthesisLike | null;
  /** Creates the platform utterance; injectable for tests. */
  utter: (text: string, lang: string) => UtteranceLike;
}

/**
 * Browser SpeechSynthesis provider. One utterance at a time: speaking a new
 * word cancels the previous one so words never overlap. Words are spoken in
 * isolation through the platform voice for the requested language.
 */
export function browserSpeechProvider({ synth, utter }: BrowserSpeechOptions): SpeechProvider {
  let current: UtteranceLike | null = null;
  let onEnd: (() => void) | null = null;

  return {
    get supported() {
      return synth !== null;
    },
    speak(request: SpeakRequest) {
      if (synth === null) {
        return;
      }
      if (current !== null) {
        synth.cancel();
      }
      const utterance = utter(request.text, request.lang);
      current = utterance;
      utterance.onend = () => {
        current = null;
        const finish = onEnd;
        onEnd = null;
        finish?.();
      };
      synth.speak(utterance);
    },
    cancel() {
      if (synth === null) {
        return;
      }
      synth.cancel();
      current = null;
    },
    get speaking() {
      return current !== null;
    },
    set onEnd(callback: (() => void) | null) {
      onEnd = callback;
    },
    get onEnd() {
      return onEnd;
    },
  };
}

/**
 * Chooses the active provider: browser speech first, reviewed local clips
 * only when the browser cannot speak, nothing when both are unavailable.
 */
export function selectSpeechProvider(
  browser: SpeechProvider,
  clips: SpeechProvider,
): SpeechProvider | null {
  if (browser.supported) {
    return browser;
  }
  if (clips.supported) {
    return clips;
  }
  return null;
}
