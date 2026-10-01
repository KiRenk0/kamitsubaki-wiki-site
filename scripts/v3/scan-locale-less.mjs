import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = ['database', 'articles', 'projects', 'lore', 'lives', 'units', 'songs', 'albums', 'artists', 'organizations', 'isotopes', 'contribute', 'chronicle', 'gallery', 'events', 'support', 'account', 'license', 'labs', 'games', 'logs'];
const re = new RegExp(`\\]\\(/(${ROOTS.join('|')})/`, 'g');

function walk(d, out = []) {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    statSync(p).isDirectory() ? walk(p, out) : p.endsWith('.md') && out.push(p);
  }
  return out;
}

let total = 0;
const hits = {};
for (const f of walk('src/content')) {
  const m = readFileSync(f, 'utf8').match(re);
  if (m) {
    total += m.length;
    hits[f] = m.length;
  }
}
console.log('locale-less internal links total:', total);
for (const [f, n] of Object.entries(hits).slice(0, 20)) console.log(`${n} ${f}`);
