import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  auditPagesAssets,
  CLOUDFLARE_PAGES_MAX_ASSET_BYTES,
} from '../scripts/audit-pages-assets.mjs';

test('Cloudflare Pages asset audit reports only files above the 25 MiB limit', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'kamitsubaki-pages-assets-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'nested'));
  await Promise.all([
    writeFile(join(root, 'at-limit.json'), '12345'),
    writeFile(join(root, 'nested', 'over-limit.json'), '123456'),
    writeFile(join(root, 'small.json'), '123'),
  ]);

  const result = await auditPagesAssets(root, { maxBytes: 5 });

  assert.equal(CLOUDFLARE_PAGES_MAX_ASSET_BYTES, 25 * 1024 * 1024);
  assert.equal(result.filesScanned, 3);
  assert.deepEqual(result.largest, { path: 'nested/over-limit.json', size: 6 });
  assert.deepEqual(result.oversized, [{ path: 'nested/over-limit.json', size: 6 }]);
});

test('CI audits the generated Pages output after the static build', async () => {
  const [packageJson, workflow] = await Promise.all([
    import('../package.json', { with: { type: 'json' } }),
    import('node:fs/promises').then(({ readFile }) => readFile(
      new URL('../.github/workflows/ci.yml', import.meta.url),
      'utf8',
    )),
  ]);

  assert.equal(
    packageJson.default.scripts['pages:assets:audit'],
    'node scripts/audit-pages-assets.mjs dist',
  );
  assert.match(
    workflow,
    /- name: Build static site[\s\S]*?run: pnpm build[\s\S]*?- name: Audit Cloudflare Pages asset sizes[\s\S]*?run: pnpm pages:assets:audit/,
  );
});
