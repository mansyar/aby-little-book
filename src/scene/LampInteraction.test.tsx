import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LampInteraction } from './LampInteraction';
import { LAMP_STRINGS } from './lampStrings';

const region = { x: 0.9, y: 0.4, width: 0.08, height: 0.12 };

function renderLamp(
  overrides: {
    onActivate?: () => void;
    reducedMotion?: boolean;
    hintDelayMs?: number;
    activated?: boolean;
  } = {},
) {
  return render(
    <LampInteraction
      region={region}
      strings={LAMP_STRINGS.en}
      hintDelayMs={overrides.hintDelayMs ?? 6000}
      reducedMotion={overrides.reducedMotion ?? false}
      activated={overrides.activated ?? false}
      onActivate={overrides.onActivate ?? vi.fn()}
    />,
  );
}

describe('LampInteraction', () => {
  it('renders the lamp as an interactive target with a localized label', () => {
    const { container } = renderLamp();
    const lamp = screen.getByRole('button', { name: 'Star lamp' });
    expect(lamp).toHaveAttribute('data-interactive');
    const wrapper = container.querySelector('.lamp-interaction');
    expect(wrapper).toHaveStyle({ left: '90%', top: '40%', width: '8%', height: '12%' });
  });

  it('activates the interaction on press', () => {
    const onActivate = vi.fn();
    renderLamp({ onActivate });
    fireEvent.click(screen.getByRole('button', { name: 'Star lamp' }));
    expect(onActivate).toHaveBeenCalledOnce();
  });

  it('shows a gentle hint only after inactivity, and reveals it to assistive tech', () => {
    vi.useFakeTimers();
    renderLamp();
    const lamp = screen.getByRole('button', { name: 'Star lamp' });
    expect(lamp.className).not.toMatch(/hint/);
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(lamp.className).toMatch(/hint/);
    expect(screen.getByText(LAMP_STRINGS.en.hint)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('replaces the pulsing hint with static emphasis under reduced motion', () => {
    vi.useFakeTimers();
    renderLamp({ reducedMotion: true });
    const lamp = screen.getByRole('button', { name: 'Star lamp' });
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(lamp.className).toBe('lamp-target lamp-target--hint-static');
    vi.useRealTimers();
  });

  it('announces the warm response through a polite live region', () => {
    const { container } = renderLamp({ activated: true });
    const live = container.querySelector('[aria-live="polite"]');
    expect(live).not.toBeNull();
    expect(live?.textContent).toBe(LAMP_STRINGS.en.response);
  });

  it('keeps the interaction fully skippable: unactivated lamp never blocks reading', () => {
    const { container } = renderLamp();
    const live = container.querySelector('[aria-live="polite"]');
    expect(live?.textContent).toBe('');
    expect(screen.queryByText(LAMP_STRINGS.en.response)).not.toBeInTheDocument();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });
});
