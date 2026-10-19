import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { JSDOM } from 'jsdom';

const require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve('vite'))('esbuild');
const [chrome, ai, navigation] = await Promise.all(['quietChrome', 'aiChatWidget', 'navigationMotion'].map(name => build({
  entryPoints: [`src/scripts/${name}.js`], platform: 'browser', bundle: true, write: false, format: 'iife',
  define: { 'import.meta.env': '{}' }, external: ['katex', 'micromark', 'micromark-extension-gfm', 'micromark-extension-math'],
})));

function tools({ reading = true, navigationMotion = false, embedded = false } = {}) {
  const dom = new JSDOM(`<main><h1>Artist</h1><button id="outside">Outside</button></main>
    <details class="tools-dock" data-chrome-menu data-tools-dock ${reading ? 'data-reader-tools' : ''}>
      <summary tabindex="0">Tools</summary><div class="tools-dock__menu">
        <aside data-support-float ${reading ? 'data-docked' : ''}>
          <button class="support-float__toggle" aria-expanded="false">Support</button>
          <div class="support-float__content" aria-hidden="true" inert><button data-support-close>Close support</button><a href="/zh/support/">Support project</a></div>
        </aside>
        <aside data-social-contact id="social-contact">
          <div data-social-contact-panel hidden><button data-social-contact-close>Close contact</button><a href="https://example.org/community/">Community</a></div>
          <button data-social-contact-toggle aria-expanded="false">Contact</button>
        </aside>
        <div data-ai-launcher><button data-ai-toggle ${reading ? 'data-reader-tool-open="ai"' : ''} aria-expanded="false">AI</button></div>
      </div>
    </details>
    <aside data-ai-chat ${embedded ? 'data-ai-presentation="embedded"' : ''} data-locale="zh" data-copy="{}" inert>
      <button data-ai-scrim>Scrim</button><section data-ai-panel aria-hidden="true">
        <button data-ai-close>Close AI</button><button data-ai-settings-toggle>Settings</button><button data-ai-history-toggle>History</button>
        <div data-ai-settings-popover hidden><button id="setting-option">Auto retrieval</button></div>
        <div data-ai-history-panel hidden><div data-ai-thread-list><div data-thread-id="test-thread">
          <button data-ai-thread-menu-toggle aria-expanded="true">Conversation actions</button>
          <div class="ai-chat__thread-actions"><div data-ai-thread-action-view="choices" hidden>Choices</div><div data-ai-thread-action-view="rename"><input data-ai-thread-rename-input value="Existing title"></div></div>
        </div></div></div>
        <div data-ai-messages><div class="ai-message--assistant"><div class="ai-message__content"></div></div></div>
        <div data-ai-quick></div><form data-ai-form><textarea data-ai-input></textarea></form>
      </section>
    </aside><a id="footer-contact" href="#social-contact">Footer contact</a>`, {
    url: 'https://wiki.example/zh/database/artists/solo/kaf/', runScripts: 'outside-only',
  });
  const w = dom.window, document = w.document, frames = [], timers = [];
  Object.defineProperty(document, 'readyState', { configurable: true, get: () => 'complete' });
  w.matchMedia = () => ({ matches: !navigationMotion, addEventListener() {}, removeEventListener() {} });
  w.requestAnimationFrame = fn => { frames.push(fn); return frames.length; };
  w.cancelAnimationFrame = () => {};
  w.setTimeout = fn => { const item = { fn, canceled: false }; timers.push(item); return item; };
  w.clearTimeout = item => { if (item) item.canceled = true; };
  w.HTMLElement.prototype.getClientRects = function () { return this.closest('[data-ai-chat]')?.classList.contains('is-open') ? [{}] : []; };
  w.fetch = () => { throw new Error('No network or message submission allowed'); };
  w.eval(chrome.outputFiles[0].text);
  w.eval(ai.outputFiles[0].text);
  if (navigationMotion) w.eval(navigation.outputFiles[0].text);
  const $ = selector => document.querySelector(selector);
  const flushFrames = () => { while (frames.length) frames.shift()(); };
  const flushTimers = () => { while (timers.length) { const timer = timers.shift(); if (!timer.canceled) timer.fn(); } };
  const dock = $('[data-tools-dock]');
  const open = () => { dock.open = true; dock.dispatchEvent(new w.Event('toggle')); };
  const escape = element => element.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
  return { dom, w, document, $, dock, open, escape, flushFrames, flushTimers };
}

test('contact Escape returns to its menu entry and footer links still open contact', () => {
  const b = tools();
  try {
    b.$('#footer-contact').click(); b.flushFrames();
    assert.equal(b.dock.open, true); assert.equal(b.$('[data-social-contact-toggle]').getAttribute('aria-expanded'), 'true');
    b.$('[data-social-contact-close]').focus(); b.escape(b.$('[data-social-contact-close]'));
    assert.equal(b.dock.open, true); assert.equal(b.$('[data-social-contact-toggle]').getAttribute('aria-expanded'), 'false');
    assert.equal(b.document.activeElement, b.$('[data-social-contact-toggle]'));
    b.escape(b.$('[data-social-contact-toggle]')); assert.equal(b.dock.open, false);
  } finally { b.dom.window.close(); }
});

