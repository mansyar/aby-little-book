import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('application shell', () => {
  it('renders the accessible application landmark', () => {
    render(<App />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders the application title as the top-level heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Aby Little Book' })).toBeInTheDocument();
  });

  it('renders the localized initial state for the default locale', () => {
    render(<App />);
    expect(screen.getByText('Getting ready…')).toBeInTheDocument();
  });

  it('keeps the initial state calm and non-blaming', () => {
    render(<App />);
    const status = screen.getByText('Getting ready…');
    expect(status).not.toHaveTextContent(/error|wrong|fail/i);
  });
});
