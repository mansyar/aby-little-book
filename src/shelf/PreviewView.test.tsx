import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { BOOKSHELF_STRINGS } from './bookshelfStrings';
import { PreviewView } from './PreviewView';

// The portal preview: a calm door into the story. One action (begin), a
// title, and never more than a breath of text before the reading starts.

function renderPreview(overrides: Partial<Parameters<typeof PreviewView>[0]> = {}) {
  const props = {
    locale: 'en' as const,
    strings: BOOKSHELF_STRINGS.en,
    storyTitle: { en: 'The Starlight Rescue', id: 'Penyelamatan Cahaya Bintang' },
    onBegin: () => undefined,
    ...overrides,
  };
  return render(<PreviewView {...props} />);
}

describe('PreviewView', () => {
  it('announces the story and offers Begin', async () => {
    const onBegin = () => undefined;
    const user = userEvent.setup();
    renderPreview({ onBegin });
    expect(screen.getByRole('heading', { level: 1, name: 'The Starlight Rescue' })).toBeVisible();
    const begin = screen.getByRole('button', { name: /begin|start/i });
    await user.click(begin);
    expect(screen.getByRole('button', { name: /begin|start/i })).toBeVisible();
  });

  it('keeps the preview quiet and free of demands', () => {
    renderPreview();
    expect(screen.queryByText(/must|should|hurry/i)).toBeNull();
  });
});
