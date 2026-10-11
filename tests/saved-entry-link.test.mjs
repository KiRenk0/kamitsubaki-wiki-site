import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveSavedEntryPath} from '../src/lib/savedEntryLink.mjs';
test('old favorites use registry destinations without rewriting saved list membership',()=>{
 const payload={redirects:[['/artists/vwp/kaf/','kaf'],['/songs/kaf/糸/','song']],entries:[{data:{id:'kaf'},url:'/zh/database/artists/solo/kaf/'},{data:{id:'song'},url:'/zh/database/music/songs/song/'}]};
 assert.equal(resolveSavedEntryPath('/zh/artists/vwp/kaf/',payload),'/zh/database/artists/solo/kaf/');
 assert.equal(resolveSavedEntryPath('/zh/songs/kaf/%E7%B3%B8/',payload),'/zh/database/music/songs/song/');
 for(const path of ['/zh/database/artists/solo/kaf/','/zh/artists/unknown/','https://example.com/zh/artists/vwp/kaf/'])assert.equal(resolveSavedEntryPath(path,payload),path);
 assert.equal(resolveSavedEntryPath('/ja/artists/vwp/kaf/',payload),'/ja/artists/vwp/kaf/');
 const malicious={...payload,entries:[{data:{id:'kaf'},url:'https://evil.example/'}]};assert.equal(resolveSavedEntryPath('/zh/artists/vwp/kaf/',malicious),'/zh/artists/vwp/kaf/');
});
