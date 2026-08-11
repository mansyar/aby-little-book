import type { SpeakRequest, SpeechProvider } from './speech';

export interface ClipSpeechOptions {
  /** Reviewed word clips keyed by spoken form. */
  clips: ReadonlyMap<string, string>;
}

export interface ClipSpeechProvider extends SpeechProvider {
  /** Whether the fallback is active. Stays false until iPad evidence requires it. */
  readonly activated: boolean;
  /** Whether a reviewed clip exists for the given word. */
  hasClip(word: string): boolean;
}

/**
 * Reviewed-clip provider boundary. The fallback is inert by design: nothing
 * plays until `activated` becomes true, which only happens when physical-iPad
 * evidence shows the browser provider is inadequate (spec: reviewed local
 * clips fallback only if needed). Until then it only reports coverage.
 */
export function clipSpeechProvider({ clips }: ClipSpeechOptions): ClipSpeechProvider {
  return {
    get supported() {
      return clips.size > 0;
    },
    get activated() {
      return false;
    },
    speak(_request: SpeakRequest) {
      // Inert boundary: no playback until activated by evidence.
    },
    cancel() {},
    get speaking() {
      return false;
    },
    onEnd: null,
    hasClip(word: string) {
      return clips.has(word);
    },
  };
}
