import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {createRequire} from 'node:module';
import {dashboardDay,dashboardShouldOpen,dashboardPreferences,reminderKey} from '../src/lib/dashboardPolicy.mjs';
import {dashboardAnnouncementIndex} from '../src/lib/dashboardAnnouncements.mjs';
import {dashboardCopy} from '../src/lib/dashboardCopy.mjs';
const require=createRequire(import.meta.url),{build}=createRequire(require.resolve('vite'))('esbuild');
const bundle=(await build({entryPoints:['src/scripts/observerDashboard.js'],bundle:true,write:false,format:'iife',globalName:'Dashboard',define:{'import.meta.env':'{}'}})).outputFiles[0].text;
const notice=(id,extra={})=>({id,data:{translationKey:id,date:'2026.10.19',title:id,summary:'Summary',pinned:true,autoOpen:true,...extra}});

test('daily and important reminders share a stable locale-independent identity, and explicit intent wins',()=>{
 const today=dashboardDay(new Date(2026,9,19,23,59)),key=reminderKey({id:'notice',important:true,reminderVersion:2});assert.equal(today,'2026-10-19');assert.equal(key,'notice:2');
 const base={home:true,visible:true,stored:{day:today,reminder:key},day:today,important:key};
 assert.equal(dashboardShouldOpen(base),false);assert.equal(dashboardShouldOpen({...base,day:'2026-10-20'}),true);assert.equal(dashboardShouldOpen({...base,important:'notice:3'}),true);
 for(const override of [{home:false},{visible:false},{intro:true},{interacted:true},{hash:'#social-contact'},{stored:null}])assert.equal(dashboardShouldOpen({...base,day:'2026-10-20',...override}),false);
 assert.equal(reminderKey({id:'notice',important:false,reminderVersion:50}),'');
});
test('storage falls back to a session, isolates previews, and never schedules without writable persistence',()=>{
 const data=new Map(),storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)},w={get localStorage(){throw Error('blocked');},sessionStorage:storage};
 const p=dashboardPreferences(w);p.write({day:'2026-10-19',reminder:'id:1'});assert.equal(p.read().day,'2026-10-19');assert.deepEqual(dashboardPreferences(w,true).read(),{});assert.equal(dashboardPreferences({}).read(),null);
});
test('announcement summaries omit drafts and full bodies while retaining pinned and reminder version semantics',()=>{
 const entries=[notice('old',{date:'2026.01.01',order:5}),notice('draft',{draft:true,order:-10}),notice('featured',{order:-2,reminderVersion:3}),notice('normal',{pinned:false,date:'2026.10.20',autoOpen:false})];
 const publicIndex=dashboardAnnouncementIndex(entries);assert.equal(publicIndex.featuredId,'featured');assert.equal(publicIndex.preview,false);assert.equal(publicIndex.items.length,3);assert.equal(publicIndex.items[0].reminderVersion,3);assert.ok(publicIndex.items.every(n=>n.id!=='draft'));assert.ok(publicIndex.items.every(n=>!('html'in n)));assert.equal(dashboardAnnouncementIndex(entries,{includeDrafts:true}).preview,true);
 for(const locale of ['zh','zh-tw','zh-hk','ja','en'])assert.ok(dashboardCopy(locale).backOverview);
});
function fixture({home=false,intro=false,stored,visible=true,preview=false,motion=false}={}){
 const dom=new JSDOM(`<button id="outside">Outside</button><div data-observer-dashboard><button data-dashboard-open hidden><span class="dashboard-launcher__cards"></span></button><i data-dashboard-dot hidden></i><dialog data-dashboard-dialog><h2 id="observer-dashboard-title" tabindex="-1">Dashboard</h2><button data-dashboard-close>Close</button><div role="tablist">${['overview','announcements','tools'].map(n=>`<button data-dashboard-tab="${n}">${n}</button>`).join('')}</div><div data-dashboard-scroll><nav>${['community','official'].map(n=>`<button data-dashboard-source="${n}">${n}</button>`).join('')}</nav><a data-dashboard-view-all></a>${['overview','announcements','tools'].map(n=>`<section data-dashboard-panel="${n}"></section>`).join('')}${['community','official'].map(n=>`<section data-dashboard-source-panel="${n}" ${n==='official'?'hidden':''}><p data-dashboard-activity-status="${n}"></p><button data-dashboard-activity-retry="${n}"></button><div data-dashboard-activity-skeleton="${n}" class="content-skeleton"><div class="dui-skeleton"></div></div><div data-dashboard-activities="${n}"></div></section>`).join('')}<div data-dashboard-notice-summary></div><nav data-dashboard-notice-list></nav><p data-dashboard-notice-status></p><button data-dashboard-notice-retry></button><div data-dashboard-notice-skeleton hidden></div><article data-dashboard-notice-body></article><button data-dashboard-search></button></div></dialog></div>`,{url:'https://wiki.example/zh/',runScripts:'outside-only'});
 const w=dom.window,d=w.document,root=d.querySelector('[data-observer-dashboard]'),calls=[];Object.assign(root.dataset,{locale:'zh',api:'https://api.example',home:String(home),preview:String(preview),copy:JSON.stringify(dashboardCopy('zh'))});
 if(intro)d.documentElement.classList.add('site-intro-enabled');if(stored)w.localStorage.setItem('kamitsubaki-dashboard:v1',JSON.stringify(stored));Object.defineProperty(d,'visibilityState',{value:visible?'visible':'hidden',configurable:true});
 const animations=[];w.matchMedia=()=>({matches:!motion});if(motion)w.HTMLElement.prototype.animate=function(){let resolve,reject;const a={finished:new Promise((ok,no)=>{resolve=ok;reject=no;}),cancel(){reject(Error('cancelled'));},finish(){resolve();}};animations.push(a);return a;};w.scrollTo=()=>{};w.AbortSignal=AbortSignal;w.Response=Response;w.HTMLElement.prototype.scrollIntoView=()=>{};w.HTMLElement.prototype.getClientRects=function(){return this.hidden?[]:[{}];};
 const dialog=root.querySelector('dialog');dialog.showModal=()=>{dialog.open=true;};dialog.close=()=>{dialog.open=false;dialog.dispatchEvent(new w.Event('close'));};
 w.fetch=async url=>{calls.push(String(url));return Response.json(String(url).includes('announcements.json')?{items:[{id:'notice',title:'Notice',summary:'Summary',date:'2026.10.19',important:true,reminderVersion:1}],featuredId:'notice',preview:false}:String(url).includes('/announcements/')?{id:'notice',title:'Notice',summary:'Summary',html:'<h2 id="original">Original body</h2>'}:{items:[],cache:{available:true,stale:false}});};
 w.eval(bundle+'; window.Dashboard=Dashboard;');const controller=w.Dashboard.initObserverDashboard(root),settle=()=>new Promise(r=>setTimeout(r,25));return{w,d,root,dialog,controller,calls,animations,settle,close(){dom.window.close();}};
}
test('closed dashboard only loads metadata; manual tabs share one shell and restore the invoking focus',async()=>{
 const p=fixture();try{await p.settle();assert.equal(p.dialog.open,false);assert.equal(p.calls.length,1);assert.ok(p.calls[0].endsWith('announcements.json'));const launcher=p.root.querySelector('[data-dashboard-open]');launcher.focus();launcher.click();await p.settle();assert.equal(p.dialog.open,true);assert.equal(p.calls.filter(u=>u.includes('placement=dashboard')).length,2);assert.equal(p.calls.filter(u=>u.includes('/announcements/')).length,0);
 p.root.querySelector('[data-dashboard-tab=announcements]').click();await p.settle();assert.match(p.root.querySelector('[data-dashboard-notice-body]').textContent,/Original body/);assert.ok(p.root.querySelector('#dashboard-notice-notice--original'));p.root.querySelector('[data-dashboard-close]').click();assert.equal(p.dialog.open,false);assert.equal(p.d.activeElement,launcher);
 }finally{p.close();}
});
test('intro completion gates auto opening, a manual tool intent cancels the pending daily prompt',async()=>{
 for(const intent of [false,true]){const p=fixture({home:true,intro:true});try{await p.settle();assert.equal(p.dialog.open,false);if(intent)p.d.querySelector('#outside').dispatchEvent(new p.w.Event('pointerdown',{bubbles:true}));p.d.documentElement.classList.remove('site-intro-enabled');p.w.dispatchEvent(new p.w.CustomEvent('wiki-site-intro-complete'));await p.settle();assert.equal(p.dialog.open,!intent);if(!intent){p.controller.close({instant:true});p.w.dispatchEvent(new p.w.CustomEvent('wiki-site-intro-complete'));assert.equal(p.dialog.open,false);}
 }finally{p.close();}}
});