test('AI uses the real dock entry, stays outside the closed menu and returns focus to Tools', () => {
  const b = tools();
  try {
    b.open(); b.$('[data-ai-toggle]').click(); b.flushTimers();
    const ai = b.$('[data-ai-chat]');
    assert.equal(b.dock.open, false); assert.equal(b.dock.contains(ai), false);
    assert.equal(ai.classList.contains('is-open'), true); assert.equal(ai.inert, false);
    assert.equal(b.document.activeElement, b.$('[data-ai-input]'));
    b.$('[data-ai-close]').click();
    assert.equal(ai.classList.contains('is-open'), false); assert.equal(ai.inert, true);
    assert.equal(b.document.activeElement, b.$('summary'));
  } finally { b.dom.window.close(); }
});

test('AI Escape and fast close cannot focus the hidden input after its open delay', () => {
  const b = tools();
  try {
    b.open(); b.$('[data-ai-toggle]').click();
    b.escape(b.$('[data-ai-input]')); b.flushTimers();
    assert.equal(b.$('[data-ai-chat]').classList.contains('is-open'), false);
    assert.equal(b.document.activeElement, b.$('summary'));
    b.open(); b.$('[data-ai-toggle]').click(); b.$('[data-ai-scrim]').click(); b.flushTimers();
    assert.equal(b.document.activeElement, b.$('summary'));
  } finally { b.dom.window.close(); }
});

test('AI settings and history Escape close one layer at a time with focus returned to its button', () => {
  const b = tools();
  try {
    b.open(); b.$('[data-ai-toggle]').click(); b.flushTimers();
    const root = b.$('[data-ai-chat]');
    b.$('[data-ai-settings-toggle]').click(); b.$('#setting-option').focus();
    b.escape(b.$('#setting-option'));
    assert.equal(b.$('[data-ai-settings-popover]').hidden, true);
    assert.equal(b.$('[data-ai-settings-toggle]').getAttribute('aria-expanded'), 'false');
    assert.equal(root.classList.contains('is-open'), true);
    assert.equal(b.document.activeElement, b.$('[data-ai-settings-toggle]'));
    b.escape(b.$('[data-ai-settings-toggle]'));
    assert.equal(root.classList.contains('is-open'), false); assert.equal(b.document.activeElement, b.$('summary'));

    b.open(); b.$('[data-ai-toggle]').click(); b.flushTimers();
    root.dataset.viewerKind = 'user'; b.$('[data-ai-history-toggle]').hidden = false;
    b.$('[data-ai-history-toggle]').click(); b.$('[data-ai-thread-menu-toggle]').focus();
    b.escape(b.$('[data-ai-thread-menu-toggle]'));
    assert.equal(b.$('[data-ai-history-panel]').hidden, true);
    assert.equal(b.$('[data-ai-history-toggle]').getAttribute('aria-expanded'), 'false');
    assert.equal(root.classList.contains('is-open'), true);
    assert.equal(b.document.activeElement, b.$('[data-ai-history-toggle]'));
    b.escape(b.$('[data-ai-history-toggle]'));
    assert.equal(root.classList.contains('is-open'), false); assert.equal(b.document.activeElement, b.$('summary'));
  } finally { b.dom.window.close(); }
});

test('AI Escape preserves conversation rename cancellation and native dialog ownership', () => {
  const b = tools();
  try {
    b.open(); b.$('[data-ai-toggle]').click(); b.flushTimers();
    const root = b.$('[data-ai-chat]');
    root.dataset.viewerKind = 'user'; b.$('[data-ai-history-toggle]').hidden = false;
    b.$('[data-ai-history-toggle]').click();
    b.$('[data-ai-thread-rename-input]').focus(); b.escape(b.$('[data-ai-thread-rename-input]'));
    assert.equal(b.$('.ai-chat__thread-actions').hidden, true);
    assert.equal(b.$('[data-ai-thread-menu-toggle]').getAttribute('aria-expanded'), 'false');
    assert.equal(b.document.activeElement, b.$('[data-ai-thread-menu-toggle]'));
    assert.equal(b.$('[data-ai-history-panel]').hidden, false);
    assert.equal(root.classList.contains('is-open'), true);

    const dialog = b.document.createElement('dialog'); dialog.open = true; root.append(dialog);
    b.escape(b.$('[data-ai-input]'));
    assert.equal(root.classList.contains('is-open'), true);
    assert.equal(b.$('[data-ai-history-panel]').hidden, false);
  } finally { b.dom.window.close(); }
});

