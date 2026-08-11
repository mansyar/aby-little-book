/**
 * Focused speech-provider contract. The reader only ever talks to this
 * interface: one word at a time, never overlapping, cancellable, and quiet
 * when speech is unavailable.
 */
export interface SpeakRequest {
  text: string;
  lang: 'en' | 'id';
}

export interface SpeechProvider {
  /** Whether this provider can speak at all right now. */
  readonly supported: boolean;
  /** Speaks a single word in isolation; cancels any active utterance first. */
  speak(request: SpeakRequest): void;
  /** Stops any active utterance. */
  cancel(): void;
  /** True while a word is being spoken. */
  readonly speaking: boolean;
  /** Called when the current utterance finishes on its own. */
  onEnd: (() => void) | null;
}
