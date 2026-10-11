import assert from 'node:assert/strict';
import test from 'node:test';
import {editorInlineParts,unwrapEditorInline,richMarkdown,inlineSource} from '../src/lib/editorRichText.mjs';
import {renderMarkdownDocument} from '../src/lib/markdown.mjs';
class Text {constructor(value){this.nodeType=3;this.textContent=value;}}
class Element {
 constructor(tag,children=[],attrs={}){this.nodeType=1;this.tagName=tag.toUpperCase();this.childNodes=children;this.attrs=attrs;this.dataset=attrs.source?{veSource:encodeURIComponent(attrs.source)}:{};this.classList={contains:name=>attrs.class===name};this.ownerDocument={createTextNode:value=>new Text(value)};}
 get textContent(){return this.childNodes.map(child=>child.textContent).join('');}
 getAttribute(name){return this.attrs[name];}
 replaceWith(...nodes){this.replacement=nodes;}
}
const text=value=>new Text(value);
test('removing imported ruby restores the base text without appending kana or romanization',()=>{
 const token=new Element('span',[text('花譜かふkaf')],{source:inlineSource('ruby',['花譜','かふ','kaf'])});
 unwrapEditorInline(token);assert.equal(token.replacement[0].textContent,'花譜');
});
test('removing a spoiler wrapper preserves nested emphasis and links',()=>{
 const bold=new Element('strong',[text('神椿')]),link=new Element('a',[text('资料')],{href:'https://kamitsubaki.jp/'});
 const spoiler=new Element('span',[bold,link],{class:'wiki-spoiler'});
 assert.equal(editorInlineParts(spoiler).kind,'spoiler');unwrapEditorInline(spoiler);
 assert.deepEqual(spoiler.replacement,[bold,link]);
});
test('all shortcode formats can be removed without losing their text',()=>{
 for(const kind of ['spoiler','mark','kbd','small','sub','sup','abbr','time','zh-variant']){
  const token=new Element('span',[text('preview')],{source:inlineSource(kind,['A::B','reading','other'])});
  unwrapEditorInline(token);assert.equal(token.replacement[0].textContent,'A::B',kind);
 }
});
test('combined formats export clean source, retaining ruby and variant semantics',async t=>{
 const previous={Node:globalThis.Node,Element:globalThis.Element};globalThis.Node={TEXT_NODE:3};globalThis.Element=Element;t.after(()=>{for(const [key,value] of Object.entries(previous)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}});
 const ruby=new Element('span',[],{source:inlineSource('ruby',['花譜','かふ'])}),variant=new Element('span',[],{source:inlineSource('zh-variant',['软件','軟體','軟件'])});
 const body=new Element('div',[new Element('span',[new Element('strong',[text('神椿')]),text(' '),ruby,text(' '),new Element('mark',[variant])],{class:'wiki-spoiler'})]);
 const markdown=richMarkdown(body);
 assert.equal(markdown,'<span class="wiki-spoiler">**神椿** {{ruby::花譜::かふ}} <mark>{{zh-variant::软件::軟體::軟件}}</mark></span>');
 assert.doesNotMatch(markdown,/data-ve-|contenteditable/);
 const {html}=await renderMarkdownDocument(markdown);assert.match(html,/<strong>神椿<\/strong>/);assert.match(html,/<ruby>花譜<rt>かふ<\/rt><\/ruby>/);assert.match(html,/<mark>软件<\/mark>/);
});
