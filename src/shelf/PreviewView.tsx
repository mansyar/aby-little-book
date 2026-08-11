import type { Locale } from '../app/locale';
import type { BookshelfStrings } from './bookshelfStrings';

export interface PreviewViewProps {
  strings: BookshelfStrings;
  storyTitle: { en: string; id: string };
  locale: Locale;
  onBegin: () => void;
}

// The portal preview: the story's title and one calm action. Reading starts
// without demands, rewards, or hurry.
export function PreviewView({
  strings,
  storyTitle,
  locale,
  onBegin,
}: PreviewViewProps): React.JSX.Element {
  return (
    <main className="preview" aria-label={strings.shelfTitle}>
      <h1 className="preview__title">{storyTitle[locale]}</h1>
      <button type="button" className="preview__begin" onClick={onBegin}>
        {strings.begin}
      </button>
    </main>
  );
}
