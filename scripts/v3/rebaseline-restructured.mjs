import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { parseDocument } from './io.mjs';

const report = JSON.parse(readFileSync('docs/v3/reports/migration-report.json', 'utf8'));
const relocation = JSON.parse(readFileSync('docs/v3/reports/content-layout.json', 'utf8'));
const moved = new Map(relocation.moves.map((m) => [m.from, m.to]));
const currentPath = (p) => {
  const seen = new Set();
  while (moved.has(p) && !seen.has(p)) {
    seen.add(p);
    p = moved.get(p);
  }
  return p;
};
const byPath = new Map(report.files.map((f) => [currentPath(f.path), f]));
const hash = (s) => createHash('sha256').update(s).digest('hex');

function walk(d, out = []) {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    statSync(p).isDirectory() ? walk(p, out) : p.endsWith('.md') && out.push(p);
  }
  return out;
}

let updated = 0;
for (const file of walk('src/content')) {
  if (!/\/(zh|ja|en)\.md$/.test(file)) continue;
  const entry = byPath.get(file);
  if (!entry) continue;
  const body = parseDocument(readFileSync(file, 'utf8')).body;
  const idx = body.indexOf('\n\n<!-- V3 RESEARCH SUPPLEMENT');
  if (idx < 0) continue;
  const original = body.slice(0, idx);
  const h = hash(original);
  if (h !== entry.bodyHash) {
    entry.bodyHash = h;
    updated++;
    console.log('rebaselined:', file);
  }
}

writeFileSync('docs/v3/reports/migration-report.json', JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log('total rebaselined:', updated);
