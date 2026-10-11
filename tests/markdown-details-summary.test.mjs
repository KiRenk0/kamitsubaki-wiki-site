import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {unified} from '@astrojs/markdown-remark';
import {renderMarkdownDocument,siteMarkdownOptions} from '../src/lib/markdown.mjs';

const legacy='<details open><br><summary><strong>Tracks</strong></summary><br>1. First<br>2. Second<details><br><summary>Credits</summary><p>Composer</p></details></details>';
const astroRenderer=unified(siteMarkdownOptions).createRenderer({syntaxHighlight:false});

function checkDisclosures(html,expected) {
 const dom=new JSDOM(html);
 try {
  const details=[...dom.window.document.querySelectorAll('details')];
  assert.equal(details.length,expected);
  for(const node of details)assert.equal(node.firstElementChild.tagName,'SUMMARY');
  return details.map(node=>({text:node.textContent,open:node.open,summary:node.querySelector(':scope > summary').innerHTML}));
 } finally {dom.window.close();}
}

test('shared light and full Markdown renderers normalize legacy disclosure headers and preserve content',async()=>{
 for(const source of [legacy,legacy+'\n\nInline $x^2$']) {
  const {html}=await renderMarkdownDocument(source);
  const details=checkDisclosures(html,2);
  assert.equal(details[0].open,true);
  assert.equal(details[0].summary,'<strong>Tracks</strong>');
  assert.equal(details[0].text,'Tracks1. First2. SecondCreditsComposer');
  assert.equal(details[1].text,'CreditsComposer');
 }
});

test('the actual Astro unified renderer applies the same normalization',async()=>{
 const {code}=await (await astroRenderer).render(legacy);
 const details=checkDisclosures(code,2);
 assert.equal(details[0].open,true);
 assert.equal(details[0].summary,'<strong>Tracks</strong>');
 assert.equal(details[1].text,'CreditsComposer');
});

test('both rendering chains correct real project tracklists without editing their preserved source',async()=>{
 for(const locale of ['zh','ja']) {
  const file=new URL(`../src/content/projects/girls-revolution/girls-revolution-project/${locale}.md`,import.meta.url);
  const original=await readFile(file,'utf8');
  assert.equal(original.split('<details><br><summary>').length-1,2,'the original authored body is retained');
  const source=original.replace(/^---[\s\S]*?\n---\s*/u,'');
  const standalone=await renderMarkdownDocument(source);
  const astro=await (await astroRenderer).render(source);
  for(const html of [standalone.html,astro.code]) {
   const details=checkDisclosures(html,2);
   assert.ok(details.every(node=>node.text.startsWith('全11曲：')));
   assert.ok(details[0].text.includes('フェイクナイト・シンデレラ'));
   assert.ok(details[1].text.includes('SURVIVAL'));
  }
  assert.equal(await readFile(file,'utf8'),original);
 }
});

test('normalization preserves preceding prose and leaves disclosures without a direct summary untouched',async()=>{
 const {html}=await renderMarkdownDocument('<details><p>Keep this introduction</p><summary>More</summary><p>Keep this body</p></details>\n\n<details><p>No authored summary</p></details>');
 const dom=new JSDOM(html);
 try {
  const [first,second]=dom.window.document.querySelectorAll('details');
  assert.equal(first.firstElementChild.tagName,'SUMMARY');
  assert.deepEqual([...first.querySelectorAll(':scope > p')].map(node=>node.textContent),['Keep this introduction','Keep this body']);
  assert.equal(second.querySelector('summary'),null);
  assert.equal(second.textContent,'No authored summary');
 } finally {dom.window.close();}
});
