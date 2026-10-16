import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {createHash} from 'node:crypto';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {articleHTML} from '../../../src/lib/articleMarkdown';
import {localArticleHTML,migratePrototypeImages} from '../server/local-api';
test('local article previews reuse the public browser renderer without installing browser globals',()=>{
 const body='正文 **加粗** 与 {{ruby::花譜::かふ}}、{{spoiler::结局}}。\n\n<details><summary>资料</summary>\n\n继续阅读 **原始资料**。\n\n</details>\n\n![测试图](/_private/article-assets/'+'a'.repeat(64)+')\n\n<script>alert(1)</script>';
 const previous={document:globalThis.document,DOMParser:globalThis.DOMParser},dom=new JSDOM('<!doctype html>');
 try{
  const expected=articleHTML(body,'zh',dom.window.document),actual=localArticleHTML(body);
  assert.equal(actual,expected);assert.ok(actual.includes('<strong>加粗</strong>'));assert.ok(actual.includes('<ruby>'));assert.ok(actual.includes('wiki-spoiler'));assert.ok(actual.includes('<details>'));assert.ok(actual.includes('/_private/article-assets/'));assert.ok(!actual.includes('<script>'));
  assert.equal(globalThis.document,previous.document);assert.equal(globalThis.DOMParser,previous.DOMParser);
 }finally{dom.window.close();}
});
test('prototype image migration retains bytes and stable URLs outside production public assets',async()=>{
 const root=await mkdtemp(join(tmpdir(),'novel-image-migration-')),legacy=join(root,'public/images/novel-prototype'),destination=join(root,'prototypes/novel-editor/.local/images'),bytes=Buffer.from('owned local upload'),name=createHash('sha256').update(bytes).digest('hex')+'.png';
 try{
  await mkdir(legacy,{recursive:true});await writeFile(join(legacy,name),bytes);await writeFile(join(legacy,'unrelated-note.txt'),'keep');
  await migratePrototypeImages(root);assert.deepEqual(await readFile(join(destination,name)),bytes);await assert.rejects(readFile(join(legacy,name)),{code:'ENOENT'});assert.equal(await readFile(join(legacy,'unrelated-note.txt'),'utf8'),'keep');
  await writeFile(join(legacy,name),bytes);await migratePrototypeImages(root);assert.deepEqual(await readFile(join(destination,name)),bytes);
  const invalid='a'.repeat(64)+'.png';await writeFile(join(legacy,invalid),'changed file');await assert.rejects(migratePrototypeImages(root),/保存记录不一致/);assert.equal(await readFile(join(legacy,invalid),'utf8'),'changed file');
 }finally{await rm(root,{recursive:true,force:true});}
});
