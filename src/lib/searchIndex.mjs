const whitespacePattern = /\s+/gu;

function uniqueStrings(values, maxLength = 160) {
  const seen = new Set();
  const output = [];

  for (const value of values) {
    const normalized = String(value || '').replace(whitespacePattern, ' ').trim().slice(0, maxLength);
    const key = normalized.toLocaleLowerCase();
    if (!normalized || seen.has(key)) continue;
    seen.add(key);
    output.push(normalized);
  }

  return output;
}

export function flattenIndexMetadata(value, options = {}, path = []) {
  const ignoredKeys = new Set(options.ignoredKeys ?? [
    'license',
    'theme',
    'officialLinks',
    'featuredEntries',
  ]);

  if (value === null || value === undefined || typeof value === 'boolean') return [];
  if (typeof value === 'string' || typeof value === 'number') return [String(value)];
  if (Array.isArray(value)) {
    return value.flatMap((item) => flattenIndexMetadata(item, options, path));
  }
  if (typeof value !== 'object') return [];

  return Object.entries(value).flatMap(([key, nestedValue]) =>
    ignoredKeys.has(key) ? [] : flattenIndexMetadata(nestedValue, options, [...path, key])
  );
}

export function cleanIndexText(value, maxLength = 7000) {
  return String(value || '')
    .replace(/^---[\s\S]*?---/u, ' ')
    .replace(/```[\s\S]*?```/gu, ' ')
    .replace(/~~~[\s\S]*?~~~/gu, ' ')
    .replace(/@\[[^\]]+\]\([^)]+\)/gu, ' ')
    .replace(/\{\{ruby::([^}:]+)::([^}:]+)(?:::([^}]+))?\}\}/gu, '$1 $2 $3')
    .replace(/\{\{abbr::([^}:]+)::([^}]+)\}\}/gu, '$1 $2')
    .replace(/\{\{(?:spoiler|mark|kbd|small|sub|sup)::([^}]+)\}\}/gu, '$1')
    .replace(/\{\{[^}]+\}\}/gu, ' ')
    .replace(/<rt[^>]*>[\s\S]*?<\/rt>/giu, ' ')
    .replace(/<[^>]+>/gu, ' ')
    .replace(/!\[([^\]]*)\]\([^)]+\)/gu, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/gu, '$1')
    .replace(/\[(?:\d{1,2}:)?\d{1,2}:\d{2}(?:\.\d+)?\]/gu, ' ')
    .replace(/^[|:\-\s]+$/gmu, ' ')
    .replace(/[\[\]#*_>`~|]/gu, ' ')
    .replace(whitespacePattern, ' ')
    .trim()
    .slice(0, maxLength);
}

export function extractIndexHeadings(body, maxHeadings = 24) {
  const headings = [];
  for (const match of String(body || '').matchAll(/^#{1,4}\s+(.+)$/gmu)) {
    headings.push(cleanIndexText(match[1], 120));
    if (headings.length >= maxHeadings) break;
  }
  return uniqueStrings(headings, 120);
}

export function buildIndexAliases(data) {
  return uniqueStrings([
    data.name,
    data.romanizedName,
    data.title,
    data.romanizedTitle,
    data.artist,
    data.code,
    ...(Array.isArray(data.seo?.keywords) ? data.seo.keywords : []),
  ]);
}

export function buildIndexDescription(data, body) {
  const authored = data.description || data.summary || data.profileTagline || data.seo?.description;
  if (authored) return cleanIndexText(authored, 360);

  const withoutHeading = String(body || '')
    .replace(/^#{1,6}\s+.*$/gmu, ' ')
    .split(/\n\s*\n/gu)
    .map((paragraph) => cleanIndexText(paragraph, 360))
    .find((paragraph) => paragraph.length >= 24);
  return withoutHeading || '';
}

export function buildIndexStats(entries) {
  const byLocale = {};
  const byKind = {};

  for (const entry of entries) {
    byLocale[entry.locale] = (byLocale[entry.locale] || 0) + 1;
    byKind[entry.kind] = (byKind[entry.kind] || 0) + 1;
  }

  return { total: entries.length, byLocale, byKind };
}
