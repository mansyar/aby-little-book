import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ProseView } from './ProseView';

const segments = [
  { text: 'Stay near', spoken: 'stay near', eligible: false },
  { text: 'my light,', spoken: 'my light,', eligible: false },
  { text: 'Lumi', spoken: 'lumi', eligible: true },
  { text: '.', spoken: '.', eligible: false },
];

function renderProse(overrides: Partial<Parameters<typeof ProseView>[0]> = {}) {
  const onSpeak = vi.fn();
  render(
    <ProseView
      segments={segments}
      speakingWord={null}
      unavailable={false}
      onSpeak={onSpeak}
      {...overrides}
    />,
  );
  return { onSpeak };
}

describe('ProseView', () => {
  it('renders ordinary words as plain spans', () => {
    renderProse();
    expect(screen.getByText('Stay near')).toBeInTheDocument();
  });

  it('renders eligible words as isolated buttons with interactive ownership', () => {
    renderProse();
    const word = screen.getByRole('button', { name: 'Lumi' });
    expect(word).toHaveAttribute('data-interactive');
    expect(word).toHaveAttribute('aria-pressed', 'false');
  });

  it('speaks the tapped word through the owner', async () => {
    const user = userEvent.setup();
    const { onSpeak } = renderProse();
    await user.click(screen.getByRole('button', { name: 'Lumi' }));
    expect(onSpeak).toHaveBeenCalledTimes(1);
    expect(onSpeak).toHaveBeenCalledWith(segments[2]);
  });

  it('marks the speaking word as pressed and styled', () => {
    renderProse({ speakingWord: 'lumi' });
    const word = screen.getByRole('button', { name: 'Lumi' });
    expect(word).toHaveAttribute('aria-pressed', 'true');
    expect(word.className).toContain('prose__word--speaking');
  });

  it('keeps reading unblocked when speech is unavailable: no buttons, same text', () => {
    renderProse({ unavailable: true });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('Lumi')).toBeInTheDocument();
  });
});
