import { readFileSync, writeFileSync } from 'node:fs';
import { getEntityRegistry } from '../../src/lib/entityRegistry.mjs';

const lines = readFileSync('/tmp/render-report.txt', 'utf8').split('\n').slice(1).filter(Boolean);
const targets = new Map(); // link -> files
for (const line of lines) {
  const idx = line.indexOf(': ');
  if (idx < 0) continue;
  const file = line.slice(0, idx);
  for (const link of line.slice(idx + 2).split(', ')) {
    if (!link.startsWith('/')) continue;
    if (!targets.has(link)) targets.set(link, []);
    targets.get(link).push(file);
  }
}
console.log(`distinct unresolved targets: ${targets.size}`);

const registry = await getEntityRegistry();
const all = registry.list('zh');
const byId = new Map(all.map((e) => [e.data.id, e.data]));

const norm = (s) => String(s || '').toLowerCase().normalize('NFKC').replace(/[\s.·・,，、_\-—–/&'’"“”()（）[\]{}!！?？:：;；~〜]/g, '');

const proposals = [];
for (const link of targets.keys()) {
  const path = link.replace(/^\/(?:zh-tw|zh-hk|zh|ja|en)/, '');
  const parts = decodeURIComponent(path).split('/').filter(Boolean);
  const last = parts.at(-1);
  let hit = byId.get(last) ? last : null;
  if (!hit) {
    // Legacy slugs frequently end with the numeric entity suffix.
    const num = last.match(/-(\d{6,})$/);
    if (num) {
      const byNum = all.filter((e) => e.data.id.endsWith(`-${num[1]}`) || e.data.id === num[1]);
      if (byNum.length === 1) hit = byNum[0].data.id;
    }
  }
  if (!hit) {
    // Leading title fragment of a legacy slug, e.g. "吸血鬼-feat-..." -> "吸血鬼".
    const head = norm(last.split(/-feat/i)[0].split('-')[0]);
    if (head.length >= 2) {
      const kind2 = { songs: 'work-track', albums: 'work-release', projects: 'project', organizations: 'organization', lives: 'live-event' }[parts[0]];
      const owner2 = parts[0] === 'songs' || parts[0] === 'albums' ? parts[1] : null;
      const cands = all.filter((e) => {
        const d = e.data;
        if (kind2 && d.entityType !== kind2) return false;
        if (!kind2 && !['person', 'virtual-avatar', 'unit', 'software-voice'].includes(d.entityType)) return false;
        if (owner2 && d.entityType === 'work-track' && !(d.performers || []).some((p) => p.entity === owner2)) return false;
        if (owner2 && d.entityType === 'work-release' && d.primaryArtist !== owner2) return false;
        const titles = [d.title, d.name].filter(Boolean).map(norm);
        return titles.some((t) => t.startsWith(head));
      });
      const distinct = [...new Set(cands.map((e) => e.data.id))];
      if (distinct.length === 1) hit = distinct[0];
    }
  }
  if (!hit) {
    // fuzzy: same collection kind and matching title
    const kind = { songs: 'work-track', albums: 'work-release', artists: null, projects: 'project', organizations: 'organization', lives: 'live-event' }[parts[0]];
    const owner = parts[0] === 'songs' || parts[0] === 'albums' ? parts[1] : null;
    const candidates = all.filter((e) => {
      const d = e.data;
      if (kind && d.entityType !== kind) return false;
      if (!kind) {
        if (!['person', 'virtual-avatar', 'unit', 'software-voice'].includes(d.entityType)) return false;
      }
      const titles = [d.title, d.name, d.romanizedTitle, d.romanizedName].filter(Boolean).map(norm);
      const key = norm(last);
      if (!key) return false;
      if (titles.some((t) => t && (t === key || t.includes(key.slice(0, 12)) || key.includes(t.slice(0, 12))))) {
        if (owner && d.entityType !== 'work-track' && d.entityType !== 'work-release') return false;
        if (owner && d.entityType === 'work-track' && !(d.performers || []).some((p) => p.entity === owner)) return false;
        if (owner && d.entityType === 'work-release' && d.primaryArtist !== owner) return false;
        return true;
      }
      return false;
    });
    if (candidates.length >= 1) hit = candidates[0].data.id;
  }
  proposals.push({ link, hit, count: targets.get(link).length });
}

const unresolved = proposals.filter((p) => !p.hit);
const resolved = proposals.filter((p) => p.hit);
console.log(`auto-resolved: ${resolved.length}, still unresolved: ${unresolved.length}`);
console.log('\n--- resolved ---');
for (const p of resolved) console.log(`${p.link}  =>  ${p.hit}`);
console.log('\n--- unresolved ---');
for (const p of unresolved) console.log(`${p.link}  (${p.count} files)`);

if (process.argv.includes('--write')) {
  if (unresolved.length) console.log(`\nwriting resolved subset; ${unresolved.length} targets still unresolved.`);
  {
    const p = 'src/data/entity-redirects.json';
    const r = JSON.parse(readFileSync(p, 'utf8'));
    let added = 0;
    for (const { link } of resolved) {
      const path = link.replace(/^\/(?:zh-tw|zh-hk|zh|ja|en)/, '');
      const key = path.endsWith('/') ? path : `${path}/`;
      const { hit } = resolved.find((x) => x.link === link);
      if (!(key in r)) {
        r[key] = hit;
        added++;
      }
    }
    const sorted = Object.fromEntries(Object.keys(r).sort().map((k) => [k, r[k]]));
    writeFileSync(p, JSON.stringify(sorted, null, 1) + '\n', 'utf8');
    console.log(`\nadded ${added} redirects (total ${Object.keys(sorted).length})`);
  }
}
