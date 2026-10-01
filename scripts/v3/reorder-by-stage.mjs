import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { stageOf } from './stages.mjs';
import { hash, parseDocument } from './io.mjs';

// Canonicalise every enriched entry to the format-guide skeleton by stable-
// sorting its `##` sections by stage:
//   概述 → 创作定位 → 基本资料/设定 → 活动历程 → 代表作品 → 相关企划 →
//   参考资料 → 外部链接
// Content is only reordered, never edited: the intro (heading-less preamble)
// stays first, sections keep their relative order inside a stage, the audit
// marker stays last, and the migration hash is re-baselined.
const dry = process.argv.includes('--dry');
const MARKER = '\n\n<!-- V3 RESEARCH SUPPLEMENT';

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.md')) out.push(p);
  }
  return out;
}

function splitBlocks(text) {
  const blocks = [];
  let current = { heading: null, lines: [] };
  for (const line of text.split('\n')) {
    if (/^## /.test(line)) {
      blocks.push(current);
      current = { heading: line.trim(), lines: [line] };
    } else {
      current.lines.push(line);
    }
  }
  blocks.push(current);
  return blocks.filter((b) => b.heading !== null || b.lines.some((l) => l.trim() !== ''));
}

const serialize = (blocks) =>
  blocks
    .map((b) => b.lines.join('\n').replace(/^\n+|\s+$/g, ''))
    .filter(Boolean)
    .join('\n\n');

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

const unknownHeadings = new Set();
const duplicates = [];
const parity = new Map();
let changed = 0;
let movedSections = 0;
let rebaselined = 0;
const biggest = [];

for (const file of walk('src/content')) {
  const locale = (file.match(/\/(zh-tw|zh-hk|zh|ja|en)\.md$/) || [])[1];
  if (!locale || locale === 'zh-tw' || locale === 'zh-hk') continue;
  const text = readFileSync(file, 'utf8');
  if (!text.includes(MARKER)) continue;
  const { body } = parseDocument(text);
  const markerIndex = body.indexOf(MARKER);
  const article = body.slice(0, markerIndex);
  const markerLine = body.slice(markerIndex + 2, body.indexOf('-->', markerIndex) + 3);

  const blocks = splitBlocks(article);
  const preamble = blocks.filter((b) => !b.heading);
  const sections = blocks.filter((b) => b.heading);

  const seen = new Map();
  for (const b of sections) {
    const key = b.heading.replace(/\s+/g, ' ');
    if (seen.has(key)) duplicates.push(`${relative('src/content', file)} :: ${b.heading}`);
    seen.set(key, true);
    if (stageOf(b.heading) === null) unknownHeadings.add(b.heading);
  }

  const sorted = [...sections].sort((a, b) => stageOf(a.heading) - stageOf(b.heading));
  const orderBefore = sections.map((b) => b.heading).join(' | ');
  const orderAfter = sorted.map((b) => b.heading).join(' | ');
  const shifts = sections.filter((b, i) => sorted[i] !== b).length;
  if (shifts) {
    movedSections += shifts;
    biggest.push({ file: relative('src/content', file), shifts, orderBefore, orderAfter });
  }

  const identity = (text.match(/<!-- V3 RESEARCH SUPPLEMENT ([^>]*?) -->/) || [])[1] || file;
  if (!parity.has(identity)) parity.set(identity, []);
  const sortedStages = sorted.map((b) => stageOf(b.heading)).join(',');
  parity.get(identity).push({ locale, stages: sortedStages, n: sections.length });

  if (orderBefore === orderAfter) continue;
  changed++;
  if (dry) continue;

  const content = serialize([...preamble, ...sorted]);
  const lost = blocks.flatMap((b) => b.lines).filter((l) => l.trim() && !content.includes(l));
  if (lost.length) throw new Error(`${file}: dropped ${lost.length} line(s): ${lost[0].slice(0, 80)}`);
  writeFileSync(file, text.slice(0, text.length - body.length) + content + '\n\n' + markerLine + '\n', 'utf8');

  const entry = byPath.get(file);
  if (entry) {
    const nextHash = hash(content);
    if (entry.bodyHash !== nextHash) {
      entry.bodyHash = nextHash;
      rebaselined++;
    }
  }
}

if (!dry) writeFileSync('docs/v3/reports/migration-report.json', JSON.stringify(report, null, 2) + '\n', 'utf8');

const parityIssues = [...parity.entries()].filter(([, list]) => list.length > 1 && new Set(list.map((x) => x.stages)).size > 1);
// Split the two very different cases: locales that simply carry a different
// number of sections (content-level, expected) vs. locales whose sections exist
// 1:1 but classify to different stages (a taxonomy bug we must fix).
const classIssues = parityIssues.filter(([, list]) => new Set(list.map((x) => x.n)).size === 1);
console.log(JSON.stringify({ dry, changed, movedSections, rebaselined, unknownHeadings: unknownHeadings.size, duplicates: duplicates.length, parityIssues: parityIssues.length, classIssues: classIssues.length, countIssues: parityIssues.length - classIssues.length }, null, 2));
for (const h of unknownHeadings) console.log('  UNKNOWN ' + h);
for (const d of duplicates.slice(0, 20)) console.log('  DUP ' + d);
console.log('--- same-length classification mismatches ---');
for (const [id, list] of classIssues) console.log(`  ${id}: ${list.map((x) => x.locale + '[' + x.stages + ']').join('  ')}`);
console.log('--- section-count differences across locales ---');
for (const [id, list] of parityIssues.filter((x) => !classIssues.includes(x))) console.log(`  ${id}: ${list.map((x) => x.locale + '(' + x.n + ')').join('  ')}`);
console.log('--- largest reorders (dry) ---');
for (const b of biggest.sort((a, b) => b.shifts - a.shifts).slice(0, dry ? (process.argv.includes('--all') ? 999 : 20) : 0)) {
  console.log(`  ${b.file} (${b.shifts} moved)\n    before: ${b.orderBefore}\n    after : ${b.orderAfter}`);
}
