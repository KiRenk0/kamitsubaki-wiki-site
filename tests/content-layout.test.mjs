import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parse} from 'yaml';
import {entitySourcePath} from '../src/lib/contentLayout.mjs';
import {getEntityRegistry} from '../src/lib/entityRegistry.mjs';
import {validateContent} from '../../kamitsubaki-wiki-site-backend/src/editor/domain.js';
import {importMarkdown,validateDraft} from '../src/lib/visualEditor.mjs';
test('detailed-map member folders and shared solo records use a single canonical home',()=>{
 assert.equal(entitySourcePath({id:'mikoto',entityType:'person',locale:'zh'}),'src/content/people/groups/sinseiki/members/mikoto/zh.md');
 assert.equal(entitySourcePath({id:'kakyoin',entityType:'person',locale:'ja'}),'src/content/people/groups/tsumitobatsu/members/kakyoin/ja.md');
 assert.equal(entitySourcePath({id:'kaf',entityType:'virtual-avatar',locale:'en'}),'src/content/people/solo/kaf/en.md');
 assert.throws(()=>entitySourcePath({id:'../escape',entityType:'person',locale:'zh'}));
});
test('relocation audit retains hashes and current entity identity without freezing later edits',async()=>{
 const report=JSON.parse(await readFile('docs/v3/reports/content-layout.json','utf8'));
 const normalized=JSON.parse(await readFile('docs/v3/reports/metadata-normalization.json','utf8'));
 const moves=new Map(report.moves.map(m=>[m.from,m.to]));
 const current=path=>{const seen=new Set();while(moves.has(path)&&!seen.has(path)){seen.add(path);path=moves.get(path);}return path;};
 const changes=new Map(normalized.changes.map(c=>[c.beforeHash,c.afterHash]));
 for(const m of report.moves){assert.match(m.sha256,/^[a-f0-9]{64}$/);const source=await readFile(current(m.to),'utf8');const metadata=parse(source.match(/^---\r?\n([\s\S]*?)\r?\n---/)[1]);assert.equal(metadata.id,m.id,current(m.to));assert.equal(metadata.locale,m.locale,current(m.to));if(changes.has(m.sha256))assert.match(changes.get(m.sha256),/^[a-f0-9]{64}$/);}
});
test('song folders use performer metadata and stable collaboration grouping',()=>{
 const base={id:'a-song',entityType:'work-track',locale:'zh'};
 assert.equal(entitySourcePath({...base,performers:[{entity:'kaf',role:'lead-vocal'}]}),'src/content/songs/kaf/a-song/zh.md');
 assert.equal(entitySourcePath({...base,performers:[{entity:'rim',role:'lead-vocal'},{entity:'kaf',role:'lead-vocal'}]}),'src/content/songs/collaborations/a-song/zh.md');
});
test('frontend and backend accept relocated sources and reject mismatched IDs',async()=>{
 const registry=await getEntityRegistry();
 for(const id of ['kaf','mikoto','kakyoin','kamitsubaki-city-anime','thinkr','witch','chronicle-style-and-live-study']){
  const entry=registry.resolveEntity(id,'zh'),path=entitySourcePath(entry.data),source=await readFile(path,'utf8');
  assert.equal(validateContent(path,source).id,id);
  const draft=importMarkdown(source,path.split('/')[2],path);
  assert.ok(!validateDraft(draft).includes('path'),path);
  assert.throws(()=>validateContent(path.replace(`/${id}/`,'/wrong-id/'),source));
 }
});
