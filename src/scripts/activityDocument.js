import {activityCopy} from '../lib/activityCopy.mjs';
import {activityDetailMarkup} from '../lib/activityPresentation.mjs';
import {contentText} from '../lib/communityClient.js';
import {activityBase,element,trackActivity} from '../lib/activityClient.js';
import {adaptActivityPoster,openActivityPoster} from '../lib/activityPoster.mjs';
import '../styles/activityCenter.css';
export async function enhanceActivityDocument(root){
 if(!root||root.dataset.communityDocument!=='activity'||root.dataset.communityUnavailable==='true'||root.dataset.enhanced)return;
 const id=root.dataset.communityId||new URLSearchParams(location.search).get('id');if(!id)return;
 const locale=root.dataset.locale,base=root.dataset.api,c=activityCopy(locale),entry=['home','center','floating','dashboard'].includes(new URLSearchParams(location.search).get('entry'))?new URLSearchParams(location.search).get('entry'):'detail';
 try{
  const r=await fetch(activityBase(base)+'/api/activity-center/community/items/'+encodeURIComponent(id),{credentials:'omit',headers:{Accept:'application/json'},signal:AbortSignal.timeout(10000)});if(!r.ok)return;const {activity:item}=await r.json();item.source='community';
  const content=root.querySelector('[data-community-content]'),body=content?.querySelector('.community-detail-body'),facts=content?.querySelector('.community-facts');if(!body||!facts)return;
  const creditHtml=[...content.querySelectorAll('.community-image-credit')].map(n=>n.outerHTML).join('');
  // Reuse the server presentation while preserving the original rendered body.
  content.innerHTML=activityDetailMarkup(item,{locale,copy:c,bodyHtml:body.innerHTML,factsHtml:facts.outerHTML,creditHtml,text:value=>contentText(value,item,locale),originalHtml:item.sourceLocale!==locale&&!(item.sourceLocale==='zh'&&locale.startsWith('zh'))?`<p>${c.originalLanguage}</p>`:''});
  for(const n of content.querySelectorAll('[data-community-local-time]'))try{n.textContent=(n.matches('small')?c.localTime+' · ':'')+new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeStyle:'short'}).format(new Date(n.dataset.communityLocalTime));}catch{}
  for(const a of content.querySelectorAll('[data-activity-outbound]'))a.onclick=()=>trackActivity(base,item,entry,'outbound');
  const tools=content.querySelector('[data-activity-detail-tools]'),copy=element('button',c.shareShort,'activity-text-action'),image=element('button',c.shareImage,'activity-text-action'),status=element('p',null,'activity-share-status');status.setAttribute('role','status');for(const n of [copy,image]){n.type='button';n.dataset.uiKit='';}
  copy.onclick=async()=>{const {copyActivity}=await import('../lib/activityShare.js');await copyActivity(item,{locale,copy:c,base,placement:entry},status);};image.onclick=async()=>{image.disabled=true;try{const {exportActivityImage}=await import('../lib/activityShare.js');await exportActivityImage(item,{locale,copy:c,base,placement:entry},status);}finally{image.disabled=false;}};tools.append(copy,image);
  const exported=root.querySelector('[data-community-export]');if(exported){exported.addEventListener('click',()=>trackActivity(base,item,entry,'export'));if(!exported.hidden){exported.className='activity-text-action';tools.append(exported);}}tools.append(status);
  const poster=content.querySelector('.community-detail-poster'),opener=content.querySelector('.activity-poster-open');if(poster&&opener){adaptActivityPoster(poster,{onError:()=>poster.closest('figure')?.remove()});opener.onclick=async e=>{if(!poster.complete||!poster.naturalWidth)return;e.preventDefault();try{await openActivityPoster(poster,opener,{closeLabel:c.closePoster,zoomLabel:c.viewPoster,keyboard:e.detail===0});}catch{location.assign(opener.href);}};}
  root.dataset.enhanced='true';trackActivity(base,item,entry,'detail');
 }catch{/* The server-rendered activity remains usable when enhancement is unavailable. */}
}
