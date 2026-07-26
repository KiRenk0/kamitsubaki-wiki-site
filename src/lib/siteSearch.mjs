const defaultResultLimit = 12;

export function normalizeSearchText(value) {
  return String(value || '')
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/\s+/gu, ' ')
    .trim();
}

function queryTokens(query) {
  return [...new Set(normalizeSearchText(query).split(' ').filter(Boolean))];
}

function editDistance(left, right) {
  const a = [...left];
  const b = [...right];
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);

  for (let row = 0; row < a.length; row += 1) {
    const current = [row + 1];
    for (let column = 0; column < b.length; column += 1) {
      current[column + 1] = Math.min(
        current[column] + 1,
        previous[column + 1] + 1,
        previous[column] + (a[row] === b[column] ? 0 : 1),
      );
    }
    previous.splice(0, previous.length, ...current);
  }

  return previous[b.length];
}

function fuzzyTokenMatch(token, titleAndAliases) {
  if (!/^[a-z0-9.-]{4,}$/iu.test(token)) return false;
  const allowedDistance = token.length >= 9 ? 2 : 1;
  return titleAndAliases
    .split(/[^\p{L}\p{N}.-]+/gu)
    .filter((candidate) => Math.abs(candidate.length - token.length) <= allowedDistance)
    .some((candidate) => editDistance(token, candidate) <= allowedDistance);
}

function isCjkToken(value) {
  return /^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー]+$/u.test(value);
}

function fuzzyCjkMatch(token, candidateText) {
  const characters = [...token];
  if (characters.length < 2 || !isCjkToken(token)) return false;

  const allowedDistance = characters.length >= 6 ? 2 : 1;
  const chunks = String(candidateText || '').match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー]+/gu) || [];

  return chunks.some((chunk) => {
    const candidateCharacters = [...chunk];
    const minWindow = characters.length === 2
      ? 2
      : Math.max(1, characters.length - allowedDistance);
    const maxWindow = characters.length + allowedDistance;

    for (let windowLength = minWindow; windowLength <= maxWindow; windowLength += 1) {
      for (let index = 0; index + windowLength <= candidateCharacters.length; index += 1) {
        const window = candidateCharacters.slice(index, index + windowLength).join('');
        if (editDistance(token, window) <= allowedDistance) return true;
      }
    }
    return false;
  });
}

function fuzzyFieldScore(token, fields) {
  const fuzzyMatch = (value) =>
    fuzzyTokenMatch(token, value) || fuzzyCjkMatch(token, value);

  if (fuzzyMatch(fields.title)) {
    const titleLength = [...fields.title].length;
    return 300 + Math.max(0, 180 - (titleLength * 6));
  }
  if (fuzzyMatch(fields.aliases)) return 170;
  if (fuzzyMatch(fields.headings)) return 80;
  return 0;
}

function scoreEntry(entry, normalizedQuery, tokens) {
  const title = normalizeSearchText(entry.titleKey || entry.title);
  const aliases = normalizeSearchText(entry.aliasKey || (Array.isArray(entry.aliases) ? entry.aliases.join(' ') : ''));
  const description = normalizeSearchText(entry.descriptionKey || entry.description);
  const headings = normalizeSearchText(entry.headingKey || (Array.isArray(entry.headings) ? entry.headings.join(' ') : ''));
  const url = normalizeSearchText(entry.path || entry.url);
  const text = normalizeSearchText(entry.searchKey || entry.searchText || entry.text);
  const haystack = `${title} ${aliases} ${description} ${headings} ${url} ${text}`;
  const highSignalText = `${title} ${aliases} ${headings}`;

  if (!tokens.every((token) =>
    haystack.includes(token)
    || fuzzyTokenMatch(token, highSignalText)
    || fuzzyCjkMatch(token, highSignalText)
  )) {
    return null;
  }

  const kindPrior = {
    artist: 48,
    album: 24,
    project: 18,
    song: 12,
    log: 0,
  };
  let score = kindPrior[entry.kind] || 0;
  if (title === normalizedQuery) score += 1200;
  if (title.startsWith(normalizedQuery)) score += 520;
  if (title.includes(normalizedQuery)) score += 320;
  if (aliases.includes(normalizedQuery)) score += 240;
  if (headings.includes(normalizedQuery)) score += 180;
  if (description.includes(normalizedQuery)) score += 150;
  if (text.includes(normalizedQuery)) score += 120;

  for (const token of tokens) {
    if (title === token) score += 280;
    else if (title.startsWith(token)) score += 180;
    else if (title.includes(token)) score += 120;

    if (aliases.includes(token)) score += 90;
    if (headings.includes(token)) score += 70;
    if (description.includes(token)) score += 60;
    if (url.includes(token)) score += 30;

    const textPosition = text.indexOf(token);
    if (textPosition >= 0) score += Math.max(8, 60 - Math.floor(textPosition / 180));
    else score += fuzzyFieldScore(token, { title, aliases, headings });
  }

  return score;
}

export function buildSearchExcerpt(entry, query, maxLength = 176) {
  const source = String(entry?.text || '').replace(/\s+/gu, ' ').trim();
  if (!source) return '';

  const normalizedSource = normalizeSearchText(source);
  const tokens = queryTokens(query);
  const positions = tokens
    .map((token) => normalizedSource.indexOf(token))
    .filter((position) => position >= 0);
  const matchPosition = positions.length ? Math.min(...positions) : 0;
  const start = Math.max(0, matchPosition - Math.floor(maxLength * 0.28));
  const end = Math.min(source.length, start + maxLength);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < source.length ? '…' : '';

  return `${prefix}${source.slice(start, end).trim()}${suffix}`;
}

export function searchSiteIndex(entries, query, options = {}) {
  const queryNormalizer = typeof options.queryNormalizer === 'function'
    ? options.queryNormalizer
    : normalizeSearchText;
  const normalizedQuery = normalizeSearchText(queryNormalizer(query));
  const tokens = queryTokens(normalizedQuery);
  const locale = options.locale ? String(options.locale) : '';
  const kind = options.kind ? String(options.kind) : '';
  const limit = Number.isFinite(options.limit) ? Math.max(1, options.limit) : defaultResultLimit;

  if (!normalizedQuery || !tokens.length || !Array.isArray(entries)) return [];

  return entries
    .filter((entry) => (!locale || entry.locale === locale) && (!kind || entry.kind === kind))
    .map((entry) => ({
      entry,
      score: scoreEntry(entry, normalizedQuery, tokens),
    }))
    .filter((candidate) => candidate.score !== null)
    .sort((left, right) =>
      right.score - left.score
      || String(left.entry.title || '').localeCompare(String(right.entry.title || ''), locale || undefined))
    .slice(0, limit)
    .map(({ entry, score }) => ({
      ...entry,
      score,
      excerpt: buildSearchExcerpt(entry, query),
    }));
}

export function searchResultPath(url) {
  try {
    const parsed = new URL(String(url || ''), 'https://kamitsubaki.wiki');
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return String(url || '#');
  }
}
