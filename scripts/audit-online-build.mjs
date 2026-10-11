import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const root=resolve('dist'),api='https://api.kamitsubaki.wiki';
for(const locale of ['zh','zh-tw','zh-hk','ja','en']){
 const editor=await readFile(resolve(root,locale,'contribute/editor/index.html'),'utf8');
 assert.ok(/data-editor-enabled="true"/.test(editor),`${locale}: PR submission is disabled`);
 assert.ok(/data-editor-local="false"/.test(editor),`${locale}: local editor mode must be off`);
 assert.ok(editor.includes(`data-editor-api="${api}"`),`${locale}: incorrect editor API`);
 assert.ok(!editor.includes('class="ve-pr-unavailable"'),`${locale}: unavailable submission entry`);
 const article=await readFile(resolve(root,locale,'articles/submit/index.html'),'utf8');
 assert.ok(article.includes(`data-article-api="${api}"`),`${locale}: incorrect article API`);
 const workflowPages=['gallery','gallery/manage/photos','gallery/classify','media','account/creator','chronicle/submit'];
 for(const path of workflowPages){
  const html=await readFile(resolve(root,locale,path,'index.html'),'utf8');
  assert.ok(html.includes(`data-api="${api}"`),`${locale}/${path}: incorrect workflow API`);
  assert.ok(!/data-[\w-]*(?:api|api-base|api-url)="https?:\/\/(?:localhost|127\.0\.0\.1)/.test(html),`${locale}/${path}: local API present`);
 }
 for(const html of [editor,article])assert.ok(!/data-[\w-]*(?:api|api-base|api-url)="https?:\/\/(?:localhost|127\.0\.0\.1)/.test(html),`${locale}: local API present`);
}
console.log('Online release gate passed: five locales, eight contribution/account/gallery pages per locale, PR enabled, local fixtures disabled, production Worker URLs.');
