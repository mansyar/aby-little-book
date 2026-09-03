import 'fake-indexeddb/auto';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from './App';
import { openDatabase } from './persistence/db';
import { resetDockStory } from './persistence/dockRepos';

// The App is a thin router: the book opens on the Starlit Dock, and the two
// query branches serve the development harnesses. Flow coverage lives with
// the dock suite (DockApp.test.tsx) and the slice evidence (e2e/3d-slice).

function go(path: string): void {
  window.history.pushState({}, '', path);
}

afterEach(async () => {
  go('/');
  const db = await openDatabase();
  await resetDockStory(db);
  db.close();
});

describe('App routing', () => {
  it('opens the book on the Starlit Dock', async () => {
    go('/');
    render(<App />);
    expect(await screen.findByRole('button', { name: 'Prepare the boat' })).toBeVisible();
    expect(screen.getByText('The Starlit Dock')).toBeVisible();
  });

  it('serves the dock slice harness on ?scene=', async () => {
    go('/?scene=S02');
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'A Shy New Friend' })).toBeVisible();
  });

  it('serves the Spread 08 reference harness on ?preview=1', async () => {
    go('/?preview=1');
    render(<App />);
    expect(await screen.findByLabelText('Spread 08 preview')).toBeVisible();
  });
});
