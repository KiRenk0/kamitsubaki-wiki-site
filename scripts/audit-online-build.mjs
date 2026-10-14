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
 const workflowPages=['gallery','gallery/manage/photos','gallery/classify','media','account/creator','chronicle/submit','community/activities','community/activities/apply','community/activities/read','community/series/read'];
 for(const path of workflowPages){
  const html=await readFile(resolve(root,locale,path,'index.html'),'utf8');
  assert.ok(html.includes(`data-api="${api}"`),`${locale}/${path}: incorrect workflow API`);
  assert.ok(!/data-[\w-]*(?:api|api-base|api-url)="https?:\/\/(?:localhost|127\.0\.0\.1)/.test(html),`${locale}/${path}: local API present`);
 }
 for(const html of [editor,article])assert.ok(!/data-[\w-]*(?:api|api-base|api-url)="https?:\/\/(?:localhost|127\.0\.0\.1)/.test(html),`${locale}: local API present`);
}
console.log('Online release gate passed: five locales, twelve contribution/account/gallery/community pages per locale, PR enabled, local fixtures disabled, production Worker URLs.');

const home=await readFile(resolve(root,'zh/index.html'),'utf8');assert.ok(!home.includes('src=\"/_editor/'),'Editor code must not load on reading pages.');
const workbench=await readFile(resolve(root,'zh/contribute/editor/index.html'),'utf8');assert.ok(workbench.includes('src=\"/_editor/workbench.js\"'),'Editing pages must load the separate built editor.');
