import type { Spread } from '../story/dock-contracts';

// Pure guided-reader engine over validated spread data. Required interactions
// gate forward movement; optional taps are recorded but never navigate; the
// chosen route survives back-travel; camera beats collapse to still frames
// under reduced motion.

export type GuidedSession = {
  storyId: string;
  path: string[];
  index: number;
  spreadId: string;
  routeId: string | null;
  boarded: boolean;
  taps: Record<string, string[]>;
  completed: boolean;
};

export type BeatDirection = 'forward' | 'back';
export type MotionPreference = 'full' | 'reduced';

export function startGuidedSession(storyId: string, path: string[]): GuidedSession {
  return {
    storyId,
    path,
    index: 0,
    spreadId: path[0] ?? '',
    routeId: null,
    boarded: false,
    taps: {},
    completed: false,
  };
}

function spreadById(spreads: Spread[], spreadId: string): Spread | undefined {
  return spreads.find((spread) => spread.id === spreadId);
}

function requiredSatisfied(session: GuidedSession, spreads: Spread[]): boolean {
  const interaction = spreadById(spreads, session.spreadId)?.interaction;
  if (interaction === undefined || interaction.required === false) {
    return true;
  }
  if (interaction.kind === 'board') {
    return session.boarded;
  }
  return session.routeId !== null;
}

export function goForward(session: GuidedSession, spreads: Spread[]): GuidedSession {
  const nextId = session.path[session.index + 1];
  if (session.completed || nextId === undefined || !requiredSatisfied(session, spreads)) {
    return session;
  }
  return { ...session, index: session.index + 1, spreadId: nextId };
}

export function goBack(session: GuidedSession): GuidedSession {
  if (session.index === 0) {
    return session;
  }
  const spreadId = session.path[session.index - 1];
  if (spreadId === undefined) {
    return session;
  }
  return { ...session, index: session.index - 1, spreadId };
}

export function boardBoat(
  session: GuidedSession,
  spreads: Spread[],
  target: string,
): GuidedSession {
  const interaction = spreadById(spreads, session.spreadId)?.interaction;
  if (interaction?.kind !== 'board' || interaction.target !== target) {
    return session;
  }
  return { ...session, boarded: true };
}

export function tapTarget(
  session: GuidedSession,
  spreads: Spread[],
  spreadId: string,
  target: string,
): GuidedSession {
  // Tap ownership: only the current spread's declared target is recorded, and
  // tapping never moves the session.
  if (spreadId !== session.spreadId) {
    return session;
  }
  const interaction = spreadById(spreads, spreadId)?.interaction;
  if (interaction?.target !== target) {
    return session;
  }
  const seen = session.taps[spreadId] ?? [];
  if (seen.includes(target)) {
    return session;
  }
  return { ...session, taps: { ...session.taps, [spreadId]: [...seen, target] } };
}

export function chooseRoute(
  session: GuidedSession,
  routeId: string,
  path: string[],
): GuidedSession {
  // Commit lock: the first chosen route is final for this reading. The choice
  // UI only offers routes while routeId is null, and back-travel preserves
  // the route, so this guard is a second lock at the engine layer.
  if (session.routeId !== null) {
    return session;
  }
  return { ...session, routeId, path };
}

export function finishGuided(session: GuidedSession, spreads: Spread[]): GuidedSession {
  const atEnd = session.index >= session.path.length - 1;
  if (session.completed || !atEnd || !requiredSatisfied(session, spreads)) {
    return session;
  }
  return { ...session, completed: true };
}

export function cameraBeatFor(
  direction: BeatDirection,
  motion: MotionPreference,
): 'arrive' | 'return' | null {
  if (motion === 'reduced') {
    return null;
  }
  return direction === 'forward' ? 'arrive' : 'return';
}
