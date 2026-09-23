import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { getEntityRegistry } from '../../src/lib/entityRegistry.mjs';
import { entityRoute } from '../../src/lib/entityModel.mjs';

const contentRoot = 'src/content';
const LOCALE_RE = /\/(zh-tw|zh-hk|zh|ja|en)\.md$/;
const LINK_RE = /\]\((\/(?:zh-tw|zh-hk|zh|ja|en)\/database\/[^)\s]+)\)/g;

const registry = await getEntityRegistry();

const ROUTE_MAP = new Map();
for (const [, group] of registry.entities) {
  for (const [, e] of group) {
    try {
      ROUTE_MAP.set(entityRoute(e.data).replace(/\/$/, ''), entityRoute(e.data));
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

let fixed = 0;
let files = 0;
const unresolved = [];

for (const file of walk(contentRoot)) {
  const locale = (file.match(LOCALE_RE) || [])[1];
  if (!locale) continue;
  const text = readFileSync(file, 'utf8');
  const idx = text.indexOf('\n\n<!-- V3 RESEARCH SUPPLEMENT');
  if (idx < 0) continue;
  const head = text.slice(0, idx);
  const tail = text.slice(idx);

  let changed = false;
  const nextTail = tail.replace(LINK_RE, (whole, href) => {
    const path = href.replace(/^\/(?:zh-tw|zh-hk|zh|ja|en)/, '').replace(/[?#].*$/, '');
    const canonical = entityRouteFor(path);
    if (!canonical) {
      unresolved.push(`${file}  ${href}`);
      return whole;
    }
    const withLocale = `/${locale}${canonical.replace(/\/$/, '')}`;
    if (withLocale === href) return whole;
    changed = true;
    fixed++;
    return `](${withLocale})`;
  });

  if (changed) {
    writeFileSync(file, head + nextTail, 'utf8');
    files++;
  }
}

function entityRouteFor(path) {
  const direct = path.replace(/\/$/, '');
  const known = ROUTE_MAP.get(direct);
  if (known) return known;
  // Fallback: resolve the final path segment as a stable entity id.
  const id = decodeURIComponent(direct.split('/').pop() || '');
  const e = registry.resolveEntity(id, 'zh');
  if (!e) return null;
  try {
    return entityRoute(e.data);
  } catch {
    return null;
  }
}

console.log(`rewrote ${fixed} canonical links across ${files} files`);
if (unresolved.length) {
  console.log(`unresolved ${unresolved.length}:`);
  for (const u of [...new Set(unresolved)].slice(0, 30)) console.log('  ' + u);
}
