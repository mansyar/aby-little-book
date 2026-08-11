import type { Locale } from '../app/locale';
import type { CompletionStrings } from './completionStrings';

export interface CompletionViewProps {
  strings: CompletionStrings;
  storyTitle: { en: string; id: string };
  locale: Locale;
  onReplay: () => void;
}

// The calm ending: title, one quiet sentence, and a replay door. No
// points, streaks, confetti, or reward-like escalation.
export function CompletionView({
  strings,
  storyTitle,
  locale,
  onReplay,
}: CompletionViewProps): React.JSX.Element {
  return (
    <main className="completion" aria-label={strings.completionTitle}>
      <h1 className="completion__title">{storyTitle[locale]}</h1>
      <h2 className="completion__heading">{strings.completionTitle}</h2>
      <p className="completion__message">{strings.completionMessage}</p>
      <button type="button" className="completion__replay" onClick={onReplay}>
        {strings.replay}
      </button>
    </main>
  );
}
