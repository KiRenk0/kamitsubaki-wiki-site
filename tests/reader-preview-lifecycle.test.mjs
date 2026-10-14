import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {JSDOM} from 'jsdom';
import {renderMarkdownFragment} from '../src/lib/markdown.mjs';
const require=createRequire(import.meta.url);
const {build}=createRequire(require.resolve('vite'))('esbuild');
const bundle=await build({stdin:{contents:"import {initializeReaderInteractions} from './src/lib/readerInteractions.mjs'; import {initWikiPreviews} from './src/lib/wikiPreviews.ts'; window.mountReader=initializeReaderInteractions; window.mountPreviews=initWikiPreviews;",resolveDir:process.cwd()},bundle:true,platform:'browser',format:'iife',write:false});
const html=await renderMarkdownFragment('{{lyrics-controls::zh}}\n\n<div class="my-lyric-box"><div class="lyric-line"><div class="jp-lyric">[00:00.00]歌词</div></div></div>');
function fixture(){
 const dom=new JSDOM(`<main>${html}</main><aside>${html}</aside>`,{url:'https://wiki.example',runScripts:'outside-only'});
 const w=dom.window,root=w.document.querySelector('main'),outside=w.document.querySelector('aside');
 const canceled=[];w.matchMedia=()=>({matches:false});w.requestAnimationFrame=()=>99;w.cancelAnimationFrame=id=>canceled.push(id);
 w.eval(bundle.outputFiles[0].text);return{dom,w,root,outside,canceled};
}
test('shared reader mounts once, scopes actions, stops playback and reopens new preview content',()=>{
 const b=fixture();try{
  const stop=b.w.mountReader(b.root);assert.equal(b.w.mountReader(b.root),stop);
  const ruby=b.root.querySelector('[data-lyric-action= ruby]');ruby.click();assert.ok(b.root.querySelector('.hide-ruby'));assert.equal(b.outside.querySelector('.hide-ruby'),null);
  b.root.querySelector('[data-lyric-action=sync-lyrics]').click();b.root.querySelector('[data-lyric-action=sync-play-pause]').click();
  stop();assert.ok(b.canceled.includes(99));ruby.click();assert.ok(b.root.querySelector('.hide-ruby'),'disposed actions do not run');
  b.root.innerHTML=html;const stopAgain=b.w.mountReader(b.root);b.root.querySelector('[data-lyric-action=sync-lyrics]').click();assert.ok(b.root.querySelector('.lrc-word'));stopAgain();
 }finally{b.w.close();}
});
test('link previews clear old descriptions, hide on nested scroll, and dispose every listener and panel',()=>{
 const b=fixture();try{
  b.root.innerHTML='<a data-wiki-id="kaf" href="/zh/kaf/">花譜</a><a data-wiki-id="rim" href="/zh/rim/">理芽</a>';
  const links=b.root.querySelectorAll('a');const stop=b.w.mountPreviews(b.root,{kaf:{title:'花譜',url:'/zh/kaf/',summary:'介绍'},rim:{title:'理芽',url:'/zh/rim/',summary:'介绍'}});
  links[0].dispatchEvent(new b.w.FocusEvent('focus'));const box=b.w.document.querySelector('.wiki-hover');assert.equal(box.hidden,false);assert.ok(links[0].getAttribute('aria-describedby'));
  links[1].dispatchEvent(new b.w.FocusEvent('focus'));assert.equal(links[0].hasAttribute('aria-describedby'),false);assert.equal(box.querySelector('strong').textContent,'理芽');
  b.root.dispatchEvent(new b.w.Event('scroll'));assert.equal(box.hidden,true);assert.equal(links[1].hasAttribute('aria-describedby'),false);
  stop();assert.equal(b.w.document.querySelector('.wiki-hover'),null);links[0].dispatchEvent(new b.w.FocusEvent('focus'));assert.equal(links[0].hasAttribute('aria-describedby'),false);
 }finally{b.w.close();}
});
test('reopening the same lyric DOM retains timestamp controls and stale cleanup cannot disable the new mount',()=>{
 const b=fixture();try{
  const old=b.w.mountReader(b.root);
  b.root.querySelector('[data-lyric-action=sync-lyrics]').click();
  assert.equal(b.root.querySelectorAll('.lrc-word').length,1);
  old();assert.equal(b.root.querySelectorAll('.lrc-word').length,0);assert.ok(b.root.querySelector('.lrc-tag'));
  const stop=b.w.mountReader(b.root);old();assert.equal(b.w.mountReader(b.root),stop);
  b.root.querySelector('[data-lyric-action=sync-lyrics]').click();
  assert.ok(b.root.querySelector('.sync-enabled'));assert.equal(b.root.querySelectorAll('.lrc-word').length,1);
  b.root.querySelector('[data-lyric-action=sync-play-pause]').click();
  assert.equal(b.root.querySelector('.sync-play-btn').getAttribute('aria-pressed'),'true');
  stop();assert.ok(b.canceled.includes(99));
 }finally{b.w.close();}
});
test('refreshing preview data replaces the previous mount without stale panels or duplicate handlers',()=>{
 const b=fixture();try{
  b.root.innerHTML='<a data-wiki-id="kaf" href="/zh/kaf/">花譜</a>';
  const link=b.root.querySelector('a');const old=b.w.mountPreviews(b.root,{kaf:{title:'旧数据',url:'/zh/kaf/'}});
  const stop=b.w.mountPreviews(b.root,{kaf:{title:'花譜',url:'/zh/kaf/'}});old();
  assert.equal(b.w.document.querySelectorAll('.wiki-hover').length,1);
  link.dispatchEvent(new b.w.FocusEvent('focus'));assert.equal(b.w.document.querySelector('.wiki-hover strong').textContent,'花譜');
  stop();assert.equal(b.w.document.querySelectorAll('.wiki-hover').length,0);
 }finally{b.w.close();}
});
