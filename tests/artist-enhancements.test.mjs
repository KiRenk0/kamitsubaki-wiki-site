import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import yaml from 'yaml';


async function readSource(path) {
  return readFile(new URL(path, import.meta.url), 'utf8');
}

async function readFrontmatter(path) {
  const content = await readSource(path);
  const match = content.match(/---\r?\n([\s\S]*?)\r?\n---/);
  return yaml.parse(match[1]);
}

test('artist hover and keyboard backgrounds use delegation for progressively revealed rows', async () => {
  const interactions = await readSource('../src/scripts/siteInteractions.js');
  assert.match(interactions, /closest\('\.artist-row'\)/);
  assert.match(interactions, /'pointerover', 'pointerout'/);
  assert.match(interactions, /'focusin', 'focusout'/);
  assert.match(interactions, /relatedTarget/);
});

test('artist background hover does not change entry text brightness or weight', async () => {
  const database = await readSource('../src/components/ArtistDatabase.astro');
  const styles = await readSource('../src/styles/global.css');

  assert.doesNotMatch(database, /group-hover:text-white/);
  assert.doesNotMatch(database, /glitch-text/);
  assert.doesNotMatch(styles, /\.artist-row:hover\s+\.glitch-text/);
  assert.doesNotMatch(styles, /\.artist-row:hover[^}]*text-shadow/s);
});

test('artist hover backgrounds preserve the source image colors', async () => {
  const database = await readSource('../src/components/ArtistDatabase.astro');
  const backgroundImage = database.match(/<img\s+id="artist-bg-img"[\s\S]*?\/>/)?.[0] ?? '';

  assert.notEqual(backgroundImage, '');
  assert.doesNotMatch(backgroundImage, /\bgrayscale(?:-|\b)/);
  assert.match(backgroundImage, /\bsaturate-125\b/);
});

test('artist hover background overscans the full viewport without changing its animation', async () => {
  const styles = await readSource('../src/styles/global.css');

  assert.match(styles, /\.fixed-bg-hack\s*\{[^}]*width:\s*100vw;[^}]*height:\s*100dvh;/s);
  assert.match(styles, /\.artist-bg__image\s*\{[^}]*top:\s*-2%;[^}]*left:\s*-2%;[^}]*width:\s*104%;[^}]*max-width:\s*none;[^}]*height:\s*104%;/s);
  assert.match(styles, /\.artist-bg__image\s*\{[^}]*transform:\s*scale\(1\.035\);[^}]*opacity 680ms[^}]*transform 1600ms[^}]*filter 900ms/s);
  assert.match(styles, /\.artist-bg__image\.is-active\s*\{[^}]*opacity:\s*0\.35;[^}]*transform:\s*scale\(1\);/s);
});

test('table of contents tracks the active heading from scroll position', async () => {
  const toc = await readSource('../src/components/TableOfContents.astro');

  assert.match(toc, /requestAnimationFrame/);
  assert.match(toc, /getBoundingClientRect\(\)\.top/);
  assert.match(toc, /window\.addEventListener\('scroll'/);
  assert.match(toc, /setActiveSlug/);
  assert.doesNotMatch(toc, /IntersectionObserver/);
});

test('table of contents controls anchor jumps with the same offset used for tracking', async () => {
  const toc = await readSource('../src/components/TableOfContents.astro');

  assert.match(toc, /event\.preventDefault\(\)/);
  assert.match(toc, /window\.scrollTo/);
  assert.match(toc, /history\.pushState/);
  assert.match(toc, /getAnchorOffset/);
});
