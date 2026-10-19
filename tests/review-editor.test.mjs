import assert from 'node:assert/strict';
import test from 'node:test';
import {reviewEditorPath} from '../src/lib/reviewEditor.mjs';
test('review records reuse the existing locale-aware domain editors with encoded identifiers',()=>{
 assert.equal(reviewEditorPath('en','community',{resourceId:'rev/1'}),'/en/community/activities/apply/?revision=rev%2F1');
 assert.equal(reviewEditorPath('zh','gallery',{resourceId:'r',batchId:'batch/1'}),'/zh/gallery/manage/photos/?retry=batch%2F1');
 assert.equal(reviewEditorPath('ja','gallery',{resourceId:'legacy'}),'/ja/gallery/manage/legacy/?revision=legacy');
 assert.equal(reviewEditorPath('zh-tw','sets',{resourceId:'r'}),'/zh-tw/gallery/manage/?revision=r');
 assert.equal(reviewEditorPath('zh-hk','timeline',{resourceId:'t'}),'/zh-hk/chronicle/submit/?submission=t');
 assert.equal(reviewEditorPath('zh','entries',{resourceId:'e'}),'/zh/contribute/editor/?view=submissions&submission=e');
 assert.equal(reviewEditorPath('evil','articles',{resourceId:'r/1'}),'/zh/articles/submit/?revision=r%2F1');
 assert.equal(reviewEditorPath('en','entries',{}),null);
});
