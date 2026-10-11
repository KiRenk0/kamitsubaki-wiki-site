import assert from 'node:assert/strict';
import test from 'node:test';
import {computeEditorPosition, mountEditorPopovers, confirmEditorPopover} from '../src/lib/editorPopover.mjs';

test('Floating UI flips edge bubbles and keeps them inside a 320px viewport',async()=>{
 const reference={x:290,y:420,width:20,height:20},floating={style:{}};
 const platform={getDocumentElement:()=>({}),isRTL:()=>false,getOffsetParent:()=>null,convertOffsetParentRelativeRectToViewportRelativeRect:({rect})=>rect,getElementRects:()=>({reference,floating:{x:0,y:0,width:304,height:180}}),getClippingRect:()=>({x:0,y:0,width:320,height:480}),getDimensions:()=>({width:304,height:180}),isElement:()=>false};
 const result=await computeEditorPosition({},floating,{platform});
 assert.equal(result.x,8);assert.equal(result.y,232);assert.match(result.placement,/^top-/);assert.equal(result.strategy,'fixed');
 reference.x=-20;reference.y=20;const top=await computeEditorPosition({},floating,{platform,placement:'top-start'});
 assert.equal(top.x,8);assert.equal(top.y,48);
});
class El extends EventTarget{
 constructor(){super();this.children=[];this.attributes=new Map();this.style={};this.isConnected=true;this.classList={add(){}};this.open=false;this.returnValue='';}
 append(...nodes){this.children.push(...nodes);for(const node of nodes)node.parent=this;}
 get firstElementChild(){return this.children[0];}
 setAttribute(k,v){this.attributes.set(k,String(v));}
 contains(target){return target===this||this.children.some(child=>child.contains(target));}
 closest(){return null;}
 focus(){document.activeElement=this;}
 getBoundingClientRect(){return {left:100,top:80,bottom:120,width:300,height:180};}
 show(){this.open=true;this.focus();}
 close(value=''){if(!this.open)return;this.returnValue=value;this.open=false;queueMicrotask(()=>this.dispatchEvent(new Event('close')));}
 remove(){this.isConnected=false;}
}
function environment(t){
 const document=new El(),window=new El(),root=new El(),toolbar={hidden:false},trigger=new El();
 document.activeElement=trigger;document.createElement=()=>new El();root.append(trigger);
 root.querySelector=selector=>selector==='[data-selection-toolbar]'?toolbar:root.children.find(child=>child.open)||null;
 for(const [key,value] of Object.entries({document,window,innerWidth:390,innerHeight:600,ResizeObserver:class {observe(){}disconnect(){}}})){
  const previous=globalThis[key];globalThis[key]=value;t.after(()=>{if(previous===undefined)delete globalThis[key];else globalThis[key]=previous;});
 }
 const pointer=target=>{const event=new Event('pointerdown');Object.defineProperty(event,'target',{value:target});document.dispatchEvent(event);};
 let watchers=0;
 mountEditorPopovers(root,{watch(_anchor,_dialog,update){watchers++;update();return ()=>watchers--;},place(anchor,dialog){const rect=anchor.getBoundingClientRect();dialog.style.left=rect.left+'px';dialog.style.top=(rect.bottom+8)+'px';}});
 return {root,toolbar,trigger,document,pointer,watchers:()=>watchers};
}
test('popover opens without a modal, dismisses outside, and Escape restores its trigger',async t=>{
 const {root,toolbar,trigger,document,pointer}=environment(t),dialog=new El();root.append(dialog);
 const controller=mountEditorPopovers(root);assert.equal(mountEditorPopovers(root),controller);
 controller.open(dialog);assert.equal(dialog.open,true);assert.equal(dialog.attributes.get('aria-modal'),'false');assert.equal(toolbar.hidden,true);
 pointer(dialog);assert.equal(dialog.open,true);pointer(new El());assert.equal(dialog.open,false);
 trigger.focus();controller.open(dialog);
 const event=new Event('keydown',{cancelable:true});Object.defineProperty(event,'key',{value:'Escape'});document.dispatchEvent(event);
 assert.equal(dialog.open,false);assert.equal(document.activeElement,trigger);assert.equal(event.defaultPrevented,true);
});
test('only one action bubble remains open when switching tools',t=>{
 const {root}=environment(t),a=new El(),b=new El();root.append(a,b);
 const controller=mountEditorPopovers(root);controller.open(a);controller.open(b);
 assert.equal(a.open,false);assert.equal(b.open,true);
});
test('replacement confirmation resolves only after an explicit choice; dismissal cancels',async t=>{
 const {root,pointer}=environment(t);
 let settled=false;const result=confirmEditorPopover(root,'Replace?',{accept:'Apply',cancel:'Cancel'}).then(value=>{settled=true;return value;});
 await Promise.resolve();assert.equal(settled,false);
 pointer(new El());assert.equal(await result,false);
 const accepted=confirmEditorPopover(root,'Replace?');
 const dialog=root.children.findLast(child=>child.open);dialog.children[1].children[1].dispatchEvent(new Event('click'));
 assert.equal(await accepted,true);
});

