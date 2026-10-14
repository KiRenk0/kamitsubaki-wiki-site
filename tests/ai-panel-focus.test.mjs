import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const source=readFileSync(new URL('../src/scripts/aiChatWidget.js',import.meta.url),'utf8');
const setExpanded=source.slice(source.indexOf('function setExpanded('),source.indexOf('\nfunction setThinking('));
function setup(){const dom=new JSDOM('<div data-ai-launcher class="is-hidden"><button data-ai-toggle>AI</button></div><aside data-ai-chat class="is-open"><div data-ai-panel><textarea>Retained input</textarea></div></aside>',{runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,frames=[];w.claimFloatingPanel=()=>{};w.toggleSettings=()=>{};w.requestAnimationFrame=cb=>frames.push(cb);w.eval(setExpanded+';window.setExpanded=setExpanded');return {dom,w,frames,root:w.document.querySelector('aside'),button:w.document.querySelector('button'),input:w.document.querySelector('textarea')};}
test('closing AI returns focus to its launcher and retains the input',()=>{const f=setup();try{f.input.focus();f.w.setExpanded(f.root,false);assert.equal(f.root.inert,true);assert.equal(f.root.querySelector('[data-ai-panel]').getAttribute('aria-hidden'),'true');assert.equal(f.w.document.activeElement,f.button);assert.equal(f.input.value,'Retained input');}finally{f.w.close();}});
test('switching floating panels does not steal the new panel focus or clear AI input',()=>{const f=setup();try{f.w.setExpanded(f.root,false,false);assert.equal(f.frames.length,0);assert.equal(f.input.value,'Retained input');}finally{f.w.close();}});