test('same-day metadata suppresses repeat visits while a new important version opens once',async()=>{
 for(const reminder of ['notice:1','notice:0']){const p=fixture({home:true,stored:{day:dashboardDay(),reminder}});try{await p.settle();assert.equal(p.dialog.open,reminder==='notice:0');if(p.dialog.open){p.controller.close({instant:true});p.w.dispatchEvent(new p.w.Event('visibilitychange'));assert.equal(p.dialog.open,false);}}finally{p.close();}}
});
test('a background homepage waits until visible, and developer preview records stay isolated',async()=>{
 const p=fixture({home:true,visible:false,preview:true,stored:{day:'2000-01-01',reminder:'public:1'}});try{await p.settle();assert.equal(p.dialog.open,false);Object.defineProperty(p.d,'visibilityState',{value:'visible',configurable:true});p.d.dispatchEvent(new p.w.Event('visibilitychange'));await p.settle();assert.equal(p.dialog.open,true);assert.equal(JSON.parse(p.w.localStorage.getItem('kamitsubaki-dashboard:v1')).reminder,'public:1');assert.equal(JSON.parse(p.w.localStorage.getItem('kamitsubaki-dashboard:v1:preview')).reminder,'notice:1');}finally{p.close();}
});

test('reopening interrupts even a resolved closing animation before its completion callback can hide the panel',async()=>{
 const p=fixture({motion:true});try{await p.controller.open();await p.settle();p.controller.close();p.animations.at(-1).finish();await p.controller.open('tools');await p.settle();assert.equal(p.dialog.open,true);assert.equal(p.root.dataset.section,'tools');p.controller.close({instant:true});assert.equal(p.dialog.open,false);}finally{p.close();}
});

