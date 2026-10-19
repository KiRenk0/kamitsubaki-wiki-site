import {formatCommunityLocation} from './communityLocationFormat.mjs';
import {iconMarkup} from './icons.mjs';

const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeHref=value=>{try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?escape(u.href):'';}catch{return '';}};

export function scheduleText(item,locale,copy,{local=false}={}){
 const s=item.schedule;if(!s||s.kind==='undated')return copy.undated;
 if(s.kind==='allDay')return s.startDate+(s.endDate&&s.endDate!==s.startDate?' – '+s.endDate:'')+' · '+copy.allDay;
 try{const format=value=>new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeStyle:'short',...(local?{}:{timeZone:s.timeZone})}).format(new Date(value));return format(s.startAt)+(s.endAt?' – '+format(s.endAt):' · '+copy.endUnknown)+' · '+(local?copy.localTime:s.timeZone);}catch{return copy.undated;}
}
export function participationLinks(item,now=Date.now()){
 const links=(item.links||[]).filter(l=>safeHref(l.url)&&(!l.startsAt||Date.parse(l.startsAt)<=now)&&(!l.endsAt||Date.parse(l.endsAt)>now));
 const primary=['cancelled','postponed'].includes(item.eventStatus||item.status)?null:links.find(l=>l.primary)||links.find(l=>['registration','submission','live','replay'].includes(l.role));
 return {links,primary};
}

// body/facts/credits are HTML from the existing sanitized Markdown and escaped
// metadata renderers. All activity values and outbound URLs are escaped here.
export function activityDetailMarkup(item,{locale,copy:c,bodyHtml='',factsHtml='',creditHtml='',originalHtml='',text=String,now}={}){
 const v=value=>escape(text(value||'')),{links,primary}=participationLinks(item,now);
 const external=(link,cls='')=>`<a class="${cls}" href="${safeHref(link.url)}" target="_blank" rel="noopener noreferrer"${links.includes(link)?' data-activity-outbound':''}>${v(link.label||c[link.role+'Link']||c.primary)}${link===primary?iconMarkup('arrow-up-right'):''}</a>`;
 const poster=item.poster||item.media?.find(m=>m.role==='poster')?.src,posterHref=safeHref(poster);
 const place=item.locationPrecision==='pending'?c.pending:formatCommunityLocation(item,locale,text);
 const secondary=[...links.filter(l=>l!==primary),...(safeHref(item.sourceUrl)?[{label:c.source,url:item.sourceUrl}]:[]),...(safeHref(item.organizerUrl)?[{label:c.organizerUrl,url:item.organizerUrl}]:[])];
 const section=(html,pattern,id)=>{let found=false;const result=html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,(match,level,attrs,title)=>{if(found||!pattern.test(title.replace(/<[^>]+>/g,'')))return match;found=true;return `<h${level}${attrs.replace(/\s+id="[^"]*"/g,'')} id="${id}">${title}</h${level}>`;});return {html:result,found};};
 const note=section(bodyHtml,/注意|须知|須知|notes|notice/i,'activity-notes');
 bodyHtml=note.html+(note.found?'':`<section id="activity-notes"><h2>${escape(c.notes)}</h2><p>${escape(c.sectionMissing)}</p></section>`);
 const participation=section(bodyHtml,/参与|參與|participation|参加/i,'activity-participation');bodyHtml=participation.html;
 const status=c[item.status]||item.status||'',category=c[item.category]||'';
 return `<div class="activity-detail-hero${posterHref?'':' activity-detail-hero--text'}">
 <div class="activity-detail-info"><p class="activity-detail-kicker">${[category,status,item.cooperation?c.cooperation:''].filter(Boolean).map(v).join('<span aria-hidden="true">·</span>')}</p>
 <h1>${v(item.title)}</h1>${item.summary?`<p class="activity-detail-summary">${v(item.summary)}</p>`:''}
 <dl class="activity-detail-essentials"><div><dt>${escape(c.timeline)}</dt><dd>${escape(scheduleText(item,locale,c))}</dd>${item.schedule?.kind==='timed'?`<dd class="activity-local" data-community-local-time="${escape(item.schedule.startAt)}"></dd>`:''}</div>
 <div><dt>${escape(c.locationShort)}</dt><dd>${[c[item.mode],place].filter(Boolean).map(v).join(' · ')||escape(c.pending)}</dd></div></dl>
 <div id="${participation.found?'activity-entry':'activity-participation'}" class="activity-detail-participation">${primary?external(primary,'activity-primary'):''}${secondary.length?`<div class="activity-detail-links">${secondary.map(l=>external(l)).join('')}${item.seriesId?`<a href="/${locale}/community/series/${escape(item.seriesId)}/">${escape(c.series)}</a>`:''}</div>`:item.seriesId?`<a href="/${locale}/community/series/${escape(item.seriesId)}/">${escape(c.series)}</a>`:''}</div>${originalHtml}
 <div class="activity-detail-tools" data-activity-detail-tools></div></div>
 ${posterHref?`<figure class="activity-detail-art"><a href="${posterHref}" class="activity-poster-open" target="_blank" rel="noopener noreferrer" aria-label="${escape(c.poster)}"><img class="community-detail-poster" src="${posterHref}" alt="${v(item.title)}" fetchpriority="high"><span class="activity-poster-caption">${escape(c.viewPoster)}${iconMarkup('arrow-up-right')}</span></a></figure>`:''}</div>
 <nav class="activity-document-nav" aria-label="${escape(c.title)}">${[['introduction',c.introduction],['participation',c.participate],['schedule',c.timeline],['notes',c.notes]].map(([id,label])=>`<a href="#activity-${id}">${escape(label)}</a>`).join('')}</nav>
 <div class="activity-detail-reading"><article id="activity-introduction" class="community-detail-body wiki-reader wiki-prose">${bodyHtml}</article><aside id="activity-schedule" class="activity-detail-sidebar"><h2>${escape(c.timeline)}</h2>${factsHtml}${creditHtml?`<details class="activity-detail-credits"><summary>${escape(c.materialCredits)}</summary>${creditHtml}</details>`:''}</aside></div>`;
}
