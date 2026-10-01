import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve('src/content');
const MARKER_PREFIX = '<!-- V3 RESEARCH SUPPLEMENT';

/**
 * Append-only enrichment: every original byte is preserved as a prefix, and all
 * new sections are appended after the migration-audit marker so that
 * validate-content.mjs can still verify the original body hash.
 */
export function appendSections(relPath, id, lang, sections) {
  const file = resolve(root, relPath, `${lang}.md`);
  const text = readFileSync(file, 'utf8');
  if (text.includes(MARKER_PREFIX)) {
    throw new Error(`already enriched (marker present): ${file}`);
  }
  const fresh = sections.filter((s) => !text.includes(s.heading));
  if (!fresh.length) return 0;
  const body = fresh.map((s) => `${s.heading}\n\n${s.body.trim()}\n`).join('\n');
  const next = `${text}\n\n${MARKER_PREFIX} ${id} -->\n\n${body}`;
  writeFileSync(file, next, 'utf8');
  return fresh.length;
}
