import test from 'node:test';
import assert from 'node:assert/strict';
import {auditMigratedBodies} from '../scripts/v3/body-audit.mjs';
import {hash} from '../scripts/v3/io.mjs';

const original='\nLegacy claim.\n',corrected='\nCorrected claim.\n';
const file={path:'src/content/old/en.md',bodyHash:hash(original)};
const amendment={path:file.path,originalHash:file.bodyHash,revisedHash:hash(corrected),reviewedAt:'2026-11-15',reason:'Replace a contradicted product claim with documented products.',sourceUrls:['https://example.org/official-product']};
const document=body=>'---\nid: sample\n---\n'+body;
const audit=(body,amendments=[])=>auditMigratedBodies({files:[file],amendments,readText:async()=>document(body)});

test('migration hashes accept unchanged prefixes and separately documented exact corrections',async()=>{
 assert.deepEqual(await audit(original+'\n\n<!-- V3 RESEARCH SUPPLEMENT sample -->\nExtra.'),{preserved:1,amended:0,errors:[]});
 assert.deepEqual(await audit(corrected,[amendment]),{preserved:0,amended:1,errors:[]});
 assert.match((await audit(corrected)).errors[0],/Original body changed/);
 assert.match((await audit(corrected+'Unreviewed edit.',[amendment])).errors[0],/Amended body changed/);
 assert.match((await audit(original,[amendment])).errors[0],/Amended body changed/);
});

test('amendments reject the wrong baseline, unknown files, duplicates and missing review evidence',async()=>{
 for(const change of [{originalHash:hash('wrong')},{path:'untracked.md'},{revisedHash:'wrong'},{reason:''},{reviewedAt:''},{reviewedAt:'2026-02-30'},{sourceUrls:[]},{sourceUrls:['javascript:alert(1)']}]){
  assert.ok((await audit(corrected,[{...amendment,...change}])).errors.some(error=>error.startsWith('Invalid body amendment')));
 }
 assert.ok((await audit(corrected,[amendment,amendment])).errors.some(error=>error.startsWith('Duplicate')));
});

test('relocated content and Windows line endings retain the original migration identity',async()=>{
 const result=await auditMigratedBodies({files:[file],moves:[{from:file.path,to:'src/content/new/en.md'}],amendments:[amendment],readText:async path=>{
  assert.equal(path,'src/content/new/en.md');return document(corrected).replace(/\n/g,'\r\n');
 }});
 assert.deepEqual(result,{preserved:0,amended:1,errors:[]});
});
