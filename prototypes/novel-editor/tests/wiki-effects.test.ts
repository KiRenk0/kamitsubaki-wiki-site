import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { Editor } from '@tiptap/core';
import { createWikiExtensions } from '../src/editor/extensions';
import { loadWikiDocument, exportWikiDocument } from '../src/lib/wiki-document';
import { clearSelectedFormatting, removeInlineEffect, removeBlockEffect, toggleInlineEffect, blockWithoutEffect } from '../src/lib/wiki-effects';
import { NodeSelection } from '@tiptap/pm/state';
import { CellSelection } from '@tiptap/pm/tables';

const dom = new JSDOM('<div id="editor"></div>', { pretendToBeVisual: true });
for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'Element', 'Node', 'DOMParser', 'MutationObserver', 'getComputedStyle', 'ShadowRoot', 'requestAnimationFrame', 'cancelAnimationFrame']) Object.defineProperty(globalThis, key, { value: (dom.window as any)[key], configurable: true, writable: true });
const editor = new Editor({ element: document.querySelector('#editor')!, extensions: createWikiExtensions(undefined, false), content: '', editorProps: { handleScrollToSelection: () => true } });
after(() => { editor.destroy(); dom.window.close(); });
const source = (body: string) => `---\nschemaVersion: 2\nid: effects-test\nlocale: zh\nentityType: editorial-article\ntitle: 测试\n---\n\n${body}\n`;
function inlinePosition(kind: string) { let pos = -1; editor.state.doc.descendants((node, offset) => { if (node.type.name === 'wikiInline' && node.attrs.kind === kind) pos = offset; }); assert.ok(pos >= 0); return pos; }

