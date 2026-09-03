import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Scene as SceneContract } from '../scene/package.js';
import type { SpeechProvider } from '../speech/speech.js';
import type { Spread } from '../story/dock-contracts.js';
import { sharingTide } from '../story/sharingTide.js';
import { TAP_TARGETS_BY_SPREAD } from '../three/tapTargets.js';
import { GuidedReaderView } from './GuidedReaderView.js';
import {
  boardBoat,
  chooseRoute,
  type GuidedSession,
  goForward,
  startGuidedSession,
} from './guided.js';

const SPREADS: Spread[] = Object.values(sharingTide.spreads);

const REED_PATH = ['S01', 'S02', 'S03', 'S04', 'A05', 'A06', 'S08', 'S10'];
const LILY_PATH = ['S01', 'S02', 'S03', 'S04', 'B05', 'B06', 'S08', 'S10'];

function sessionAt(
  spreadId: string,
  route: 'reed-channel' | 'lily-cove' = 'reed-channel',
): GuidedSession {
  const path = route === 'reed-channel' ? REED_PATH : LILY_PATH;
  let session = boardBoat(startGuidedSession(sharingTide.id, path), SPREADS, 'boat');
  let guard = 0;
  while (session.spreadId !== spreadId && guard < 20) {
    guard += 1;
    if (session.spreadId === 'S04' && session.routeId === null) {
      session = chooseRoute(session, route, path);
    } else {
      const next = goForward(session, SPREADS);
      if (next === session) {
        break;
      }
      session = next;
    }
  }
  return session;
}

function stubSpeech(): { speech: SpeechProvider; speak: ReturnType<typeof vi.fn> } {
  const speak = vi.fn();
  return {
    speak,
    speech: {
      supported: true,
      speak,
      cancel: vi.fn(),
      speaking: false,
      onEnd: null,
    },
  };
}

const scenes = new Map<string, SceneContract>();

function show(
  session: GuidedSession,
  locale: 'en' | 'id' = 'en',
  stub: { speech: SpeechProvider; speak: ReturnType<typeof vi.fn> } = stubSpeech(),
) {
  const onSessionChange = vi.fn();
  const onClose = vi.fn();
  const onFinish = vi.fn();
  render(
    <GuidedReaderView
      session={session}
      locale={locale}
      speech={stub.speech}
      scenes={scenes}
      posterSrc="poster-s01.png"
      onSessionChange={onSessionChange}
      onClose={onClose}
      onFinish={onFinish}
    />,
  );
  return { onSessionChange, onClose, onFinish, speak: stub.speak };
}

describe('GuidedReaderView', () => {
  it('renders the S01 title, prose, and boat tap', () => {
    show(sessionAt('S01'));
    expect(screen.getByRole('heading', { name: 'Lanterns on the Water' })).toBeVisible();
    expect(
      screen.getByText('The night lake is still. A small boat sways by the dock.'),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Boat' })).toBeVisible();
  });

  it('holds Next until the boat is boarded, then advances', () => {
    // Unboarded, there is nowhere honest to go, so Next stays hidden.
    const unboarded = startGuidedSession(sharingTide.id, REED_PATH);
    const first = show(unboarded);
    expect(screen.queryByRole('button', { name: 'Next' })).toBeNull();
    expect(first.onSessionChange).not.toHaveBeenCalled();

    // Boarded, Next walks the real engine to S02.
    const boarded = boardBoat(unboarded, SPREADS, 'boat');
    const second = show(boarded);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(second.onSessionChange).toHaveBeenCalledOnce();
    const advanced = second.onSessionChange.mock.calls[0]?.[0] as GuidedSession;
    expect(advanced.spreadId).toBe('S02');
  });

  it('tapping the boat boards it so Next reaches S02', () => {
    const unboarded = startGuidedSession(sharingTide.id, REED_PATH);
    const { onSessionChange } = show(unboarded);
    fireEvent.click(screen.getByRole('button', { name: 'Boat' }));
    expect(onSessionChange).toHaveBeenCalledOnce();
    const boarded = onSessionChange.mock.calls[0]?.[0] as GuidedSession;
    expect(boarded.boarded).toBe(true);
  });

  it('offers both routes at S04 and commits the choice', () => {
    const { onSessionChange } = show(sessionAt('S04'));
    fireEvent.click(screen.getByRole('button', { name: 'Reed Channel' }));
    expect(onSessionChange).toHaveBeenCalledOnce();
    const chosen = onSessionChange.mock.calls[0]?.[0] as GuidedSession;
    expect(chosen.routeId).toBe('reed-channel');
  });

  it('a guided tap glows, shows the word, and speaks it once', () => {
    const stub = stubSpeech();
    show(sessionAt('S03'), 'id', stub);
    fireEvent.click(screen.getByRole('button', { name: 'Kue' }));
    expect(screen.getByRole('button', { name: 'Kue' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Kue');
    expect(stub.speak).toHaveBeenCalledOnce();
    expect(stub.speak).toHaveBeenCalledWith({ text: 'Kue', lang: 'id' });
  });

  it('finishes at S10 and closes on Escape', () => {
    const { onFinish, onClose } = show(sessionAt('S10'));
    fireEvent.click(screen.getByRole('button', { name: 'Finish' }));
    expect(onFinish).toHaveBeenCalledOnce();
    fireEvent.keyDown(screen.getByRole('main'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('covers every interactive spread with a tap target', () => {
    for (const spread of SPREADS) {
      if (spread.interaction?.kind === 'tap' || spread.interaction?.kind === 'board') {
        const targets =
          TAP_TARGETS_BY_SPREAD[spread.id as keyof typeof TAP_TARGETS_BY_SPREAD] ?? [];
        expect(targets, `${spread.id} needs a tap target`).not.toHaveLength(0);
      }
    }
  });
});
