// Pure application state machine. The reader session is treated as opaque
// engine-owned data; view transitions and settings live here, navigation
// logic lives in the reader engine. No routing library: the view union is the
// navigation model.

import type { ReaderSession } from '../reader/types';
import type { AstronautId, Locale } from '../story/contracts';

export type AppView =
  | 'bookshelf'
  | 'preparation'
  | 'preview'
  | 'reader'
  | 'completion'
  | 'caregiver';

export type Preparation = {
  packageId: string;
  ready: true;
};

export type AppState = {
  view: AppView;
  locale: Locale;
  astronautId: AstronautId;
  session: ReaderSession | null;
  preparation: Preparation | null;
  lastCompletedStoryId: string | null;
};

export type AppEvent =
  | { type: 'open-story' }
  | { type: 'begin-preparation' }
  | { type: 'preparation-ready'; session: ReaderSession }
  | { type: 'continue-story'; session: ReaderSession }
  | { type: 'update-reader'; session: ReaderSession }
  | { type: 'close-reader' }
  | { type: 'open-caregiver' }
  | { type: 'close-caregiver' }
  | { type: 'set-locale'; locale: Locale }
  | { type: 'set-astronaut'; astronautId: AstronautId }
  | { type: 'replay' }
  | { type: 'reset' };

export function initialAppState(): AppState {
  return {
    view: 'bookshelf',
    locale: 'en',
    astronautId: 'aby',
    session: null,
    preparation: null,
    lastCompletedStoryId: null,
  };
}

const PREPARED_VIEWS: ReadonlySet<AppView> = new Set([
  'bookshelf',
  'preview',
  'completion',
  'caregiver',
]);

export function reduceAppState(state: AppState, event: AppEvent): AppState {
  switch (event.type) {
    case 'open-story': {
      if (state.view !== 'bookshelf') {
        return state;
      }
      return { ...state, view: 'preview' };
    }
    case 'begin-preparation': {
      if (state.view !== 'preview') {
        return state;
      }
      return { ...state, view: 'preparation' };
    }
    case 'preparation-ready': {
      if (state.view !== 'preparation') {
        return state;
      }
      const session = event.session;
      return {
        ...state,
        view: 'reader',
        session,
        preparation: { packageId: `${session.story.id}-${session.story.version}`, ready: true },
      };
    }
    case 'continue-story': {
      if (state.view !== 'bookshelf') {
        return state;
      }
      return { ...state, view: 'reader', session: event.session };
    }
    case 'update-reader': {
      if (state.session === null) {
        return state;
      }
      const session = event.session;
      return {
        ...state,
        view: session.completed ? 'completion' : 'reader',
        session,
        lastCompletedStoryId: session.completed ? session.story.id : state.lastCompletedStoryId,
      };
    }
    case 'close-reader': {
      if (state.view !== 'reader' && state.view !== 'preview') {
        return state;
      }
      return { ...state, view: 'bookshelf', session: null };
    }
    case 'open-caregiver': {
      if (!PREPARED_VIEWS.has(state.view)) {
        return state;
      }
      return { ...state, view: 'caregiver' };
    }
    case 'close-caregiver': {
      if (state.view !== 'caregiver') {
        return state;
      }
      return { ...state, view: 'bookshelf' };
    }
    case 'set-locale': {
      if (state.session === null) {
        return { ...state, locale: event.locale };
      }
      return {
        ...state,
        locale: event.locale,
        session: { ...state.session, locale: event.locale },
      };
    }
    case 'set-astronaut': {
      if (state.view !== 'bookshelf' && state.view !== 'preview' && state.view !== 'caregiver') {
        return state;
      }
      return { ...state, astronautId: event.astronautId };
    }
    case 'replay': {
      if (state.view !== 'completion') {
        return state;
      }
      return { ...state, view: 'preview', session: null };
    }
    case 'reset': {
      if (state.view !== 'caregiver') {
        return state;
      }
      return {
        ...state,
        view: 'bookshelf',
        session: null,
        preparation: null,
        lastCompletedStoryId: null,
      };
    }
  }
}

// Progress is persisted at stable boundaries only: after a navigation or
// reader update, and when the reader closes. Setting changes are stored
// separately and never overwrite progress.
export const SAVE_BOUNDARY_TYPES = ['update-reader', 'close-reader'] as const;

export function isSaveBoundary(event: AppEvent): boolean {
  return (SAVE_BOUNDARY_TYPES as readonly string[]).includes(event.type);
}
