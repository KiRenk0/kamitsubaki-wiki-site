// Development-only compatibility probe. Never imported by production pages.
import {JSDOM} from 'jsdom';
import {Editor} from '@tiptap/core';
import {StarterKit} from '@tiptap/starter-kit';
import {Markdown} from '@tiptap/markdown';
import {Image} from '@tiptap/extension-image';
import {TableKit} from '@tiptap/extension-table';
import {renderMarkdownDocument} from '../../src/lib/markdown.mjs';
import {newBlock,blockMarkdown} from '../../src/lib/visualEditor.mjs';

export function createTiptapProbe(){
 const dom=new JSDOM('<div id="editor"></div>'),originals=new Map();
 for(const key of ['window','document','navigator','HTMLElement','Node','DOMParser','MutationObserver','getComputedStyle']){
  originals.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{value:dom.window[key],configurable:true,writable:true});
 }
 const editor=new Editor({element:dom.window.document.querySelector('#editor'),extensions:[StarterKit,Image,TableKit,Markdown],content:'',contentType:'markdown'});
 function semanticHTML(html){
  const root=dom.window.document.createElement('div');root.innerHTML=html;
  const walk=node=>node.nodeType===3?(node.textContent.trim()?node.textContent:null):node.nodeType===1?{tag:node.tagName,attrs:[...node.attributes].map(a=>[a.name,a.value]).sort(),children:[...node.childNodes].map(walk).filter(v=>v!==null)}:null;
  return JSON.stringify(walk(root));
 }
 return {editor,
  roundTrip(source){editor.commands.setContent(source,{contentType:'markdown'});return {output:editor.getMarkdown(),document:editor.getJSON()};},
  async check(source){
   const {output,document}=this.roundTrip(source);
   const before=await renderMarkdownDocument(source),after=await renderMarkdownDocument(output);
   return {exactSource:source.trim()===output.trim(),sameRenderedContent:semanticHTML(before.html)===semanticHTML(after.html),output,document};
  },
  close(){editor.destroy();dom.window.close();for(const [key,value] of originals){if(value)Object.defineProperty(globalThis,key,value);else delete globalThis[key];}},
 };
}
export function compatibilityCases(locale='zh'){
 const specs={ruby:['花譜','かふ','kaf'],spoiler:['结局'],mark:['重点'],abbr:['V.W.P','Virtual Witch Phenomenon'],kbd:['Ctrl+K'],time:['今天','2026-10-03'],small:['附注'],sub:['2'],sup:['2'],'zh-variant':['软件','軟體','軟件']};
 const block=(type,values)=>blockMarkdown({...newBlock(type),...values},locale);
 return [
  {name:'standard-markdown',source:'## 花譜 / KAF\n\n**资料**与 *日本語*、~~旧文~~、[Official](https://kamitsubaki.jp/)。\n\n- 花\n- 譜\n\n> 引用\n\n---'},
  {name:'code',source:block('code',{language:'js',text:'const title = "花譜";'})},
  {name:'table',source:block('table',{rows:[['艺人','说明'],['花譜','来源']]})},
  ...Object.entries(specs).map(([name,args])=>({name:'shortcode-'+name,source:block('inline',{kind:name,args}),requiresNode:name==='ruby'?'ruby':name==='spoiler'?'spoiler':name})),
  {name:'html-spoiler',source:'<span class="wiki-spoiler"><strong>结局</strong> [来源](https://kamitsubaki.jp/)</span>',requiresNode:'spoiler'},
  {name:'image-caption',source:block('image',{url:'/images/sample.png',text:'花譜',caption:'来源：官方资料'}),protectedText:'<!-- wiki-editor:image-caption -->'},
  {name:'details',source:block('details',{title:'背景',text:'**设定**\n\n第二段'}),requiresNode:'details'},
  {name:'media',source:block('media',{provider:'youtube',url:'https://youtu.be/abc123',caption:'来源'}),requiresNode:'wikiMedia'},
  {name:'media-switcher',source:block('media-switcher',{title:'视听',items:[{provider:'youtube',url:'https://youtu.be/abc123'},{provider:'bilibili',url:'BV1xx411c7mD'}]}),requiresNode:'mediaSwitcher'},
  {name:'math',source:block('math',{text:'x^2 + y^2 = 1'}),requiresNode:'mathematics'},
  {name:'timed-lyrics',source:block('lyrics',{rows:[{translation:'译文',units:[{original:'花',kana:'はな',romaji:'hana',time:'00:01.00'},{original:'譜',kana:'ふ',romaji:'fu',time:'00:02.500'}]}]}),requiresNode:'lyrics'},
 ];
}
export function hasNode(document,type){return document.type===type||document.marks?.some(mark=>mark.type===type)||document.content?.some(child=>hasNode(child,type))||false;}
