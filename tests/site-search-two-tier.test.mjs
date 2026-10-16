import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('two-tier search index separation verifies endpoint schemas', async () => {
  const [indexEndpoint, bodyEndpoint, script] = await Promise.all([
    readFile(new URL('../src/pages/[locale]/search-index.json.ts', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/[locale]/search-body.json.ts', import.meta.url), 'utf8'),
    readFile(new URL('../src/scripts/siteSearch.js', import.meta.url), 'utf8'),
  ]);

  // Primary index is lightweight
  assert.match(indexEndpoint, /schema:\s*'kamitsubaki-wiki-search-index'/);
  assert.match(indexEndpoint, /titleKey/);
  assert.match(indexEndpoint, /aliasKey/);
  assert.match(indexEndpoint, /headingKey/);
  assert.doesNotMatch(indexEndpoint, /searchKey:\s*foldCjkSearchText/);

  // Secondary index provides body full-text map
  assert.match(bodyEndpoint, /schema:\s*'kamitsubaki-wiki-search-body'/);
  assert.match(bodyEndpoint, /bodies\[id\]\s*=\s*buildSearchKey/);

  // Public JSON feeds remain for their other consumers; the dialog uses only Pagefind.
  assert.doesNotMatch(script, /search-index\.json|search-body\.json|searchSiteIndex/);
  assert.match(script, /loadEngine/);
  assert.match(script, /searchPagefind/);

});

