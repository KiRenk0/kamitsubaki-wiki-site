import test from 'node:test';
import assert from 'node:assert/strict';
import {confirmDialog} from '../src/lib/confirmDialog.mjs';

function environment(t,{failOpen=false}={}){
 const previous=Object.fromEntries(['document','window','getComputedStyle'].map(key=>[key,globalThis[key]]));
 t.after(()=>{for(const [key,value]of Object.entries(previous))value===undefined?delete globalThis[key]:globalThis[key]=value;});
 class El extends EventTarget{
  constructor(){super();this.children=[];this.dataset={};this.attributes={};this.isConnected=true;this.returnValue='';this.open=false;}
  append(...children){this.children.push(...children);}
  setAttribute(k,v){this.attributes[k]=v;}
  focus(){document.activeElement=this;}
  showModal(){if(failOpen)throw Error('unavailable');this.open=true;}
  close(value=''){this.returnValue=value;this.open=false;this.dispatchEvent(new Event('close'));}
  remove(){this.isConnected=false;}
  getBoundingClientRect(){return {left:200,right:600,top:200,bottom:400};}
 }
 const body=new El(),trigger=new El(),values=new Map(),scrolls=[];
 body.style={getPropertyValue:k=>values.get(k)||'',getPropertyPriority:()=>'',setProperty:(k,v)=>values.set(k,v),removeProperty:k=>values.delete(k)};
 globalThis.document={body,activeElement:trigger,createElement:()=>new El(),querySelector:()=>body.children.find(x=>x.open)||null,documentElement:{clientWidth:1000,classList:{add(){},remove(){}}}};
 globalThis.window={innerWidth:1000,scrollX:0,scrollY:820,scrollTo:p=>scrolls.push(p)};
 globalThis.getComputedStyle=()=>({paddingRight:'0',scrollbarGutter:'stable'});
 return {body,trigger,values,scrolls};
}
const copy={title:'删除草稿',accept:'删除',cancel:'取消'};
for(const way of ['cancel','escape','backdrop','accept'])test(`confirmation ${way} resolves safely and restores scroll/focus`,async t=>{
 const {body,trigger,values,scrolls}=environment(t),pending=confirmDialog('<draft>',copy),dialog=body.children[0],buttons=dialog.children[2].children;
 assert.equal(document.activeElement,buttons[0]);assert.equal(values.get('top'),'-820px');
 assert.equal(dialog.children[1].textContent,'<draft>');assert.ok(dialog.attributes['aria-describedby']);
 if(way==='accept')buttons[1].onclick();
 else if(way==='cancel')buttons[0].onclick();
 else if(way==='escape')dialog.close();
 else {const event=new Event('click');Object.defineProperties(event,{clientX:{value:20},clientY:{value:20}});dialog.dispatchEvent(event);}
 assert.equal(await pending,way==='accept');assert.equal(dialog.isConnected,false);assert.equal(document.activeElement,trigger);assert.equal(values.size,0);assert.equal(scrolls[0].top,820);
});
test('opening failure releases the scroll lock and removes the dialog',async t=>{
 const {body,values,trigger}=environment(t,{failOpen:true});await assert.rejects(confirmDialog('Remove?',copy),/unavailable/);assert.equal(values.size,0);assert.equal(body.children[0].isConnected,false);assert.equal(document.activeElement,trigger);
});
test('a second confirmation cannot replace the pending choice; padding clicks stay open',async t=>{
 const {body}=environment(t),pending=confirmDialog('First',copy),dialog=body.children[0];assert.equal(await confirmDialog('Second',copy),false);assert.equal(body.children.length,1);
 const event=new Event('click');Object.defineProperties(event,{clientX:{value:220},clientY:{value:220}});dialog.dispatchEvent(event);assert.equal(dialog.open,true);dialog.close();assert.equal(await pending,false);
});
