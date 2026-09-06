import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const script = await readFile(new URL('../public/games/theme.js', import.meta.url), 'utf8');

function mount({ parentRoot, frameId, preference = null, dark = false, blocked = false, crossOrigin = false } = {}) {
  const root = { dataset: {} }, listeners = {}, observers = [];
  let systemListener, metaColor;
  const system = { matches: dark, addEventListener: (_, callback) => { systemListener = callback; } };
  const window = { matchMedia: () => system, addEventListener: (name, callback) => { listeners[name] = callback; } };
  window.frameElement = frameId ? { id: frameId } : null;
  window.parent = parentRoot ? { document: { documentElement: parentRoot } } : window;
  if (crossOrigin) Object.defineProperty(window.parent = {}, 'document', { get() { throw new Error('Cross-origin'); } });
  runInNewContext(script, {
    window,
    document: { documentElement: root, querySelector: () => ({ setAttribute: (_, value) => { metaColor = value; } }) },
    localStorage: { getItem() { if (blocked) throw new Error('Storage blocked'); return preference; } },
    MutationObserver: class { constructor(callback) { this.callback = callback; } observe(target) { observers.push({ target, callback: this.callback }); } },
  });
  return {
    root, observers, get metaColor() { return metaColor; },
    systemChange(value) { system.matches = value; systemListener(); },
    storageChange(value, key = 'kamitsubaki-theme') { preference = value; listeners.storage({ key }); },
  };
}

test('both iframe levels follow the parent theme without replacing their document', () => {
  const parentRoot = { dataset: { theme: 'light' } };
  const explorer = mount({ parentRoot, preference: 'dark' });
  const runner = mount({ parentRoot: explorer.root, preference: 'dark' });
  runner.root.dataset.state = 'paused';
  assert.equal(explorer.root.dataset.theme, 'light');
  assert.equal(runner.root.dataset.theme, 'light');
  parentRoot.dataset.theme = 'dark';
  explorer.observers[0].callback();
  runner.observers[0].callback();
  assert.equal(runner.root.dataset.theme, 'dark');
  assert.equal(runner.root.dataset.state, 'paused');
  assert.equal(runner.metaColor, '#020908');
});

test('runner inherits Wiki navigation space only when nested inside the Wiki explorer', () => {
  const explorer = mount({ frameId: 'memory-corridor-frame' });
  const runner = mount({ parentRoot: explorer.root, frameId: 'runnerFrame' });
  assert.equal(runner.root.dataset.wikiEmbedded, 'true');
  assert.equal(runner.root.dataset.runnerEmbedded, 'true');
  const standaloneExplorer = mount();
  const standaloneRunner = mount({ parentRoot: standaloneExplorer.root, frameId: 'runnerFrame' });
  assert.equal(standaloneRunner.root.dataset.wikiEmbedded, undefined);
  assert.equal(standaloneRunner.root.dataset.runnerEmbedded, 'true');
  assert.equal(mount().root.dataset.runnerEmbedded, undefined);
});

test('standalone game follows saved preference, storage changes and system mode', () => {
  const game = mount({ preference: 'light', dark: true });
  assert.equal(game.root.dataset.theme, 'light');
  game.systemChange(true);
  assert.equal(game.root.dataset.theme, 'light');
  game.storageChange('dark');
  assert.equal(game.root.dataset.theme, 'dark');
  game.storageChange('system');
  game.systemChange(false);
  assert.equal(game.root.dataset.theme, 'light');
  game.storageChange(null, null);
  game.systemChange(true);
  assert.equal(game.root.dataset.theme, 'dark');
});

test('blocked storage and cross-origin embedding fall back to system theme', () => {
  const game = mount({ blocked: true, crossOrigin: true, dark: true });
  assert.equal(game.root.dataset.theme, 'dark');
  game.systemChange(false);
  assert.equal(game.root.dataset.theme, 'light');
  assert.equal(game.metaColor, '#f7f8f4');
});
