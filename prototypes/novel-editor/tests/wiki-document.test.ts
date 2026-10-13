import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { Editor } from '@tiptap/core';
import { createWikiExtensions, renderNestedMarkdown } from '../src/editor/extensions';
import { loadWikiDocument, exportWikiDocument } from '../src/lib/wiki-document';
import { compatibilityCases } from '../../../scripts/lib/tiptapCompatibility.mjs';
import { readFile } from 'node:fs/promises';
import { parseDocument } from 'yaml';

const dom = new JSDOM('<div id="editor"></div>', { url: 'http://127.0.0.1:4371', pretendToBeVisual: true });
for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'Element', 'Node', 'DOMParser', 'MutationObserver', 'getComputedStyle', 'ShadowRoot', 'requestAnimationFrame', 'cancelAnimationFrame']) {
  Object.defineProperty(globalThis, key, { value: (dom.window as any)[key], configurable: true, writable: true });
}
const editor = new Editor({ element: dom.window.document.querySelector('#editor')!, extensions: createWikiExtensions(undefined, false), content: '' });
after(() => { editor.destroy(); dom.window.close(); });
const wrap = (body: string, locale = 'zh') => `---\n# 保留 YAML 注释\nschemaVersion: 2\nid: test-document\nlocale: ${locale}\nentityType: editorial-article\ntitle: "测试"\nrelations: []\npresentation: {}\n---\n\n${body}\n`;

