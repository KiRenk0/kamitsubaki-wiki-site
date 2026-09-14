import test from 'node:test';
import assert from 'node:assert/strict';
import {markdownTrigger,upgradeListBlock} from '../src/lib/editorWriting.mjs';
import {editorGuide} from '../src/lib/editorGuide.mjs';
import {importMarkdown,exportMarkdown} from '../src/lib/visualEditor.mjs';
test('writing shortcuts require a whole marker and preserve ordinary text',()=>{
 for(const marker of ['-','+','*'])assert.equal(markdownTrigger(marker).command,'insertUnorderedList');
 for(const marker of ['1.','1)'])assert.equal(markdownTrigger(marker).command,'insertOrderedList');
 for(const text of ['2026.','hello -',' -','**text**','','七','## title'])assert.equal(markdownTrigger(text),null);
 assert.deepEqual(markdownTrigger('#'),{command:'formatBlock',value:'h2'});
 assert.equal(markdownTrigger('###').value,'h3');
 assert.equal(markdownTrigger('>').value,'blockquote');
});
test('switching source and visual preserves nested lists, numbering and emphasis',()=>{
 const source='---\nlocale: zh\ntitle: Test\ntranslationKey: test\ndescription: Test\nkind: PROJECT\norder: 0\n---\n\n7. **First**\n   - [source](https://example.com)\n     - nested\n8. Second\n\nAfter the list.\n';
 const once=exportMarkdown(importMarkdown(source,'projects'));
 assert.match(once,/7\. \*\*First\*\*/);
 assert.match(once,/     - nested/);
 assert.match(once,/8\. Second/);
 assert.equal(exportMarkdown(importMarkdown(once,'projects')),once);
});
test('all five guide locales provide both complete contribution workflows',()=>{
 for(const locale of ['zh','zh-tw','zh-hk','en','ja']){
  const guide=editorGuide(locale);assert.equal(guide.steps.length,7);assert.equal(guide.githubSteps.length,3);
  assert.ok(guide.scope.length>30);assert.ok(guide.steps.some(([,body])=>body.includes('90')));assert.ok(guide.steps.some(([,body])=>body.includes('GitHub')));
 }
});

test('Chrome list indentation exports one nested item without a phantom bullet',async()=>{
 const {richMarkdown}=await import('../src/lib/editorRichText.mjs');
 const previousElement=globalThis.Element,previousNode=globalThis.Node;
 class FixtureElement {
  constructor(tag,children=[],attrs={}){this.tagName=tag;this.childNodes=children;this.children=children.filter(child=>child instanceof FixtureElement);this.dataset={};this.attrs=attrs;this.classList={contains:()=>false};this.nodeType=1;for(const child of children)child.parentElement=this;}
  getAttribute(name){return this.attrs[name]??null;}
 }
 const text=value=>({nodeType:3,textContent:value});
 const el=(tag,children=[],attrs={})=>new FixtureElement(tag,children,attrs);
 globalThis.Element=FixtureElement;globalThis.Node={TEXT_NODE:3};
 try {
  // Reproduces Chromium insertUnorderedList -> Enter -> Tab DOM shape.
  const native=el('DIV',[el('UL',[el('LI',[text('Parent')]),el('UL',[el('LI',[text('Child')])])])]);
  assert.equal(richMarkdown(native),'- Parent\n  - Child');
  const standard=el('DIV',[el('OL',[el('LI',[text('First'),el('UL',[el('LI',[text('Nested')])])]),el('LI',[text('Next')])],{start:'7'})]);
  assert.equal(richMarkdown(standard),'7. First\n   - Nested\n8. Next');
 } finally {globalThis.Element=previousElement;globalThis.Node=previousNode;}
});

test('legacy list drafts migrate without double markers or losing emphasis escapes',()=>{
 const block={id:'saved',type:'list',ordered:true,text:'First\nSecond *literal*'};
 const migrated=upgradeListBlock(block);assert.equal(migrated.id,'saved');assert.equal(migrated.type,'paragraph');
 assert.equal(migrated.text,'1. First\n2. Second \\*literal\\*');assert.equal(block.type,'list');assert.equal(upgradeListBlock(migrated),migrated);
});
