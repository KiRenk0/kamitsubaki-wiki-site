import { readFileSync } from 'node:fs';
import { renderMarkdownFragment } from '../../src/lib/markdown.mjs';
import { getEntityRegistry } from '../../src/lib/entityRegistry.mjs';
import { renderWikiLinks } from '../../src/lib/wikiLinks.mjs';

const args = process.argv.slice(2);
const listIndex = args.indexOf('--list');
const listFile = listIndex >= 0 ? args[listIndex + 1] : '';
const files = listFile
  ? readFileSync(listFile, 'utf8').trim().split('\n').filter(Boolean)
  : args;
const registry = await getEntityRegistry();
let missingTotal = 0;
const report = [];
for (const file of files) {
  const raw = readFileSync(file, 'utf8');
  const m = raw.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  const body = m ? raw.slice(m[0].length) : raw;
  const locale = file.match(/\/(zh-tw|zh-hk|zh|ja|en)\.md$/)[1];
  const html = await renderMarkdownFragment(body);
  const { missing } = renderWikiLinks(html, registry, locale);
  if (missing.length) {
    report.push(`${file}: ${[...new Set(missing)].join(', ')}`);
    missingTotal += missing.length;
  }
}
console.log(`rendered ${files.length} files; unresolved links: ${missingTotal}`);
console.log(report.join('\n'));
