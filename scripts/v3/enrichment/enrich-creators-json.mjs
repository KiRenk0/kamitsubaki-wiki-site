import { readFileSync } from 'node:fs';
import { appendSections } from '../entry-append.mjs';

const langs = process.argv.slice(2).length ? process.argv.slice(2) : ['zh', 'ja', 'en'];
for (const lang of langs) {
  const data = JSON.parse(readFileSync(`scripts/v3/data/creators-${lang}.json`, 'utf8'));
  for (const [id, sections] of Object.entries(data)) {
    const n = appendSections(`people/creators/${id}`, id, lang, sections);
    console.log(`${id}/${lang}: appended ${n} sections`);
  }
}
