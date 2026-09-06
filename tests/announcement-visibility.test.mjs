import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const component = await readFile(new URL('../src/components/AnnouncementModal.astro', import.meta.url), 'utf8');
const script = ts.transpileModule(component.match(/<script>([\s\S]*?)<\/script>/)[1], {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
}).outputText;

function mount(storage, { id = 'notice-1', draft = false, reduced = false } = {}) {
  class Element {
    hidden = false;
    dataset = {};
    listeners = new Map();
    classes = new Set();
    classList = { add: name => this.classes.add(name), remove: name => this.classes.delete(name), contains: name => this.classes.has(name) };
    addEventListener(name, callback) { this.listeners.set(name, callback); }
    dispatch(name, event = {}) { this.listeners.get(name)?.(event); }
    focus() { document.activeElement = this; }
    closest() { return null; }
    querySelectorAll() { return []; }
  }
  const modal = new Element(), panel = new Element(), launcher = new Element(), close = new Element(), body = new Element();
  modal.hidden = true;
  modal.dataset = { announcementId: id, announcementDraft: draft ? 'true' : undefined };
  modal.querySelector = () => panel;
  modal.querySelectorAll = selector => selector === '[data-announcement-close]' ? [close] : [];
  const document = { body, activeElement: null, querySelector: selector => selector === '[data-announcement-modal]' ? modal : launcher };
  const window = new Element(), timers = new Map(); let serial = 0;
  Object.assign(window, {
    localStorage: storage, matchMedia: () => ({ matches: reduced }),
    setTimeout: callback => { timers.set(++serial, callback); return serial; },
    clearTimeout: id => timers.delete(id), requestAnimationFrame: callback => callback(),
  });
  runInNewContext(script, { window, document, HTMLElement: Element, HTMLDetailsElement: class extends Element {} });
  const flush = () => { for (const [id, callback] of [...timers]) { timers.delete(id); callback(); } };
  return { modal, body, launcher, close, window, timers, flush };
}
const storage = () => {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key,value) => values.set(key,value) };
};

test('first display is remembered before dismissal and refresh stays collapsed', () => {
  const saved = storage(), first = mount(saved);
  assert.equal(first.modal.hidden, true);
  first.flush();
  assert.equal(first.modal.hidden, false);
  assert.equal(saved.getItem('kamitsubaki-wiki-announcement-seen'), 'notice-1');
  const refreshed = mount(saved); refreshed.flush();
  assert.equal(refreshed.modal.hidden, true);
  refreshed.launcher.dispatch('click');
  assert.equal(refreshed.modal.hidden, false);
  refreshed.close.dispatch('click'); refreshed.flush();
  assert.equal(refreshed.modal.hidden, true);
  assert.equal(refreshed.body.classList.contains('announcement-modal-open'), false);
});
test('drafts also open once while their read state is isolated from publication', () => {
  const saved = storage(), preview = mount(saved,{draft:true}); preview.flush();
  assert.equal(saved.getItem('kamitsubaki-wiki-announcement-preview-seen'), 'notice-1');
  assert.equal(saved.getItem('kamitsubaki-wiki-announcement-seen'), null);
  const repeated = mount(saved,{draft:true}); repeated.flush(); assert.equal(repeated.modal.hidden,true);
  const published = mount(saved); published.flush(); assert.equal(published.modal.hidden,false);
  const newer = mount(saved,{id:'notice-2'}); newer.flush(); assert.equal(newer.modal.hidden,false);
});
test('manual open and dismissal cancel the delayed initial popup', () => {
  const page = mount(storage());
  page.launcher.dispatch('click'); page.close.dispatch('click'); page.flush(); page.flush();
  assert.equal(page.modal.hidden,true);
  assert.equal(page.timers.size,0);
});
test('blocked storage does not break dismissal, Escape, or reduced motion', () => {
  const blocked = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  const page = mount(blocked,{reduced:true}); page.flush(); assert.equal(page.modal.hidden,false);
  page.window.dispatch('keydown',{key:'Escape'}); page.flush(); assert.equal(page.modal.hidden,true);
});
