import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'scripts/v3/enrichment/data';
const heads = new Set();
for (const f of readdirSync(dir)) {
  if (!f.endsWith('.json')) continue;
  const j = JSON.parse(readFileSync(join(dir, f), 'utf8'));
  for (const value of Object.values(j)) {
    // Two shapes exist: { path: [sections] } and { locale: { path: [sections] } }.
    const group = Array.isArray(value) ? [value] : Object.values(value);
    for (const sections of group) {
      if (!Array.isArray(sections)) continue;
      for (const s of sections) if (s && s.heading) heads.add(s.heading);
    }
  }
}
const list = [...heads].sort();
writeFileSync('/tmp/new-headings.json', JSON.stringify(list, null, 1));
console.log('distinct new headings:', list.length);
