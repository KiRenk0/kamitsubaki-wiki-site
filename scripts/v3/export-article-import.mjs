// Read-only by default. An output path writes a reviewable SQL bundle, never a remote database.
import {readdir,readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {join,resolve} from 'node:path';import {createHash} from 'node:crypto';import YAML from 'yaml';
import {pathToFileURL} from 'node:url';
import {getEntityRegistry} from '../../src/lib/entityRegistry.mjs';
const hash=value=>createHash('sha256').update(value).digest('hex');
const quote=value=>value===null?'NULL':"'"+String(value).replaceAll("'","''")+"'";
async function walk(dir){const result=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory())result.push(...await walk(p));else if(/\/(zh|ja|en)\.md$/.test(p))result.push(p);}return result.sort();}
export async function articleImport(root){
 const registry=await getEntityRegistry();
 const sql=['-- Apply 0021_articles.sql and 0023_article_ownership.sql first.','CREATE TABLE IF NOT EXISTS article_import_guard(valid INTEGER CHECK(valid=1));'];const report=[];
 for(const file of await walk(root)){
  const source=await readFile(file,'utf8'),m=source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);if(!m)throw Error('Missing metadata: '+file);
  const meta=YAML.parse(m[1]),body=source.slice(m[0].length),sourceHash=hash(source),published=meta.contentStatus!=='stub';
  const content={title:meta.title||meta.name,summary:meta.summary||'',body,category:meta.articleCategory,relatedEntities:meta.relatedEntities||[]};
  if(!Array.isArray(content.relatedEntities)||content.relatedEntities.length>50||content.relatedEntities.some(id=>!registry.entities.has(id)))throw Error('Invalid article associations: '+file);
  const id=quote(meta.id),locale=quote(meta.locale),json=quote(JSON.stringify(content)),revision=quote('import-'+sourceHash.slice(0,32)),date=quote(meta.publishDate||null);
  // A CHECK failure stops execution before any record for this article is changed.
  sql.push(`-- ${meta.id}/${meta.locale}: conflict guard; do not continue after errors.`);
  sql.push(`INSERT INTO article_import_guard SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM article_documents WHERE id=${id} AND locale=${locale}) OR EXISTS(SELECT 1 FROM article_import_sources WHERE source_hash=${quote(sourceHash)} AND article_id=${id} AND locale=${locale}) OR EXISTS(SELECT 1 FROM article_documents WHERE id=${id} AND locale=${locale} AND published_json=${json}) THEN 1 ELSE 0 END;`);
  sql.push('DELETE FROM article_import_guard;');
  sql.push(`INSERT OR IGNORE INTO article_documents(id,locale,origin,owner_id,version,published_json,published_revision_id,author_name,published_at) VALUES (${id},${locale},'site-original',NULL,${published?1:0},${published?json:'NULL'},${published?revision:'NULL'},${quote(meta.author||'')},${date});`);
  sql.push(`INSERT OR IGNORE INTO article_revisions(id,article_id,locale,base_version,author_id,author_name,content_json,status) VALUES (${revision},${id},${locale},0,'legacy-import',${quote(meta.author||'')},${json},${quote(published?'approved':'draft')});`);
  sql.push(`INSERT OR IGNORE INTO article_import_sources(source_hash,article_id,locale,source_path,source_markdown) VALUES (${quote(sourceHash)},${id},${locale},${quote(file)},${quote(source)});`);
  report.push({file,id:meta.id,locale:meta.locale,sha256:sourceHash,bodySha256:hash(body),origin:'site-original',published,publishDate:meta.publishDate||null,author:meta.author||'',relatedEntities:content.relatedEntities});
 }
 return {sql:sql.join('\n')+'\n',report};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 let root='docs/archive/articles';try{await access(root);}catch{root='src/content/articles';}
 const {sql,report}=await articleImport(root),out=process.argv[2];
 if(out){await mkdir(resolve(out,'..'),{recursive:true});await writeFile(out,sql);await writeFile(out+'.json',JSON.stringify(report,null,2)+'\n');console.log(`${report.length} article translations exported; no database modified.`);}else console.log(JSON.stringify(report,null,2));
}
