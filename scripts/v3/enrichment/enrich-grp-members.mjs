import { readFileSync } from 'node:fs';
import { appendSections } from '../entry-append.mjs';
import { getEntityRegistry } from '../../../src/lib/entityRegistry.mjs';

// Build per-member song archives for the Girls Revolution Project roster
// directly from the entity registry, so dates and credits stay canonical.
const members = [
  { id: 'garasumiya', path: 'people/groups/tsumitobatsu/members/garasumiya', unit: 'tsumitobatsu' },
  { id: 'kakyoin', path: 'people/groups/tsumitobatsu/members/kakyoin', unit: 'tsumitobatsu' },
  { id: 'yunagi', path: 'people/groups/sinseiki/members/yunagi', unit: 'sinseiki' },
  { id: 'mikoto', path: 'people/groups/sinseiki/members/mikoto', unit: 'sinseiki' },
  { id: 'hinageshi', path: 'people/groups/sinseiki/members/hinageshi', unit: 'sinseiki' }
];

const registry = await getEntityRegistry();
const all = registry.list('zh');

const byMember = new Map(members.map((m) => [m.id, []]));
for (const e of all) {
  const d = e.data;
  if (d.entityType !== 'work-track') continue;
  const roles = (d.performers || []).filter((p) => byMember.has(p.entity));
  if (!roles.length) continue;
  const primary = roles.some((r) => ['lead-vocal', 'vocal', 'singer'].includes(r.role));
  if (!primary) continue;
  byMember.get(roles[0].entity).push(d);
}

const head = {
  zh: '## 个人曲目档案',
  ja: '## 個人楽曲アーカイブ',
  en: '## Solo Song Archive'
};
const note = {
  zh: '> **数据来源**：以下曲目由本站实体登记表（Metadata Schema v2）自动汇总，日期与演唱者以条目元数据为准；组合曲与合唱曲另见所属组合与[少女革命計画](/database/projects/girls-revolution-project)总条目。',
  ja: '> **データ出典**：以下の曲目は本サイトの実体登録表（Metadata Schema v2）から自動集計したもので、日付と歌唱者は各項目のメタデータに準拠する。ユニット曲・合唱曲は所属ユニットおよび[少女革命計画](/database/projects/girls-revolution-project)の総項目を参照。',
  en: '> **Source**: the tracks below are compiled automatically from this site’s entity registry (Metadata Schema v2); dates and performers follow each entry’s metadata. Unit and duet songs are listed on the group entry and the [Girls Revolution Project](/database/projects/girls-revolution-project) overview.'
};

for (const m of members) {
  const tracks = byMember
    .get(m.id)
    .filter((d) => (d.performers || []).some((p) => ['lead-vocal', 'vocal', 'singer'].includes(p.role) && p.entity === m.id))
    .sort((a, b) => String(a.releaseDate || '').localeCompare(String(b.releaseDate || '')));
  if (!tracks.length) {
    console.log(`${m.id}: no tracks found, skipped`);
    continue;
  }
  const rowsZh = tracks
    .map((d) => `| ${d.releaseDate || '—'} | ${d.title || d.romanizedTitle || d.id} | ${(d.credits || []).find((c) => c.role === 'composer')?.name || '—'} |`)
    .join('\n');
  const body = {
    zh: `本条目收录的独唱曲目如下（按发行/公开时间排序）：\n\n| 日期 | 曲目 | 作曲 |\n| :--- | :--- | :--- |\n${rowsZh}\n\n${note.zh}`,
    ja: `本項目に収録された独唱曲は以下の通り（公開・配信日順）。\n\n| 日付 | 曲目 | 作曲 |\n| :--- | :--- | :--- |\n${rowsZh}\n\n${note.ja}`,
    en: `The solo tracks recorded for this member are listed below in release order.\n\n| Date | Track | Composer |\n| :--- | :--- | :--- |\n${rowsZh}\n\n${note.en}`
  };
  for (const lang of ['zh', 'ja', 'en']) {
    const n = appendSections(m.path, m.id, lang, [{ heading: head[lang], body: body[lang] }]);
    console.log(`${m.path}/${lang}: appended ${n}`);
  }
}
