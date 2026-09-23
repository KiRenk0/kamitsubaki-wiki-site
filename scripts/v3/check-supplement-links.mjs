import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { renderMarkdownFragment } from '../../src/lib/markdown.mjs';
import { getEntityRegistry } from '../../src/lib/entityRegistry.mjs';
import { renderWikiLinks } from '../../src/lib/wikiLinks.mjs';

const contentRoot = 'src/content';
const LOCALE_RE = /\/(zh-tw|zh-hk|zh|ja|en)\.md$/;
// Forms the runtime link resolver rewrites on its own.
const RESOLVER_RE = /^\/(?:zh-tw|zh-hk|zh|ja|en)\/(?:artists|projects|songs|albums|organizations|lives)(?:\/[^?#]*)?(?:[?#].*)?$/;
const STATIC = new Set(['', '/contribute', '/contribute/', '/chronicle', '/gallery', '/events', '/support', '/account', '/license', '/labs', '/database', '/songs', '/albums', '/artists', '/projects', '/lore', '/lives', '/units', '/isotopes', '/organizations', '/articles', '/games', '/logs', '/beta']);

const registry = await getEntityRegistry();
const valid = new Set(Object.keys(registry.legacyRoutes || {}).map((p) => p.replace(/\/$/, '')));
for (const [, group] of registry.entities) {
  for (const [, e] of group) {
    try {
      valid.add(registry.resolveEntityUrl(e.data.id, 'zh').replace(/^\/zh/, '').replace(/\/$/, ''));
    } catch {
      /* ignore */
    }
  }
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.md')) out.push(p);
  }
  return out;
}

const problems = [];
let checked = 0;
let resolverMissing = 0;
let files = 0;

for (const file of walk(contentRoot)) {
  const locale = (file.match(LOCALE_RE) || [])[1];
  if (!locale) continue;
  const text = readFileSync(file, 'utf8');
  const idx = text.indexOf('\n\n<!-- V3 RESEARCH SUPPLEMENT');
  if (idx < 0) continue;
  files++;
  const supplement = text.slice(idx);
  const authored = [...supplement.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]).filter((h) => h.startsWith('/'));
  checked += authored.length;

  // 1) Forms the runtime resolver handles: rely on its own `missing` report.
  const html = await renderMarkdownFragment(supplement);
  const { missing } = renderWikiLinks(html, registry, locale);
  for (const m of [...new Set(missing)]) {
    resolverMissing++;
    problems.push(`${relative('.', file)}  runtime-unresolved: ${m}`);
  }

  // 2) Canonical /database/... and other non-resolver forms: verify statically.
  for (const href of authored) {
    if (RESOLVER_RE.test(href)) continue;
    const loc = href.match(/^\/(zh-tw|zh-hk|zh|ja|en)(\/.*)?$/);
    if (!loc) {
      problems.push(`${relative('.', file)}  locale-less: ${href}`);
      continue;
    }
    if (loc[1] !== locale) {
      problems.push(`${relative('.', file)}  locale mismatch (file=${locale}): ${href}`);
      continue;
    }
    const path = (loc[2] || '').replace(/[?#].*$/, '').replace(/\/$/, '');
    if (valid.has(path) || STATIC.has(path)) continue;
    const parts = path.split('/').filter(Boolean);
    if (parts.length <= 2 && STATIC.has('/' + parts[0])) continue;
    problems.push(`${relative('.', file)}  unresolved-route: ${href}`);
  }
}

console.log(`supplement files: ${files}; internal links checked: ${checked}`);
console.log(`runtime-unresolved: ${resolverMissing}`);
console.log(`problems: ${problems.length}`);
for (const p of problems.slice(0, 40)) console.log('  ' + p);
