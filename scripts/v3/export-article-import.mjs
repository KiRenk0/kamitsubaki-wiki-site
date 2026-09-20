// Generates an idempotent D1 import file. Never writes or deploys remote data.
import {readdir,readFile,writeFile,mkdir} from 'node:fs/promises';
import {join,resolve} from 'node:path';import {createHash} from 'node:crypto';import YAML from 'yaml';
const out=process.argv[2];if(!out)throw Error('Provide an output .sql path');
const quote=value=>"'"+String(value).replaceAll("'","''")+"'";
async function walk(dir){const result=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory())result.push(...await walk(p));else if(/\/(zh|ja|en)\.md$/.test(p))result.push(p);}return result;}
const sql=['-- Apply migrations/0021_articles.sql first. Imported articles await review.'];const report=[];
for(const file of await walk('src/content/articles')){
 const source=await readFile(file,'utf8'),m=source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);if(!m)throw Error('Missing metadata: '+file);
 const meta=YAML.parse(m[1]),body=source.slice(m[0].length),hash=createHash('sha256').update(source).digest('hex');
 const content={title:meta.title||meta.name,summary:meta.summary||'',body,category:meta.articleCategory,relatedEntities:meta.relatedEntities||[]};
 sql.push(`INSERT OR IGNORE INTO article_import_sources(source_hash,article_id,locale,source_path,source_markdown) VALUES (${quote(hash)},${quote(meta.id)},${quote(meta.locale)},${quote(file)},${quote(source)});`);
 sql.push(`INSERT OR IGNORE INTO article_documents(id,locale) VALUES (${quote(meta.id)},${quote(meta.locale)});`);
 sql.push(`INSERT OR IGNORE INTO article_revisions(id,article_id,locale,base_version,author_id,author_name,content_json,status) SELECT ${quote('import-'+hash.slice(0,32))},id,locale,version,'legacy-import',${quote(meta.author||'历史文章导入')},${quote(JSON.stringify(content))},'pending' FROM article_documents WHERE id=${quote(meta.id)} AND locale=${quote(meta.locale)};`);
 report.push({file,id:meta.id,locale:meta.locale,sha256:hash,bodySha256:createHash('sha256').update(body).digest('hex')});
}
await mkdir(resolve(out,'..'),{recursive:true});await writeFile(out,sql.join('\n')+'\n');await writeFile(out+'.json',JSON.stringify(report,null,2));console.log(`${report.length} articles exported to ${out}; source files unchanged; awaiting review.`);
