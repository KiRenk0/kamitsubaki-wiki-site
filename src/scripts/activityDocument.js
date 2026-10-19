import {activityCopy} from '../lib/activityCopy.mjs';
import {activityBase,element,scheduleText,trackActivity} from '../lib/activityClient.js';
import '../styles/activityCenter.css';
import 'photoswipe/style.css';
export async function enhanceActivityDocument(root){
 if(!root||root.dataset.communityDocument!=='activity'||root.dataset.communityUnavailable==='true'||root.dataset.enhanced)return;root.dataset.enhanced='true';
 const id=root.dataset.communityId||new URLSearchParams(location.search).get('id');if(!id)return;
 const locale=root.dataset.locale,base=root.dataset.api,c=activityCopy(locale),entry=['home','center','floating'].includes(new URLSearchParams(location.search).get('entry'))?new URLSearchParams(location.search).get('entry'):'detail';
 try{
  const r=await fetch(activityBase(base)+'/api/activity-center/community/items/'+encodeURIComponent(id),{credentials:'omit',headers:{Accept:'application/json'},signal:AbortSignal.timeout(10000)});if(!r.ok)return;const {activity:item}=await r.json();item.source='community';
  const content=root.querySelector('[data-community-content]'),overview=root.querySelector('.community-detail-overview'),body=root.querySelector('.community-detail-body'),facts=root.querySelector('.community-facts'),actions=overview?.querySelector('.community-actions');if(!overview||!body||!actions)return;
  body.id='activity-introduction';facts.id='activity-schedule';actions.id='activity-participation';
  const when=element('p',scheduleText(item,locale,c),'activity-date');overview.prepend(when);
  const now=Date.now(),links=(item.links||[]).filter(l=>(!l.startsAt||Date.parse(l.startsAt)<=now)&&(!l.endsAt||Date.parse(l.endsAt)>now));
  const primary=!['cancelled','postponed'].includes(item.eventStatus)?links.find(l=>l.primary)||links.find(l=>['registration','submission','live','replay'].includes(l.role)):null;
  actions.replaceChildren();for(const link of [...links,...(item.sourceUrl?[{label:c.source,url:item.sourceUrl}]:[]),...(item.organizerUrl?[{label:c.organizerUrl,url:item.organizerUrl}]:[])]){
   const a=element('a',link.label||c[link.role+'Link']||c.primary);a.href=link.url;a.target='_blank';a.rel='noopener noreferrer';if(link===primary)a.className='activity-primary';a.onclick=()=>{if(links.includes(link))trackActivity(base,item,entry,'outbound');};actions.append(a);
  }
  const lead=element('div',null,'activity-detail-lead');const summary=overview.querySelector('p:not(.activity-date)');lead.append(when);if(summary)lead.append(summary);if(item.venue||item.city)lead.append(element('p',[item.city,item.venue].filter(Boolean).join(' · ')));lead.append(actions);overview.prepend(lead);
  const nav=element('nav',null,'activity-document-nav');nav.setAttribute('aria-label',c.title);for(const [key,label]of [['introduction',c.introduction],['participation',c.participate],['schedule',c.timeline],['notes',c.notes]]){const a=element('a',label);a.href='#activity-'+key;nav.append(a);}overview.append(nav);
  let notes=[...body.querySelectorAll('h2,h3')].find(n=>/注意|须知|須知|notes|notice|注意事項/i.test(n.textContent));if(notes)notes.id='activity-notes';else{notes=element('section');notes.id='activity-notes';notes.append(element('h2',c.notes),element('p',c.sectionMissing));body.append(notes);}
  const share=element('div',null,'community-actions activity-detail-share'),copy=element('button',c.share,'workspace-button dui-btn'),image=element('button',c.shareImage,'workspace-button dui-btn'),status=element('p',null,'activity-share-status');status.setAttribute('role','status');for(const n of [copy,image]){n.type='button';n.dataset.uiKit='';}
  copy.onclick=async()=>{const {copyActivity}=await import('../lib/activityShare.js');await copyActivity(item,{locale,copy:c,base,placement:entry},status);};image.onclick=async()=>{image.disabled=true;const {exportActivityImage}=await import('../lib/activityShare.js');await exportActivityImage(item,{locale,copy:c,base,placement:entry},status);image.disabled=false;};share.append(copy,image,status);overview.append(share);
  const poster=content.querySelector('.community-detail-poster');if(poster){const {default:PhotoSwipe}=await import('photoswipe');poster.tabIndex=0;poster.setAttribute('role','button');poster.setAttribute('aria-label',c.poster);const open=()=>{const viewer=new PhotoSwipe({dataSource:[{src:poster.src,width:poster.naturalWidth||1080,height:poster.naturalHeight||1440,alt:poster.alt}],bgOpacity:.9});viewer.init();};poster.onclick=open;poster.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}};}
  const exported=root.querySelector('[data-community-export]');if(exported)exported.addEventListener('click',()=>trackActivity(base,item,entry,'export'));trackActivity(base,item,entry,'detail');
 }catch{/* Existing server-rendered activity remains usable when enhancement is unavailable. */}
}
