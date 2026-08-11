import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';

const PACKAGE_PATH = resolve(process.cwd(), 'package.json');

function packageVersion(): string {
  const packageJson = JSON.parse(readFileSync(PACKAGE_PATH, 'utf8')) as {
    version: string;
  };
  return packageJson.version;
}

function shortCommit(): string {
  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
      encoding: 'utf8',
    }).trim();
  } catch {
    return 'unknown';
  }
}

// Writes dist/version.json at the end of every production build so the deployed
// output can be identified exactly. Content is deterministic apart from the
// build timestamp, which intentionally marks the release build moment.
export function versionJsonPlugin(): Plugin {
  let outDir = 'dist';
  return {
    name: 'aby-little-book:version-json',
    configResolved(config) {
      outDir = config.build.outDir;
    },
    closeBundle() {
      const versionInfo = {
        name: 'aby-little-book',
        version: packageVersion(),
        commit: shortCommit(),
        buildTime: new Date().toISOString(),
      };
      mkdirSync(outDir, { recursive: true });
      writeFileSync(
        resolve(outDir, 'version.json'),
        `${JSON.stringify(versionInfo, null, 2)}\n`,
        'utf8',
      );
    },
  };
}
