import assert from 'node:assert/strict';
import test from 'node:test';
import { EditorState } from '@codemirror/state';
import { history, undo } from '@codemirror/commands';
import { programmaticSourceChange } from '../src/lib/editorSourceCode.mjs';

test('visual draft synchronization cannot be undone as a source edit', () => {
  let state = EditorState.create({ doc: '', extensions: [history()] });
  const apply = spec => { state = state.update(spec).state; };
  apply(programmaticSourceChange(state, 'First visual draft'));
  apply(programmaticSourceChange(state, 'Second visual draft'));
  assert.equal(state.doc.toString(), 'Second visual draft');
  assert.equal(undo({ state, dispatch: transaction => { state = state.update(transaction).state; } }), false);
  assert.equal(state.doc.toString(), 'Second visual draft');

  apply({ changes: { from: state.doc.length, insert: ' with source edit' } });
  assert.equal(undo({ state, dispatch: transaction => { state = state.update(transaction).state; } }), true);
  assert.equal(state.doc.toString(), 'Second visual draft');
});
