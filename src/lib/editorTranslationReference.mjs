import { editorCollections, editorLocales, sourceRequest } from './editorSource.mjs';
import { importMarkdown } from './visualEditor.mjs';

function sourceParts(path) {
  if (typeof path !== 'string' || !sourceRequest(path)) return null;
  const match = path.match(/^src\/content\/([^/]+)\/((?:[^/]+\/)+)(zh|ja|en)\.md$/);
  if (!match || !editorCollections.includes(match[1])) return null;
  return { collection: match[1], directory: `src/content/${match[1]}/${match[2]}`, locale: match[3] };
}

/** A reference always uses the same entity directory and a supported authored locale. */
export function translationReferenceTargets(currentPath) {
  const source = sourceParts(currentPath);
  if (!source) return [];
  return editorLocales.filter(locale => locale !== source.locale).map(locale => {
    const path = `${source.directory}${locale}.md`;
    return { locale, path, request: sourceRequest(path) };
  });
}

function readOnlyBlock(block, index) {
  const rows = block.type === 'lyrics' ? Object.freeze((block.rows || []).map(row => Object.freeze({
    original: String(row.original || ''),
    kana: String(row.kana || ''),
    romaji: String(row.romaji || ''),
    translation: String(row.translation || ''),
    time: String(row.time || row.units?.[0]?.time || ''),
  }))) : undefined;
  const text = block.text ?? block.title ?? block.caption ?? (block.type === 'table'
    ? (block.rows || []).map(row => row.join(' | ')).join('\n')
    : rows ? rows.map(row => [row.original, row.translation].filter(Boolean).join(' | ')).join('\n') : '');
  return Object.freeze({
    index,
    type: block.type,
    text: String(text || ''),
    source: String(block.originalSource || ''),
    ...(block.level ? { level: Number(block.level) } : {}),
    ...(rows ? { rows } : {}),
  });
}

/**
 * Load one published translation through the existing static editor-source bucket.
 * `blocks[*].source` is source text, never trusted HTML; render it with textContent
 * or the existing sanitized reader renderer. The returned data cannot edit a draft.
 */
export async function loadTranslationReference(currentPath, targetLocale, {
  fetcher = globalThis.fetch,
  signal,
  expectedEntityId,
} = {}) {
  const target = translationReferenceTargets(currentPath).find(item => item.locale === targetLocale);
  if (!target) return { status: 'unavailable', locale: targetLocale, reason: currentPath ? 'invalid-path-or-locale' : 'new-entry' };
  try {
    if (typeof fetcher !== 'function') throw new TypeError('Fetch is unavailable');
    const response = await fetcher(target.request, { signal });
    if (!response?.ok) return { ...target, status: 'error', reason: 'http', httpStatus: response?.status ?? null };
    let payload;
    try { payload = await response.json(); }
    catch { return { ...target, status: 'error', reason: 'invalid-response' }; }
    const files = payload?.files;
    if (!files || typeof files !== 'object' || Array.isArray(files)) return { ...target, status: 'error', reason: 'invalid-response' };
    const actualPath = Object.keys(files).find(path => path.normalize('NFC') === target.path.normalize('NFC'));
    if (!actualPath) return { ...target, status: 'missing' };
    if (typeof files[actualPath] !== 'string') return { ...target, status: 'error', reason: 'invalid-response' };
    let imported;
    try {
      imported = importMarkdown(files[actualPath], sourceParts(actualPath)?.collection || '', actualPath);
    } catch {
      return { ...target, status: 'error', reason: 'invalid-source' };
    }
    if (imported.meta.locale !== targetLocale || expectedEntityId && imported.meta.id && imported.meta.id !== expectedEntityId) {
      return { ...target, status: 'error', reason: 'source-mismatch' };
    }
    return {
      ...target,
      status: 'ready',
      title: String(imported.meta.name || imported.meta.title || imported.meta.id || ''),
      entityId: imported.meta.id || null,
      blocks: Object.freeze(imported.blocks.map(readOnlyBlock)),
    };
  } catch (error) {
    return { ...target, status: signal?.aborted || error?.name === 'AbortError' ? 'aborted' : 'error', reason: signal?.aborted || error?.name === 'AbortError' ? 'aborted' : 'network' };
  }
}

export async function loadTranslationReferences(currentPath, options = {}) {
  return Promise.all(translationReferenceTargets(currentPath).map(target => loadTranslationReference(currentPath, target.locale, options)));
}

function structuralPairs(current, reference, startA, endA, startB, endB) {
  const left = current.slice(startA, endA);
  const right = reference.slice(startB, endB);
  const signature = block => block?.type === 'heading' ? `heading:${block.level}` : block?.type;
  if (!left.length || !right.length) return [];
  // Bound memory for unusually long pages; the fallback never links different types.
  if (left.length * right.length > 250_000) {
    return left.flatMap((block, offset) => signature(block) === signature(right[offset])
      ? [[startA + offset, startB + offset]] : []);
  }
  const table = Array.from({ length: left.length + 1 }, () => new Uint16Array(right.length + 1));
  for (let i = left.length - 1; i >= 0; i--) for (let j = right.length - 1; j >= 0; j--) {
    table[i][j] = signature(left[i]) === signature(right[j])
      ? table[i + 1][j + 1] + 1
      : Math.max(table[i + 1][j], table[i][j + 1]);
  }
  const pairs = [];
  for (let i = 0, j = 0; i < left.length && j < right.length;) {
    if (signature(left[i]) === signature(right[j])) {
      pairs.push([startA + i, startB + j]);
      i++; j++;
    } else if (table[i + 1][j] >= table[i][j + 1]) i++;
    else j++;
  }
  return pairs;
}

/** Align structural blocks within matching heading sections; omit uncertain pairs. */
export function alignTranslationBlocks(currentBlocks, referenceBlocks) {
  const current = Array.isArray(currentBlocks) ? currentBlocks : [];
  const references = Array.isArray(referenceBlocks) ? referenceBlocks : [];
  const currentHeadings = current.flatMap((block, index) => block?.type === 'heading' ? [{ type: 'heading', level: block.level, index }] : []);
  const referenceHeadings = references.flatMap((block, index) => block?.type === 'heading' ? [{ type: 'heading', level: block.level, index }] : []);
  const headingPairs = structuralPairs(currentHeadings, referenceHeadings, 0, currentHeadings.length, 0, referenceHeadings.length)
    .map(([left, right]) => [currentHeadings[left].index, referenceHeadings[right].index]);
  const anchors = [[-1, -1], ...headingPairs, [current.length, references.length]];
  const pairs = new Map(headingPairs);
  for (let i = 1; i < anchors.length; i++) {
    const [startA, startB] = anchors[i - 1];
    const [endA, endB] = anchors[i];
    for (const [left, right] of structuralPairs(current, references, startA + 1, endA, startB + 1, endB)) pairs.set(left, right);
  }
  return current.map((block, currentIndex) => ({
    currentIndex,
    referenceIndex: pairs.get(currentIndex) ?? null,
    sameType: pairs.has(currentIndex) && block?.type === references[pairs.get(currentIndex)]?.type,
  }));
}