test('community and official share one source switch, keep card actions out, and support arrow keys',async()=>{
 const p=fixture();try{await p.controller.open();await p.settle();p.root.querySelector('[data-dashboard-source=official]').click();assert.equal(p.root.querySelector('[data-dashboard-source-panel=community]').hidden,true);assert.equal(p.root.querySelector('[data-dashboard-source-panel=official]').hidden,false);assert.match(p.root.querySelector('[data-dashboard-view-all]').href,/source=official/);p.root.querySelector('[data-dashboard-source=official]').dispatchEvent(new p.w.KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}));assert.equal(p.root.querySelector('[data-dashboard-source=community]').getAttribute('aria-selected'),'true');assert.equal(p.d.activeElement,p.root.querySelector('[data-dashboard-source=community]'));assert.equal(p.dialog.open,true);}finally{p.close();}
});
test('cold reads use skeletons without loading text; a cached refresh keeps cards visible while revalidating',async()=>{
 for(const cached of [false,true]){const p=fixture();try{await p.settle();let resolve;const pending=new Promise(r=>{resolve=r;});p.w.fetch=url=>String(url).includes('/api/activity-center')?pending.then(()=>Response.json(data)):Promise.reject(Error('unexpected'));const data={items:[{id:'project',source:'community',title:'Cached project',poster:'https://images.example/p.jpg',schedule:{kind:'undated'}}],cache:{available:true,stale:false}};
 if(cached)p.w.localStorage.setItem('activity-center:v1:https://api.example/api/activity-center?source=community&recommend=1&placement=dashboard&locale=zh',JSON.stringify({data,at:new Date().toISOString()}));
 await p.controller.open();await p.settle();assert.equal(p.root.querySelector('[data-dashboard-activity-skeleton=community]').hidden,cached);assert.equal(p.root.querySelector('[data-dashboard-activity-status=community]').textContent,'');assert.equal(p.root.querySelector('[data-dashboard-activity-status=community]').hidden,true);assert.equal(p.root.querySelectorAll('[data-dashboard-activities=community] article').length,cached?1:0);assert.equal(p.root.querySelectorAll('[data-dashboard-activities=community] button').length,0);
 const cachedCard=p.root.querySelector('[data-dashboard-activities=community] article'),cachedImage=cachedCard?.querySelector('img'),cachedLink=cachedCard?.querySelector('a');
 if(cached){cachedImage.dispatchEvent(new p.w.Event('load'));cachedLink.focus();}
 resolve(Response.json(data));await p.settle();
 if(cached){assert.equal(p.root.querySelector('[data-dashboard-activities=community] article'),cachedCard,'unchanged cache revalidation preserves the card');assert.equal(cachedImage.classList.contains('is-loaded'),true,'loaded artwork does not restart its skeleton');assert.equal(p.d.activeElement,cachedLink,'background refresh keeps keyboard focus');}
 assert.equal(p.root.querySelector('[data-dashboard-activity-skeleton=community]').hidden,true);assert.equal(p.root.querySelectorAll('[data-dashboard-activities=community] article').length,1);assert.equal(p.root.querySelector('[data-dashboard-source-panel=community]').getAttribute('aria-busy'),'false');
 }finally{p.close();}}
});
test('failed activity reads end the skeleton and offer retry without taking over the source switch',async()=>{
 const p=fixture();try{await p.settle();p.w.fetch=async()=>{throw Error('offline');};await p.controller.open();await p.settle();assert.equal(p.root.querySelector('[data-dashboard-activity-skeleton=community]').hidden,true);assert.equal(p.root.querySelector('[data-dashboard-source-panel=community]').getAttribute('aria-busy'),'false');assert.equal(p.root.querySelector('[data-dashboard-activity-retry=community]').hidden,false);assert.equal(p.root.querySelector('[data-dashboard-activity-status=community]').hidden,false);p.root.querySelector('[data-dashboard-source=official]').click();assert.equal(p.root.querySelector('[data-dashboard-source-panel=official]').hidden,false);assert.equal(p.dialog.open,true);}finally{p.close();}
});
