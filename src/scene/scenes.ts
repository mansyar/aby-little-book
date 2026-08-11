// Scene binding: the live set of spreads around the reading position. The
// renderer decodes at most these three scenes so memory stays bounded, and
// the unchosen route never leaks into the bound set.

import { nextDestination } from '../reader/engine';
import type { ReaderSession } from '../reader/types';

export type BoundScenes = {
  previous: string | null;
  active: string;
  next: string | null;
};

export function boundScenes(session: ReaderSession): BoundScenes {
  const history = session.history;
  const previous = history.length >= 2 ? (history[history.length - 2] ?? null) : null;
  return {
    previous,
    active: session.currentSpreadId,
    next: nextDestination(session),
  };
}
