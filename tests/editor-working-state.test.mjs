import assert from 'node:assert/strict';
import test from 'node:test';
import { hasEditorLocalWork, canTraverseEditorHistory, acceptRecoveredArticleDraft, withLockedEditorWorkspace } from '../src/lib/editorWorkingState.mjs';
import { newBlock, newDraft } from '../src/lib/visualEditor.mjs';

test('a source edit awaiting parse still protects an empty article from replacement', () => {
  const emptyArticle = newDraft('articles','zh');
  assert.equal(hasEditorLocalWork(emptyArticle,null),false);
  assert.equal(hasEditorLocalWork(emptyArticle,'Unsaved source body'),true);
  assert.equal(hasEditorLocalWork(emptyArticle,''),true);
});

test('visual edits and inserted structured blocks also count as local work', () => {
  const titled = newDraft('articles','zh'); titled.meta.title='Draft';
  const paragraph = newDraft('articles','zh'); paragraph.blocks[0].text='Changed text';
  const lyrics = newDraft('songs','zh'); lyrics.blocks.push(newBlock('lyrics'));
  assert.equal(hasEditorLocalWork(titled),true);
  assert.equal(hasEditorLocalWork(paragraph),true);
  assert.equal(hasEditorLocalWork(lyrics),true);
});

test('metadata, relation, media and path edits count as local work without a title', () => {
  const relations = newDraft('articles','zh'); relations.meta.relatedEntities=['kaf'];
  const credits = newDraft('songs','ja'); credits.meta.credits.push({role:'composer',entity:'kaf'});
  const media = newDraft('songs','zh'); media.blocks=[newBlock('media')];
  const path = newDraft('songs','zh'); path.path='src/content/songs/example/zh.md';
  for (const draft of [relations,credits,media,path]) assert.equal(hasEditorLocalWork(draft),true);
});

test('history navigation waits for pending source to parse and preserves invalid text', () => {
  let attempts = 0;
  assert.equal(canTraverseEditorHistory(null,()=>{attempts++;return false;}),true);
  assert.equal(attempts,0);
  const raw='---\nlocale: [broken';
  assert.equal(canTraverseEditorHistory(raw,()=>{attempts++;return false;}),false);
  assert.equal(attempts,1);
  assert.equal(canTraverseEditorHistory(raw,()=>{attempts++;return true;}),true);
  assert.equal(attempts,2);
});

test('recovering an older article draft cancels pending source before adopting the draft', () => {
  const recovered={version:1,kind:'articles',ownerId:null,blocks:[{type:'paragraph',text:'Saved copy'}]};
  const events=[];
  const draft=acceptRecoveredArticleDraft(recovered,'account-2',()=>events.push('pending source cleared'));
  assert.deepEqual(events,['pending source cleared']);
  assert.equal(draft.ownerId,'account-2');
  assert.equal(draft.blocks[0].text,'Saved copy');
  assert.equal(recovered.ownerId,null);
  assert.equal(acceptRecoveredArticleDraft(recovered,'guest',()=>{}).ownerId,null);
});

test('remote article work locks the editor for its full async lifetime and restores it on failure', async () => {
  const workspace={inert:false};
  let release;
  const action=withLockedEditorWorkspace(workspace,()=>new Promise(resolve=>{release=resolve;}));
  assert.equal(workspace.inert,true);
  release('loaded');
  assert.equal(await action,'loaded');
  assert.equal(workspace.inert,false);
  await assert.rejects(withLockedEditorWorkspace(workspace,async()=>{assert.equal(workspace.inert,true);throw Error('network');}),/network/);
  assert.equal(workspace.inert,false);
});

test('saving locks the canvas and header while keeping non-modal confirmations usable',async()=>{
 const header={tagName:'HEADER',inert:false},canvas={tagName:'DIV',inert:false},alreadyDisabled={tagName:'SECTION',inert:true},dialog={tagName:'DIALOG',inert:false};
 const root={children:[header,canvas,alreadyDisabled,dialog],inert:false};
 await withLockedEditorWorkspace(root,async()=>{
  assert.equal(header.inert,true);assert.equal(canvas.inert,true);assert.equal(dialog.inert,false);assert.equal(root.inert,false);
 },{allowDialogs:true});
 assert.equal(header.inert,false);assert.equal(canvas.inert,false);assert.equal(alreadyDisabled.inert,true);
});
