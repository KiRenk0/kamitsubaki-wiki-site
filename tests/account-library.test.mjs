import test from 'node:test';
import assert from 'node:assert/strict';
import {setLibraryOwner,readLibrary,writeLibrary,readLibraryRecord,saveLibraryRecord,LIBRARY_KEY} from '../src/lib/personalLibrary.mjs';
import {emptyLibrary,libraryChanges,applyLibraryChanges} from '../src/lib/accountLibrary.mjs';
const item={path:'/zh/artists/solo/kaf/',title:'花谱',kind:'artists',savedAt:1};
test('guest and two signed-in libraries remain separate and pending changes retain their remote base',()=>{
 const data=new Map(),storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
 setLibraryOwner(null);writeLibrary(storage,{...emptyLibrary(),items:[item]});const guest=data.get(LIBRARY_KEY);
 setLibraryOwner('alice');assert.equal(readLibrary(storage).items.length,0);saveLibraryRecord(storage,{library:emptyLibrary(),base:emptyLibrary(),revision:3});writeLibrary(storage,{...emptyLibrary(),lists:[{id:'list-a',name:'Mine',paths:[]}]});
 assert.equal(readLibraryRecord(storage).revision,3);assert.equal(readLibraryRecord(storage).base.lists.length,0);
 setLibraryOwner('bob');assert.equal(readLibrary(storage).lists.length,0);
 setLibraryOwner('alice');assert.equal(readLibrary(storage).lists[0].name,'Mine');
 setLibraryOwner(null);assert.equal(readLibrary(storage).items[0].title,'花谱');assert.equal(data.get(LIBRARY_KEY),guest);
});
test('separate device additions rebase but a conflicting edit cannot silently overwrite remote data',()=>{
 const base={...emptyLibrary(),items:[item]};const local={...base,items:[{...item,title:'A'}]},remote={...base,items:[{...item,title:'B'}]};
 assert.throws(()=>applyLibraryChanges(remote,libraryChanges(base,local)),{code:'library_conflict'});
 const added={...base,items:[item,{...item,path:'/ja/artists/solo/kaf/'}]};assert.equal(applyLibraryChanges(remote,libraryChanges(base,added)).items.length,2);
});
