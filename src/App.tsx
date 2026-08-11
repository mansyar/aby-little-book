import { ErrorBoundary } from './app/ErrorBoundary';
import { DEFAULT_LOCALE } from './app/locale';
import { shellStrings } from './app/strings';

export function App() {
  const strings = shellStrings(DEFAULT_LOCALE);
  return (
    <ErrorBoundary locale={DEFAULT_LOCALE}>
      <main className="app-shell" aria-label={strings.appName}>
        <h1 className="app-shell__title">{strings.appName}</h1>
        <p className="app-shell__status">{strings.initializing}</p>
      </main>
    </ErrorBoundary>
  );
}
