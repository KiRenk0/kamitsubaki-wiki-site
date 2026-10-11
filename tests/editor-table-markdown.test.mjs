import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import { renderRich, richMarkdown, sanitizeEditorHTML } from '../src/lib/editorRichText.mjs';
import { importMarkdown, exportMarkdown } from '../src/lib/visualEditor.mjs';
import { renderMarkdownDocument } from '../src/lib/markdown.mjs';

const { window } = new JSDOM('');
for (const name of ['document', 'DOMParser', 'Node', 'Element']) globalThis[name] = window[name];
const editor = source => { const element = document.createElement('div'); element.innerHTML = renderRich(source); return element; };
// Reproduces the date correction in PR #65, including angle destinations and a Chinese URL.
const singles = '**单曲**\n\n| 发行日期 | 标题 |\n| --- | --- |\n| 2010-12-12 | [不可欠](</zh/songs/kafu/originals/不可欠>) |\n| 2020-02-29 | [病名を教えて](</zh/songs/kafu/originals/病名wo教ete>) |';

test('a date correction retains GFM, untouched rows, link spelling and surrounding whitespace', () => {
  const element = editor(singles);
  assert.equal(richMarkdown(element), singles);
  element.querySelector('td').textContent = '2022-9-11';
  assert.equal(richMarkdown(element), singles.replace('2010-12-12', '2022-9-11'));
  assert.doesNotMatch(richMarkdown(element), /<table|data-ve-|%E/);
  element.querySelector('td').textContent = '2010-12-12';
  assert.equal(richMarkdown(element), singles);
});

test('changing a timeline cell keeps the one-line-per-row review format of PR #64', () => {
  const source = '| 时间 | 节点 | 说明 |\n| --- | --- | --- |\n| 2024年7月7日 | V.I.P 演出 | 参与「V.I.P 1st MINI LIVE ETHEREAL WORLD」。 |';
  const element = editor(source); element.querySelectorAll('td')[1].append('测试测试测试');
  assert.equal(richMarkdown(element), source.replace('V.I.P 演出 |', 'V.I.P 演出测试测试测试 |'));
});

test('editing a table inside a disclosure exports a minimal whole-document diff', () => {
  const source = '---\nlocale: zh\ntitle: Test\n---\n\nBefore.\n\n{{details::展开完整单曲目录}}\n\n' + singles + '\n\n{{/details}}\n\nAfter.\n';
  const draft = importMarkdown(source, 'projects'), block = draft.blocks.find(block => block.type === 'details');
  const element = editor(block.text); element.querySelector('td').textContent = '2022-9-11'; block.text = richMarkdown(element);
  const exported = exportMarkdown(draft);
  assert.equal(exported, source.replace('2010-12-12', '2022-9-11'));
  assert.equal(exportMarkdown(importMarkdown(exported, 'projects')), exported);
});

test('alignment, compact rows, emphasis, escapes, code and shortcodes survive repeated edits', () => {
  const source = '| 项目 | 内容 |\n|:----|----:|\n| **花譜** | [来源](</zh/花譜>) |\n| `A\\|B` | A \\| B {{ruby::花譜::かふ}} |';
  const element = editor(source); assert.equal(richMarkdown(element), source);
  element.querySelector('td strong').textContent = '理芽';
  const changed = source.replace('**花譜**', '**理芽**'); assert.equal(richMarkdown(element), changed);
  assert.equal(richMarkdown(editor(changed)), changed);
  assert.equal(element.querySelector('th').getAttribute('align'), 'left');
  assert.equal(element.querySelectorAll('th')[1].getAttribute('align'), 'right');
});

