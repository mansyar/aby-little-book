import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CaregiverControls, type CaregiverSettings } from './CaregiverControls';
import { CaregiverGate } from './CaregiverGate';
import { CAREGIVER_STRINGS } from './caregiverStrings';
import { ResetConfirm } from './ResetConfirm';

// Caregiver flows: the adult gate is a calm door, settings are explicit
// toggles, and destructive actions require a confirmation that states the
// consequences plainly. Focus returns where it belongs.

function renderGate(overrides: Partial<Parameters<typeof CaregiverGate>[0]> = {}) {
  const props = {
    strings: CAREGIVER_STRINGS.en,
    onEnter: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  };
  return render(<CaregiverGate {...props} />);
}

const SETTINGS: CaregiverSettings = {
  locale: 'en',
  soundEnabled: true,
  textScale: 'standard',
  reducedMotion: false,
};

function renderControls(overrides: Partial<Parameters<typeof CaregiverControls>[0]> = {}) {
  const props = {
    strings: CAREGIVER_STRINGS.en,
    settings: SETTINGS,
    preparing: false,
    onLocaleChange: vi.fn(),
    onSoundChange: vi.fn(),
    onTextScaleChange: vi.fn(),
    onReducedMotionChange: vi.fn(),
    onPrepare: vi.fn(),
    onReset: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  };
  return render(<CaregiverControls {...props} />);
}

describe('CaregiverGate', () => {
  it('shows a deliberate door into the grown-up area', () => {
    renderGate();
    expect(screen.getByRole('dialog', { name: /grown-?ups/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /open grown-?up settings/i })).toBeVisible();
  });

  it('closes with Escape from inside the gate', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderGate({ onClose });
    screen.getByRole('button', { name: /open grown-?up settings/i }).focus();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});

describe('CaregiverControls', () => {
  it('offers language, sound, text, motion, preparation, and reset sections', () => {
    renderControls();
    expect(screen.getByRole('group', { name: /language/i })).toBeVisible();
    expect(screen.getByRole('group', { name: /sound/i })).toBeVisible();
    expect(screen.getByRole('group', { name: /text/i })).toBeVisible();
    expect(screen.getByRole('group', { name: /motion/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /prepare the book/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /start the book over/i })).toBeVisible();
  });

  it('reports settings changes through callbacks', async () => {
    const onLocaleChange = vi.fn();
    const onSoundChange = vi.fn();
    const user = userEvent.setup();
    renderControls({ onLocaleChange, onSoundChange });
    await user.click(screen.getByRole('button', { name: /bahasa indonesia/i }));
    expect(onLocaleChange).toHaveBeenCalledWith('id');
    await user.click(screen.getByRole('button', { name: /sound on/i }));
    expect(onSoundChange).toHaveBeenCalledWith(false);
  });

  it('triggers preparation from the caregiver surface', async () => {
    const onPrepare = vi.fn();
    const user = userEvent.setup();
    renderControls({ onPrepare });
    await user.click(screen.getByRole('button', { name: /prepare the book/i }));
    expect(onPrepare).toHaveBeenCalled();
  });
});

describe('ResetConfirm', () => {
  it('states the consequences and requires an explicit erase', async () => {
    const onReset = vi.fn();
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<ResetConfirm strings={CAREGIVER_STRINGS.en} onReset={onReset} onCancel={onCancel} />);
    const dialog = screen.getByRole('dialog', { name: /start the book over/i });
    expect(dialog).toHaveTextContent(/progress/i);
    await user.click(screen.getByRole('button', { name: /keep everything/i }));
    expect(onCancel).toHaveBeenCalled();
    expect(onReset).not.toHaveBeenCalled();
  });

  it('erases only after the explicit confirmation', async () => {
    const onReset = vi.fn();
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<ResetConfirm strings={CAREGIVER_STRINGS.en} onReset={onReset} onCancel={onCancel} />);
    await user.click(screen.getByRole('button', { name: /erase everything/i }));
    expect(onReset).toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });
});
