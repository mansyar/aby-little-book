import type { Locale } from '../app/locale';
import type { BookshelfStrings } from './bookshelfStrings';

export type BookCardState = 'new' | 'preparing' | 'ready' | 'in-progress' | 'complete';

export interface BookshelfViewProps {
  locale: Locale;
  strings: BookshelfStrings;
  storyTitle: { en: string; id: string };
  cardState: BookCardState;
  keepsake?: boolean;
  onOpen: () => void;
  onContinue: () => void;
  onReadAgain: () => void;
  onPrepare: () => void;
  onCaregiver: () => void;
}

// The celestial shelf. The book card's state decides its single primary
// action; status text is announced politely so every state is understood
// without motion.
export function BookshelfView({
  locale,
  strings,
  storyTitle,
  cardState,
  keepsake = false,
  onOpen,
  onContinue,
  onReadAgain,
  onPrepare,
  onCaregiver,
}: BookshelfViewProps): React.JSX.Element {
  const title = storyTitle[locale];
  return (
    <main className="bookshelf" aria-label={strings.shelfTitle}>
      <h1 className="bookshelf__app-title">Aby Little Book</h1>
      <section className="bookshelf__shelf" aria-label={strings.shelfTitle}>
        <article className="book-card" aria-labelledby="book-card-title">
          <h2 id="book-card-title" className="book-card__title">
            {title}
          </h2>
          <p className="book-card__status" aria-live="polite">
            {cardState === 'preparing' ? strings.preparing : ''}
          </p>
          {keepsake ? <p className="book-card__keepsake">{strings.keepsake}</p> : null}
          <div className="book-card__actions">
            {cardState === 'new' && (
              <button type="button" className="book-card__action" onClick={onPrepare}>
                {strings.prepare}
              </button>
            )}
            {cardState === 'ready' && (
              <button type="button" className="book-card__action" onClick={onOpen}>
                {strings.open}
              </button>
            )}
            {cardState === 'in-progress' && (
              <button type="button" className="book-card__action" onClick={onContinue}>
                {strings.continueLabel}
              </button>
            )}
            {cardState === 'complete' && (
              <button type="button" className="book-card__action" onClick={onReadAgain}>
                {strings.readAgain}
              </button>
            )}
          </div>
        </article>
      </section>
      <button type="button" className="bookshelf__caregiver" onClick={onCaregiver}>
        {strings.caregiver}
      </button>
    </main>
  );
}
