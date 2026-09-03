import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { type BoatState, DockHomeView } from './DockHomeView.js';
import { DOCK_STRINGS } from './dockStrings.js';

function show(cardState: BoatState, keepsake = false, locale: 'en' | 'id' = 'en') {
  const onPrepare = vi.fn();
  const onOpen = vi.fn();
  const onContinue = vi.fn();
  const onReadAgain = vi.fn();
  const onCaregiver = vi.fn();
  render(
    <DockHomeView
      locale={locale}
      strings={DOCK_STRINGS[locale]}
      storyTitle={{ en: 'The Sharing Tide', id: 'Air Pasang Berbagi' }}
      cardState={cardState}
      keepsake={keepsake}
      onPrepare={onPrepare}
      onOpen={onOpen}
      onContinue={onContinue}
      onReadAgain={onReadAgain}
      onCaregiver={onCaregiver}
    />,
  );
  return { onPrepare, onOpen, onContinue, onReadAgain, onCaregiver };
}

describe('DockHomeView', () => {
  it('names the dock and the story', () => {
    show('new');
    expect(screen.getByText('The Starlit Dock')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'The Sharing Tide' })).toBeVisible();
  });

  it('a new boat offers preparation and nothing else', () => {
    show('new');
    fireEvent.click(screen.getByRole('button', { name: 'Prepare the boat' }));
    expect(screen.queryByRole('button', { name: 'Climb into the boat' })).toBeNull();
  });

  it('announces offline preparation without an action', () => {
    show('preparing');
    expect(screen.getByText('Saving the story for offline.')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Prepare the boat' })).toBeNull();
  });

  it('a ready boat invites boarding', () => {
    const { onOpen } = show('ready');
    fireEvent.click(screen.getByRole('button', { name: 'Climb into the boat' }));
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it('an unfinished float continues', () => {
    const { onContinue } = show('in-progress');
    fireEvent.click(screen.getByRole('button', { name: 'Keep floating' }));
    expect(onContinue).toHaveBeenCalledOnce();
  });

  it('a finished float keeps its lantern and can float again', () => {
    const { onReadAgain } = show('complete', true);
    expect(screen.getByText('A lantern glows on your dock.')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Float again' }));
    expect(onReadAgain).toHaveBeenCalledOnce();
  });

  it('opens the grown-ups door', () => {
    const { onCaregiver } = show('ready');
    fireEvent.click(screen.getByRole('button', { name: 'For grown-ups' }));
    expect(onCaregiver).toHaveBeenCalledOnce();
  });

  it('speaks Indonesian throughout', () => {
    show('ready', false, 'id');
    expect(screen.getByText('Dermaga Bintang')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Air Pasang Berbagi' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Naik ke perahu' })).toBeVisible();
  });
});
