import test from 'node:test';
import assert from 'node:assert/strict';
import {articleLocalImages,articleSnapshot,articleSourceWithContent,sameArticleContent,validateArticleContent,validateArticleImage} from '../src/lib/article-document';
const source='\uFEFF---\r\nschemaVersion: 2\r\nid: local-article\r\nlocale: zh\r\nentityType: editorial-article\r\ntitle: 本地文章 # 保留说明\r\narticleCategory: archival\r\nauthor: 原作者\r\nunknownValue: null\r\n---\r\n\r\n{{ruby::花譜::かふ}} 与 [[vwp]]。\r\n';
test('article API snapshots keep exact Markdown, BOM/CRLF and unsupported original metadata locally',()=>{
 const snapshot=articleSnapshot('doc',source);assert.ok(snapshot.content.body.endsWith('\r\n'));assert.equal(snapshot.content.body,'\r\n{{ruby::花譜::かふ}} 与 [[vwp]]。\r\n');
 assert.equal(articleSourceWithContent(source,snapshot.content),source);
 const changed=articleSourceWithContent(source,{...snapshot.content,title:'修正后的文章',body:snapshot.content.body+'\r\n补充正文。\r\n'});
 assert.ok(changed.includes('unknownValue: null'));assert.ok(changed.includes('author: 原作者'));assert.ok(changed.includes('# 保留说明'));assert.ok(changed.startsWith('\uFEFF'));assert.ok(!changed.replaceAll('\r\n','').includes('\n'));
});
test('article comparisons recognize API field order without ignoring changed Markdown or image attribution',()=>{
 const content=articleSnapshot('doc',source).content;
 const reordered={body:content.body,relatedEntities:[],category:content.category,summary:content.summary,title:content.title,mediaRefs:[]};
 assert.equal(sameArticleContent(content,reordered),true);
 assert.equal(sameArticleContent(content,{...reordered,body:content.body.replaceAll('\r\n','\n')}),false);
 const image={alt:'说明',caption:'',author:'作者',sourceTitle:'来源',sourceUrl:'',rightsBasis:'original',rightsEvidence:''};
 assert.equal(sameArticleContent({...content,mediaRefs:[image]},{...reordered,mediaRefs:[{...image,author:'另一作者'}]}),false);
});
test('article attachments only include rendered body images and leave compatibility covers and code examples alone',()=>{
 const url='/images/novel-prototype/'+'a'.repeat(64)+'.png';
 const cover=source.replace('author: 原作者','presentation:\r\n  image: '+url+'\r\nauthor: 原作者');
 assert.deepEqual(articleSnapshot('doc',cover).attachments,[]);
 assert.deepEqual(articleLocalImages('```md\n![示例]('+url+')\n```'),[]);
 assert.equal(articleLocalImages('![图片]('+url+')')[0].url,url);
});
test('article image descriptions follow the body and native image edits while preserving their provenance',()=>{
 const ref={assetId:'b'.repeat(64),alt:'旧说明',caption:'旧配文',author:'原作者',sourceTitle:'来源',sourceUrl:'',rightsBasis:'original',rightsEvidence:''},url='/_private/article-assets/'+ref.assetId;
 const next=articleSourceWithContent(source,{...articleSnapshot('doc',source).content,body:'![新的说明]('+url+')\n\n<!-- wiki-editor:image-caption -->\n\n新的配文\n',mediaRefs:[ref]});
 const parsed=articleSnapshot('doc',next);assert.equal(parsed.content.mediaRefs?.[0].alt,'新的说明');assert.equal(parsed.content.mediaRefs?.[0].caption,'新的配文');assert.equal(parsed.content.mediaRefs?.[0].author,'原作者');
 assert.equal(articleSnapshot('doc',next,[],undefined,[{src:url,alt:'表格中的新说明',caption:'表格配文'}]).content.mediaRefs?.[0].alt,'表格中的新说明');
});
test('incomplete drafts may save, but empty articles and incomplete image provenance cannot submit',()=>{
 const content=articleSnapshot('doc',source).content;assert.doesNotThrow(()=>validateArticleContent({...content,title:'',body:''}));assert.throws(()=>validateArticleContent({...content,title:''},true),/标题与正文/);
 const image={alt:'图片说明',caption:'',author:'',sourceTitle:'',sourceUrl:'',rightsBasis:'',rightsEvidence:''};assert.doesNotThrow(()=>validateArticleImage(image));assert.throws(()=>validateArticleImage(image,true),/作者/);
 assert.throws(()=>validateArticleImage({...image,author:'原作者',sourceTitle:'官方发布',rightsBasis:'official'},true),/来源链接/);
 assert.throws(()=>validateArticleImage({...image,author:'原作者',sourceTitle:'原始发布',rightsBasis:'authorized'},true),/具体说明/);
});
