import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RouteChoiceView } from './RouteChoiceView';
import { READER_STRINGS } from './readerStrings';

const renderChoice = (overrides: Partial<Parameters<typeof RouteChoiceView>[0]> = {}) => {
  const onChoose = vi.fn();
  render(
    <RouteChoiceView strings={READER_STRINGS.en} locale="en" onChoose={onChoose} {...overrides} />,
  );
  return { onChoose };
};

describe('RouteChoiceView', () => {
  it('shows both routes as equal doors', () => {
    renderChoice();
    expect(screen.getByRole('button', { name: 'Asteroid Garden' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Singing Starfield' })).toBeInTheDocument();
  });

  it('marks both doors as interactive targets so taps never page-turn', () => {
    renderChoice();
    for (const door of screen.getAllByRole('button')) {
      expect(door.getAttribute('data-interactive')).toBe('true');
    }
  });

  it('reports the chosen route', () => {
    const { onChoose } = renderChoice();
    fireEvent.click(screen.getByRole('button', { name: 'Asteroid Garden' }));
    expect(onChoose).toHaveBeenCalledExactlyOnceWith('asteroid-garden');
  });

  it('renders the Indonesian labels', () => {
    renderChoice({ strings: READER_STRINGS.id, locale: 'id' });
    expect(screen.getByRole('button', { name: 'Taman Asteroid' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hamparan Bintang Bernyanyi' })).toBeInTheDocument();
  });
});
