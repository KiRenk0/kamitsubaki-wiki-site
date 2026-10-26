import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const requiredNodeVersion = readFileSync(new URL('../.node-version', import.meta.url), 'utf8').trim();

export function assertNodeVersion(version = process.versions.node) {
  if (version !== requiredNodeVersion) {
    throw new Error(`Node.js ${requiredNodeVersion} is required by .node-version; running ${version}. Select the pinned runtime before installing, building, releasing, or syncing.`);
  }
}

export function checkNodeVersion() {
  assertNodeVersion();
  console.log(`[node-runtime] ${process.version} (${process.execPath}); required ${requiredNodeVersion}`);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  checkNodeVersion();
}
