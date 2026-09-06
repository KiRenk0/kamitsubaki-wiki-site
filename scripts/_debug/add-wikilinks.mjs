#!/usr/bin/env node
/**
 * Batch-add internal wiki links to entry bodies.
 *
 * For every zh/ja/en entry under src/content/{songs,albums,artists,projects},
 * scan the body for mentions of other entries' titles (per-locale frontmatter
 * title / artist name) and wrap them with locale-prefixed links following the
 * site convention: `[title](/{locale}/{collection}/{slugPath})`.
 *
 * Safety rules:
 * - each target is linked only on its first occurrence in a file; the entry's
 *   own title/name is never linked on its own page;
 * - frontmatter, fenced code, my-lyric-box lyric blocks, heading lines,
 *   inline code, HTML tags/comments, {{shortcodes}}, @[embeds], existing
 *   markdown links and bare URLs are never touched;
 * - title mentions must satisfy word-boundary rules (no adjacent CJK for CJK
 *   titles, no adjacent alnum for ASCII titles); 1-char titles additionally
 *   require a punctuation/quote neighbour;
 * - a title is linked only when it resolves to exactly one target: quote
 *   character (「 vs 『) and same-artist proximity break ties, otherwise the
 *   mention is left alone;
 * - the entry's own title is never linked on its own page;
 * - titles wrapped in `{{ruby::...}}` / `{{abbr::...}}` are linked by wrapping
 *   the whole shortcode (renders as <a><ruby>…</ruby></a>);
 * - existing internal links whose path is not slug-normalised (Astro
 *   slugifies ids, so `/Black-or-White-...` 404s) are rewritten to the
 *   slugified route when that route exists.
 *
 * Usage: node scripts/_debug/add-wikilinks.mjs [--dry] [--only <path-substring>]
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const YAML = require('../../node_modules/.pnpm/yaml@2.9.0/node_modules/yaml');
const { slug: githubSlug } = require('../../node_modules/.pnpm/github-slugger@2.0.0/node_modules/github-slugger');

const ROOT = join(fileURLToPath(new URL('../..', import.meta.url)), 'src', 'content');
const COLLECTIONS = ['songs', 'albums', 'artists', 'projects'];
const LOCALES = ['zh', 'zh-tw', 'zh-hk', 'ja', 'en'];
const EDIT_LOCALES = ['zh', 'ja', 'en'];
const FALLBACK_LOCALES = ['zh-tw', 'zh-hk', 'ja', 'en'];

const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const ONLY = args.find((a, i) => args[i - 1] === '--only') ?? '';
const DEBUG_SKIP = args.includes('--debug-skip');

const slugPath = (idPath) => idPath.split('/').map((s) => githubSlug(s)).join('/');

const FRONTMATTER_RE = /^\uFEFF?---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/u;

function parseFrontmatter(source) {
  const match = source.match(FRONTMATTER_RE);
  if (!match) return { prefix: '', locale: null, data: {} };
  let data = {};
  try {
    data = YAML.parse(match[0].replace(/^---[\r\n]+/, '').replace(/[\r\n]+---[\r\n]*$/, '')) ?? {};
  } catch {
    data = {};
  }
  return { prefix: match[0], locale: data.locale ?? null, data };
}

function walkLocaleFiles(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    for (const name of readdirSync(current)) {
      const full = join(current, name);
      if (statSync(full).isDirectory()) stack.push(full);
      else if (name.endsWith('.md') && LOCALES.includes(name.replace(/\.md$/, ''))) out.push(full);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// 1. Load entries and build per-locale title index + route set
// ---------------------------------------------------------------------------

const entries = []; // { collection, idPath, locale, file, data }
for (const collection of COLLECTIONS) {
  const base = join(ROOT, collection);
  for (const file of walkLocaleFiles(base)) {
    const idPath = relative(base, file).split(sep).slice(0, -1).join('/');
    const source = readFileSync(file, 'utf8');
    const { locale, data } = parseFrontmatter(source);
    if (!locale || !LOCALES.includes(locale)) continue;
    entries.push({ collection, idPath, locale, file, data });
  }
}

const titleOf = (entry) => (entry.collection === 'artists' ? entry.data.name : entry.data.title);

const routes = new Set(); // `locale/collection/slugPath`
for (const entry of entries) {
  const sp = slugPath(entry.idPath);
  routes.add(`${entry.locale}/${entry.collection}/${sp}`);
}
for (const entry of entries) {
  if (entry.locale !== 'zh') continue;
  const sp = slugPath(entry.idPath);
  for (const locale of FALLBACK_LOCALES) routes.add(`${locale}/${entry.collection}/${sp}`);
}

const index = new Map(); // locale -> Map<title, candidate[]>
for (const locale of EDIT_LOCALES) index.set(locale, new Map());
const indexTitle = (entry, rawTitle) => {
  if (typeof rawTitle !== 'string') return;
  const trimmed = rawTitle.trim();
  if (!trimmed) return;
  // Markdown-unsafe or low-signal titles are never linked.
  if (/[\[\]|*~`<>\r\n\\]/u.test(trimmed)) return;
  if (/^[0-9０-９\s/\-.月日年時分秒]{1,}$/u.test(trimmed)) return; // dates / numbers
  if (/^[\x20-\x7E]+$/u.test(trimmed) && trimmed.replace(/\s+/g, '').length < 3) return; // short ascii
  const candidate = {
    collection: entry.collection,
    idPath: entry.idPath,
    slugPath: slugPath(entry.idPath),
    topSegment: entry.idPath.split('/')[0],
    segments: new Set(entry.idPath.split('/')),
  };
  const localeMap = index.get(entry.locale);
  if (!localeMap.has(trimmed)) localeMap.set(trimmed, []);
  localeMap.get(trimmed).push(candidate);
};
for (const entry of entries) {
  if (!EDIT_LOCALES.includes(entry.locale)) continue;
  indexTitle(entry, titleOf(entry));
  // prose commonly uses the romanized short form for artist units (V.W.P)
  if (entry.collection === 'artists') indexTitle(entry, entry.data.romanizedName);
}

// ---------------------------------------------------------------------------
// 2. Aho-Corasick over titles per locale
// ---------------------------------------------------------------------------

class Aho {
  constructor() {
    this.next = [new Map()];
    this.fail = [0];
    this.out = [[]];
    this.count = 1;
  }

  add(word, id) {
    let node = 0;
    for (const ch of word) {
      if (!this.next[node].has(ch)) {
        this.next.push(new Map());
        this.fail.push(0);
        this.out.push([]);
        this.next[node].set(ch, this.count);
        this.count += 1;
      }
      node = this.next[node].get(ch);
    }
    this.out[node].push({ id, length: [...word].length });
  }

  build() {
    const queue = [];
    for (const child of this.next[0].values()) {
      this.fail[child] = 0;
      queue.push(child);
    }
    while (queue.length) {
      const node = queue.shift();
      for (const [ch, child] of this.next[node]) {
        let f = this.fail[node];
        while (f && !this.next[f].has(ch)) f = this.fail[f];
        this.fail[child] = this.next[f].get(ch) ?? 0;
        this.out[child] = this.out[child].concat(this.out[this.fail[child]]);
        queue.push(child);
      }
    }
  }

  // cb(stringStartIndex, lengthInChars, patternId)
  scan(text, cb) {
    const chars = [...text];
    const offsets = new Array(chars.length + 1);
    let cursor = 0;
    for (let i = 0; i < chars.length; i += 1) {
      offsets[i] = cursor;
      cursor += chars[i].length;
    }
    offsets[chars.length] = cursor;
    let node = 0;
    for (let i = 0; i < chars.length; i += 1) {
      const ch = chars[i];
      while (node && !this.next[node].has(ch)) node = this.fail[node];
      node = this.next[node].get(ch) ?? 0;
      for (const hit of this.out[node]) {
        cb(offsets[i + 1 - hit.length], hit.length, hit.id);
      }
    }
  }
}

const automatons = new Map(); // locale -> { ac, titles: string[] }
for (const locale of EDIT_LOCALES) {
  const titles = [...index.get(locale).keys()];
  const ac = new Aho();
  titles.forEach((t, i) => ac.add(t, i));
  ac.build();
  automatons.set(locale, { ac, titles });
}

// ---------------------------------------------------------------------------
// 3. Body segmentation into protected / text chunks
// ---------------------------------------------------------------------------

function findLyricBoxEnd(body, start) {
  const tagRe = /<div\b|<\/div\s*>/giu;
  tagRe.lastIndex = start;
  let depth = 0;
  let match;
  while ((match = tagRe.exec(body))) {
    depth += match[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return tagRe.lastIndex;
  }
  return body.length;
}

const LYRIC_BOX_OPEN = /^([ \t]*<div\s+class="my-lyric-box">)/iu;
const FENCE_LINE = /^ {0,3}(`{3,}|~{3,})/u;
const HEADING_LINE = /^ {0,3}#{1,6}\s/u;

function splitChunks(body) {
  const chunks = [];
  const pushText = (text) => { if (text) chunks.push({ text, protected: false }); };
  const pushSkip = (text) => { if (text) chunks.push({ text, protected: true }); };
  let fence = null;
  let pos = 0;
  while (pos < body.length) {
    const nl = body.indexOf('\n', pos);
    const lineEnd = nl === -1 ? body.length : nl + 1;
    const line = body.slice(pos, lineEnd);

    if (fence) {
      pushSkip(line);
      const closing = line.match(FENCE_LINE);
      if (closing && closing[1][0] === fence[0] && closing[1].length >= fence[1] && /^\s*$/u.test(line.slice(closing[1].length).trimEnd())) {
        fence = null;
      }
      pos = lineEnd;
      continue;
    }

    const box = line.match(LYRIC_BOX_OPEN);
    if (box) {
      pushText(line.slice(0, box[1].length === line.length ? 0 : box.index ?? 0));
      const absEnd = findLyricBoxEnd(body, pos + (box.index ?? 0));
      pushSkip(body.slice(pos + (box.index ?? 0), absEnd));
      pos = absEnd;
      continue;
    }

    const opening = line.match(FENCE_LINE);
    if (opening) {
      const indent = line.match(/^ {0,3}/u)[0].length;
      pushText(line.slice(0, indent));
      pushSkip(line.slice(indent));
      fence = [opening[1][0], opening[1].length];
      pos = lineEnd;
      continue;
    }

    if (HEADING_LINE.test(line)) {
      pushSkip(line);
      pos = lineEnd;
      continue;
    }

    pushText(line);
    pos = lineEnd;
  }
  // wire up cross-chunk boundary characters
  for (let i = 0; i < chunks.length; i += 1) {
    chunks[i].beforeChar = i > 0 ? chunks[i - 1].text.slice(-1) : '';
    chunks[i].afterChar = i + 1 < chunks.length ? chunks[i + 1].text.slice(0, 1) : '';
  }
  return chunks;
}

// ---------------------------------------------------------------------------
// 4. Inline protection inside text chunks
// ---------------------------------------------------------------------------

const SHORTCODE_RE = /\{\{(?:\\.|[^{}])*\}\}/gu;
const EMBED_RE = /@\[[^\]]*\]\([^)]*\)/gu;
const HTML_TAG_RE = /<!--[\s\S]*?-->|<\/?[A-Za-z][^>]*>|<https?:\/\/[^>\s]+>/gu;
const URL_RE = /https?:\/\/[^\s<>"')\]]+/gu;
const SITE_PATH_RE = /\/(?:zh-tw|zh-hk|zh|ja|en)\/(?:songs|albums|artists|projects)\/[^\s)\]]+/gu;
const FOOTNOTE_RE = /\[\^[^\]]+\]/gu;

function inlineProtectedRanges(text) {
  const ranges = [];
  const add = (re) => {
    re.lastIndex = 0;
    let match;
    while ((match = re.exec(text))) ranges.push([match.index, match.index + match[0].length]);
  };
  add(SHORTCODE_RE);
  add(EMBED_RE);
  add(HTML_TAG_RE);
  add(URL_RE);
  add(SITE_PATH_RE);
  add(FOOTNOTE_RE);
  // markdown links/images: [label](dest)
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] !== '[') continue;
    if (i > 0 && text[i - 1] === '\\') continue;
    let depth = 0;
    let end = -1;
    for (let j = i; j < text.length; j += 1) {
      if (text[j] === '\\') { j += 1; continue; }
      if (text[j] === '[') depth += 1;
      else if (text[j] === ']') {
        depth -= 1;
        if (depth === 0) { end = j; break; }
      }
    }
    if (end === -1) continue;
    let k = end + 1;
    while (k < text.length && (text[k] === ' ' || text[k] === '\t')) k += 1;
    if (text[k] !== '(') continue;
    let close = -1;
    for (let m = k + 1; m < text.length; m += 1) {
      if (text[m] === '\\') { m += 1; continue; }
      if (text[m] === ')') { close = m; break; }
    }
    if (close === -1) continue;
    ranges.push([i, close + 1]);
    i = close;
  }
  return mergeRanges(ranges);
}

function mergeRanges(ranges) {
  const sorted = ranges.slice().sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const range of sorted) {
    const last = merged[merged.length - 1];
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
    else merged.push([range[0], range[1]]);
  }
  return merged;
}

const overlapsRange = (ranges, start, end) => {
  let lo = 0;
  let hi = ranges.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (ranges[mid][1] <= start) lo = mid + 1;
    else if (ranges[mid][0] >= end) hi = mid - 1;
    else return true;
  }
  return false;
};

// ---------------------------------------------------------------------------
// 5. Matching rules
// ---------------------------------------------------------------------------

const isCJK = (ch) => !!ch && /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/u.test(ch);
const isAsciiWordChar = (ch) => !!ch && /[0-9A-Za-z_]/u.test(ch);
// Parens deliberately excluded: glosses like “slogan”（一切从这里开始） are not
// title mentions even when a word inside matches a title.
const OPEN_QUOTES = new Set(['「', '『', '《', '〈', '“', '"']);
const CLOSE_QUOTES = new Set(['」', '』', '》', '〉', '”', '"', '\'', '’']);
const QUOTES = new Set(['「', '」', '『', '』', '《', '》', '〈', '〉', '“', '”', '"', '\'']);
// Words that introduce a work mention (シングル『X』, 收录曲《X》, new single "X",
// "X" appears on <album>).
const WORK_KW_RE = /(シングル|アルバム|ミニアルバム|楽曲|デビュー曲|代表曲|表題曲|表题曲|同名曲|主題歌|主題曲|主题曲|題名曲|挿入歌|収録曲|収録|收录曲|收录|收錄|單曲|单曲|歌曲|专辑|專輯|大碟|appears on|EP\b|[Ss]ingle|[Aa]lbum|[Ss]ong\b|[Tt]rack\b|[Dd]isc\b|[曲])/u;

function matchingParen(text, openIndex) {
  const open = text[openIndex];
  const close = open === '(' ? ')' : '）';
  let depth = 0;
  for (let j = openIndex; j < text.length; j += 1) {
    if (text[j] === open) depth += 1;
    else if (text[j] === close) {
      depth -= 1;
      if (depth === 0) return j;
    }
  }
  return -1;
}

// A song/album mention is only linked when the wording actually refers to the
// work: quoted (『X』, "X"), quoted with a parenthetical suffix inside the
// quotes (『CREAM PUFF LIVE 4 (Cover Live)』), introduced by a work keyword
// (シングル「X」, new album "X", … appears on <album>), wrapped in emphasis
// (*Proto*), or inside a discography-style table/numbered track list. Bare
// keyword coincidences (slogans, motifs, event names, common words) stay
// unlinked.
function isGenuineWorkMention(chunk, start, end, sourceCollection) {
  const text = chunk.text;
  const before = start > 0 ? text[start - 1] : chunk.beforeChar;
  const after = end < text.length ? text[end] : chunk.afterChar;
  if (OPEN_QUOTES.has(before) && CLOSE_QUOTES.has(after)) return true;
  // quoted title followed by parenthetical groups before the closing quote
  if (OPEN_QUOTES.has(before)) {
    let j = end;
    for (let guard = 0; guard < 3; guard += 1) {
      while (j < text.length && /\s/u.test(text[j])) j += 1;
      if (text[j] === '(' || text[j] === '（') {
        const close = matchingParen(text, j);
        if (close === -1) break;
        j = close + 1;
        continue;
      }
      break;
    }
    while (j < text.length && /\s/u.test(text[j])) j += 1;
    if (CLOSE_QUOTES.has(text[j])) return true;
  }
  if (WORK_KW_RE.test(text.slice(Math.max(0, start - 12), start))) return true;
  if (before === '(' || before === '（') {
    if (WORK_KW_RE.test(text.slice(Math.max(0, start - 36), start))) return true;
  }
  if (before === '*' && after === '*') return true;
  if (text.includes('|') && /\d{4}年|\d{1,2}月\d{1,2}日|\d{4}-\d{1,2}-\d{1,2}|\d{4}\.\d{1,2}|[A-Za-z]{3,9} \d{1,2}, \d{4}/u.test(text)) return true;
  if (/^\s*\d{1,3}[.、)]/u.test(text) && (/\d{1,2}:\d{2}/u.test(text) || sourceCollection === 'songs' || sourceCollection === 'albums')) return true;
  return false;
}
const PUNCT = new Set(['「', '」', '『', '』', '《', '》', '〈', '〉', '（', '）', '(', ')', '【', '】', '“', '”', '"', '\'', '・', '—', '–', '―', '。', '．', '.', '，', ',', '、', '!', '！', '?', '？', ':', '：', ';', '；', '〜', '~', '…', '‥', '*', '◇', '◆', '●', '○', '▲', '▼', '□', '■', '／', '/', '｜', '|']);

function boundaryOK(before, after, title) {
  const chars = [...title];
  const first = chars[0];
  const last = chars[chars.length - 1];
  if (isAsciiWordChar(first) && isAsciiWordChar(before)) return false;
  if (isAsciiWordChar(last) && isAsciiWordChar(after)) return false;
  if (isCJK(first) && isCJK(before)) return false;
  if (isCJK(last) && isCJK(after)) return false;
  // 1-char titles (糸, 花, …) only link when actually quoted, so that ordinary
  // single characters in prose/lists never become accidental song links.
  if (chars.length === 1 && !(QUOTES.has(before) || QUOTES.has(after))) return false;
  return true;
}

// When a title exists as both a song and an album, the surrounding wording
// decides (アルバム『X』 vs 代表曲『X』); without a signal the mention is skipped.
const ALBUM_KW_RE = /(アルバム|专辑|專輯|大碟|ベスト|サントラ|OST|[Ss]oundtrack|[Aa]lbum|EP\b|ミニ|フル|精選|精选|\b\d(?:st|nd|rd|th)\b)/u;
const SONG_KW_RE = /(シングル|[Ss]ingle|单曲|單曲|歌曲|主题曲|主題曲|插曲|代表曲|楽曲|乐曲|[曲歌]|テーマ|[Tt]heme)/u;

function selectCandidate({ candidates, sourceSegments, selfURL, contextBefore }) {
  const unique = new Map();
  for (const candidate of candidates) {
    const url = `/${candidate.collection}/${candidate.slugPath}`;
    if (!unique.has(url)) unique.set(url, candidate);
  }
  if (unique.has(selfURL)) return null; // own subject is never linked
  let pool = [...unique.values()];
  if (pool.length === 1) return pool[0];

  const has = (collection) => pool.some((c) => c.collection === collection);
  if (has('songs') && has('albums')) {
    const window = (contextBefore ?? '').slice(-16);
    // singles/代表曲 point at songs; アルバム/1st point at albums
    const prefer = SONG_KW_RE.test(window) ? 'songs' : ALBUM_KW_RE.test(window) ? 'albums' : null;
    if (!prefer) return null;
    pool = pool.filter((c) => c.collection === prefer);
    if (pool.length === 1) return pool[0];
  }

  // Artists/projects take priority: unit and project names are quoted with
  // 「」 just like song titles, but a same-titled song is the rarer referent.
  const order = ['artists', 'projects', 'songs', 'albums'];
  for (const group of order) {
    const sub = pool.filter((c) => c.collection === group);
    if (!sub.length) continue;
    if (sub.length === 1) return sub[0];
    const near = sub.filter((c) => sourceSegments.has(c.topSegment));
    if (near.length === 1) return near[0];
    return null; // ambiguous within the most likely group
  }
  return null;
}

// ---------------------------------------------------------------------------
// 6. Process a file
// ---------------------------------------------------------------------------

const stats = {
  filesScanned: 0,
  filesChanged: 0,
  linksAdded: 0,
  rubyWrapped: 0,
  linksByCollection: {},
  repeatHistogram: new Map(),
  ambiguousSkipped: 0,
  boundarySkipped: 0,
  contextSkipped: 0,
  brokenLinksFixed: 0,
  deadLinks: new Map(),
};

function recordLink(target, collection, candidateCollection, usedTargets) {
  usedTargets.set(target, (usedTargets.get(target) ?? 0) + 1);
  stats.linksAdded += 1;
  const key = `${collection}->${candidateCollection}`;
  stats.linksByCollection[key] = (stats.linksByCollection[key] ?? 0) + 1;
}

function processFile(entry) {
  const { locale, collection, idPath, file, data } = entry;
  if (!EDIT_LOCALES.includes(locale)) return;
  if (ONLY && !file.replaceAll('\\', '/').includes(ONLY)) return;
  stats.filesScanned += 1;

  const source = readFileSync(file, 'utf8');
  const { prefix } = parseFrontmatter(source);
  const body = source.slice(prefix.length);
  if (!body.trim()) return;

  const selfURL = `/${collection}/${slugPath(idPath)}`;
  const sourceSegments = new Set(idPath.split('/'));
  const ownTitles = new Set();
  for (const value of [data.title, data.name]) {
    if (typeof value === 'string' && value.trim()) ownTitles.add(value.trim());
  }

  const { ac, titles } = automatons.get(locale);
  const localeIndex = index.get(locale);
  const usedTargets = new Map();
  // Existing (hand-written) internal links already occupy the first-occurrence
  // quota for their target.
  INTERNAL_LINK_RE.lastIndex = 0;
  let existingLink;
  while ((existingLink = INTERNAL_LINK_RE.exec(body))) {
    usedTargets.set(existingLink[1], (usedTargets.get(existingLink[1]) ?? 0) + 1);
  }

  // Pass A: wrap `{{ruby::TITLE::...}}` / `{{abbr::TITLE::...}}` tokens whose
  // first argument is exactly a known title.
  const chunksA = splitChunks(body);
  for (const chunk of chunksA) {
    if (chunk.protected) continue;
    const tokenRe = /\{\{(?:ruby|abbr)::((?:\\.|[^{}:])*)::/giu;
    const tokens = [];
    let tokenMatch;
    while ((tokenMatch = tokenRe.exec(chunk.text))) {
      const close = chunk.text.indexOf('}}', tokenMatch.index);
      if (close === -1) continue;
      tokens.push({ arg: tokenMatch[1], start: tokenMatch.index, end: close + 2 });
    }
    for (const token of tokens.reverse()) {
      const title = token.arg;
      const candidates = localeIndex.get(title);
      if (!candidates) continue;
      // skip tokens nested in another shortcode or inside an existing link label
      const beforeText = chunk.text.slice(0, token.start);
      if (beforeText.lastIndexOf('{{') > beforeText.lastIndexOf('}}')) continue;
      if (beforeText.lastIndexOf('[') > beforeText.lastIndexOf(']')) continue;
      const before = token.start > 0 ? chunk.text[token.start - 1] : chunk.beforeChar;
      const after = token.end < chunk.text.length ? chunk.text[token.end] : chunk.afterChar;
      if (!boundaryOK(before, after, title)) { stats.boundarySkipped += 1; continue; }
      const candidate = selectCandidate({
        candidates,
        sourceSegments,
        selfURL,
        contextBefore: chunk.text.slice(0, token.start),
      });
      if (!candidate) { stats.ambiguousSkipped += 1; continue; }
      if ((candidate.collection === 'songs' || candidate.collection === 'albums') && !isGenuineWorkMention(chunk, token.start, token.end, collection)) {
        stats.contextSkipped += 1;
        if (DEBUG_SKIP) console.error(`[skip-ctx] ${file}: {{}}${token.arg} :: ${chunk.text.slice(Math.max(0, token.start - 30), token.end + 20).replace(/\r?\n/g, ' ')}`);
        continue;
      }
      const target = `/${locale}/${candidate.collection}/${candidate.slugPath}`;
      if (usedTargets.has(target)) continue; // link only the first occurrence
      const tokenText = chunk.text.slice(token.start, token.end);
      chunk.text = chunk.text.slice(0, token.start) + `[${tokenText}](${target})` + chunk.text.slice(token.end);
      stats.rubyWrapped += 1;
      recordLink(target, collection, candidate.collection, usedTargets);
    }
  }

  const updated = chunksA.map((c) => c.text).join('');
  const chunks = updated === body ? chunksA : splitChunks(updated);

  // Pass B: plain title mentions in unprotected text.
  for (const chunk of chunks) {
    if (chunk.protected) continue;
    const protectedRanges = inlineProtectedRanges(chunk.text);
    const hits = [];
    ac.scan(chunk.text, (start, length, id) => {
      hits.push({ start, end: start + length, title: titles[id] });
    });
    hits.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));
    const accepted = [];
    let lastEnd = -1;
    for (const hit of hits) {
      if (hit.start < lastEnd) continue;
      if (overlapsRange(protectedRanges, hit.start, hit.end)) continue;
      accepted.push(hit);
      lastEnd = hit.end;
    }
    for (const hit of accepted.reverse()) {
      const title = hit.title;
      const before = hit.start > 0 ? chunk.text[hit.start - 1] : chunk.beforeChar;
      const after = hit.end < chunk.text.length ? chunk.text[hit.end] : chunk.afterChar;
      if (!boundaryOK(before, after, title)) { stats.boundarySkipped += 1; continue; }
      if (ownTitles.has(title)) { stats.ambiguousSkipped += 1; continue; }
      const candidates = localeIndex.get(title);
      if (!candidates) continue;
      const candidate = selectCandidate({
        candidates,
        sourceSegments,
        selfURL,
        contextBefore: chunk.text.slice(0, hit.start),
      });
      if (!candidate) { stats.ambiguousSkipped += 1; continue; }
      if ((candidate.collection === 'songs' || candidate.collection === 'albums') && !isGenuineWorkMention(chunk, hit.start, hit.end, collection)) {
        stats.contextSkipped += 1;
        if (DEBUG_SKIP) console.error(`[skip-ctx] ${file}: ${title} :: ${chunk.text.slice(Math.max(0, hit.start - 30), hit.end + 20).replace(/\r?\n/g, ' ')}`);
        continue;
      }
      const target = `/${locale}/${candidate.collection}/${candidate.slugPath}`;
      if (usedTargets.has(target)) continue; // link only the first occurrence
      chunk.text = chunk.text.slice(0, hit.start) + `[${title}](${target})` + chunk.text.slice(hit.end);
      recordLink(target, collection, candidate.collection, usedTargets);
    }
  }

  const result = prefix + chunks.map((c) => c.text).join('');
  for (const [, count] of usedTargets) {
    stats.repeatHistogram.set(count, (stats.repeatHistogram.get(count) ?? 0) + 1);
  }
  if (result !== source) {
    stats.filesChanged += 1;
    if (!DRY) writeFileSync(file, result, 'utf8');
  }
}

// ---------------------------------------------------------------------------
// 7. Fix non-slugified internal links; report dead links
// ---------------------------------------------------------------------------

const INTERNAL_LINK_RE = /\]\((\/(?:zh-tw|zh-hk|zh|ja|en)\/(?:songs|albums|artists|projects)\/[^\s)#?]+)\)/gu;

function fixBrokenLinks(entry) {
  if (!EDIT_LOCALES.includes(entry.locale)) return;
  if (ONLY && !entry.file.replaceAll('\\', '/').includes(ONLY)) return;
  const source = readFileSync(entry.file, 'utf8');
  const { prefix } = parseFrontmatter(source);
  const body = source.slice(prefix.length);
  let changed = false;
  const result = body.replace(INTERNAL_LINK_RE, (full, dest) => {
    const match = dest.match(/^\/(zh-tw|zh-hk|zh|ja|en)\/(songs|albums|artists|projects)\/(.*)$/u);
    if (!match) return full;
    const [, locale, targetCollection, rawPath] = match;
    const normalized = slugPath(rawPath);
    if (normalized === rawPath) return full;
    if (!routes.has(`${locale}/${targetCollection}/${normalized}`)) return full;
    stats.brokenLinksFixed += 1;
    changed = true;
    return `](${dest.slice(0, dest.length - rawPath.length)}${normalized})`;
  });
  INTERNAL_LINK_RE.lastIndex = 0;
  let deadMatch;
  while ((deadMatch = INTERNAL_LINK_RE.exec(result))) {
    const key = deadMatch[1].slice(1); // strip leading '/'
    if (!routes.has(key)) stats.deadLinks.set(key, (stats.deadLinks.get(key) ?? 0) + 1);
  }
  if (changed && !DRY) writeFileSync(entry.file, prefix + result, 'utf8');
}

for (const entry of entries) processFile(entry);
for (const entry of entries) fixBrokenLinks(entry);

// ---------------------------------------------------------------------------
// 8. Report
// ---------------------------------------------------------------------------

console.log(`files scanned: ${stats.filesScanned}`);
console.log(`files changed: ${stats.filesChanged}${DRY ? ' (dry run)' : ''}`);
console.log(`links added:   ${stats.linksAdded} (ruby-wrapped: ${stats.rubyWrapped})`);
console.log(`broken internal links fixed (slug normalisation): ${stats.brokenLinksFixed}`);
console.log('links by source->target collection:');
for (const [key, count] of Object.entries(stats.linksByCollection).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${key}: ${count}`);
}
console.log('repeats per target per file histogram:');
for (const [count, occurrences] of [...stats.repeatHistogram.entries()].sort((a, b) => a[0] - b[0])) {
  console.log(`  ${count}x: ${occurrences}`);
}
console.log(`ambiguous skipped: ${stats.ambiguousSkipped}, boundary skipped: ${stats.boundarySkipped}, bare-work-mention skipped: ${stats.contextSkipped}`);
console.log(`dead internal links: ${stats.deadLinks.size}`);
for (const [key, count] of [...stats.deadLinks.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40)) {
  console.log(`  ${key}: ${count}`);
}
