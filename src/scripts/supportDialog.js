import {supportImageUrl,supportQrCropStyle} from '../lib/supportAssets.mjs';
import {withSupportQr,supportCatalog} from '../lib/supportCatalog.mjs';
import {claimFloatingPanel} from '../lib/floatingPanels.js';
import {lockModalScroll} from '../lib/modalScroll.mjs';
import {readBoundedJson} from '../lib/boundedJson.mjs';

// Support opens on explicit intent only. Reading time and scroll never interrupt a visit.
export function initializeSupportDialog(root=document){
 const dialog=root.querySelector('[data-support-dialog]');if(!dialog||dialog.dataset.ready)return;dialog.dataset.ready='true';
 const {copy,channels:initial}=JSON.parse(dialog.querySelector('[data-support-dialog-data]').textContent),locale=dialog.dataset.locale,$=s=>dialog.querySelector(s);
 let channels=initial.map(withSupportQr),selected='afdian',loaded=0,loading=false,trigger,releaseScroll;
 const text=value=>value?.[locale]||value?.zh||'',safe=value=>{try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null;}catch{return null;}};
 const render=()=>{
  const channel=channels.find(c=>c.id===selected),link=safe(channel?.url),qr=supportImageUrl(channel?.qrImageUrl);
  $('[data-support-channel-name]').textContent=text(channel?.name)||copy[selected];
  $('[data-support-channel-description]').textContent=text(channel?.description);
  const recipient=$('[data-support-recipient]');recipient.textContent=text(channel?.recipientLabel);recipient.hidden=!recipient.textContent;
  const original=$('[data-support-original]');original.hidden=!qr;if(qr)original.href=qr;else original.removeAttribute('href');
  const image=$('[data-support-qr]');image.hidden=!qr;if(qr){image.src=qr;image.alt=copy[selected]+' QR';}else image.removeAttribute('src');
  const viewport=$('[data-support-qr-window]'),cropStyle=supportQrCropStyle(channel);viewport.dataset.cropped=String(Boolean(cropStyle));viewport.setAttribute('style',cropStyle);
  const external=$('[data-support-external]');external.hidden=!link;if(link)external.href=selected==='afdian'&&link===supportCatalog.source?supportCatalog.planUrl:link;else external.removeAttribute('href');
  const save=$('[data-support-save]');save.hidden=!qr;if(qr)save.href=qr;else save.removeAttribute('href');
  const scan=$('[data-support-scan]');scan.hidden=!qr;scan.textContent=selected==='afdian'?copy.afdianScan:copy.paymentScan;
  $('[data-support-unavailable]').hidden=Boolean(link||qr);
  external.firstChild.textContent=selected==='afdian'?copy.go:copy[selected];
  for(const tab of dialog.querySelectorAll('[data-support-channel]')){const active=tab.dataset.supportChannel===selected;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;}
  $('#support-channel-panel').setAttribute('aria-labelledby','support-tab-'+selected);
 };
 const load=async(force=false)=>{
  if(loading||!force&&Date.now()-loaded<30000)return;
  loading=true;try{const response=await fetch(dialog.dataset.api.replace(/\/$/,'')+'/api/support',{credentials:'omit',signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error();const data=await readBoundedJson(response);if(!Array.isArray(data.data?.channels))throw Error();channels=data.data.channels.map(withSupportQr);loaded=Date.now();$('[data-support-refresh]').hidden=true;const status=$('[data-support-load-status]');if(status)status.textContent='';render();}catch{$('[data-support-refresh]').hidden=false;const status=$('[data-support-load-status]');if(status)status.textContent=copy.offline;}finally{loading=false;}
 };
 const open=source=>{
  if(dialog.open)return;
  trigger=source instanceof HTMLElement?source:document.activeElement;
  const preferred=source?.dataset?.supportPreferredChannel;if(['afdian','wechat','alipay'].includes(preferred))selected=preferred;
  claimFloatingPanel('support');render();dialog.showModal();releaseScroll=lockModalScroll();
  $('[data-support-dismiss]').focus({preventScroll:true});void load();
 };
 dialog.addEventListener('close',()=>{releaseScroll?.();releaseScroll=null;let target=trigger;if(!target?.isConnected||!target.getClientRects().length)target=[...document.querySelectorAll('[data-support-open],[data-reader-tools]>summary')].find(item=>item.getClientRects().length);target?.focus({preventScroll:true});});
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 dialog.querySelectorAll('[data-support-dismiss]').forEach(button=>button.onclick=()=>dialog.close());$('[data-support-refresh]').onclick=()=>load(true);
 for(const tab of dialog.querySelectorAll('[data-support-channel]')){tab.onclick=()=>{selected=tab.dataset.supportChannel;render();};tab.onkeydown=event=>{const tabs=[...dialog.querySelectorAll('[data-support-channel]')],index=tabs.indexOf(tab);let next;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;if(next!==undefined){event.preventDefault();tabs[next].click();tabs[next].focus();}};}
 document.addEventListener('click',event=>{const button=event.target.closest?.('[data-support-open]');if(button){event.preventDefault();open(button);}});
 window.addEventListener('pagehide',()=>releaseScroll?.(),{once:true});render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>initializeSupportDialog(),{once:true});else initializeSupportDialog();