test('inserted and deleted rows retain unchanged original rows instead of shifting their source', () => {
  const element = editor(singles), body = element.querySelector('tbody');
  const inserted = document.createElement('tr'); inserted.innerHTML = '<td>2021</td><td><strong>新作</strong></td>'; body.prepend(inserted);
  const withRow = singles.replace('| 2010', '| 2021 | **新作** |\n| 2010');
  assert.equal(richMarkdown(element), withRow);
  body.lastElementChild.remove();
  assert.equal(richMarkdown(element), withRow.split('\n').slice(0, -1).join('\n'));
});

test('a new plain table serializes inline formats, literal pipes and cell line breaks as GFM', async () => {
  const element = document.createElement('div');
  element.innerHTML = '<table><thead><tr><th>Title</th><th align="center">Note</th></tr></thead><tbody><tr><td><strong>A | B</strong></td><td><a href="/zh/花譜">资料</a><br>next</td></tr></tbody></table><p>After</p>';
  const markdown = richMarkdown(element);
  assert.match(markdown, /\| Title \| Note \|\n\| --- \| :---: \|/);
  assert.match(markdown, /\*\*A \\\| B\*\*/); assert.match(markdown, /<br>next/);
  assert.ok(markdown.endsWith('\n\nAfter'));
  const { html } = await renderMarkdownDocument(markdown);
  assert.match(html, /<strong>A \| B<\/strong>/); assert.match(html, /<br/);
});

test('empty cells can be filled without rewriting the rest of a compact table', () => {
  const source = '| A | B |\n| --- | --- |\n| | keep |';
  const element = editor(source); element.querySelector('td').textContent = 'filled';
  assert.equal(richMarkdown(element), source.replace('| | keep |', '|filled | keep |'));
});

test('saving, reloading and editing a second cell never turns the table into HTML', () => {
  let element = editor(singles); element.querySelector('td').textContent = '2022-9-11';
  element = editor(richMarkdown(element)); element.querySelectorAll('td')[2].textContent = '2020-03-01';
  assert.equal(richMarkdown(element), singles.replace('2010-12-12', '2022-9-11').replace('2020-02-29', '2020-03-01'));
});

test('multiple tables in one rich block retain their own source', () => {
  const source = singles + '\n\nOther.\n\n| X | Y |\n| :--- | ---: |\n| first | second |';
  const element = editor(source); element.querySelectorAll('table')[1].querySelector('td').textContent = 'changed';
  assert.equal(richMarkdown(element), source.replace('| first | second |', '| changed | second |'));
});

test('merged cells and existing authored HTML remain lossless HTML without editor attributes', () => {
  const html = '<table><thead><tr><th colspan="2">Group</th></tr></thead><tbody><tr><td rowspan="2">A</td><td>B</td></tr><tr><td>C</td></tr></tbody></table>';
  const element = editor(html), markdown = richMarkdown(element);
  assert.equal(markdown, sanitizeEditorHTML(html)); assert.doesNotMatch(markdown, /data-ve-/);
  const plain = '<table><thead><tr><th>A</th></tr></thead><tbody><tr><td>B</td></tr></tbody></table>';
  assert.equal(richMarkdown(editor(plain)), plain);
});

test('a table inside a quote retains Markdown and the outer quote prefix', () => {
  const source = '> | A | B |\n> | --- | --- |\n> | one | two |';
  const element = editor(source); element.querySelector('td').textContent = 'changed';
  assert.equal(richMarkdown(element), source.replace('one', 'changed'));
});

test('adding a column regenerates valid GFM without losing inline cell formats', () => {
  const element = editor(singles);
  for (const [i, row] of [...element.querySelector('table').rows].entries()) {
    const cell = document.createElement(i === 0 ? 'th' : 'td'); cell.textContent = i === 0 ? 'Note' : 'new'; row.append(cell);
  }
  const markdown = richMarkdown(element); assert.doesNotMatch(markdown, /<table/);
  assert.equal(editor(markdown).querySelector('table').rows[0].cells.length, 3);
  assert.match(markdown, /不可欠/); assert.match(markdown, /\| --- \| --- \| --- \|/);
});