test('ordinary pages keep AI focus restoration and donation waits for a click', () => {
  const b = tools({ reading: false });
  try {
    const hover = new b.w.Event('pointerenter'); Object.defineProperty(hover, 'pointerType', { value: 'mouse' });
    b.$('[data-support-float]').dispatchEvent(hover);
    assert.equal(b.$('[data-support-float]').hasAttribute('data-open'), false);
    b.open(); b.$('[data-ai-toggle]').click(); b.flushTimers();
    b.$('[data-ai-close]').click();
    assert.equal(b.document.activeElement, b.$('[data-ai-toggle]'));
  } finally { b.dom.window.close(); }
});

test('shared layout owns two launchers and dashboard fits safe-area viewport bounds', async () => {
  const [layout, styles] = await Promise.all(['../src/layouts/BaseLayout.astro', '../src/styles/observerDashboard.css'].map(path => readFile(new URL(path, import.meta.url), 'utf8')));
  assert.match(layout, /<SupportFloat locale=\{lang\} \/>/);
  assert.match(layout, /<ObserverDashboard locale=\{lang\}/);
  assert.doesNotMatch(layout, /<CommunityFloat|<ToolsDock|<SocialContactWidget|<AiChatWidget/);
  assert.match(styles, /env\(safe-area-inset-bottom\)/);
  assert.match(styles, /88dvh/);
  assert.match(styles, /94dvh/);
  assert.match(styles, /overflow(?:-y)?:\s*auto/);
});

test('an externally interrupted menu closing animation does not swallow the first reopening click', async () => {
  const b = tools({ navigationMotion: true });
  try {
    const animations = [];
    b.$('.tools-dock__menu').animate = () => {
      let resolve, reject;
      const animation = { cancelled: false, finished: new Promise((accept, fail) => { resolve = accept; reject = fail; }),
        cancel() { this.cancelled = true; reject(Error('cancelled')); }, finish() { resolve(); } };
      animations.push(animation); return animation;
    };
    for (const externalClose of ['pointer', 'escape']) {
      b.open(); b.$('summary').click();
      const animation = animations.at(-1);
      assert.equal(b.dock.open, true, 'the menu remains native-open while its closing animation plays');
      if (externalClose === 'pointer') b.$('#outside').dispatchEvent(new b.w.Event('pointerdown', { bubbles: true }));
      else b.escape(b.$('summary'));
      assert.equal(b.dock.open, false);
      b.$('summary').click();
      assert.equal(animation.cancelled, true); assert.equal(b.dock.open, true, 'the first click must reopen the already closed menu');
      animation.finish(); await Promise.resolve(); await Promise.resolve();
      assert.equal(b.dock.open, true, 'the cancelled earlier close cannot hide the reopened menu');
    }
  } finally { b.dom.window.close(); }
});

test('clicking an open menu again during its closing animation cancels the close without changing native state', async () => {
  const b = tools({ navigationMotion: true });
  try {
    const animations = [];
    b.$('.tools-dock__menu').animate = () => {
      let resolve, reject;
      const animation = { cancelled: false, finished: new Promise((accept, fail) => { resolve = accept; reject = fail; }),
        cancel() { this.cancelled = true; reject(Error('cancelled')); }, finish() { resolve(); } };
      animations.push(animation); return animation;
    };
    b.open(); b.$('summary').click(); b.$('summary').click();
    assert.equal(animations[0].cancelled, true); assert.equal(b.dock.open, true);
    animations[0].finish(); await Promise.resolve(); await Promise.resolve();
    assert.equal(b.dock.open, true);
    b.$('summary').click(); animations[1].finish(); await Promise.resolve();
    assert.equal(b.dock.open, false, 'a subsequent uninterrupted close still completes normally');
  } finally { b.dom.window.close(); }
});


test('embedded AI keeps its draft and single instance across panel claims, and returns through its shell', () => {
  const b = tools({ embedded: true });
  try {
    const root = b.$('[data-ai-chat]'), input = b.$('[data-ai-input]');
    let section, claims = 0;
    b.w.addEventListener('wiki-dashboard-section', e => { section = e.detail.section; });
    b.w.addEventListener('wiki-floating-panel', () => { claims++; });
    root.dispatchEvent(new b.w.CustomEvent('ai-widget:open')); b.flushTimers();
    input.value = 'Keep this observer draft';
    root.hidden = true;
    b.w.dispatchEvent(new b.w.CustomEvent('wiki-floating-panel', { detail: { id: 'support' } }));
    root.hidden = false;
    root.dispatchEvent(new b.w.CustomEvent('ai-widget:open')); b.flushTimers();
    assert.equal(input.value, 'Keep this observer draft');
    assert.equal(b.document.querySelectorAll('[data-ai-chat]').length, 1);
    assert.equal(claims, 1, 'embedded AI never claims another floating panel');
    assert.equal(root.classList.contains('is-open'), true);
    b.$('[data-ai-close]').click();
    assert.equal(section, 'overview');
    assert.equal(input.value, 'Keep this observer draft');
  } finally { b.dom.window.close(); }
});
