import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const contentRoot = 'src/content';
const ROOTS = ['database', 'articles', 'projects', 'lore', 'lives', 'units', 'songs', 'albums', 'artists', 'organizations', 'isotopes', 'contribute', 'chronicle', 'gallery', 'events', 'support', 'account', 'license', 'labs', 'games', 'logs'];
const pattern = new RegExp(`\\]\\(/(${ROOTS.join('|')})/`, 'g');

// Audited files must keep their original body byte-for-byte, so only the
// appended supplement may be rewritten there.
const migration = JSON.parse(readFileSync('docs/v3/reports/migration-report.json', 'utf8'));
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
const AUDITED = new Set(migration.files.map((f) => currentPath(f.path)));

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.md')) out.push(p);
  }
  return out;
}

const report = { supplementLinksFixed: 0, bodyLinksFixed: 0, skippedAuditedBodies: 0, filesFixed: 0 };

for (const file of walk(contentRoot)) {
  const locale = (file.match(/\/(zh-tw|zh-hk|zh|ja|en)\.md$/) || [])[1];
  if (!locale || locale === 'zh-tw' || locale === 'zh-hk') continue; // generated from zh
  const text = readFileSync(file, 'utf8');
  const markerIdx = text.indexOf('\n\n<!-- V3 RESEARCH SUPPLEMENT');
  const head = markerIdx >= 0 ? text.slice(0, markerIdx) : text;
  const tail = markerIdx >= 0 ? text.slice(markerIdx) : '';

  const count = (s) => (s.match(pattern) || []).length;
  const headCount = count(head);
  const tailCount = count(tail);
  if (!headCount && !tailCount) continue;

  const fix = (s) => s.replace(pattern, (_m, root) => `](/${locale}/${root}/`);

  const nextTail = fix(tail);
  report.supplementLinksFixed += tailCount;

  let nextHead = head;
  if (headCount) {
    if (AUDITED.has(file)) {
      report.skippedAuditedBodies += headCount;
    } else {
      nextHead = fix(head);
      report.bodyLinksFixed += headCount;
    }
  }

  if (nextHead !== head || nextTail !== tail) {
    writeFileSync(file, nextHead + nextTail, 'utf8');
    report.filesFixed++;
  }
}

console.log(JSON.stringify(report, null, 2));
