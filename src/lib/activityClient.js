import {formatCommunityLocation} from './communityLocationFormat.mjs';
import {contentText} from './communityClient.js';

export const activityBase=value=>String(value||'https://api.kamitsubaki.wiki').replace(/\/$/,'');
export const activityHref=(item,locale,entry='')=>item.source==='official'?item.sourceUrl:`/${locale}/community/activities/${encodeURIComponent(item.id)}/`+(entry?'?entry='+encodeURIComponent(entry):'');
export const element=(tag,text,className)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(className)n.className=className;return n;};
export function scheduleText(item,locale,copy,{local=false}={}){
 const s=item.schedule;if(!s||s.kind==='undated')return copy.undated;
 if(s.kind==='allDay')return s.startDate+(s.endDate&&s.endDate!==s.startDate?' – '+s.endDate:'')+' · '+copy.allDay;
 try{const format=value=>new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeStyle:'short',...(local?{}:{timeZone:s.timeZone})}).format(new Date(value));return format(s.startAt)+(s.endAt?' – '+format(s.endAt):' · '+copy.endUnknown)+' · '+(local?copy.localTime:s.timeZone);}catch{return copy.undated;}
}
export function nextDeadline(item,locale,copy,now=Date.now()){
 const dayInZone=zone=>new Intl.DateTimeFormat('en-CA',{timeZone:zone||'UTC',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));
 const list=(item.deadlines||[]).filter(d=>d.schedule?.kind==='timed'?Date.parse(d.schedule.startAt)>now:d.schedule?.startDate>=dayInZone(d.schedule?.timeZone)).sort((a,b)=>(a.schedule.startAt||a.schedule.startDate).localeCompare(b.schedule.startAt||b.schedule.startDate));
 const d=list[0];return d?(d.label||copy[d.type]||copy.supportDeadline)+' · '+scheduleText({schedule:d.schedule},locale,copy):'';
}
export async function getActivities(base,params,{signal}={}){
 const url=new URL(activityBase(base)+'/api/activity-center');for(const [key,value]of Object.entries(params))if(value)url.searchParams.set(key,value);
 const key='activity-center:v1:'+url;
 try{
  const r=await fetch(url,{headers:{Accept:'application/json'},credentials:'omit',signal:signal||AbortSignal.timeout(12000)});if(!r.ok)throw Error('unavailable');const data=await r.json();
  if(data.cache?.stale&&!data.cache?.available)throw Error('unavailable');
  try{if(!data.cache?.stale)localStorage.setItem(key,JSON.stringify({data,at:new Date().toISOString()}));}catch{}
  return data;
 }catch(e){if(e.name==='AbortError')throw e;try{const saved=JSON.parse(localStorage.getItem(key));if(saved?.data&&Date.now()-Date.parse(saved.at)<86400000)return {...saved.data,cache:{stale:true,available:true,fetchedAt:saved.at}};}catch{}throw e;}
}
export function trackActivity(base,item,placement,event){
 if(!item.id)return;
 // A failed metric must never delay navigation or participation.
 void fetch(activityBase(base)+'/api/activity-center/metrics',{method:'POST',credentials:'omit',keepalive:true,headers:{'Content-Type':'application/json'},body:JSON.stringify({source:item.source||'community',id:item.id,placement,event})}).catch(()=>{});
}
const seenImpressions=new Set();
if(typeof document!=='undefined')document.addEventListener('astro:before-swap',()=>seenImpressions.clear());
export function observeActivities(root,base,placement){
 const nodes=[...root.querySelectorAll('[data-activity-id]')];if(!globalThis.IntersectionObserver)return ()=>{};
 const timers=new Map(),observer=new IntersectionObserver(entries=>{for(const entry of entries){const n=entry.target,key=placement+':'+n.dataset.activitySource+':'+n.dataset.activityId;if(!entry.isIntersecting||entry.intersectionRatio<.5||document.hidden){clearTimeout(timers.get(n));timers.delete(n);continue;}if(seenImpressions.has(key)||timers.has(n))continue;timers.set(n,setTimeout(()=>{timers.delete(n);if(document.hidden||!n.isConnected)return;seenImpressions.add(key);trackActivity(base,{source:n.dataset.activitySource,id:n.dataset.activityId},placement,'impression');observer.unobserve(n);},1000));}},{threshold:[0,.5]});
 const observe=()=>nodes.forEach(n=>observer.observe(n));const visibility=()=>{for(const timer of timers.values())clearTimeout(timer);timers.clear();observer.disconnect();if(!document.hidden)observe();};observe();document.addEventListener('visibilitychange',visibility);const stop=()=>{observer.disconnect();for(const timer of timers.values())clearTimeout(timer);document.removeEventListener('visibilitychange',visibility);};document.addEventListener('astro:before-swap',stop,{once:true});return stop;
}
export function activityCard(item,{locale,copy,base,placement='center',compact=false}){
 const card=element('article',null,'activity-card'+(compact?' activity-card--compact':''));card.dataset.activityId=item.id;card.dataset.activitySource=item.source||'community';
 const href=activityHref(item,locale,placement),link=element('a',null,'activity-card__link');if(href)link.href=href;
 if(item.source==='official'){link.target='_blank';link.rel='noopener noreferrer';}
 if(item.poster){const img=element('img');img.src=item.poster;img.alt=contentText(item.title,item,locale);img.loading='lazy';link.append(img);}
 const body=element('div',null,'activity-card__body'),source=element('span',item.source==='official'?copy.officialTab:copy.communityTab,'community-badge');
 body.append(source,element('h3',contentText(item.title,item,locale)),element('p',scheduleText(item,locale,copy),'activity-date'));
 if(item.schedule?.kind==='timed')body.append(element('p',scheduleText(item,locale,copy,{local:true}),'activity-local'));
 const location=item.source==='official'?[item.artist,item.location].filter(Boolean).join(' · '):[copy[item.mode],formatCommunityLocation(item,locale)].filter(Boolean).join(' · ');if(location)body.append(element('p',location));
 const status=copy[item.status]||item.status;if(status)body.append(element('span',status,'community-badge'));if(item.cooperation)body.append(element('span',copy.cooperation,'community-badge'));
 const deadline=nextDeadline(item,locale,copy);if(deadline)body.append(element('p',deadline,'activity-deadline'));
 if(!compact&&item.summary)body.append(element('p',contentText(item.summary,item,locale),'activity-card__summary'));
 link.append(body);link.addEventListener('click',()=>{if(item.source==='official')trackActivity(base,item,placement,'outbound');});card.append(link);
 const actions=element('div',null,'activity-card__actions'),share=element('button',copy.share,'workspace-button dui-btn dui-btn-ghost');share.type='button';share.dataset.uiKit='';share.onclick=async()=>{const {copyActivity}=await import('./activityShare.js');await copyActivity(item,{locale,copy,base,placement},share);};actions.append(share);
 const exported=element('a',copy.exportCalendar,'workspace-button dui-btn dui-btn-ghost');exported.dataset.uiKit='';exported.href=activityBase(base)+(item.source==='official'?'/api/activity-center/official/items/':'/api/community-activities/items/')+encodeURIComponent(item.id)+'/calendar.ics?locale='+locale;exported.onclick=()=>trackActivity(base,item,placement,'export');if(item.schedule?.kind!=='undated')actions.append(exported);card.append(actions);return card;
}
