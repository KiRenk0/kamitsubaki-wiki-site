import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export { stageOf } from './stages.mjs';
import { stageOf } from './stages.mjs';

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.md')) out.push(p);
  }
  return out;
}

const counts = new Map();
for (const file of walk('src/content')) {
  const locale = (file.match(/\/(zh-tw|zh-hk|zh|ja|en)\.md$/) || [])[1];
  if (!locale || locale === 'zh-tw' || locale === 'zh-hk') continue;
  if (file.includes('/contribute/')) continue;
  const text = readFileSync(file, 'utf8');
  const fm = text.match(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/);
  if (!fm) continue;
  const body = text.slice(fm[0].length);
  for (const line of body.split('\n')) {
    if (!/^## /.test(line)) continue;
    const h = line.slice(3).trim();
    if (!counts.has(h)) counts.set(h, { n: 0, stage: stageOf(line) });
    counts.get(h).n++;
  }
}

const rows = [...counts.entries()].sort((a, b) => b[1].n - a[1].n);
const unknown = rows.filter(([, v]) => v.stage === null);
console.log(`distinct headings: ${rows.length}; unclassified: ${unknown.length} (${unknown.reduce((s, [, v]) => s + v.n, 0)} occurrences)`);
console.log('\n--- unclassified ---');
for (const [h, v] of unknown) console.log(`${String(v.n).padStart(4)}  ${h}`);
console.log('\n--- classified sample ---');
for (const [h, v] of rows.filter(([, v]) => v.stage !== null).slice(0, 0)) console.log(h);
