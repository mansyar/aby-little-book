import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// The builders cannot execute without Blender, so this contract pins the
// seam instead: every builder must be versioned, seedable, bible-driven,
// and log its provenance for the manifest.
const BUILDERS_DIR = join(__dirname, '..', '..', 'art', 'builders');
const EXPECTED = ['dock', 'boat', 'turtle', 'child', 'lake_props'];

describe('builder contract', () => {
  it('ships one versioned builder per expected subject', () => {
    const files = readdirSync(BUILDERS_DIR);
    for (const name of EXPECTED) {
      expect(files).toContain(`${name}.py`);
      const source = readFileSync(join(BUILDERS_DIR, `${name}.py`), 'utf8');
      expect(source).toMatch(/BUILDER_NAME = '/);
      expect(source).toMatch(/BUILDER_VERSION = '\d+\.\d+\.\d+'/);
      expect(source).toMatch(/style-bible\.json/);
      expect(source).toMatch(/--seed/);
    }
  });
});
