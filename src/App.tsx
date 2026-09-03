import { ErrorBoundary } from './app/ErrorBoundary';
import { DEFAULT_LOCALE, isLocale, type Locale } from './app/locale';
import { DockApp } from './dock/DockApp';
import { Spread08Preview } from './reader/Spread08Preview';
import type { RouteId } from './story/sharingTide';
import { DockSlicePreview } from './three/DockSlicePreview';
import { STORY_STAGING, type StorySpreadId } from './three/staging';

const STORY_SCENE_IDS = Object.keys(STORY_STAGING);

function isPreviewRequest(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return new URLSearchParams(window.location.search).get('preview') === '1';
}

function scenePreviewId(): StorySpreadId | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const requested = new URLSearchParams(window.location.search).get('scene');
  return (STORY_SCENE_IDS as string[]).includes(requested ?? '')
    ? (requested as StorySpreadId)
    : null;
}

function scenePreviewRoute(): RouteId {
  if (typeof window === 'undefined') {
    return 'reed-channel';
  }
  return new URLSearchParams(window.location.search).get('route') === 'lily-cove'
    ? 'lily-cove'
    : 'reed-channel';
}

function scenePreviewBeat(): 'rest' | 'arrive' {
  if (typeof window === 'undefined') {
    return 'rest';
  }
  return new URLSearchParams(window.location.search).get('beat') === 'arrive' ? 'arrive' : 'rest';
}

function previewLocale(): Locale {
  const requested = new URLSearchParams(window.location.search).get('locale');
  return requested !== null && isLocale(requested) ? requested : DEFAULT_LOCALE;
}

// The book opens on the Starlit Dock. The two query branches are development
// harnesses (slice evidence, Spread 08 reference), not reader paths.
export function App(): React.JSX.Element {
  const sceneId = scenePreviewId();
  if (sceneId !== null) {
    return (
      <ErrorBoundary locale={previewLocale()}>
        <DockSlicePreview
          spreadId={sceneId}
          route={scenePreviewRoute()}
          locale={previewLocale()}
          beat={scenePreviewBeat()}
        />
      </ErrorBoundary>
    );
  }
  if (isPreviewRequest()) {
    return (
      <ErrorBoundary locale={previewLocale()}>
        <Spread08Preview locale={previewLocale()} />
      </ErrorBoundary>
    );
  }
  return (
    <ErrorBoundary locale={previewLocale()}>
      <DockApp />
    </ErrorBoundary>
  );
}
