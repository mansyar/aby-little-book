import { Component, type ErrorInfo, type ReactNode } from 'react';
import type { Locale } from './locale';
import { shellStrings } from './strings';

interface ErrorBoundaryProps {
  locale: Locale;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // Console-only visibility; the product collects no remote error reports.
    console.error('Aby Little Book error boundary caught:', error, info);
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      const strings = shellStrings(this.props.locale);
      return (
        <main className="app-shell" aria-label={strings.appName}>
          <h1 className="app-shell__title">{strings.appName}</h1>
          <h2 className="app-shell__status">{strings.errorTitle}</h2>
          <p className="app-shell__hint">{strings.errorMessage}</p>
        </main>
      );
    }
    return this.props.children;
  }
}
