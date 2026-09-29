import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readSource = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('contact panel cannot move appearance controls out of the navigation menu', async () => {
  const [homeNav, chrome, styles] = await Promise.all([
    readSource('../src/components/HomeSiteNav.astro'),
    readSource('../src/scripts/quietChrome.js'),
    readSource('../src/styles/global.css'),
  ]);

  assert.match(homeNav, /data-home-nav-controls-origin[\s\S]*data-home-nav-portable-controls/);
  assert.match(homeNav, /data-search-open[\s\S]*data-home-nav-portable-controls[\s\S]*CompactLanguageSwitcher[\s\S]*data-theme-switcher/);
  assert.doesNotMatch(homeNav, /homeNavCollision|controls-destination/);
  assert.doesNotMatch(styles, /controls-destination/);
  assert.match(chrome, /menus\.filter\(other => other !== menu\)/);
});
