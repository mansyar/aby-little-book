// Pure reader engine: navigation, route selection and lock, progress
// snapshots. No DOM, no storage, no side effects — every function returns a
// new session and rejects invalid moves by returning the identical object.

import type { AstronautId, Locale, RouteId, Spread, Story } from '../story/contracts';
import { story as starlightStory } from '../story/starlight-rescue';
import type { ProgressSnapshot, ReaderSession } from './types';

const KNOWN_STORIES: Readonly<Record<string, Story>> = {
  'the-starlight-rescue': starlightStory,
};

export function loadStory(storyId: string): Story {
  const story = KNOWN_STORIES[storyId];
  if (story === undefined) {
    throw new Error(`Unknown story resource: '${storyId}'.`);
  }
  return story;
}

export function createSession(
  story: Story,
  astronautId: AstronautId,
  locale: Locale,
): ReaderSession {
  return {
    story,
    astronautId,
    locale,
    currentSpreadId: story.startSpreadId,
    route: null,
    history: [story.startSpreadId],
    completed: false,
  };
}

export function resolveSpread(session: ReaderSession): Spread {
  const spread = session.story.spreads[session.currentSpreadId];
  if (spread === undefined) {
    throw new Error(`Session is on unknown spread '${session.currentSpreadId}'.`);
  }
  return spread;
}

function routeOf(session: ReaderSession): readonly string[] {
  const route = session.story.routes.find((candidate) => candidate.id === session.route);
  if (route === undefined) {
    throw new Error(`Session route '${session.route}' is not part of the story.`);
  }
  return route.spreadIds;
}

export function nextDestination(session: ReaderSession): string | null {
  if (session.completed) {
    return null;
  }
  const firstRoute = session.story.routes[0];
  if (firstRoute === undefined) {
    return null;
  }
  const spreadIds = session.route === null ? firstRoute.spreadIds : routeOf(session);
  const index = spreadIds.indexOf(session.currentSpreadId);
  if (index === -1) {
    return null;
  }
  if (session.route === null && session.currentSpreadId === session.story.choiceSpreadId) {
    // The route choice is required and blocking; no forward move until chosen.
    return null;
  }
  const next = spreadIds[index + 1];
  return next === undefined ? null : next;
}

export function previousDestination(session: ReaderSession): string | null {
  const currentIndex = session.history.lastIndexOf(session.currentSpreadId);
  if (currentIndex <= 0) {
    return null;
  }
  const previous = session.history[currentIndex - 1];
  return previous === undefined ? null : previous;
}

export function chooseRoute(session: ReaderSession, routeId: RouteId): ReaderSession {
  if (session.currentSpreadId !== session.story.choiceSpreadId || session.route !== null) {
    return session;
  }
  if (!session.story.routes.some((route) => route.id === routeId)) {
    return session;
  }
  return { ...session, route: routeId };
}

export function goForward(session: ReaderSession): ReaderSession {
  const destination = nextDestination(session);
  if (destination === null) {
    return session;
  }
  return {
    ...session,
    currentSpreadId: destination,
    history: [...session.history, destination],
    completed: destination === session.story.endingSpreadId,
  };
}

export function goBack(session: ReaderSession): ReaderSession {
  const destination = previousDestination(session);
  if (destination === null) {
    return session;
  }
  return {
    ...session,
    currentSpreadId: destination,
    history: session.history.slice(0, session.history.indexOf(destination) + 1),
  };
}

export function snapshot(session: ReaderSession, savedAt: number): ProgressSnapshot {
  return {
    storyId: session.story.id,
    astronautId: session.astronautId,
    locale: session.locale,
    currentSpreadId: session.currentSpreadId,
    route: session.route,
    history: [...session.history],
    completed: session.completed,
    savedAt,
  };
}

export function fromSnapshot(progress: ProgressSnapshot): ReaderSession {
  return {
    story: loadStory(progress.storyId),
    astronautId: progress.astronautId,
    locale: progress.locale,
    currentSpreadId: progress.currentSpreadId,
    route: progress.route,
    history: [...progress.history],
    completed: progress.completed,
  };
}
