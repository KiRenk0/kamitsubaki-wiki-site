import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { stageOf } from './stages.mjs';

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.md')) out.push(p);
  }
  return out;
}

const MARKER = '\n\n<!-- V3 RESEARCH SUPPLEMENT';
const counts = new Map();
for (const file of walk('src/content')) {
  const locale = (file.match(/\/(zh-tw|zh-hk|zh|ja|en)\.md$/) || [])[1];
  if (!locale || locale === 'zh-tw' || locale === 'zh-hk') continue;
  if (file.includes('/contribute/')) continue;
  const text = readFileSync(file, 'utf8');
  if (!text.includes(MARKER)) continue;
  const fm = text.match(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/);
  if (!fm) continue;
  const body = text.slice(fm[0].length);
  const article = body.slice(0, body.indexOf(MARKER));
  for (const line of article.split('\n')) {
    if (!/^## /.test(line)) continue;
    const h = line.slice(3).trim();
    if (!counts.has(h)) counts.set(h, { n: 0, stage: stageOf(line), files: [] });
    const c = counts.get(h);
    c.n++;
    if (c.files.length < 3) c.files.push(file.replace('src/content/', ''));
  }
}

const rows = [...counts.entries()].sort((a, b) => b[1].n - a[1].n);
const unknown = rows.filter(([, v]) => v.stage === null);
console.log(`marked-entry headings: ${rows.length} distinct; unclassified: ${unknown.length} (${unknown.reduce((s, [, v]) => s + v.n, 0)} occ)`);
console.log('\n--- unclassified ---');
for (const [h, v] of unknown) console.log(`${String(v.n).padStart(3)}  ${h}   [${v.files.join(', ')}]`);
console.log('\n--- by stage ---');
for (const stage of [0, 1, 2, 3, 4, 5, 5.5, 6, 7]) {
  const list = rows.filter(([, v]) => v.stage === stage);
  console.log(`\n[stage ${stage}] ${list.reduce((s, [, v]) => s + v.n, 0)} occ / ${list.length} distinct`);
  for (const [h] of list) console.log('   ' + h);
}