test('clicking the open bubble trigger closes it without immediately reopening it',t=>{
 const {root,trigger,document,pointer}=environment(t),dialog=new El();root.append(dialog);trigger.matches=selector=>selector==='button,summary';
 const controller=mountEditorPopovers(root);controller.open(dialog);pointer(trigger);
 const click=new Event('click',{cancelable:true});Object.defineProperty(click,'target',{value:trigger});document.dispatchEvent(click);
 assert.equal(dialog.open,false);assert.equal(click.defaultPrevented,true);
});
test('outside dismissal of a confirmation does not reopen the parent bubble',async t=>{
 const {root,pointer}=environment(t),parent=new El();root.append(parent);mountEditorPopovers(root).open(parent);
 const pending=confirmEditorPopover(root,'Replace?');pointer(new El());assert.equal(await pending,false);assert.equal(parent.open,false);
});

test('a menu action anchors to its visible summary after the menu closes',t=>{
 const {root,trigger}=environment(t),dialog=new El(),summary=new El();let expanded=true;
 const menu={querySelector:()=>summary,removeAttribute:()=>{expanded=false;}};
 trigger.closest=selector=>selector==='details'?menu:null;
 trigger.getBoundingClientRect=()=>expanded?{left:200,top:220,bottom:250,width:60,height:30}:{left:0,top:0,bottom:0,width:0,height:0};
 summary.getBoundingClientRect=()=>({left:80,top:20,bottom:50,width:50,height:30});root.append(dialog);
 mountEditorPopovers(root).open(dialog);assert.equal(expanded,false);assert.equal(dialog.style.left,'80px');assert.equal(dialog.style.top,'58px');
});

test('closing and switching bubbles dispose Floating UI observers',t=>{
 const {root,watchers}=environment(t),a=new El(),b=new El();root.append(a,b);const controller=mountEditorPopovers(root);
 controller.open(a);assert.equal(watchers(),1);controller.open(b);assert.equal(watchers(),1);controller.close();assert.equal(watchers(),0);
});

test('keyboard toggling closes the same bubble and restores its explicit trigger',t=>{
 const {root,trigger,document,watchers}=environment(t),dialog=new El(),origin=new El();root.append(dialog,origin);
 const controller=mountEditorPopovers(root);trigger.focus();
 assert.equal(controller.toggle(dialog,origin,{trigger:origin}),true);assert.equal(origin.attributes.get('aria-expanded'),'true');
 assert.equal(controller.toggle(dialog,origin,{trigger:origin}),false);assert.equal(dialog.open,false);assert.equal(document.activeElement,origin);assert.equal(watchers(),0);
});

test('Escape from an option closes its bubble, but composition Escape stays with the IME',t=>{
 const {root,trigger,document}=environment(t),dialog=new El(),option=new El();dialog.append(option);root.append(dialog);
 const controller=mountEditorPopovers(root);controller.open(dialog);option.focus();
 const key=composing=>{const event=new Event('keydown',{cancelable:true});Object.defineProperties(event,{key:{value:'Escape'},target:{value:option},isComposing:{value:composing}});document.dispatchEvent(event);return event;};
 assert.equal(key(true).defaultPrevented,false);assert.equal(dialog.open,true);
 assert.equal(key(false).defaultPrevented,true);assert.equal(dialog.open,false);assert.equal(document.activeElement,trigger);
});

test('a queued close event from a previous opening cannot detach a reopened bubble',async t=>{
 const {root,watchers}=environment(t),dialog=new El();root.append(dialog);const controller=mountEditorPopovers(root);
 controller.open(dialog);controller.close();controller.open(dialog);
 const stale=new Event('close');Object.defineProperty(stale,'target',{value:dialog});root.dispatchEvent(stale);
 assert.equal(dialog.open,true);assert.equal(watchers(),1);controller.close();assert.equal(dialog.open,false);assert.equal(watchers(),0);
});
