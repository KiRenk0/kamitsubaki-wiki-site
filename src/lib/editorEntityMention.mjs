import { foldCjkSearchText } from './cjkSearch.mjs';
import { entityCollections, entityTypes, stableIdPattern } from './entityContract.mjs';
import { editorLocales } from './editorSource.mjs';

const segment = '[a-z0-9]+(?:-[a-z0-9]+)*';
const databasePath = new RegExp(`^/(${editorLocales.join('|')})/database/(?:${segment}/){2,8}$`);
const plainText = value => (typeof value === 'string' || typeof value === 'number' ? String(value) : '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim();

export function safeEditorEntityUrl(url, locale, id) {
  if (!editorLocales.includes(locale) || typeof id !== 'string' || !stableIdPattern.test(id) || typeof url !== 'string') return null;
  const match = databasePath.exec(url);
  if (!match || match[1] !== locale || !url.endsWith(`/${id}/`)) return null;
  return url;
}

export function normalizeEditorEntityRecord(value, locale = 'zh') {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const { id, kind, entityType } = value;
  if (!entityCollections.includes(kind) || !entityTypes.includes(entityType)) return null;
  const url = safeEditorEntityUrl(value.url, locale, id);
  const title = plainText(value.title).slice(0, 200);
  if (!url || !title) return null;
  const romanized = plainText(value.romanized).slice(0, 200);
  const aliases = Array.isArray(value.aliases) ? value.aliases.filter(alias=>typeof alias === 'string').map(alias=>plainText(alias).slice(0, 200)).filter(Boolean).slice(0, 20) : [];
  return { id, kind, entityType, typeLabel: plainText(value.typeLabel).slice(0, 100), title, romanized, aliases, url };
}

function matchScore(record, query) {
  const terms = [record.title, record.id, record.romanized, ...record.aliases].map(foldCjkSearchText).filter(Boolean);
  if (terms[0] === query || terms[1] === query) return 0;
  if (terms.some(term=>term.startsWith(query))) return 1;
  if (terms.some(term=>term.includes(query))) return 2;
  return -1;
}

/** Returns text-only records; callers should render labels using textContent. */
export function searchEditorEntityCatalog(catalog, query, { locale = 'zh', limit = 8 } = {}) {
  const folded = foldCjkSearchText(query);
  if (!Array.isArray(catalog) || !folded || !editorLocales.includes(locale)) return [];
  const count = Math.max(1,Math.min(30,Math.trunc(Number(limit)) || 8));
  return catalog.map(value=>normalizeEditorEntityRecord(value,locale)).filter(Boolean)
    .map(record=>({record,score:matchScore(record,folded)})).filter(item=>item.score>=0)
    .sort((a,b)=>a.score-b.score || a.record.title.localeCompare(b.record.title,locale) || a.record.id.localeCompare(b.record.id))
    .slice(0,count).map(item=>item.record);
}

function escapeMarkdownLabel(value) {
  return plainText(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/[\\`*_{}\[\]()#!|~]/g,'\\$&');
}

/** A catalog record with no canonical page returns null rather than a broken link. */
export function buildEditorEntityMention(value, { locale = 'zh', label } = {}) {
  const record = normalizeEditorEntityRecord(value,locale);
  if (!record) return null;
  const text = escapeMarkdownLabel(label || record.title);
  if (!text) return null;
  return { id: record.id, title: record.title, url: record.url, markdown: `[${text}](${record.url})` };
}
