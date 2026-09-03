import type { Locale } from '../story/dock-contracts';

// Pure dock application state machine. The guided-reader session is opaque
// engine-owned data; view transitions and settings live here. No routing
// library: the view union is the navigation model. Invalid transitions return
// the state unchanged so a stray tap can never strand the child.

export type DockView = 'dock' | 'preparation' | 'reader' | 'completion' | 'caregiver';

export type Preparation = {
  packageId: string;
  ready: true;
};

export type DockState = {
  view: DockView;
  locale: Locale;
  session: unknown;
  preparation: Preparation | null;
  lastCompletedStoryId: string | null;
};

export type DockEvent =
  | { type: 'begin-preparation' }
  | { type: 'preparation-ready'; session: unknown; packageId: string }
  | { type: 'board-boat'; session: unknown }
  | { type: 'continue-story'; session: unknown }
  | { type: 'update-reader'; session: unknown }
  | { type: 'close-reader' }
  | { type: 'finish'; storyId: string }
  | { type: 'open-caregiver' }
  | { type: 'close-caregiver' }
  | { type: 'set-locale'; locale: Locale }
  | { type: 'replay'; session: unknown }
  | { type: 'reset' };

export function initialDockState(): DockState {
  return {
    view: 'dock',
    locale: 'en',
    session: null,
    preparation: null,
    lastCompletedStoryId: null,
  };
}

export function reduceDockState(state: DockState, event: DockEvent): DockState {
  switch (event.type) {
    case 'begin-preparation': {
      if (state.view !== 'dock') {
        return state;
      }
      return { ...state, view: 'preparation' };
    }
    case 'preparation-ready': {
      if (state.view !== 'preparation') {
        return state;
      }
      return {
        ...state,
        view: 'reader',
        session: event.session,
        preparation: { packageId: event.packageId, ready: true },
      };
    }
    case 'board-boat': {
      // Boarding needs an explicitly prepared package; otherwise the dock
      // stays put and the child can start preparation instead.
      if (state.view !== 'dock' || state.preparation === null) {
        return state;
      }
      return { ...state, view: 'reader', session: event.session };
    }
    case 'continue-story': {
      if (state.view !== 'dock') {
        return state;
      }
      return { ...state, view: 'reader', session: event.session };
    }
    case 'update-reader': {
      if (state.session === null) {
        return state;
      }
      return { ...state, session: event.session };
    }
    case 'close-reader': {
      if (state.view !== 'reader') {
        return state;
      }
      return { ...state, view: 'dock' };
    }
    case 'finish': {
      if (state.view !== 'reader') {
        return state;
      }
      return { ...state, view: 'completion', lastCompletedStoryId: event.storyId };
    }
    case 'open-caregiver': {
      if (state.view !== 'dock') {
        return state;
      }
      return { ...state, view: 'caregiver' };
    }
    case 'close-caregiver': {
      if (state.view !== 'caregiver') {
        return state;
      }
      return { ...state, view: 'dock' };
    }
    case 'set-locale': {
      return { ...state, locale: event.locale };
    }
    case 'replay': {
      if (state.view !== 'completion') {
        return state;
      }
      return { ...state, view: 'reader', session: event.session };
    }
    case 'reset': {
      return { ...initialDockState(), locale: state.locale };
    }
  }
}
