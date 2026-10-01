import { readFileSync, writeFileSync } from 'node:fs';
import { hash, parseDocument } from './io.mjs';

// Three song links in the migrated bodies point at slugs that never existed
// (`.../originals/<slug>`), so they rendered as unresolved. Point them at the
// canonical entity routes instead. Only the link target changes.
const REPLACEMENTS = [
  [
    'songs/kafu/originals/koechitcha-tegonne',
    'database/music/songs/single-kafu-koechitcha-tego-nne'
  ],
  [
    'songs/sooda/originals/人生geemu-feat-彗星runa-cv-younapi--犬甘uru-cv-pochi--犬甘ruru-cv-由莉子--hideya-kojima',
    'database/music/songs/single-sooda-geemu-feat-runa-cv-younapi-uru-cv-pochi-ruru-cv-hideya-kojima'
  ],
  [
    'songs/sooda/originals/人生geemu-feat-犬甘uru-cv-pochi--犬甘ruru-cv-由莉子--彗星runa-cv-younapi-sped-up',
    'database/music/songs/single-sooda-geemu-feat-uru-cv-pochi-ruru-cv-runa-cv-younapi-sped-up'
  ]
];

const TARGETS = [
  ...['zh', 'ja', 'en'].map((l) => `src/content/isotopes/kafu/${l}.md`),
  ...['zh', 'ja', 'en'].map((l) => `src/content/units/sooda/${l}.md`)
];

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

let changed = 0;
let rebaselined = 0;
for (const file of TARGETS) {
  let text = readFileSync(file, 'utf8');
  let edited = text;
  for (const [from, to] of REPLACEMENTS) edited = edited.split(from).join(to);
  if (edited === text) continue;
  // Safety: the edit must not touch the audit marker or the frontmatter.
  const before = parseDocument(text).body;
  const after = parseDocument(edited).body;
  if (before.split('\n').length !== after.split('\n').length) throw new Error('line count changed: ' + file);
  writeFileSync(file, edited, 'utf8');
  changed++;

  const entry = byPath.get(file);
  if (entry) {
    const marker = after.indexOf('\n\n<!-- V3 RESEARCH SUPPLEMENT');
    const original = marker >= 0 ? after.slice(0, marker) : after;
    const nextHash = hash(original);
    if (entry.bodyHash !== nextHash) {
      entry.bodyHash = nextHash;
      rebaselined++;
    }
  }
}

writeFileSync('docs/v3/reports/migration-report.json', JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log(JSON.stringify({ changed, rebaselined }, null, 2));
