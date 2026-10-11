import test from 'node:test';
import assert from 'node:assert/strict';
import {assertReleaseHead} from '../scripts/release-baseline.mjs';
test('only the current remote main can become a production release',()=>{
 const valid={head:'new',remoteMain:'new',branch:'main',buildHead:'new'};
 assert.doesNotThrow(()=>assertReleaseHead(valid));
 assert.throws(()=>assertReleaseHead({...valid,branch:'feature'}),/must use main/);
 assert.throws(()=>assertReleaseHead({...valid,head:'old'}),/stale/);
 assert.throws(()=>assertReleaseHead({...valid,buildHead:'old'}),/Build source differs/);
 // A concurrent push during a build must invalidate the earlier build.
 assert.throws(()=>assertReleaseHead({...valid,remoteMain:'newer'}),/moved/);
});
