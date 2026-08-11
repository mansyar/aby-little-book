// Reader session contract shared by the application state machine (view layer)
// and the pure reader engine (navigation logic). The session is the reader's
// source of truth: current spread, locked route, visit history, and outcome.
// Optional interactions never affect navigation or completion.

import type { AstronautId, Locale, RouteId, Story } from '../story/contracts';

export type ReaderSession = {
  story: Story;
  astronautId: AstronautId;
  locale: Locale;
  currentSpreadId: string;
  route: RouteId | null;
  /** Visited spread ids in order, current spread last. Never rewinds past S01. */
  history: string[];
  completed: boolean;
};

export type ProgressSnapshot = {
  storyId: string;
  astronautId: AstronautId;
  locale: Locale;
  currentSpreadId: string;
  route: RouteId | null;
  history: string[];
  completed: boolean;
  savedAt: number;
};
