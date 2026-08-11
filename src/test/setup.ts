import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Testing Library auto-cleanup requires globals; register it explicitly since
// globals are disabled.
afterEach(() => {
  cleanup();
});
