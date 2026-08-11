import { ErrorBoundary } from './app/ErrorBoundary';
import { DEFAULT_LOCALE, isLocale, type Locale } from './app/locale';
import { shellStrings } from './app/strings';
import { Spread08Preview } from './reader/Spread08Preview';

function isPreviewRequest(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return new URLSearchParams(window.location.search).get('preview') === '1';
}

function previewLocale(): Locale {
  const requested = new URLSearchParams(window.location.search).get('locale');
  return requested !== null && isLocale(requested) ? requested : DEFAULT_LOCALE;
}

export function App() {
  const strings = shellStrings(DEFAULT_LOCALE);
  if (isPreviewRequest()) {
    // Phase 4 development harness: the Spread 08 vertical slice. The real
    // reader composition replaces this branch in Phase 6.
    return (
      <ErrorBoundary locale={previewLocale()}>
        <Spread08Preview locale={previewLocale()} />
      </ErrorBoundary>
    );
  }
  return (
    <ErrorBoundary locale={DEFAULT_LOCALE}>
      <main className="app-shell" aria-label={strings.appName}>
        <h1 className="app-shell__title">{strings.appName}</h1>
        <p className="app-shell__status">{strings.initializing}</p>
      </main>
    </ErrorBoundary>
  );
}
