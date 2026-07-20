import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readAsset = (name) => readFile(new URL(`../public/brand/${name}`, import.meta.url), 'utf8');

test('square and long brand logos are valid local SVG assets', async () => {
  const [square, long] = await Promise.all([
    readAsset('kamitsubakiwiki-square.svg'),
    readAsset('kamitsubakiwiki-long.svg'),
  ]);

  assert.match(square, /<svg[^>]+viewBox="0 0 400 400"/);
  assert.match(long, /<svg[^>]+viewBox="0 0 1577 400"/);
  assert.doesNotMatch(square, /<script|javascript:/i);
  assert.doesNotMatch(long, /<script|javascript:/i);
});

test('site footer closes the page with the long brand logo', async () => {
  const footer = await readFile(new URL('../src/components/SiteFooter.astro', import.meta.url), 'utf8');

  assert.match(footer, /src="\/brand\/kamitsubakiwiki-long\.svg"/);
  assert.match(footer, /alt=\{footerLogoAlt\}/);
  assert.match(footer, /width="1577"/);
  assert.match(footer, /height="400"/);
});
