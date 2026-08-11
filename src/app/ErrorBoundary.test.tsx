import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

function ExplodingChild(): never {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  it('renders its children when no error occurs', () => {
    render(
      <ErrorBoundary locale="en">
        <p>quiet content</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('quiet content')).toBeInTheDocument();
  });

  it('renders a calm, localized fallback when a child throws', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary locale="en">
        <ExplodingChild />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Aby Little Book' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Something went quiet');
    expect(screen.getByText('Please close the book and open it again.')).toBeInTheDocument();
    errorSpy.mockRestore();
  });

  it('uses the Indonesian fallback when the locale is id', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary locale="id">
        <ExplodingChild />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Ada yang menjadi sunyi');
    errorSpy.mockRestore();
  });
});
