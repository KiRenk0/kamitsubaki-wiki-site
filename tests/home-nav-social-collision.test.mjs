import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readSource = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('home navigation relocates controls when the social contact panel overlaps them', async () => {
  const [homeNav, socialScript, collisionScript, styles] = await Promise.all([
    readSource('../src/components/HomeSiteNav.astro'),
    readSource('../src/scripts/socialContact.js'),
    readSource('../src/scripts/homeNavCollision.js'),
    readSource('../src/styles/global.css'),
  ]);

  assert.match(homeNav, /data-home-nav-brand[\s\S]*data-home-nav-controls-destination/);
  assert.match(homeNav, /data-home-nav-controls-origin[\s\S]*data-home-nav-portable-controls/);
  assert.match(homeNav, /data-home-nav-portable-controls[\s\S]*data-search-open[\s\S]*Language switcher[\s\S]*data-theme-switcher/);
  assert.match(homeNav, /homeNavCollision\.js/);

  assert.match(socialScript, /social-contact:statechange/);
  assert.match(socialScript, /detail: \{ open \}/);
  assert.match(collisionScript, /getBoundingClientRect\(\)/);
  assert.match(collisionScript, /rectanglesOverlap/);
  assert.match(collisionScript, /target\.append\(controls\)/);
  assert.match(collisionScript, /translate3d\(4\.5rem, 0, 0\)/);
  assert.match(collisionScript, /translate3d\(-4\.5rem, 0, 0\)/);
  assert.match(collisionScript, /prefers-reduced-motion: reduce/);

  assert.match(styles, /\.site-nav__controls-destination:not\(:empty\)/);
  assert.match(styles, /\.site-nav__controls-destination \.site-nav__portable-controls\s*\{[\s\S]*align-items: flex-start/);
});
