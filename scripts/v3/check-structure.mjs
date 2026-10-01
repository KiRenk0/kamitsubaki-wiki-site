import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { stageOf } from './stages.mjs';

// Check the enriched entries (those carrying the V3 audit marker) against the
// format-guide skeleton:
//   - no duplicate `##` heading
//   - the audit marker is the last line
//   - 参考资料 / 外部链接 form a contiguous suffix
//   - every other section is in non-decreasing stage order:
//     概述 → 创作定位 → 基本资料/设定 → 活动历程 → 代表作品 → 相关企划
// Files without the marker keep their own type-specific skeleton and are only
// counted, not listed.
const contentRoot = 'src/content';
const LOCALE_RE = /\/(zh-tw|zh-hk|zh|ja|en)\.md$/;
const MARKER_RE = /\n\n<!-- V3 RESEARCH SUPPLEMENT ([^>]*?) -->/;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.md')) out.push(p);
  }
  return out;
}

const tailProblems = [];
const orderProblems = [];
const duplicateProblems = [];
const markerProblems = [];
let checked = 0;
let skipped = 0;

for (const file of walk(contentRoot)) {
  const locale = (file.match(LOCALE_RE) || [])[1];
  if (!locale || locale === 'zh-tw' || locale === 'zh-hk') continue;
  const text = readFileSync(file, 'utf8');
  if (!MARKER_RE.test(text)) {
    skipped++;
    continue;
  }
  checked++;
  const rel = file.replace('src/content/', '');
  if (!/<!-- V3 RESEARCH SUPPLEMENT [^>]*? -->\s*$/.test(text)) markerProblems.push(rel);

  const fm = text.match(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/);
  const body = fm ? text.slice(fm[0].length) : text;
  const markerIndex = body.indexOf('\n\n<!-- V3 RESEARCH SUPPLEMENT');
  const article = markerIndex >= 0 ? body.slice(0, markerIndex) : body;

  const headings = article.split('\n').filter((l) => /^## /.test(l)).map((l) => l.slice(3).trim());
  const seen = new Map();
  for (const h of headings) {
    if (seen.has(h)) duplicateProblems.push(`${rel} :: ${h}`);
    seen.set(h, true);
  }

  const stages = headings.map((h) => stageOf(h));
  const tailIdx = stages.map((s, i) => (s >= 6 ? i : -1)).filter((i) => i >= 0);
  if (tailIdx.length) {
    const first = tailIdx[0];
    if (tailIdx.length !== stages.length - first) tailProblems.push(`${rel} (tail not contiguous)`);
    if (tailIdx[tailIdx.length - 1] !== stages.length - 1) tailProblems.push(`${rel} (content after tail)`);
  }

  let prev = 0;
  let broke = false;
  for (const s of stages) {
    if (s === null) {
      broke = true;
      break;
    }
    if (s >= 6) continue;
    if (s < prev) broke = true;
    prev = Math.max(prev, s);
  }
  if (broke) orderProblems.push(`${rel} :: ${stages.join(',')}`);
}

console.log(`enriched files checked: ${checked}; other files skipped: ${skipped}`);
console.log(`tail problems: ${tailProblems.length}`);
for (const p of tailProblems) console.log('  ' + p);
console.log(`stage-order problems: ${orderProblems.length}`);
for (const p of orderProblems) console.log('  ' + p);
console.log(`duplicate headings: ${duplicateProblems.length}`);
for (const p of duplicateProblems) console.log('  ' + p);
console.log(`marker-not-last: ${markerProblems.length}`);
for (const p of markerProblems) console.log('  ' + p);
