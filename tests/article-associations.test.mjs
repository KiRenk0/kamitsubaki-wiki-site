import test from 'node:test';import assert from 'node:assert/strict';
import {ensureArticleDraftUrl,initialArticleRelations,matchArticleEntities} from '../src/lib/articleEntities.mjs';
import {articleImport} from '../scripts/v3/export-article-import.mjs';
import {readFileSync} from 'node:fs';import {DatabaseSync} from 'node:sqlite';import {createHash} from 'node:crypto';
test('new related submissions are isolated; existing and restored drafts ignore URL preselection',()=>{
 const a=ensureArticleDraftUrl('https://wiki.test/zh/articles/submit/?related=kaf',()=> 'a'),b=ensureArticleDraftUrl('https://wiki.test/zh/articles/submit/?related=rim',()=> 'b');
 assert.notEqual(a.searchParams.get('draft'),b.searchParams.get('draft'));assert.deepEqual(initialArticleRelations(a.href),['kaf']);assert.deepEqual(initialArticleRelations(a.href,true),[]);assert.deepEqual(initialArticleRelations('https://wiki.test/?id=existing&related=kaf'),[]);assert.equal(ensureArticleDraftUrl(a.href,()=> 'new').href,a.href);
});
test('related picker matches names, aliases and IDs and excludes selected entries',()=>{
 const entries=[{id:'kaf',name:'花譜',aliases:['花谱']},{id:'rim',name:'理芽',aliases:['RIME']}];assert.equal(matchArticleEntities(entries,'花谱')[0].id,'kaf');assert.equal(matchArticleEntities(entries,'RIME')[0].id,'rim');assert.equal(matchArticleEntities(entries,'KAF')[0].id,'kaf');assert.equal(matchArticleEntities(entries,'kaf',['kaf']).length,0);assert.equal(matchArticleEntities(entries,'unknown').length,0);
});
test('archive import preserves full body and provenance, is idempotent, and refuses conflicts without overwriting',async()=>{
 const {sql,report}=await articleImport('docs/archive/articles'),db=new DatabaseSync(':memory:');try{
 db.exec(readFileSync('../kamitsubaki-wiki-site-backend/migrations/0021_articles.sql','utf8'));db.exec(readFileSync('../kamitsubaki-wiki-site-backend/migrations/0023_article_ownership.sql','utf8'));db.exec(sql);db.exec(sql);
 assert.equal(db.prepare('SELECT COUNT(*) n FROM article_documents').get().n,report.length);
 for(const r of report){const row=db.prepare('SELECT * FROM article_documents WHERE id=? AND locale=?').get(r.id,r.locale);assert.equal(row.origin,'site-original');assert.equal(row.author_name,r.author);assert.equal(row.published_at,r.publishDate);assert.equal(createHash('sha256').update(JSON.parse(row.published_json).body).digest('hex'),r.bodySha256);}
 const first=report[0];db.prepare("UPDATE article_documents SET published_json=json_set(published_json,'$.body','Later edit'),version=2 WHERE id=? AND locale=?").run(first.id,first.locale);db.exec(sql);assert.equal(JSON.parse(db.prepare('SELECT published_json FROM article_documents WHERE id=? AND locale=?').get(first.id,first.locale).published_json).body,'Later edit');
 db.prepare('DELETE FROM article_import_sources WHERE article_id=? AND locale=?').run(first.id,first.locale);assert.throws(()=>db.exec(sql),/CHECK constraint/);assert.equal(JSON.parse(db.prepare('SELECT published_json FROM article_documents WHERE id=? AND locale=?').get(first.id,first.locale).published_json).body,'Later edit');
 }finally{db.close();}
});

test('picker can reveal matches beyond its initial page',()=>{
 const entries=Array.from({length:45},(_,i)=>({id:String(i),name:'entry '+i,aliases:[]}));assert.equal(matchArticleEntities(entries,'entry').length,20);assert.equal(matchArticleEntities(entries,'entry',[],40).length,40);assert.equal(matchArticleEntities(entries,'entry',[],60).length,45);
});
