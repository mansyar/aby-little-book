// Prose rendered one word at a time so eligible focus words become isolated
// pronunciation controls. Each control is a semantic button marked
// data-interactive so the gesture layer never turns a word tap into a page
// turn. When speech is unavailable the words render as plain text: the story
// reads exactly the same, and no false affordance is offered.

import type { WordSegment } from '../speech/words';

export type ProseViewProps = {
  segments: readonly WordSegment[];
  speakingWord: string | null;
  unavailable: boolean;
  onSpeak: (segment: WordSegment) => void;
};

export function ProseView({
  segments,
  speakingWord,
  unavailable,
  onSpeak,
}: ProseViewProps): React.JSX.Element {
  // Stable keys without array indexes: segments are content-addressed with an
  // occurrence counter so repeated words (two 'Lumi.') stay distinct.
  const seen = new Map<string, number>();
  const keyOf = (text: string): string => {
    const count = seen.get(text) ?? 0;
    seen.set(text, count + 1);
    return `${text}-${count}`;
  };
  return (
    <p className="prose">
      {segments.map((segment) => {
        if (!segment.eligible || unavailable) {
          return <span key={keyOf(segment.text)}>{segment.text}</span>;
        }
        const speaking = speakingWord === segment.spoken;
        return (
          <button
            key={keyOf(segment.text)}
            type="button"
            className={`prose__word${speaking ? ' prose__word--speaking' : ''}`}
            data-interactive="true"
            aria-pressed={speaking}
            onClick={() => onSpeak(segment)}
          >
            {segment.text}
          </button>
        );
      })}
    </p>
  );
}
