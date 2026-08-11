import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { type BookCardState, BookshelfView } from './BookshelfView';
import { BOOKSHELF_STRINGS } from './bookshelfStrings';

// The celestial shelf: one book card whose state decides the primary
// action. Every state must be understandable without motion, and the
// caregiver door must always be reachable.

function renderShelf(overrides: Partial<Parameters<typeof BookshelfView>[0]> = {}) {
  const props = {
    locale: 'en' as const,
    strings: BOOKSHELF_STRINGS.en,
    storyTitle: { en: 'The Starlight Rescue', id: 'Penyelamatan Cahaya Bintang' },
    cardState: 'new' as BookCardState,
    onOpen: () => undefined,
    onContinue: () => undefined,
    onReadAgain: () => undefined,
    onPrepare: () => undefined,
    onCaregiver: () => undefined,
    ...overrides,
  };
  return render(<BookshelfView {...props} />);
}

describe('BookshelfView', () => {
  it('shows the shelf and the book card with the story title', () => {
    renderShelf();
    expect(screen.getByRole('heading', { level: 1, name: 'Aby Little Book' })).toBeVisible();
    expect(screen.getByRole('heading', { level: 2, name: 'The Starlight Rescue' })).toBeVisible();
  });

  it('offers Prepare when the book is new and not prepared', async () => {
    const onPrepare = () => undefined;
    const user = userEvent.setup();
    renderShelf({ onPrepare });
    const prepare = screen.getByRole('button', { name: /prepare/i });
    expect(screen.queryByRole('button', { name: /open/i })).toBeNull();
    await user.click(prepare);
    expect(screen.getByRole('button', { name: /prepare/i })).toBeVisible();
  });

  it('reports preparation progress instead of offering an action', () => {
    renderShelf({ cardState: 'preparing' });
    expect(screen.getByText(/saving/i)).toBeVisible();
    expect(screen.queryByRole('button', { name: /prepare/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /open/i })).toBeNull();
  });

  it('opens the book when prepared and never opened', () => {
    renderShelf({ cardState: 'ready' });
    expect(screen.getByRole('button', { name: /open/i })).toBeVisible();
    expect(screen.queryByRole('button', { name: /continue/i })).toBeNull();
  });

  it('continues a reading in progress', () => {
    renderShelf({ cardState: 'in-progress' });
    expect(screen.getByRole('button', { name: /continue/i })).toBeVisible();
    expect(screen.queryByRole('button', { name: /open/i })).toBeNull();
  });

  it('offers Read Again after completion', () => {
    renderShelf({ cardState: 'complete' });
    expect(screen.getByRole('button', { name: /again/i })).toBeVisible();
  });

  it('keeps the caregiver door reachable in every state', () => {
    renderShelf({ cardState: 'complete' });
    expect(screen.getByRole('button', { name: /grown-?up|caregiver/i })).toBeVisible();
  });
});
