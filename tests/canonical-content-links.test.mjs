import test from 'node:test';
import assert from 'node:assert/strict';
import {renderWikiLinks} from '../src/lib/wikiLinks.mjs';
const entities=[
 {data:{id:'kaf',entityType:'virtual-avatar',name:'花譜'},url:'/ja/database/artists/solo/kaf/'},
 {data:{id:'song',entityType:'work-track',title:'糸',performers:[{entity:'kaf'}]},url:'/ja/database/music/songs/song/'},
];
const registry={legacyRoutes:new Map([['/songs/kaf/originals/shi/','song']]),resolveEntity:id=>entities.find(e=>e.data.id===id),list:()=>entities};
test('authored old references become canonical links with query and anchor intact',()=>{
 const result=renderWikiLinks('<a href="/ja/songs/kaf/originals/shi?x=1&amp;y=2#lyrics"><em>糸</em></a>',registry,'ja');
 assert.match(result.html,/href="\/ja\/database\/music\/songs\/song\/\?x=1&amp;y=2#lyrics"/);assert.match(result.html,/<em>糸<\/em>/);assert.deepEqual(result.missing,[]);
});
test('exact stable artist IDs and performer-scoped unique titles can resolve changed folders',()=>{
 const result=renderWikiLinks('<a href="/ja/artists/old/kaf">花譜</a><a href="/ja/songs/kaf/new-name">糸</a>',registry,'ja');
 assert.match(result.html,/\/database\/artists\/solo\/kaf\//);assert.match(result.html,/\/database\/music\/songs\/song\//);assert.equal(result.missing.length,0);
});
test('unknown and ambiguous references retain text without dead links or guessed targets',()=>{
 const ambiguous={...registry,list:()=>[...entities,{...entities[1],data:{...entities[1].data,id:'other'}}]};
 const result=renderWikiLinks('<a href="/ja/songs/kaf/unknown">糸</a><a href="/ja/songs/rim/unknown">Unknown</a>',ambiguous,'ja');
 assert.doesNotMatch(result.html,/<a\b/);assert.match(result.html,/>糸<\/span>/);assert.match(result.html,/>Unknown<\/span>/);assert.equal(result.missing.length,2);
});
test('external links and current paths are unchanged, catalog links use canonical paths',()=>{
 const html='<a href="https://example.com/ja/songs/a">External</a><a href="/ja/database/music/songs/song/">Song</a>';
 assert.equal(renderWikiLinks(html,registry,'ja').html,html);
 assert.match(renderWikiLinks('<a href="/ja/songs/">Songs</a>',registry,'ja').html,/href="\/ja\/database\/music\/songs\/"/);
});

test('same-site absolute links are canonicalized while unrelated domains remain untouched',()=>{
 const result=renderWikiLinks('<a href="https://kamitsubaki.wiki/ja/artists/old/kaf/">花譜</a>',registry,'ja');
 assert.match(result.html,/href="\/ja\/database\/artists\/solo\/kaf\/"/);
});
