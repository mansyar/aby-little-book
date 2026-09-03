import type { Locale } from '../app/locale';
import type { DockStrings } from './dockStrings';

// The boat card states mirror the old book card: the dock home's single
// primary action follows the story state, so a child always sees one
// obvious next step. "New" and "preparing" gate on the explicit offline
// preparation; boarding is only offered once the package is ready.
export type BoatState = 'new' | 'preparing' | 'ready' | 'in-progress' | 'complete';

export interface DockHomeViewProps {
  locale: Locale;
  strings: DockStrings;
  storyTitle: { en: string; id: string };
  cardState: BoatState;
  keepsake?: boolean;
  onPrepare: () => void;
  onOpen: () => void;
  onContinue: () => void;
  onReadAgain: () => void;
  onCaregiver: () => void;
}

export function DockHomeView({
  locale,
  strings,
  storyTitle,
  cardState,
  keepsake = false,
  onPrepare,
  onOpen,
  onContinue,
  onReadAgain,
  onCaregiver,
}: DockHomeViewProps): React.JSX.Element {
  const title = storyTitle[locale];
  return (
    <main className="dock" aria-label={strings.dockTitle}>
      <h1 className="dock__app-title">Aby Little Book</h1>
      <p className="dock__place">{strings.dockTitle}</p>
      <section className="dock__shore" aria-label={strings.dockTitle}>
        <article className="boat-card" aria-labelledby="boat-card-title">
          <h2 id="boat-card-title" className="boat-card__title">
            {title}
          </h2>
          <p className="boat-card__status" aria-live="polite">
            {cardState === 'preparing' ? strings.preparing : ''}
          </p>
          {keepsake ? <p className="boat-card__keepsake">{strings.keepsake}</p> : null}
          <div className="boat-card__actions">
            {cardState === 'new' && (
              <button type="button" className="boat-card__action" onClick={onPrepare}>
                {strings.prepare}
              </button>
            )}
            {cardState === 'ready' && (
              <button type="button" className="boat-card__action" onClick={onOpen}>
                {strings.open}
              </button>
            )}
            {cardState === 'in-progress' && (
              <button type="button" className="boat-card__action" onClick={onContinue}>
                {strings.continueLabel}
              </button>
            )}
            {cardState === 'complete' && (
              <button type="button" className="boat-card__action" onClick={onReadAgain}>
                {strings.readAgain}
              </button>
            )}
          </div>
        </article>
      </section>
      <button type="button" className="dock__caregiver" onClick={onCaregiver}>
        {strings.caregiver}
      </button>
    </main>
  );
}
