import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { assertUiStringParity } from '../app/strings';
import { PrepareView } from './PrepareView';
import { PREPARE_STRINGS } from './prepareStrings';

const EN = PREPARE_STRINGS.en;
const ID = PREPARE_STRINGS.id;

describe('prepare strings', () => {
  it('keeps English and Indonesian key-aligned', () => {
    expect(assertUiStringParity(PREPARE_STRINGS.en, PREPARE_STRINGS.id)).toEqual([]);
  });

  it('never blames the child in any message', () => {
    for (const strings of [EN, ID]) {
      for (const value of Object.values(strings as unknown as Record<string, string>)) {
        expect(value).not.toMatch(/error|wrong|fail|gagal|salah/i);
      }
    }
  });

  it('offers a calm one-step recovery path on failure', () => {
    expect(EN.errorMessage).toMatch(/try again|another try/i);
    expect(ID.errorMessage).toMatch(/coba lagi|sekali lagi/i);
    expect(EN.retry).not.toHaveLength(0);
    expect(ID.retry).not.toHaveLength(0);
  });
});

function renderView(overrides?: Partial<Parameters<typeof PrepareView>[0]>) {
  const props = {
    strings: EN,
    phase: 'downloading' as const,
    progressFraction: 0.5,
    error: null,
    onRetry: () => undefined,
    ...overrides,
  };
  return render(<PrepareView {...props} />);
}

describe('PrepareView', () => {
  it('shows bounded progress with an accessible bar', () => {
    renderView({ progressFraction: 0.4 });
    expect(screen.getByRole('heading', { level: 2, name: EN.title })).toBeVisible();
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(screen.getByText(EN.preparing)).toBeVisible();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('clamps the reported fraction to the unit interval', () => {
    renderView({ progressFraction: 1.5 });
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('shows the calm failure message with a retry action only when failed', () => {
    renderView({ phase: 'failed', error: 'missing' });
    expect(screen.getByText(EN.errorMessage)).toBeVisible();
    expect(screen.getByRole('button', { name: EN.retry })).toBeVisible();
  });

  it('never shows a retry action while downloading or ready', () => {
    const { unmount } = renderView({ phase: 'ready' });
    expect(screen.getByText(EN.ready)).toBeVisible();
    expect(screen.queryByRole('button')).toBeNull();
    unmount();
    renderView({ phase: 'downloading' });
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('triggers retry from the calm recovery action', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn().mockImplementation(() => undefined);
    renderView({ phase: 'failed', error: 'evicted', onRetry });
    await user.click(screen.getByRole('button', { name: EN.retry }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders the same recovery path in Indonesian', () => {
    renderView({ strings: ID, phase: 'failed', error: 'hash-mismatch' });
    expect(screen.getByText(ID.errorMessage)).toBeVisible();
    expect(screen.getByRole('button', { name: ID.retry })).toBeVisible();
  });
});
