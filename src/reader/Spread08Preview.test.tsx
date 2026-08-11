import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { Spread08Preview } from './Spread08Preview';

// jsdom has no speechSynthesis; the preview needs a present (but quiet)
// provider so eligible words render as pronunciation controls.
beforeEach(() => {
  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: {
      speak: () => undefined,
      cancel: () => undefined,
      getVoices: () => [],
    },
  });
  Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    configurable: true,
    value: class SpeechSynthesisUtteranceStub {
      text: string;
      lang: string;
      onend: (() => void) | null = null;
      constructor(text: string, lang: string) {
        this.text = text;
        this.lang = lang;
      }
    },
  });
});

function renderPreview(overrides: Partial<Parameters<typeof Spread08Preview>[0]> = {}) {
  return render(<Spread08Preview locale="en" {...overrides} />);
}

function imagesOf(container: HTMLElement): HTMLImageElement[] {
  return Array.from(container.querySelectorAll('img'));
}

describe('Spread08Preview', () => {
  it('opens the engine session on Spread 08 along the asteroid-garden route', () => {
    renderPreview();
    expect(screen.getByRole('heading', { level: 2, name: 'Share the Light' })).toBeInTheDocument();
  });

  it('composes the rest-state layers only (response layers hidden)', () => {
    const { container } = renderPreview();
    const sources = imagesOf(container).map((image) => image.getAttribute('src'));
    expect(sources).toHaveLength(7);
    expect(sources.some((src) => src?.includes('fx-lamp-beam'))).toBe(false);
    expect(sources.some((src) => src?.includes('fx-shared-glow'))).toBe(false);
  });

  it('places the lamp interaction over the authored target region', () => {
    renderPreview();
    const lamp = screen.getByRole('button', { name: 'Star lamp' });
    expect(lamp).toHaveAttribute('data-interactive');
  });

  it('renders tappable pronunciation words in the prose', () => {
    renderPreview();
    // Word controls keep their punctuation visually ('Lumi.'), spoken values
    // strip it. S08 prose names Lumi twice, so both carry controls.
    expect(screen.getAllByRole('button', { name: /Lumi/ })).toHaveLength(2);
  });

  it('activates the response: response layers join, announcement is spoken', async () => {
    const user = userEvent.setup();
    const { container } = renderPreview();
    await user.click(screen.getByRole('button', { name: 'Star lamp' }));
    const sources = imagesOf(container).map((image) => image.getAttribute('src'));
    expect(sources).toHaveLength(9);
    expect(sources.some((src) => src?.includes('fx-lamp-beam'))).toBe(true);
    expect(screen.getByText('The lamp glows warm.')).toBeInTheDocument();
  });

  it('keeps the lamp tap on the interaction, never navigating the page', async () => {
    const user = userEvent.setup();
    renderPreview();
    await user.click(screen.getByRole('button', { name: 'Star lamp' }));
    expect(screen.getByRole('heading', { level: 2, name: 'Share the Light' })).toBeInTheDocument();
  });

  it('navigates forward with the keyboard to the next bound scene', async () => {
    const user = userEvent.setup();
    renderPreview();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('heading', { level: 2, name: 'The Warm Moon' })).toBeInTheDocument();
  });

  it('leaves the spread without the lamp when the interaction is ignored', async () => {
    const user = userEvent.setup();
    const { container } = renderPreview();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('heading', { level: 2, name: 'Lumi' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Star lamp' })).not.toBeInTheDocument();
    expect(imagesOf(container)).toHaveLength(0);
  });
});
