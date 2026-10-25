import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { assertNodeVersion, requiredNodeVersion } from '../scripts/check-node-version.mjs';

test('the selected runtime matches the repository security patch', () => {
  assert.doesNotThrow(() => assertNodeVersion());
  const result = spawnSync(process.execPath, ['scripts/check-node-version.mjs'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.stdout.includes(`[node-runtime] v${requiredNodeVersion}`));
  assert.ok(result.stdout.includes(process.execPath));
});

test('old runner caches, other release lines and unreviewed upgrades fail closed', () => {
  for (const version of ['22.23.3', '24.21.0', '26.12.1', '99.0.0']) {
    if (version !== requiredNodeVersion) {
      assert.throws(() => assertNodeVersion(version), /required by \.node-version/);
    }
  }
});
