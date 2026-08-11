import 'fake-indexeddb/auto';
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

  it('opens on the calm bookshelf with the story card', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 2, name: 'The Starlight Rescue' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Prepare the book' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'For grown-ups' })).toBeInTheDocument();
  });

  it('keeps the initial state calm and non-blaming', () => {
    render(<App />);
    const main = screen.getByRole('main');
    expect(main).not.toHaveTextContent(/error|wrong|fail|gagal|salah/i);
  });
});
