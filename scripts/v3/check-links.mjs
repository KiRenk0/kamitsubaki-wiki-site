import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';

const root = resolve('.');
const contentRoot = resolve('src/content');

// Valid legacy redirect paths (locale-stripped) and canonical entity routes.
const redirects = JSON.parse(readFileSync('src/data/entity-redirects.json', 'utf8'));
const valid = new Set(Object.keys(redirects).map((p) => p.replace(/\/$/, '')));

const { getEntityRegistry } = await import('../../src/lib/entityRegistry.mjs');
const { entityRoute } = await import('../../src/lib/entityModel.mjs');
const registry = await getEntityRegistry();
for (const [, group] of registry.entities) {
  for (const [, e] of group) {
    try {
      valid.add(entityRoute(e.data).replace(/\/$/, ''));
    } catch {
      /* ignore */
    }
  }
}

// Static section roots that legitimately exist as pages.
const staticRoots = new Set([
  '', '/contribute', '/contribute/edit', '/contribute/editor', '/contribute/files', '/contribute/syntax', '/contribute/format',
  '/chronicle', '/gallery', '/events', '/support', '/account', '/license', '/labs', '/database', '/songs', '/albums',
  '/artists', '/projects', '/articles', '/games', '/logs', '/beta', '/editor-source', '/search'
]);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.md')) out.push(p);
  }
  return out;
}

const only = process.argv.slice(2);
const files = (only.length ? only.map((p) => resolve(p)) : walk(contentRoot));
const problems = new Map();
let checked = 0;

for (const file of files) {
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(/\]\((\/(?:zh-tw|zh-hk|zh|ja|en)[^)\s]*)\)/g)) {
    const raw = m[1];
    const path = raw.replace(/^\/(?:zh-tw|zh-hk|zh|ja|en)/, '').replace(/[?#].*$/, '').replace(/\/$/, '');
    checked++;
    if (valid.has(path)) continue;
    if (staticRoots.has(path)) continue;
    // Allow dynamic listing pages such as /songs/<artist>/ and /artists/<id>/
    const parts = path.split('/').filter(Boolean);
    if (parts.length <= 2 && staticRoots.has('/' + parts[0])) continue;
    const key = `${path}`;
    if (!problems.has(key)) problems.set(key, []);
    problems.get(key).push(relative(root, file));
  }
}

console.log(`checked ${checked} locale links across ${files.length} files`);
console.log(`unresolved distinct targets: ${problems.size}`);
for (const [target, where] of [...problems.entries()].sort()) {
  console.log(`  ${target}  <- ${where.length} file(s): ${[...new Set(where)].slice(0, 4).join(', ')}`);
}
