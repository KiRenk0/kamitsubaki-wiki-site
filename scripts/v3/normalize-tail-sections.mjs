import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// Five migrated Japanese entries carried `## 外部リンク` before their final
// content section. Move the trailing reference/link sections to the end, as the
// format guide requires, and re-baseline the audit hash.
const files = [
  'src/content/isotopes/coko/ja.md',
  'src/content/isotopes/haru/ja.md',
  'src/content/isotopes/kafu/ja.md',
  'src/content/people/creators/hifi-p/ja.md',
  'src/content/units/sooda/ja.md'
];
const TAIL = /参考资料|參考資料|参考資料|外部链接|外部連結|外部リンク|References|External Links/;
const hashOf = (s) => createHash('sha256').update(s).digest('hex');

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

let fixed = 0;
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  const fm = text.match(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/);
  if (!fm) throw new Error('no frontmatter: ' + file);
  const body = text.slice(fm[0].length);
  const markerMatch = body.match(/\n\n<!-- V3 RESEARCH SUPPLEMENT ([^>]*?) -->/);
  if (!markerMatch) throw new Error('no marker: ' + file);
  const markerIndex = body.indexOf(markerMatch[0]);
  const article = body.slice(0, markerIndex);
  const markerLine = `<!-- V3 RESEARCH SUPPLEMENT ${markerMatch[1]} -->`;

  const blocks = splitBlocks(article);
  const head = blocks.filter((b) => !b.heading || !TAIL.test(b.heading));
  const tail = blocks.filter((b) => b.heading && TAIL.test(b.heading));
  // Preserve the conventional blank line between frontmatter and the body.
  const lead = /^\r?\n/.test(body) ? '\n' : '';
  const content = `${lead}${serialize([...head, ...tail])}`;

  // Reordering must never drop a line of the original article.
  const lost = blocks
    .flatMap((b) => b.lines)
    .filter((l) => l.trim() && !content.includes(l));
  if (lost.length) throw new Error(`${file}: dropped ${lost.length} line(s): ${lost[0].slice(0, 80)}`);
  if (body.slice(markerIndex + markerMatch[0].length).trim())
    throw new Error(`${file}: content follows the audit marker`);

  writeFileSync(file, `${fm[0]}${content}\n\n${markerLine}\n`, 'utf8');

  const entry = byPath.get(file);
  if (entry) entry.bodyHash = hashOf(content);
  fixed++;
  console.log('normalized:', file, '| tail sections:', tail.map((t) => t.heading).join(' '));
}

writeFileSync('docs/v3/reports/migration-report.json', JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log('fixed:', fixed);
