import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {expandRecordBatch,setExpandablePanel} from '../src/lib/recordExpansion.mjs';

test('expanded records remeasure after width or font changes, without reopening a collapsed panel', t => {
  const dom = new JSDOM(`<section><div data-artist-collapsible data-page-size="12" data-total="2" data-expanded="false"><div class="artist-collapsible__inner"><button hidden>A</button><button hidden>B</button></div></div><button class="artist-expand-btn" data-expand-label="More"><span data-artist-expand-count></span></button><button data-artist-collapse>Collapse</button></section>`);
  t.after(() => dom.window.close());
  const previous = Object.fromEntries(['HTMLElement','ResizeObserver','requestAnimationFrame'].map(key => [key, globalThis[key]]));
  t.after(() => { for (const [key, value] of Object.entries(previous)) { if (value === undefined) delete globalThis[key]; else globalThis[key] = value; } });
  globalThis.HTMLElement = dom.window.HTMLElement;
  const observers = [];
  globalThis.ResizeObserver = class {
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe(element) { this.element = element; }
  };
  globalThis.requestAnimationFrame = callback => callback();
  const panel = dom.window.document.querySelector('[data-artist-collapsible]');
  const inner = panel.querySelector('.artist-collapsible__inner');
  let height = 378;
  Object.defineProperty(inner, 'scrollHeight', {get:() => height});
  const more = dom.window.document.querySelector('.artist-expand-btn');
  const collapse = dom.window.document.querySelector('[data-artist-collapse]');
  expandRecordBatch(panel, more);
  assert.equal(panel.style.getPropertyValue('--artist-collapsible-height'), '378px');
  height = 422; observers[0].callback();
  assert.equal(panel.style.getPropertyValue('--artist-collapsible-height'), '422px');
  assert.equal(observers[0].element, inner);
  setExpandablePanel(panel, more, true, false);
  assert.equal(observers.length, 1, 'repeated expansion does not install duplicate observers');
  expandRecordBatch(panel, collapse);
  height = 300; observers[0].callback();
  assert.equal(panel.dataset.expanded, 'false');
  assert.equal(panel.getAttribute('aria-hidden'), 'true');
  assert.equal(panel.style.getPropertyValue('--artist-collapsible-height'), '422px');
  // Reopening cancels the pending removal of rows from the closing transition.
  expandRecordBatch(panel, more);
  assert.equal(panel.style.getPropertyValue('--artist-collapsible-height'), '300px');
  assert.ok([...inner.children].every(row => !row.hidden));
});
