import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parse} from 'yaml';
import {createEntityRegistry} from '../src/lib/entityRegistry.mjs';
import {buildArchiveSnapshot} from '../src/lib/archiveSnapshot.mjs';
import {physicalCatalog,validBarcode} from '../src/lib/archiveResearch.mjs';

test('an identity-unverified placeholder remains a review issue even when its translated facts agree',async()=>{
 const entries=await Promise.all(['zh','ja','en'].map(async locale=>{
  const path=`src/content/people/creators/ichinose-ruri/${locale}.md`,raw=await readFile(path,'utf8');
  const data=parse(raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)[1]);
  assert.equal(data.contentStatus,'stub');assert.equal(data.seo.noindex,true);assert.deepEqual(data.roles,[]);
  return {data,filePath:path,body:''};
 }));
 // The physical catalogue is read by the snapshot builder and must resolve too.
 const physical=JSON.parse(await readFile('src/data/physical-items.json','utf8'));
 for(const id of new Set(physical.flatMap(row=>row.relatedEntities)))entries.push({data:{schemaVersion:2,id,locale:'zh',entityType:'project',status:'active'}});
 const snapshot=await buildArchiveSnapshot(createEntityRegistry(entries),{events:[]});
 assert.deepEqual(snapshot.issues.filter(row=>row.id==='ichinose-ruri'),[{id:'ichinose-ruri',field:'identity',kind:'unverified-record'}]);
 assert.equal(snapshot.entities.find(row=>row.id==='ichinose-ruri').status,'stub');
});

test('the sourced physical RIME JAN matches its package and never its separate download edition',async()=>{
 const physical=JSON.parse(await readFile('src/data/physical-items.json','utf8'));
 const catalogue=physicalCatalog({entities:[],physical},'ja');
 const packageCode=validBarcode('4582736573240'),downloadCode=validBarcode('4582736574544');
 assert.ok(packageCode&&downloadCode);
 const matched=catalogue.filter(row=>row.barcode===packageCode);
 assert.equal(matched.length,1);assert.equal(matched[0].id,'rime-voicepeak-package');
 assert.equal(matched[0].entityId,'rime');assert.equal(matched[0].bonusItems.length,3);
 assert.equal(catalogue.filter(row=>row.barcode===downloadCode).length,0);
 const barcodeEvidence=matched[0].evidence.find(row=>row.field==='barcode');
 assert.equal(matched[0].sources.find(row=>row.id===barcodeEvidence.sourceIds[0]).type,'retailer');
});