test('all existing Wiki compatibility fixtures have exact no-op Markdown saves', () => {
  for (const locale of ['zh', 'ja', 'en']) for (const fixture of compatibilityCases(locale)) {
    const source = wrap(fixture.source, locale);
    const loaded = loadWikiDocument(editor, source);
    assert.equal(exportWikiDocument(editor, loaded.context, loaded.metadata), source, fixture.name + ' / ' + locale);
  }
});
test('inline shortcodes become semantic nodes, including table cells', () => {
  loadWikiDocument(editor, wrap('正文 {{ruby::花譜::かふ::kaf}} 与 {{spoiler::结局}}。\n\n| 名称 | 注释 |\n| --- | --- |\n| 花譜 | {{abbr::V.W.P::Virtual Witch Phenomenon}} |'));
  const nodes: string[] = [];
  editor.state.doc.descendants(node => { if (node.type.name === 'wikiInline') nodes.push(node.attrs.kind); });
  assert.deepEqual(nodes, ['ruby', 'spoiler', 'abbr']);
});
test('folded Markdown renders Wiki shortcodes and formulas without executing raw HTML', () => {
  const html = renderNestedMarkdown('{{ruby::花譜::かふ}} {{spoiler::结局}} $x^2$ <script>alert(1)</script>');
  assert.ok(html.includes('<ruby>'));
  assert.ok(html.includes('wiki-spoiler'));
  assert.ok(html.includes('katex'));
  assert.ok(!html.includes('<script>'));
});
test('editing prose retains shortcodes, timed-lyric markup, image provenance and nested metadata', () => {
  const lyrics = compatibilityCases('zh').find((item: any) => item.name === 'timed-lyrics')!.source;
  const image = compatibilityCases('zh').find((item: any) => item.name === 'image-caption')!.source;
  const source = wrap(`正文 {{ruby::花譜::かふ::kaf}}。\n\n${lyrics}\n\n${image}`);
  const loaded = loadWikiDocument(editor, source);
  editor.commands.insertContentAt(1, '新增');
  const output = exportWikiDocument(editor, loaded.context, loaded.metadata);
  assert.match(output, /新增正文/);
  assert.ok(output.includes('{{ruby::花譜::かふ::kaf}}'));
  assert.ok(output.includes(lyrics));
  assert.ok(output.includes(image));
  assert.ok(output.includes('# 保留 YAML 注释'));
});
test('changing title retains body, YAML comments and unrecognized metadata', () => {
  const source = wrap('原文  {{ruby::花譜::かふ}}\n\n<!-- 资料说明 -->').replace('relations: []', 'futureField:\n  nested: [one, two]\nrelations: []');
  const loaded = loadWikiDocument(editor, source);
  const output = exportWikiDocument(editor, loaded.context, { ...loaded.metadata, title: '新的标题' });
  assert.ok(output.endsWith(loaded.context.body));
  assert.deepEqual(parseDocument(output.match(/^---\n([\s\S]*?)\n---/)![1]).toJS().futureField.nested, ['one', 'two']);
  assert.ok(output.includes('# 保留 YAML 注释'));
});
test('BOM and CRLF remain exact on a no-op save', () => {
  const source = '\uFEFF' + wrap('**文字** {{ruby::花譜::かふ}}').replaceAll('\n', '\r\n');
  const loaded = loadWikiDocument(editor, source);
  assert.equal(exportWikiDocument(editor, loaded.context, loaded.metadata), source);
});
test('editing a Markdown table keeps inline Wiki nodes and column alignment', () => {
  const source = wrap('| 名称 | 说明 |\n| :--- | ---: |\n| 花譜 | {{ruby::花譜::かふ}} |');
  const loaded = loadWikiDocument(editor, source);
  let position = 0;
  editor.state.doc.descendants((node, offset) => { if (node.isText && node.text === '花譜') position = offset; });
  editor.commands.insertContentAt(position, '新');
  const output = exportWikiDocument(editor, loaded.context, loaded.metadata);
  assert.ok(output.includes('{{ruby::花譜::かふ}}'));
  assert.match(output, /\| :--- \| ---: \|/);
  assert.ok(output.includes('新花譜'));
});
test('Tiptap undo restores the original document without a custom history stack', () => {
  const source = wrap('正文 {{ruby::花譜::かふ}}');
  const loaded = loadWikiDocument(editor, source);
  editor.commands.insertContentAt(1, '新文字');
  assert.notEqual(exportWikiDocument(editor, loaded.context, loaded.metadata), source);
  editor.commands.undo();
  assert.equal(exportWikiDocument(editor, loaded.context, loaded.metadata), source);
});
test('merged table cells export public HTML without editor node payloads', () => {
  const source = wrap('正文');
  const loaded = loadWikiDocument(editor, source);
  editor.commands.insertContentAt(editor.state.doc.content.size, { type: 'table', content: [
    { type: 'tableRow', content: ['名称', '备注'].map(text => ({ type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] })) },
    { type: 'tableRow', content: [{ type: 'tableCell', attrs: { colspan: 2 }, content: [{ type: 'paragraph', content: [{ type: 'wikiInline', attrs: { kind: 'ruby', args: ['花譜', 'かふ'], source: '{{ruby::花譜::かふ}}', syntax: 'shortcode' } }] }] }] },
  ] });
  const output = exportWikiDocument(editor, loaded.context, loaded.metadata);
  assert.match(output, /<table/);
  assert.ok(output.includes('{{ruby::花譜::かふ}}'));
  assert.ok(!output.includes('data-wiki-'));
});
test('real KAF biography is editable and preserves special content when prose changes', async () => {
  for (const locale of ['zh', 'ja', 'en']) {
    const path = `src/content/people/solo/kaf/${locale}.md`;
    const latest = await readFile(new URL('../../../' + path, import.meta.url), 'utf8');
    const imported = loadWikiDocument(editor, latest, path);
    assert.equal(exportWikiDocument(editor, imported.context, imported.metadata), latest, path);
  }
  const source = await readFile(new URL('../../../src/content/people/solo/kaf/zh.md', import.meta.url), 'utf8');
  const loaded = loadWikiDocument(editor, source, 'src/content/people/solo/kaf/zh.md');
  assert.equal(exportWikiDocument(editor, loaded.context, loaded.metadata), source);
  let paragraph = 0;
  editor.state.doc.forEach((node, offset) => { if (!paragraph && node.type.name === 'paragraph' && node.content.size) paragraph = offset + 1; });
  editor.commands.insertContentAt(paragraph, '测试：');
  const output = exportWikiDocument(editor, loaded.context, loaded.metadata);
  assert.ok(output.includes('测试：'));
  assert.ok(output.includes('{{ruby::花譜::かふ::kaf}}'));
  assert.ok(output.includes('{{spoiler::'));
});
