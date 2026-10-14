import {supportImageUrl,supportQrCropStyle} from '../lib/supportAssets.mjs';
import {claimFloatingPanel} from '../lib/floatingPanels.js';
import {lockModalScroll} from '../lib/modalScroll.mjs';
import {shouldPromptSupport,supportPromptRecord,supportPromptEligible} from '../lib/supportPrompt.mjs';
const preferenceKey='kamitsubaki-wiki:support-prompt:v1',visitKey='kamitsubaki-wiki:support-visit:v1',announcementKey='kamitsubaki-wiki:auto-announcement:v1';
export function initializeSupportDialog(root=document){
 const dialog=root.querySelector('[data-support-dialog]');if(!dialog||dialog.dataset.ready)return;dialog.dataset.ready='true';
 const {copy,channels:initial}=JSON.parse(dialog.querySelector('[data-support-dialog-data]').textContent),locale=dialog.dataset.locale,$=s=>dialog.querySelector(s);
 let channels=initial,selected='afdian',loaded=0,loading,trigger,releaseScroll,stored=supportPromptRecord(null),available=true,visit={activeMs:0,shown:false},last=performance.now(),timer,maxProgress=0;
 const text=value=>value?.[locale]||value?.zh||'',safe=value=>{try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null;}catch{return null;}};
 const write=()=>{try{localStorage.setItem(preferenceKey,JSON.stringify(stored));sessionStorage.setItem(visitKey,JSON.stringify(visit));}catch{available=false;}};
 try{stored=supportPromptRecord(localStorage.getItem(preferenceKey));const prior=JSON.parse(sessionStorage.getItem(visitKey)||'{}');visit={activeMs:Number.isFinite(prior.activeMs)?Math.max(0,prior.activeMs):0,shown:prior.shown===true};localStorage.setItem(preferenceKey,JSON.stringify(stored));}catch{available=false;}
 const render=()=>{
  const channel=channels.find(c=>c.id===selected),link=safe(channel?.url),qr=supportImageUrl(channel?.qrImageUrl);
  $('[data-support-channel-name]').textContent=text(channel?.name)||copy[selected];
  $('#support-channel-panel').dataset.hasQr=String(Boolean(qr));
  $('[data-support-channel-description]').textContent=text(channel?.description);
  const recipient=$('[data-support-recipient]');recipient.textContent=text(channel?.recipientLabel);recipient.hidden=!recipient.textContent;
  const original=$('[data-support-original]');original.hidden=!qr;if(qr)original.href=qr;else original.removeAttribute('href');
  const image=$('[data-support-qr]');image.hidden=!qr;if(qr){image.src=qr;image.alt=copy[selected]+' · '+copy.scan;}else image.removeAttribute('src');
  const viewport=$('[data-support-qr-window]'),cropStyle=supportQrCropStyle(channel);viewport.dataset.cropped=String(Boolean(cropStyle));viewport.setAttribute('style',cropStyle);
  const external=$('[data-support-external]');external.hidden=!link;if(link)external.href=link;else external.removeAttribute('href');
  const save=$('[data-support-save]');save.hidden=!qr;if(qr)save.href=qr;else save.removeAttribute('href');
  $('[data-support-scan]').hidden=!qr;$('[data-support-unavailable]').hidden=Boolean(link||qr);
  $('[data-support-external]').firstChild.textContent=selected==='afdian'?copy.go:copy[selected];
  for(const tab of dialog.querySelectorAll('[data-support-channel]')){const active=tab.dataset.supportChannel===selected;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;}
  $('#support-channel-panel').setAttribute('aria-labelledby','support-tab-'+selected);
 };
 const load=async(force=false)=>{
  if(loading||!force&&Date.now()-loaded<30000)return;
  loading=true;try{const response=await fetch(dialog.dataset.api.replace(/\/$/,'')+'/api/support',{credentials:'omit',signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error();const data=await response.json();if(!Array.isArray(data.data?.channels))throw Error();channels=data.data.channels;loaded=Date.now();$('[data-support-refresh]').hidden=true;render();}catch{$('[data-support-refresh]').hidden=false;}finally{loading=false;}
 };
 const close=never=>{try{stored=supportPromptRecord(localStorage.getItem(preferenceKey));}catch{available=false;}if(never)stored.never=true;if(dialog.open)dialog.close();else write();};
 const open=(source,automatic=false)=>{
  if(dialog.open)return;
  trigger=source instanceof HTMLElement?source:document.activeElement;
  if(automatic){stored.shownAt=Date.now();visit.shown=true;try{localStorage.setItem(preferenceKey,JSON.stringify(stored));sessionStorage.setItem(visitKey,JSON.stringify(visit));}catch{available=false;return;}}
  claimFloatingPanel('support');selected='afdian';render();dialog.showModal();releaseScroll=lockModalScroll();
  $('[data-support-dismiss]').focus({preventScroll:true});void load();
 };
 dialog.addEventListener('close',()=>{releaseScroll?.();releaseScroll=null;try{const newest=supportPromptRecord(localStorage.getItem(preferenceKey));stored.never ||=newest.never;stored.shownAt=Math.max(stored.shownAt,newest.shownAt);}catch{available=false;}stored.dismissedAt=Date.now();write();let target=trigger;if(!target?.isConnected||!target.getClientRects().length)target=[...document.querySelectorAll('[data-support-open],[data-reader-tools]>summary')].find(item=>item.getClientRects().length);target?.focus({preventScroll:true});});
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close(false);}});
 dialog.querySelectorAll('[data-support-dismiss]').forEach(button=>button.onclick=()=>close(false));$('[data-support-never]').onclick=()=>close(true);$('[data-support-refresh]').onclick=()=>load(true);
 for(const tab of dialog.querySelectorAll('[data-support-channel]')){tab.onclick=()=>{selected=tab.dataset.supportChannel;render();};tab.onkeydown=event=>{const tabs=[...dialog.querySelectorAll('[data-support-channel]')],index=tabs.indexOf(tab);let next;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;if(next!==undefined){event.preventDefault();tabs[next].click();tabs[next].focus();}};}
 document.addEventListener('click',event=>{const button=event.target.closest?.('[data-support-open]');if(button){event.preventDefault();open(button);}});
 window.addEventListener('wiki-announcement-displayed',event=>{if(event.detail?.automatic){try{sessionStorage.setItem(announcementKey,'true');}catch{available=false;}}});
 window.addEventListener('storage',event=>{if(event.key===preferenceKey)stored=supportPromptRecord(event.newValue);});
 const busy=()=>document.documentElement.classList.contains('site-intro-enabled')||Boolean(document.querySelector('dialog[open],[data-announcement-modal]:not([hidden]),.pswp--open,.ai-chat.is-open,[data-community-panel]:not([hidden]),[data-tools-dock][open]'))||[...document.querySelectorAll('audio,video')].some(media=>!media.paused&&!media.ended)||Boolean(document.activeElement?.matches('input,textarea,[contenteditable=true],iframe'));
 timer=setInterval(()=>{
  const now=performance.now(),delta=Math.max(0,Math.min(2000,now-last));last=now;
  if(document.visibilityState!=='visible'||!document.hasFocus())return;
  if(!available||!supportPromptEligible(location.pathname))return;
  if(!busy())visit.activeMs+=delta;
  const extent=document.documentElement.scrollHeight-innerHeight,progress=maxProgress=Math.max(maxProgress,extent>0?scrollY/extent:0);
  let announcement=true;try{announcement=sessionStorage.getItem(announcementKey)==='true';}catch{available=false;return;}
  if(shouldPromptSupport({now:Date.now(),activeMs:visit.activeMs,progress,stored,shown:visit.shown,announcement,busy:busy(),eligible:true})){
   const attempt=()=>{try{stored=supportPromptRecord(localStorage.getItem(preferenceKey));if(shouldPromptSupport({now:Date.now(),activeMs:visit.activeMs,progress,stored,shown:visit.shown,announcement,busy:busy(),eligible:true}))open(null,true);}catch{available=false;}};
   if(navigator.locks)void navigator.locks.request('wiki-support-auto-prompt',{ifAvailable:true},lock=>{if(lock)attempt();}).catch(()=>{available=false;});else attempt();
  }
 },1000);
 window.addEventListener('pagehide',()=>{clearInterval(timer);try{sessionStorage.setItem(visitKey,JSON.stringify(visit));}catch{}releaseScroll?.();},{once:true});
 render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>initializeSupportDialog(),{once:true});else initializeSupportDialog();
