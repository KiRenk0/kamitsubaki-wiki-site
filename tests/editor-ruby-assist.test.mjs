import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { rubySugarAtCaret, rubySugarMatches } from '../src/lib/editorRubyAssist.mjs';

test('ruby sugar only activates at the caret after a complete reading', () => {
  assert.deepEqual(rubySugarAtCaret('介绍 [ヰ世界情緒]{いせかいじょうちょ}'), {
    start: 3, end: 21, text: 'ヰ世界情緒', kana: 'いせかいじょうちょ',
  });
  assert.equal(rubySugarAtCaret('[花譜]{かふ} later'), null);
  assert.equal(rubySugarAtCaret('[花譜]{'), null);
  assert.equal(rubySugarAtCaret('[花譜]{かふ\n}'), null);
});

test('ruby sugar finds multiple complete tokens without crossing lines', () => {
  const matches = rubySugarMatches('[花譜]{かふ} 和 [廻花]{かいか}');
  assert.deepEqual(matches.map(({text,kana})=>[text,kana]), [['花譜','かふ'],['廻花','かいか']]);
});

test('explicit variant formatting preserves the selected text and opens at its saved range', async () => {
  const source = await readFile(new URL('../src/scripts/visualEditor.js', import.meta.url), 'utf8');
  const start = source.indexOf('  function openInline(rich,chip=null,preset=null,selectedRange=null) {');
  const end = source.indexOf("  root.addEventListener('click'", start);
  const selectedNode = {}, rich = { contains: node => node === selectedNode };
  const clonedRange = { commonAncestorContainer: selectedNode };
  const savedRange = { cloneRange: () => clonedRange, toString: () => '数码' };
  const kind = { value: '' }, title = { textContent: '' }, error = { textContent: '' };
  let fields, anchor, focused=false;
  const elements = {
    '[data-inline-kind]': kind, '#ve-inline-title': title, '[data-inline-error]': error,
    '[data-inline-remove]': {hidden:false}, '[data-inline-dialog]': {},
    '[data-dialog-arg]': {focus(){focused=true;}},
  };
  const { openInline, context } = Function('window', 'document', 'inlineTokenParts', 'inlineFields', '$', 'copy', 'openEditorPopover', 'root', `
    let inlineContext = null;
    ${source.slice(start,end)}
    return { openInline, context: () => inlineContext };
  `)(
    { getSelection: () => ({ rangeCount: 0, toString: () => '' }) },
    { createRange() { throw Error('the saved range should be used'); } },
    () => null, args => { fields = args; }, selector => elements[selector],
    { inline: { 'zh-variant': '繁体用词覆写' } },
    (_root,_dialog,range)=>{anchor=range;}, {},
  );
  openInline(rich,null,'zh-variant',savedRange);
  assert.equal(kind.value, 'zh-variant');
  assert.deepEqual(fields, ['数码']);
  assert.equal(context().range, clonedRange);
  assert.equal(anchor,clonedRange);
  assert.equal(focused,true);
  assert.equal(elements['[data-inline-remove]'].hidden,true);
  assert.equal(title.textContent, '繁体用词覆写');
});
