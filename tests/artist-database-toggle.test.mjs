import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

async function readProjectFile(path) {
  return readFile(new URL(path, import.meta.url), 'utf8');
}

test('artist categories keep six rows visible and group extra rows in an accessible collapsible region', async () => {
  const component = await readProjectFile('../src/components/ArtistDatabase.astro');

  assert.match(component, /ITEMS_PER_CATEGORY = 6/);
  assert.match(component, /slice\(0, ITEMS_PER_CATEGORY\)/);
  assert.match(component, /slice\(ITEMS_PER_CATEGORY\)/);
  assert.match(component, /data-artist-collapsible/);
  assert.match(component, /aria-hidden="true"/);
  assert.match(component, /\binert\b/);
  assert.match(component, /<ExpandControl\b/);
});

test('artist category toggle synchronizes animation, accessibility, and localized button state', async () => {
  const script = await readProjectFile('../src/scripts/siteInteractions.js');
  const expansion = await readProjectFile('../src/lib/recordExpansion.mjs');
  const control = await readProjectFile('../src/components/ExpandControl.astro');
  const styles = await readProjectFile('../src/styles/global.css');

  assert.match(script, /setExpandablePanel/);
  assert.match(expansion, /collapsible\.dataset\.expanded/);
  assert.match(expansion, /collapsible\.setAttribute\('aria-hidden'/);
  assert.match(expansion, /collapsible\.inert/);
  assert.match(expansion, /--artist-collapsible-height/);
  assert.match(expansion, /inner\.scrollHeight/);
  assert.match(control, /data-artist-expand-copy/);
  assert.doesNotMatch(expansion, /scrollIntoView\(\{ behavior: 'smooth', block: 'center' \}\)/);
  assert.match(styles, /\.artist-collapsible[\s\S]*max-height: 0/);
  assert.match(styles, /\.artist-collapsible\[data-expanded="true"\][\s\S]*max-height: var\(--artist-collapsible-height/);
  assert.match(styles, /prefers-reduced-motion: reduce[\s\S]*\.artist-collapsible/);
});
