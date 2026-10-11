import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {sortGalleryRoles,createGalleryRoleControls} from '../src/lib/galleryRoles.mjs';

function setup(t, total = 32, media) {
  const dom = new JSDOM(`<section>
    <input data-gallery-role-search><select data-gallery-role-sort><option value="site">Site</option><option value="count">Photos</option><option value="name">Name</option></select>
    <div data-gallery-roles><button data-role="">All</button>${Array.from({length:total}, (_, i) => `<button data-role="role-${i}" data-search="subject ${i} alias-${i}" data-name="Subject ${i}" data-count="${i}" data-site-order="${i}">Subject ${i}</button>`).join('')}</div>
    <p data-gallery-role-empty hidden>No matches</p><output data-gallery-role-count></output>
    <button data-gallery-roles-toggle data-expand-label="More"><span data-artist-expand-count></span></button><button data-artist-collapse hidden>Collapse</button>
  </section>`);
  t.after(() => dom.window.close());
  const section = dom.window.document.querySelector('section');
  if (media) dom.window.matchMedia = () => media;
  const controls = createGalleryRoleControls(section, {locale:'en'});
  const find = selector => section.querySelector(selector);
  const visible = () => [...section.querySelectorAll('[data-role]')].filter(card => !card.hidden).map(card => card.dataset.role);
  const search = value => { find('input').value = value; find('input').dispatchEvent(new dom.window.Event('input')); };
  const sort = value => { find('select').value = value; find('select').dispatchEvent(new dom.window.Event('change')); };
  controls.render();
  return {section,controls,find,visible,search,sort};
}

test('default subject order follows the editorial directory even when photo counts reverse', () => {
  const rows = [{id:'rim',count:400}, {id:'koko',count:900}, {id:'kaf',count:1}, {id:'harusaruhi',count:8}, {id:'isekaijoucho',count:2}];
  const ids = ['kaf','rim','harusaruhi','isekaijoucho','koko'];
  assert.deepEqual(sortGalleryRoles(rows, id => id).map(row => row.id), ids);
  assert.deepEqual(sortGalleryRoles(rows.map(row => ({...row,count:1000-row.count})), id => id).map(row => row.id), ids);
  const unknown = [{id:'unknown-10'}, {id:'unknown-2'}];
  assert.deepEqual(sortGalleryRoles(unknown, id => id,'en').map(row => row.id), ['unknown-2','unknown-10']);
});

test('expansion adds twelve subjects, reaches the end and collapses without losing a selected subject', t => {
  const ui = setup(t);
  assert.equal(ui.visible().length, 8);
  const more = ui.find('[data-gallery-roles-toggle]'), collapse = ui.find('[data-artist-collapse]');
  more.click(); assert.equal(ui.visible().length, 20);
  more.click(); assert.equal(ui.visible().length, 32);
  assert.equal(more.querySelector('span').textContent, '＋1');
  more.click(); assert.equal(ui.visible().length, 33); assert.equal(more.hidden, true);
  assert.equal(ui.section.ownerDocument.activeElement, collapse);
  ui.controls.render('role-31');
  collapse.click();
  assert.deepEqual(ui.visible(), ['', ...Array.from({length:7}, (_, i) => `role-${i}`), 'role-31']);
  assert.equal(ui.find('[data-role="role-31"]').getAttribute('aria-pressed'), 'true');
  assert.equal(more.getAttribute('aria-expanded'), 'false');
  more.click(); collapse.click(); more.click();
  assert.equal(ui.visible().length, 21, 'rapid collapse/reopen never hides the new batch later');
});

test('search reaches hidden subjects without expanding, reports no matches, then restores the previous batch', t => {
  const ui = setup(t);
  ui.search('ALIAS-28'); assert.deepEqual(ui.visible(), ['', 'role-28']);
  assert.equal(ui.find('[data-gallery-roles-toggle]').hidden, true);
  assert.equal(ui.find('[data-gallery-role-empty]').hidden, true);
  ui.search('missing'); assert.deepEqual(ui.visible(), ['']);
  assert.equal(ui.find('[data-gallery-role-empty]').hidden, false);
  ui.search(''); assert.equal(ui.visible().length, 8);
  ui.find('[data-gallery-roles-toggle]').click();
  ui.search('alias-28'); ui.search(''); assert.equal(ui.visible().length, 20);
  ui.search('alias-28'); ui.find('[data-artist-collapse]').click();
  assert.equal(ui.find('input').value, ''); assert.equal(ui.visible().length, 8);
});

test('sorting preserves filtering and the selected subject while restoring directory order deterministically', t => {
  const ui = setup(t);
  ui.controls.render('role-28'); ui.sort('count');
  assert.deepEqual(ui.visible(), ['', 'role-31','role-30','role-29','role-28','role-27','role-26','role-25']);
  ui.search('alias-28'); ui.sort('name');
  assert.deepEqual(ui.visible(), ['', 'role-28']); assert.equal(ui.find('input').value, 'alias-28');
  ui.controls.render('role-28'); assert.deepEqual(ui.visible(), ['', 'role-28']);
  ui.search(''); ui.sort('site');
  assert.equal(ui.visible()[1], 'role-0'); assert.ok(ui.visible().includes('role-28'));
  assert.equal(ui.find('[data-role="role-28"]').getAttribute('aria-pressed'), 'true');
});

test('short and empty catalogs do not expose an unusable expansion control', t => {
  const ui = setup(t, 0);
  assert.deepEqual(ui.visible(), ['']);
  assert.equal(ui.find('[data-gallery-roles-toggle]').hidden, true);
  ui.search('someone'); assert.equal(ui.find('[data-gallery-role-empty]').hidden, false);
  ui.search(''); assert.equal(ui.find('[data-artist-collapse]').hidden, true);
});

test('mobile starts with five subjects and resizing preserves an expanded batch and selection', t => {
  let resized;
  const media = {matches:true, addEventListener:(_, callback) => {resized = callback;}};
  const ui = setup(t, 32, media);
  assert.equal(ui.visible().length, 6);
  media.matches = false; resized(); assert.equal(ui.visible().length, 8);
  ui.find('[data-gallery-roles-toggle]').click(); assert.equal(ui.visible().length, 20);
  media.matches = true; resized(); assert.equal(ui.visible().length, 20);
  ui.controls.render('role-31'); ui.find('[data-artist-collapse]').click();
  assert.deepEqual(ui.visible(), ['', 'role-0','role-1','role-2','role-3','role-4','role-31']);
});
