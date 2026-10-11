import test from 'node:test';
import assert from 'node:assert/strict';
import { editorStarterCopy, isUntouchedEditorDraft, sortInsertActions } from '../src/lib/editorStarter.mjs';
import { newDraft } from '../src/lib/visualEditor.mjs';

test('the editor start panel appears only for a blank new draft', () => {
  const draft = newDraft('projects', 'zh');
  assert.equal(isUntouchedEditorDraft(draft), true);
  draft.blocks[0].text = '已写的内容';
  assert.equal(isUntouchedEditorDraft(draft), false);
  draft.blocks[0].text = '';
  draft.path = 'src/content/projects/example/zh.md';
  assert.equal(isUntouchedEditorDraft(draft), false);
  assert.equal(isUntouchedEditorDraft(newDraft('songs', 'zh')), false);
  assert.equal(isUntouchedEditorDraft(newDraft('articles', 'zh'), true), true);
});

test('domain blocks are first and the start panel has copy in every UI locale', () => {
  const actions = [{type:'paragraph'}, {type:'lyrics'}, {type:'heading'}, {type:'ruby'}, {type:'media-switcher'}];
  assert.deepEqual(sortInsertActions(actions).map(action => action.type), ['lyrics','media-switcher','ruby','paragraph','heading']);
  for (const locale of ['zh','zh-tw','zh-hk','ja','en']) {
    const copy = editorStarterCopy(locale);
    assert.ok(copy.title && copy.lyrics && copy.domainGroup);
  }
});
