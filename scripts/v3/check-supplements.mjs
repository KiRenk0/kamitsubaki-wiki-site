import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { renderMarkdownFragment } from '../../src/lib/markdown.mjs';
import { getEntityRegistry } from '../../src/lib/entityRegistry.mjs';
import { renderWikiLinks } from '../../src/lib/wikiLinks.mjs';

const files = readFileSync(process.argv[2], 'utf8').trim().split('\n').filter(Boolean);
const registry = await getEntityRegistry();
const dir = mkdtempSync(join(tmpdir(), 'supp-'));
let bad = 0;
let enriched = 0;

for (const file of files) {
  const raw = readFileSync(file, 'utf8');
  const m = raw.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  const body = m ? raw.slice(m[0].length) : raw;
  const idx = body.indexOf('\n\n<!-- V3 RESEARCH SUPPLEMENT');
  if (idx < 0) continue;
  enriched++;
  const supplement = body.slice(idx);
  const locale = file.match(/\/(zh-tw|zh-hk|zh|ja|en)\.md$/)[1];
  const html = await renderMarkdownFragment(supplement);
  const { missing } = renderWikiLinks(html, registry, locale);
  if (missing.length) {
    bad++;
    console.log(`${file}: ${[...new Set(missing)].join(', ')}`);
  }
}

console.log(`checked ${enriched} enriched files; ${bad} have unresolved links inside appended supplements`);
