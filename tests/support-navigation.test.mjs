import test from 'node:test';
import assert from 'node:assert/strict';
import { initializeSupportNavigation } from '../src/lib/supportNavigation.mjs';

function setup(hash = '') {
  const ids = ['ways-to-support', 'running-costs', 'transparency', 'sponsor-wall'];
  const listeners = {};
  const clicks = {};
  const changedURLs = [];
  const globals = ['document', 'location', 'history', 'window', 'matchMedia', 'requestAnimationFrame', 'cancelAnimationFrame'];
  const saved = new Map(globals.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  let location = new URL(`https://example.com/zh/support/?source=wiki${hash}`);
  const panels = ids.map(id => ({
    id, hidden: false, entries: { open: false },
    closest() { return this; },
    contains(node) { return node === this || node?.panel === this; },
  }));
  const heading = { id: 'support-transparency-title', panel: panels[2], closest() { return this.panel; } };
  const tabs = ids.map(id => ({
    dataset: { supportTab: id }, attributes: {}, target: '',
    get href() { return `${location.origin}${location.pathname}${location.search}#${id}`; },
    setAttribute(key, value) { this.attributes[key] = value; },
    removeAttribute(key) { delete this.attributes[key]; },
    hasAttribute() { return false; },
    closest() { return this; },
    focus() { globalThis.document.activeElement = this; },
  }));
  const language = { href: 'https://example.com/ja/support/' };
  const nav = { querySelectorAll: () => tabs };
  const root = {
    dataset: {},
    contains: node => panels.includes(node) || node === heading,
    querySelector: selector => selector === '[data-workspace-navigation]' ? nav : {},
    querySelectorAll: () => panels,
    addEventListener: (event, listener) => { clicks[event] = listener; },
  };
  Object.assign(globalThis, {
    document: { activeElement: null, getElementById: id => panels.find(p => p.id === id) || (id === heading.id ? heading : null), querySelectorAll: () => [language] },
    location,
    history: { state: { kept: true }, pushState(state, _title, url) { assert.deepEqual(state, { kept: true }); changedURLs.push(String(url)); location = new URL(url); globalThis.location = location; } },
    window: { addEventListener: (event, listener) => { listeners[event] = listener; } },
    matchMedia: () => ({ matches: true }),
    requestAnimationFrame: () => 1,
    cancelAnimationFrame: () => {},
  });
  initializeSupportNavigation(root);
  return {
    panels, tabs, language, changedURLs,
    visible: () => panels.filter(p => !p.hidden).map(p => p.id),
    click(index, extra = {}) { const event = { button: 0, target: tabs[index], preventDefault() { this.prevented = true; }, ...extra }; clicks.click(event); return event; },
    restoreURL(hash, event = 'popstate') { location.hash = hash; globalThis.location = location; listeners[event](); },
    restore() { for (const [key, descriptor] of saved) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; } },
  };
}

test('support deep links select the owning panel and retain hash and query in language links', () => {
  const env = setup('#support-transparency-title');
  try {
    assert.deepEqual(env.visible(), ['transparency']);
    assert.equal(env.tabs[2].attributes['aria-current'], 'location');
    assert.equal(env.language.href, 'https://example.com/ja/support/?source=wiki#support-transparency-title');
  } finally { env.restore(); }
});

test('switching and history restore keep the annual report DOM and disclosure state', () => {
  const env = setup();
  try {
    const report = env.panels[2].entries;
    assert.equal(env.click(2).prevented, true);
    report.open = true;
    env.click(3);
    assert.deepEqual(env.visible(), ['sponsor-wall']);
    env.restoreURL('#transparency');
    assert.deepEqual(env.visible(), ['transparency']);
    assert.equal(env.panels[2].entries, report);
    assert.equal(report.open, true);
    assert.equal(env.changedURLs.length, 2);
  } finally { env.restore(); }
});

test('modified clicks keep native navigation and malformed hashes safely select the default', () => {
  const env = setup('#%E0%A4');
  try {
    assert.deepEqual(env.visible(), ['ways-to-support']);
    for (const extra of [{ metaKey: true }, { ctrlKey: true }, { button: 1 }]) {
      assert.equal(env.click(3, extra).prevented, undefined);
    }
    assert.equal(env.changedURLs.length, 0);
    env.restoreURL('#missing', 'hashchange');
    assert.deepEqual(env.visible(), ['ways-to-support']);
  } finally { env.restore(); }
});

test('history navigation moves focus out of the panel being hidden', () => {
  const env = setup('#transparency');
  try {
    globalThis.document.activeElement = { panel: env.panels[2] };
    env.restoreURL('#sponsor-wall');
    assert.equal(globalThis.document.activeElement, env.tabs[3]);
  } finally { env.restore(); }
});