test('removing ruby retains outer bold and link, Unicode prose, and exact undo/redo', () => {
  const original = source('前文 😀 **[{{ruby::花譜::かふ}}](https://example.com)** 后文。');
  const loaded = loadWikiDocument(editor, original);
  const pos = inlinePosition('ruby');
  assert.equal(removeInlineEffect(editor, pos), true);
  assert.equal(editor.state.doc.textContent, '前文 😀 花譜 后文。');
  const output = exportWikiDocument(editor, loaded.context, loaded.metadata);
  assert.doesNotMatch(output, /ruby::/); assert.match(output, /https:\/\/example.com/); assert.ok(editor.state.doc.nodeAt(pos)!.marks.some(mark => mark.type.name === 'bold'));
  assert.equal(editor.commands.undo(), true); assert.equal(exportWikiDocument(editor, loaded.context, loaded.metadata), original);
  assert.equal(editor.commands.redo(), true); assert.equal(exportWikiDocument(editor, loaded.context, loaded.metadata), output);
  loadWikiDocument(editor, output); assert.equal(editor.state.doc.textContent, '前文 😀 花譜 后文。');
});
test('HTML ruby removal keeps formatted base text and removes all readings', () => {
  loadWikiDocument(editor, source('<ruby><strong>花</strong>譜<rp>（</rp><rt>かふ</rt><rp>）</rp><rt class="roma">kaf</rt></ruby>'));
  const pos = inlinePosition('ruby'); removeInlineEffect(editor, pos);
  assert.equal(editor.state.doc.textContent, '花譜'); assert.ok(editor.state.doc.nodeAt(pos)!.marks.some(mark => mark.type.name === 'bold'));
});
test('selection effect removal keeps ordinary formatting and resolves unlabeled Wiki references', () => {
  const loaded = loadWikiDocument(editor, source('**强调** {{spoiler::结局}} [[kaf]] 后文。'));
  editor.commands.selectAll(); clearSelectedFormatting(editor, false, id => id === 'kaf' ? '花譜' : undefined);
  const output = exportWikiDocument(editor, loaded.context, loaded.metadata);
  assert.match(output, /\*\*强调\*\*/); assert.match(output, /结局 花譜/); assert.doesNotMatch(output, /spoiler::|\[\[kaf/);
});
test('clear-all formatting includes replacement text at selection boundaries', () => {
  loadWikiDocument(editor, source('**{{ruby::花譜::かふ}}**'));
  const pos = inlinePosition('ruby'); editor.view.dispatch(editor.state.tr.setSelection(NodeSelection.create(editor.state.doc, pos)));
  clearSelectedFormatting(editor, true);
  assert.equal(editor.state.doc.textContent, '花譜'); assert.equal(editor.state.doc.nodeAt(pos)!.marks.length, 0);
  loadWikiDocument(editor, source('**{{ruby::花譜::かふ}}** **{{spoiler::結末}}**')); editor.commands.selectAll(); clearSelectedFormatting(editor, true);
  editor.state.doc.descendants(node => { assert.notEqual(node.type.name, 'wikiInline'); if (node.isText) assert.equal(node.marks.length, 0); });
});
test('native spoiler toggles preserve mixed marks and can be cleared without touching bold', () => {
  loadWikiDocument(editor, source('**花**譜😀')); editor.commands.selectAll(); toggleInlineEffect(editor, 'spoiler');
  assert.ok(editor.state.doc.firstChild!.firstChild!.marks.some(mark => mark.type.name === 'wikiSpoiler'));
  toggleInlineEffect(editor, 'spoiler'); assert.ok(editor.state.doc.firstChild!.firstChild!.marks.some(mark => mark.type.name === 'bold'));
  assert.equal(editor.state.doc.textContent, '花譜😀');
});
test('clearing formatting in one selected cell does not change adjacent cells', () => {
  loadWikiDocument(editor, source('| A | B |\n| --- | --- |\n| **{{ruby::花譜::かふ}}** | **{{spoiler::保留}}** |'));
  const cells: number[] = []; editor.state.doc.descendants((node, pos) => { if (node.type.name === 'tableCell') cells.push(pos); });
  editor.view.dispatch(editor.state.tr.setSelection(CellSelection.create(editor.state.doc, cells[0])));
  clearSelectedFormatting(editor, true);
  let ruby = 0, spoiler = 0; editor.state.doc.descendants(node => { if (node.type.name === 'wikiInline') { if (node.attrs.kind === 'ruby') ruby++; if (node.attrs.kind === 'spoiler') spoiler++; } });
  assert.equal(ruby, 0); assert.equal(spoiler, 1); assert.equal(editor.state.doc.textContent, 'AB花譜');
});
test('unfolding preserves title, nested formatting, table, ruby and exact undo', () => {
  const original = source('{{details::补充资料}}\n\n**正文** {{ruby::花譜::かふ}}\n\n| 名称 |\n| --- |\n| 测试 |\n\n{{/details}}');
  const loaded = loadWikiDocument(editor, original); assert.equal(editor.state.doc.firstChild!.type.name, 'wikiBlock');
  assert.equal(removeBlockEffect(editor, 0), true);
  const output = exportWikiDocument(editor, loaded.context, loaded.metadata); assert.doesNotMatch(output, /details::/); assert.match(output, /补充资料/); assert.match(output, /\*\*正文\*\*/); assert.match(output, /ruby::/); assert.equal(editor.state.doc.child(2).type.name, 'table');
  assert.equal(editor.commands.undo(), true); assert.equal(exportWikiDocument(editor, loaded.context, loaded.metadata), original);
});
test('plain lyrics preserve every timestamp, reading, romaji, translation and media converts safely', () => {
  const lyrics = blockWithoutEffect(editor, { type: 'lyrics', rows: [{ units: [{ original: '花', kana: 'はな', romaji: 'hana', time: '00:01.000' }, { original: '譜', kana: 'ふ', romaji: 'fu', time: '00:02.000' }], translation: '译文' }] })!;
  assert.match(lyrics.textBetween(0, lyrics.size, '\n'), /00:01.000.*花.*はな.*hana.*00:02.000.*譜.*ふ.*fu\n译文/);
  const links = blockWithoutEffect(editor, { type: 'media-switcher', title: '官方平台', items: [{ provider: 'youtube', url: 'https://youtube.com/watch?v=abc' }, { provider: 'spotify', url: '' }, { provider: 'youtube', url: 'javascript:alert(1)' }] })!;
  assert.equal(links.firstChild!.textContent, '官方平台'); assert.equal(links.child(1).firstChild!.marks[0].type.name, 'link'); assert.equal(links.child(2).firstChild!.marks.length, 0); assert.equal(links.child(3).firstChild!.marks.length, 0);
  assert.equal(blockWithoutEffect(editor, { type: 'preserved' }), null);
});
