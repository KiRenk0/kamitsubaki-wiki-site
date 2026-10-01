import { readFileSync, writeFileSync, renameSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';

// The Girls Revolution roster was filed under the wrong unit in both the
// classification map and the content tree. The members' own officialLinks
// (kamitsubaki.jp/artist/sinseiki/ vs /tsumitobatsu/) settle the correct mapping:
//   心世纪 SINSEIKI  : orihime, kakyoin, garasumiya
//   罪十罚 TSUMITOBATSU: mikoto, yunagi, hinageshi
const SWAP = {
  'group-sinseiki': ['orihime', 'kakyoin', 'garasumiya'],
  'group-tsumitobatsu': ['mikoto', 'yunagi', 'hinageshi']
};
const MOVES = [
  ...['orihime', 'kakyoin', 'garasumiya'].map((id) => [join('people/groups/tsumitobatsu/members', id), join('people/groups/sinseiki/members', id)]),
  ...['mikoto', 'yunagi', 'hinageshi'].map((id) => [join('people/groups/sinseiki/members', id), join('people/groups/tsumitobatsu/members', id)])
];
const LOCALES = ['zh', 'ja', 'en', 'zh-tw', 'zh-hk'];

// 1) classification map: swap the two groups' member id lists.
const mapPath = 'src/data/classification-map.json';
const map = JSON.parse(readFileSync(mapPath, 'utf8'));
const groups = map.tree.find((n) => n.id === 'people').children.find((n) => n.id === 'groups').children;
let mapTouched = 0;
for (const node of groups) {
  if (!SWAP[node.id]) continue;
  const next = SWAP[node.id];
  if (JSON.stringify(node.ids) !== JSON.stringify(next)) {
    node.ids = next;
    mapTouched++;
  }
}
writeFileSync(mapPath, JSON.stringify(map, null, 2) + '\n', 'utf8');
console.log(`classification-map groups updated: ${mapTouched}`);

// 2) move the member folders.
const moveRecords = [];
for (const [fromRel, toRel] of MOVES) {
  const from = join('src/content', fromRel);
  const to = join('src/content', toRel);
  if (!existsSync(from)) {
    console.log(`skip missing: ${from}`);
    continue;
  }
  mkdirSync(dirname(to), { recursive: true });
  renameSync(from, to);
  for (const locale of LOCALES) {
    const fromFile = join(from, `${locale}.md`);
    const toFile = join(to, `${locale}.md`);
    if (!existsSync(toFile)) continue;
    const body = readFileSync(toFile, 'utf8').replace(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '');
    moveRecords.push({
      from: fromFile,
      to: toFile,
      id: fromRel.split('/').pop(),
      locale,
      sha256: createHash('sha256').update(body).digest('hex')
    });
  }
  console.log(`moved ${fromRel} -> ${toRel}`);
}

// 3) record the relocation so the migration audit can still locate the files.
const layoutPath = 'docs/v3/reports/content-layout.json';
const layout = JSON.parse(readFileSync(layoutPath, 'utf8'));
layout.moves.push(...moveRecords);
writeFileSync(layoutPath, JSON.stringify(layout, null, 2) + '\n', 'utf8');
console.log(`relocation records appended: ${moveRecords.length} (total ${layout.moves.length})`);
