import { readFileSync } from 'node:fs';
import { appendSections } from '../entry-append.mjs';

const file = process.argv[2];
const lang = process.argv[3];
if (!file || !lang) throw new Error('usage: node enrich-by-path.mjs <jsonFile> <lang>');

const data = JSON.parse(readFileSync(file, 'utf8'));
for (const [relPath, sections] of Object.entries(data)) {
  const id = relPath.split('/').pop();
  const n = appendSections(relPath, id, lang, sections);
  console.log(`${relPath}/${lang}: appended ${n} sections`);
}
