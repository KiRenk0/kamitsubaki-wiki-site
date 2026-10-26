import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import {reactive,ref,watch,computed,nextTick} from 'vue'
const source=readFileSync(new URL('../app/composables/useAlbumFeed.ts',import.meta.url),'utf8')
function albumFeed(api){
 const exports={},initial=ref({photos:[{id:'first'}],total:3,nextOffset:1}),id=ref(1)
 const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText
 vm.runInNewContext(compiled,{exports,reactive,watch,computed,useGalleryApi:()=>api})
 return {feed:exports.useAlbumFeed(initial,id),initial,id}
}
test('album page failure clears loading and retry keeps its cursor',async()=>{
 let fail=true
 const {feed}=albumFeed(async(path,options)=>{
  assert.equal(options.timeout,20000)
  assert.equal(path,'/api/albums/1?offset=1')
  if(fail){fail=false;throw Error('503')}
  return {photos:[{id:'second'},{id:'third'}],total:3,nextOffset:null}
 })
 await feed.reveal();assert.equal(feed.state.loading,false);assert.ok(feed.state.error);assert.equal(feed.state.nextOffset,1)
 await feed.reveal();assert.equal(feed.state.error,'');assert.equal(feed.state.nextOffset,null);assert.equal(feed.data.value.photos.map(p=>p.id).join(','),'first,second,third')
})
test('a late old album page cannot replace a newly resolved album',async()=>{
 let resolvePage
 const {feed,initial,id}=albumFeed(()=>new Promise(resolve=>{resolvePage=resolve}))
 const pending=feed.reveal();id.value=2;initial.value={photos:[{id:'new-album'}],total:1,nextOffset:null};await nextTick()
 resolvePage({photos:[{id:'old-album'}],total:2,nextOffset:null});await pending
 assert.equal(feed.state.photos.map(p=>p.id).join(','),'new-album');assert.equal(feed.state.loading,false)
})

test('deep-link metadata paging keeps the rendered album wall bounded',async()=>{
 const {feed}=albumFeed(async path=>{const offset=Number(path.split('offset=')[1]);return {photos:[{id:'photo-'+offset}],total:75,nextOffset:offset+1<75?offset+1:null}})
 for(let i=0;i<74;i++)await feed.loadNext()
 assert.equal(feed.state.photos.length,75)
 assert.equal(feed.state.nextOffset,null)
 assert.equal(feed.data.value.photos.length,48)
 await feed.reveal()
 assert.equal(feed.data.value.photos.length,75)
})
