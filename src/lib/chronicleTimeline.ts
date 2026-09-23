import {dateBounds, eventBounds, timelineBounds, clusterEvents} from './chronicleTimeline.mjs';
interface TimelineEvent {id:string;title:string;summary:string;era?:string;date:{start:string;end?:string;precision:string};tracks:string[];eventTypes:string[];importance:string;related?:{entity:string}[];links:{label:string;url:string}[];sources?:{url?:string;title?:string;publisher?:string;page?:string}[]}
export function initTimeline(){
 const root=document.querySelector<HTMLElement>('[data-timeline]');if(!root)return;
 const data=JSON.parse(root.querySelector('[data-timeline-data]')!.textContent!);
 const events:TimelineEvent[]=data.events, eras:{id:string;start:string;end:string}[]=data.eras;
 const ui=data.ui, domain=timelineBounds(events,eras), duration=domain.end-domain.start;
 const get=<T extends Element=HTMLElement>(s:string)=>root.querySelector<T>(s)!;
 const viewport=get<HTMLElement>('[data-time-scroll]'),canvas=get<HTMLElement>('[data-time-canvas]');
 const zoom=get<HTMLInputElement>('[data-time-zoom]'),pan=get<HTMLInputElement>('[data-pan]'),form=get<HTMLFormElement>('form');
 const checks=[...root.querySelectorAll<HTMLInputElement>('[data-track]')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let width=1, filtered=events, selected:TimelineEvent|undefined, group:TimelineEvent[]=[], activeEra='', previousWidth=0;
 const el=(tag:string,text?:string,cls?:string)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
 const pos=(time:number)=>(time-domain.start)/duration*width;
 const dateLabel=(event:TimelineEvent)=>event.date.start+(event.date.end?' — '+event.date.end:'');
 const enabled=()=>checks.filter(c=>c.checked).map(c=>c.value);
 const viewportState=()=>{
   const start=domain.start+viewport.scrollLeft/width*duration,end=Math.min(domain.end,start+viewport.clientWidth/width*duration);
   const format=(t:number)=>new Date(t).toISOString().slice(0,7);
   get('[data-window]').textContent=`${format(start)} — ${format(end)}`;
   const marker=get<HTMLElement>('[data-window-marker]');marker.style.left=`${viewport.scrollLeft/width*100}%`;marker.style.width=`${Math.min(100,viewport.clientWidth/width*100)}%`;
   pan.value=String(viewport.scrollLeft/Math.max(1,width-viewport.clientWidth)*1000);
   const current=root.querySelector<HTMLSelectElement>('[data-timeline-view]')?.value==='list'?activeEra:eras.find(e=>start>=dateBounds(e.start).start&&start<dateBounds(e.end).end)?.id||'';
   root.querySelectorAll<HTMLButtonElement>('[data-era]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.era===current)));
 };
 const focusEvent=(event:TimelineEvent,animate=true)=>viewport.scrollTo({left:Math.max(0,pos(eventBounds(event).start)-viewport.clientWidth*.35),behavior:animate&&!reduced.matches?'smooth':'instant'});
 const select=(event:TimelineEvent,save=true,locate=false)=>{
   selected=event;
   if(!group.some(e=>e.id===event.id))group=[event];
   get('[data-group-title]').textContent=`${group.length} ${ui.events}`;
   const list=get('[data-event-list]');list.replaceChildren();
   let shown=0;const more=el('button',ui.more) as HTMLButtonElement;more.type='button';more.className='timeline-events-more';
   const reveal=()=>{const batch=group.slice(shown,shown+12);shown+=batch.length;
   batch.forEach(e=>{const b=el('button',`${dateLabel(e)} · ${e.title}`) as HTMLButtonElement;b.type='button';b.setAttribute('aria-pressed',String(e.id===event.id));b.addEventListener('click',()=>select(e,true,true));list.insertBefore(b,more.isConnected?more:null);});more.hidden=shown>=group.length;};
   list.append(more);more.addEventListener('click',()=>{reveal();});do{reveal();}while(shown<=group.findIndex(e=>e.id===event.id));
   const detail=get('[data-detail]');detail.replaceChildren();
   const time=el('time',dateLabel(event));time.setAttribute('datetime',event.date.start);
   const eraIndex=eras.findIndex(e=>e.id===event.era);
   detail.append(time,el('p',[eraIndex>=0?data.eraLabels[eraIndex]:'',...event.tracks.map(t=>data.trackLabels[data.tracks.indexOf(t)])].filter(Boolean).join(' / ')),el('h2',event.title));
   if(event.summary!==event.title)detail.append(el('p',event.summary));
   const links=el('div',undefined,'timeline-detail-links');event.links.forEach(link=>{const a=el('a',link.label) as HTMLAnchorElement;a.href=link.url;links.append(a);});detail.append(links);
   if(event.sources?.length){const sources=el('details');sources.append(el('summary',ui.sources));event.sources.forEach(s=>{const label=[s.title,s.publisher,s.page].filter(Boolean).join(' · ');if(s.url){const a=el('a',label||new URL(s.url).hostname) as HTMLAnchorElement;a.href=s.url;a.target='_blank';a.rel='noopener noreferrer';sources.append(a);}else sources.append(el('p',label));});detail.append(sources);}
   const nav=el('nav'),index=filtered.findIndex(e=>e.id===event.id);
   [-1,1].forEach(delta=>{const b=el('button',delta<0?'← '+ui.previous:ui.next+' →') as HTMLButtonElement;b.type='button';b.disabled=!filtered[index+delta];b.addEventListener('click',()=>{group=[filtered[index+delta]];select(filtered[index+delta],true,true);});nav.append(b);});detail.append(nav);
   const playhead=get<HTMLElement>('[data-playhead]');playhead.hidden=false;playhead.style.left=pos(eventBounds(event).start)+'px';playhead.dataset.convergence=String(event.tracks.length>1);const indices=event.tracks.map(t=>data.tracks.indexOf(t));playhead.style.top=event.tracks.length>1?44+Math.min(...indices)*104+'px':'28px';playhead.style.bottom=event.tracks.length>1?(3-Math.max(...indices))*104+'px':'0';
   root.querySelectorAll<HTMLElement>('[data-event-ids]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.eventIds!.split(' ').includes(event.id))));
   if(!reduced.matches)detail.animate([{opacity:.35,transform:'translateY(5px)'},{opacity:1,transform:'none'}],{duration:220,easing:'ease-out'});
   if(save){const url=new URL(location.href);url.hash=event.id;history.replaceState(null,'',url);}
   if(locate)focusEvent(event);
 };
 const draw=()=>{
   width=Math.max(1,viewport.clientWidth)*Number(zoom.value);canvas.style.width=width+'px';get('[data-scale]').textContent=Number(zoom.value).toFixed(1)+'×';
   const ruler=get('[data-ruler]');ruler.replaceChildren();
   const monthPixels=width/(duration/(365.25*86400000))*1/12;
   const step=monthPixels>60?1:monthPixels>20?3:12;
   const d=new Date(domain.start);
   while(d.getTime()<domain.end){const tick=el('span',d.toISOString().slice(0,step===12?4:7),'timeline-tick');tick.style.left=pos(d.getTime())+'px';ruler.append(tick);d.setUTCMonth(d.getUTCMonth()+step);}
   const enabledTracks=enabled();
   root.querySelectorAll<HTMLElement>('[data-lane]').forEach(lane=>{
     lane.replaceChildren();const track=lane.dataset.lane!;lane.dataset.muted=String(!enabledTracks.includes(track));
     const visible=enabledTracks.includes(track)?filtered.filter(e=>e.tracks.includes(track)):[];
     for(const cluster of clusterEvents(visible,domain.start,domain.end,width)){
       const first=cluster.events[0] as TimelineEvent;
       const b=el('button',undefined,'timeline-clip') as HTMLButtonElement;b.type='button';b.style.left=cluster.x+4+'px';b.dataset.eventIds=cluster.events.map((e:TimelineEvent)=>e.id).join(' ');b.dataset.milestone=String(cluster.events.some((e:TimelineEvent)=>e.importance==='milestone'));
       const date=cluster.events.length>1?first.date.start+' — '+cluster.events.at(-1).date.start:dateLabel(first);
       b.append(el('small',date),el('strong',cluster.events.length>1?`${cluster.events.length} ${ui.events} · ${first.title}`:first.title));
       b.title=`${date} · ${cluster.events.length} ${ui.events}`;b.setAttribute('aria-pressed',String(cluster.events.some((e:TimelineEvent)=>e.id===selected?.id)));
       b.addEventListener('click',()=>{group=cluster.events;select(group.find(e=>e.id===selected?.id)||first);});lane.append(b);
     }
     // These marks show actual date precision/duration independently of label width.
     visible.forEach(event=>{const bounds=eventBounds(event),bar=el('span',undefined,'timeline-date-span');bar.style.left=pos(bounds.start)+'px';bar.style.width=Math.max(2,(bounds.end-bounds.start)/duration*width)+'px';bar.title=dateLabel(event);bar.setAttribute('aria-hidden','true');lane.append(bar);});
   });
   if(selected)get<HTMLElement>('[data-playhead]').style.left=pos(eventBounds(selected).start)+'px';
   viewportState();
 };
 const saveEra=(id='')=>{activeEra=id;const url=new URL(location.href);id?url.searchParams.set('era',id):url.searchParams.delete('era');history.replaceState(null,'',url);if(viewControl.value==='list'){renderList();viewportState();}};
 const fitRange=(start:number,end:number)=>{
   const range=Math.max(86400000,Math.min(domain.end,end)-Math.max(domain.start,start));zoom.value=String(Math.max(1,Math.min(40,duration/range)));draw();viewport.scrollTo({left:pos(Math.max(domain.start,start)),behavior:reduced.matches?'instant':'smooth'});
 };
 const listView=get<HTMLElement>('[data-chronicle-list]'),viewControl=get<HTMLSelectElement>('[data-timeline-view]'),orderControl=get<HTMLSelectElement>('[data-timeline-order]');
 const renderList=()=>{listView.replaceChildren();const ordered=filtered.filter(event=>viewControl.value!=='list'||!activeEra||event.era===activeEra).sort((a,b)=>a.date.start.localeCompare(b.date.start)||a.id.localeCompare(b.id));if(orderControl.value==='desc')ordered.reverse();let shown=0;const more=el('button',ui.more) as HTMLButtonElement;more.type='button';const reveal=()=>{for(const event of ordered.slice(shown,shown+12)){const button=el('button',`${dateLabel(event)} · ${event.title}`) as HTMLButtonElement;button.type='button';button.onclick=()=>{group=[event];select(event);get('[data-detail]').scrollIntoView({block:'nearest',behavior:'instant'});};listView.insertBefore(button,more);}shown+=12;more.hidden=shown>=ordered.length;collapse.hidden=shown<=12;};const collapse=el('button',data.locale==='en'?'Collapse':data.locale==='ja'?'折りたたむ':'收起') as HTMLButtonElement;collapse.type='button';collapse.onclick=()=>{renderList();listView.scrollIntoView({block:'nearest',behavior:'instant'});};listView.append(more,collapse);more.onclick=reveal;reveal();};
 const changeListView=(save=true)=>{listView.hidden=viewControl.value!=='list';get<HTMLElement>('.timeline-console').hidden=!listView.hidden;renderList();if(listView.hidden)draw();if(save){const url=new URL(location.href);url.searchParams.set('view',viewControl.value);url.searchParams.set('order',orderControl.value);history.replaceState(null,'',url);}};
 viewControl.onchange=()=>changeListView();orderControl.onchange=()=>changeListView();
 const apply=(save=false)=>{
   const values=Object.fromEntries(new FormData(form)),on=enabled();
   filtered=events.filter(e=>on.some(t=>e.tracks.includes(t))&&(!values.q||`${e.title} ${e.summary}`.toLowerCase().includes(String(values.q).toLowerCase()))&&(!values.entity||e.related?.some(r=>r.entity===values.entity))&&(!values.type||e.eventTypes.includes(String(values.type)))&&(!values.year||e.date.start.startsWith(String(values.year))));
   get('[data-count]').textContent=`${filtered.length} / ${events.length} ${ui.events}`;get('[data-filter-count]').textContent=filtered.length===events.length?'':`${filtered.length} / ${events.length}`;
   get<HTMLElement>('[data-empty]').hidden=filtered.length>0;
   root.querySelectorAll<HTMLElement>('[data-solo]').forEach(b=>b.setAttribute('aria-pressed',String(on.length===1&&on[0]===b.dataset.solo)));
   if(selected&&!filtered.some(e=>e.id===selected!.id)){selected=undefined;group=[];get('[data-event-list]').replaceChildren();get('[data-detail]').replaceChildren(el('p',ui.select));get('[data-group-title]').textContent=ui.select;get<HTMLElement>('[data-playhead]').hidden=true;}
   if(selected){group=group.filter(e=>filtered.some(f=>f.id===e.id));select(selected,false);}
   draw();renderList();
   if(values.year){activeEra='';fitRange(Date.UTC(Number(values.year),0,1),Date.UTC(Number(values.year)+1,0,1));if(save)saveEra();}
   if(save){const url=new URL(location.href);for(const [key,value]of Object.entries(values))value?url.searchParams.set(key,String(value)):url.searchParams.delete(key);on.length===checks.length?url.searchParams.delete('tracks'):url.searchParams.set('tracks',on.join(','));if(!selected)url.hash='';history.replaceState(null,'',url);}
 };
 const restore=()=>{
   const params=new URLSearchParams(location.search);viewControl.value=params.get('view')==='list'?'list':'timeline';orderControl.value=params.get('order')==='desc'?'desc':'asc';
   form.querySelectorAll<HTMLInputElement|HTMLSelectElement>('[name]').forEach(c=>c.value=params.get(c.name)||'');checks.forEach(c=>c.checked=!params.has('tracks')||(params.get('tracks')||'').split(',').includes(c.value));apply();
   changeListView(false);const era=eras.find(e=>e.id===params.get('era'));activeEra=era?.id||'';renderList();if(era)fitRange(dateBounds(era.start).start,dateBounds(era.end).end);
   let id='';try{id=decodeURIComponent(location.hash.slice(1));}catch{}
   const event=filtered.find(e=>e.id===id);if(event){group=[event];select(event,false);focusEvent(event,false);}
 };
 eras.forEach((era,i)=>{const start=Math.max(domain.start,dateBounds(era.start).start),end=Math.min(domain.end,dateBounds(era.end).end);const span=el('span',`0${i+1}`);span.style.position='absolute';span.style.left=(start-domain.start)/duration*100+'%';span.style.width=Math.max(0,(end-start)/duration*100)+'%';get('[data-overview-eras]').append(span);});
 root.querySelectorAll<HTMLButtonElement>('[data-era]').forEach(b=>b.addEventListener('click',()=>{const year=form.querySelector<HTMLSelectElement>('[name=year]')!;if(year.value){year.value='';apply(true);}const era=eras.find(e=>e.id===b.dataset.era)!;fitRange(dateBounds(era.start).start,dateBounds(era.end).end);saveEra(era.id);}));
 get('[data-fit]').addEventListener('click',()=>{saveEra();fitRange(domain.start,domain.end);});
 zoom.addEventListener('input',()=>{const anchor=(viewport.scrollLeft+viewport.clientWidth/2)/width;draw();viewport.scrollLeft=anchor*width-viewport.clientWidth/2;saveEra();viewportState();});
 pan.addEventListener('input',()=>{viewport.scrollLeft=Number(pan.value)/1000*(width-viewport.clientWidth);viewportState();});
 viewport.addEventListener('scroll',viewportState,{passive:true});
 get('[data-ruler]').addEventListener('click',e=>{if(!filtered.length)return;const x=(e as MouseEvent).clientX-canvas.getBoundingClientRect().left;const time=domain.start+x/width*duration;const nearest=filtered.reduce((a,b)=>Math.abs(eventBounds(a).start-time)<Math.abs(eventBounds(b).start-time)?a:b);group=[nearest];select(nearest);});
 form.addEventListener('input',()=>apply(true));form.addEventListener('submit',e=>e.preventDefault());form.addEventListener('reset',()=>requestAnimationFrame(()=>{checks.forEach(c=>c.checked=true);apply(true);}));checks.forEach(c=>c.addEventListener('change',()=>apply(true)));
 root.querySelectorAll<HTMLButtonElement>('[data-solo]').forEach(b=>b.addEventListener('click',()=>{const all=enabled().length===1&&enabled()[0]===b.dataset.solo;checks.forEach(c=>c.checked=all||c.value===b.dataset.solo);apply(true);}));
 addEventListener('popstate',restore);addEventListener('hashchange',restore);
 new ResizeObserver(()=>{if(previousWidth===viewport.clientWidth)return;const center=(viewport.scrollLeft+previousWidth/2)/width;previousWidth=viewport.clientWidth;draw();if(activeEra){const era=eras.find(e=>e.id===activeEra)!;fitRange(dateBounds(era.start).start,dateBounds(era.end).end);}else viewport.scrollLeft=Math.max(0,center*width-viewport.clientWidth/2);}).observe(viewport);
 restore();previousWidth=viewport.clientWidth;
}
