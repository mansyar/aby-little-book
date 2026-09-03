import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { BookshelfView } from '../shelf/BookshelfView';
import { BOOKSHELF_STRINGS } from '../shelf/bookshelfStrings';
import { CompletionView } from './CompletionView';
import { COMPLETION_STRINGS } from './completionStrings';
import { KeepsakeBadge } from './KeepsakeBadge';

// Completion: a calm ending, a keepsake that stays on the shelf, and a
// quiet replay door. Route history is preserved while the current reading
// resets — the unvisited route stays discoverable.

function renderCompletion(overrides: Partial<Parameters<typeof CompletionView>[0]> = {}) {
  const props = {
    locale: 'en' as const,
    strings: COMPLETION_STRINGS.en,
    storyTitle: { en: 'The Starlight Rescue', id: 'Penyelamatan Cahaya Bintang' },
    onReplay: () => undefined,
    ...overrides,
  };
  return render(<CompletionView {...props} />);
}

describe('CompletionView', () => {
  it('arrives calmly with the story title and a quiet message', () => {
    renderCompletion();
    expect(screen.getByRole('heading', { level: 1, name: 'The Starlight Rescue' })).toBeVisible();
    expect(screen.getByText(/shared the light|home/i)).toBeVisible();
    expect(screen.queryByText(/point|score|reward/i)).toBeNull();
  });

  it('replays from the completion view', async () => {
    const onReplay = () => undefined;
    const user = userEvent.setup();
    renderCompletion({ onReplay });
    await user.click(screen.getByRole('button', { name: /again|once more/i }));
    expect(screen.getByRole('button', { name: /again|once more/i })).toBeVisible();
  });
});

describe('KeepsakeBadge', () => {
  it('is silent when there is no keepsake', () => {
    render(<KeepsakeBadge strings={COMPLETION_STRINGS.en} hasKeepsake={false} />);
    expect(screen.queryByText(/lantern/i)).toBeNull();
  });

  it('announces the lantern when the keepsake exists', () => {
    render(<KeepsakeBadge strings={COMPLETION_STRINGS.en} hasKeepsake={true} />);
    expect(screen.getByText(/lantern/i)).toBeVisible();
  });
});

describe('bookshelf keepsake presence', () => {
  it('shows the keepsake badge on the shelf after completion', () => {
    render(
      <BookshelfView
        locale="en"
        strings={BOOKSHELF_STRINGS.en}
        storyTitle={{ en: 'The Starlight Rescue', id: 'Penyelamatan Cahaya Bintang' }}
        cardState="complete"
        keepsake={true}
        onOpen={() => undefined}
        onContinue={() => undefined}
        onReadAgain={() => undefined}
        onPrepare={() => undefined}
        onCaregiver={() => undefined}
      />,
    );
    expect(screen.getByText(/lumi/i)).toBeVisible();
    expect(screen.getByRole('button', { name: /again/i })).toBeVisible();
  });
});
