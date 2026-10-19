import {Calendar} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import zhCN from '@fullcalendar/core/locales/zh-cn.js';
import zhTW from '@fullcalendar/core/locales/zh-tw.js';
import ja from '@fullcalendar/core/locales/ja.js';
import TomSelect from 'tom-select';
import '../lib/communityLocationRuntime.js';
import {createCommunityLocationPicker} from '../lib/communityLocationPicker.js';
import {mountFilterPopover} from '../lib/filterPopover.js';
import {calendarMonthRange,addCalendarDays} from '../lib/calendarMonth.js';
import {activityBase,activityCard,activityHref,getActivities,element,scheduleText,observeActivities,trackActivity} from '../lib/activityClient.js';

export function initActivityCenter(root){
 if(!root||root.dataset.mounted)return;root.dataset.mounted='true';
 const c=JSON.parse(root.dataset.copy),locale=root.dataset.locale,base=root.dataset.api,$=s=>root.querySelector(s),form=$('[data-activity-filters]'),keys=['month','q','artist','country','subdivisionCode','cityId','city','mode','category'];
 const today=(source=state.source||root.dataset.source)=>new Intl.DateTimeFormat('en-CA',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:source==='official'?'Asia/Tokyo':Intl.DateTimeFormat().resolvedOptions().timeZone}).format(new Date());
 let state={},data={items:[],points:[],undated:[]},renderedKey='',artistStop=()=>{},controller,generation=0,searchTimer,disposed=false,stopObserving=()=>{};
 const memory={};let artistPicker;
 const picker=createCommunityLocationPicker(form,{apiBase:base,locale,copy:c,filters:true,onChange:()=>{if(state.source==='community')changed();}});
 mountFilterPopover($('[data-activity-filter-details]'));
 const read=()=>{const p=new URLSearchParams(location.search),source=['official','community'].includes(p.get('source'))?p.get('source'):root.dataset.source;
  state={source,month:/^\d{4}-(0[1-9]|1[0-2])$/.test(p.get('month')||'')?p.get('month'):today(source).slice(0,7),view:['calendar','agenda'].includes(p.get('view'))?p.get('view'):matchMedia('(max-width:760px)').matches?'agenda':'calendar',range:['next','deadline'].includes(p.get('range'))?p.get('range'):'month',date:p.get('date')||'',deadlines:p.get('deadlines')!=='0'};
  for(const key of keys){const n=form.elements.namedItem(key),value=key==='month'?state.month:p.get(key)||'';if(n.tagName==='SELECT'&&value&&![...n.options].some(o=>o.value===value))n.add(new Option(value,value));n.value=value;}
  $('[data-activity-deadlines]').checked=state.deadlines;artistPicker?.setValue(form.elements.artist.value,true);picker.set(Object.fromEntries(['country','subdivisionCode','cityId','city'].map(k=>[k,form.elements[k].value]))).catch(()=>{});
 };
 const sync=(replace=false)=>{const url=new URL(location.href);for(const key of keys){const value=form.elements.namedItem(key).value;if(value)url.searchParams.set(key,value);else url.searchParams.delete(key);}for(const key of ['source','view','range'])url.searchParams.set(key,state[key]);if(state.date)url.searchParams.set('date',state.date);else url.searchParams.delete('date');if(!state.deadlines)url.searchParams.set('deadlines','0');else url.searchParams.delete('deadlines');history[replace?'replaceState':'pushState'](null,'',url);memory[state.source]=url.search;};
 const range=()=>state.range==='month'?calendarMonthRange(state.month,{weekStartsOn:1,includeOutside:true}):{from:today(),to:addCalendarDays(today(),29)};
 const filterParams=()=>Object.fromEntries(keys.filter(k=>k!=='month'&&(state.source==='community'?k!=='artist':['q','artist'].includes(k))).map(k=>[k,form.elements.namedItem(k).value]));
 const relevantPoints=()=>data.points.filter(p=>(state.deadlines||p.type==='main')&&(state.range!=='deadline'||p.type!=='main'));
 function updateSubscription(){const params=new URLSearchParams({...filterParams(),locale});const path=state.source==='official'?'/api/activity-center/official/calendar.ics':'/api/community-activities/calendar.ics';const url=activityBase(base)+path+'?'+params;$('[data-activity-subscribe]').href=url.replace(/^https?:/,'webcal:');$('[data-activity-subscribe]').dataset.url=url;}
 function controls(){
  root.dataset.activeSource=state.source;root.querySelectorAll('[data-official-only]').forEach(n=>n.hidden=state.source!=='official');root.querySelectorAll('[data-community-only]').forEach(n=>n.hidden=state.source!=='community');
  root.querySelectorAll('[data-activity-tab]').forEach(a=>{if(a.dataset.activityTab===state.source)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  root.querySelectorAll('[data-activity-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.activityView===state.view)));root.querySelectorAll('[data-activity-range]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.activityRange===state.range)));updateSubscription();
 }
 function eventContent(arg){
  const {activity:item,group}=arg.event.extendedProps,copy=element('div',null,'activity-event-copy');copy.append(element('strong',item.title));
  const labels=[...new Set(group.map(p=>p.label||c[p.type]||c.main))].join(' / ');
  if(arg.view.type==='dayGridMonth')copy.append(element('small',[labels,['cancelled','postponed'].includes(item.eventStatus)?c[item.eventStatus]:''].filter(Boolean).join(' · ')));else{
   copy.append(element('small',labels+' · '+scheduleText(item,locale,c)),element('small',[c[item.status]||item.status,item.artist,item.location,item.city,c[item.mode]].filter(Boolean).join(' · ')));
   if(item.schedule.kind==='timed')copy.append(element('small',scheduleText(item,locale,c,{local:true})));
  }
  if(arg.view.type.startsWith('list')){const link=element('a');link.href=activityHref(item,locale,'center');if(item.source==='official'){link.target='_blank';link.rel='noopener noreferrer';}link.append(copy);return {domNodes:[link]};}
  return {domNodes:[copy]};
 }
 const calendar=new Calendar($('[data-activity-native]'),{plugins:[dayGridPlugin,listPlugin,interactionPlugin],locale:locale==='ja'?ja:locale==='zh'?zhCN:locale.startsWith('zh')?zhTW:'en',timeZone:'UTC',firstDay:1,initialDate:new Date().toISOString().slice(0,10),initialView:'dayGridMonth',headerToolbar:{left:'prev,next',center:'title',right:''},buttonText:{today:c.today},height:'auto',fixedWeekCount:true,allDayText:'',dayMaxEvents:2,editable:false,navLinks:false,eventInteractive:true,eventContent,
  moreLinkContent:args=>({html:''+args.num+' '+c.more}),moreLinkClick:'popover',
  noEventsContent:()=>({domNodes:[element('p',state.requestState==='loading'?c.loading:state.requestState==='error'?c.unavailable:Object.values(filterParams()).some(Boolean)?c.emptyFiltered:c.emptyRange)]}),
  views:{listThirty:{type:'list',duration:{days:30}}},
  dateClick:arg=>showDay(arg.dateStr),
  dayCellDidMount:arg=>{const number=arg.el.querySelector('.fc-daygrid-day-number');if(!number)return;number.setAttribute('role','button');number.tabIndex=0;number.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showDay(arg.date.toISOString().slice(0,10));}});},
  eventClick:arg=>{if(state.source==='official')trackActivity(base,arg.event.extendedProps.activity,'center','outbound');},
  eventDidMount:arg=>{arg.el.dataset.activityId=arg.event.extendedProps.activity.id;arg.el.dataset.activitySource=state.source;if(state.source==='official'){arg.el.target='_blank';arg.el.rel='noopener noreferrer';}},
 });
 function showDay(day,persist=true){state.date=day;calendar.setOption('dayCellClassNames',arg=>arg.date.toISOString().slice(0,10)===day?['is-selected']:[]);if(persist)sync();$('[data-activity-day]').hidden=false;$('[data-activity-day-title]').textContent=day;const list=$('[data-activity-day-list]');list.replaceChildren();const items=[...new Map(relevantPoints().filter(p=>p.startDate<=day&&p.endDate>=day).map(p=>[p.activityId,p.activity])).values()];for(const a of items)list.append(activityCard(a,{locale,copy:c,base}));if(!items.length)list.append(element('p',c.emptyDay));observeActivities(list,base,'center');}
 function render(){
  controls();const points=relevantPoints(),{from,to}=range(),events=[];
  if(state.view==='calendar'&&state.range==='month')for(const p of points)events.push({id:p.id,start:p.startDate,end:addCalendarDays(p.endDate,1),allDay:true,title:p.activity.title,url:activityHref(p.activity,locale,'center'),classNames:p.type==='main'?[]:['activity-deadline-event'],extendedProps:{activity:p.activity,group:[p]}});
  else{
   for(let day=from;day<=to;day=addCalendarDays(day,1)){
    if(state.range==='month'&&!day.startsWith(state.month))continue;const groups=new Map();for(const p of points.filter(p=>p.startDate<=day&&p.endDate>=day)){if(!groups.has(p.activityId))groups.set(p.activityId,[]);groups.get(p.activityId).push(p);}
    for(const [id,group]of groups)events.push({id:day+':'+id,start:day,allDay:true,title:group[0].activity.title,url:activityHref(group[0].activity,locale,'center'),extendedProps:{activity:group[0].activity,group}});
   }
  }
  stopObserving();calendar.batchRendering(()=>{calendar.setOption('headerToolbar',{left:state.range==='month'?'prev,next':'',center:'title',right:''});calendar.changeView(state.view==='calendar'&&state.range==='month'?'dayGridMonth':state.range==='month'?'listMonth':'listThirty',state.range==='month'?state.month+'-01':from);calendar.removeAllEventSources();calendar.addEventSource(events);});stopObserving=observeActivities($('[data-activity-native]'),base,'center');
  const unknown=$('[data-activity-undated-list]');unknown.replaceChildren();$('[data-activity-undated]').hidden=!data.undated?.length;for(const a of data.undated||[])unknown.append(activityCard(a,{locale,copy:c,base}));
  if(state.date&&state.requestState!=='error')showDayWithoutHistory(state.date);else $('[data-activity-day]').hidden=true;
 }
 function showDayWithoutHistory(day){showDay(day,false);}
 async function load(){
  const current=++generation,key=JSON.stringify({source:state.source,...range(),...filterParams()});state.requestState='loading';if(renderedKey!==key){data={items:[],points:[],undated:[]};calendar.removeAllEventSources();$('[data-activity-day]').hidden=true;$('[data-activity-undated]').hidden=true;stopObserving();renderedKey=key;}controller?.abort();controller=new AbortController();$('[data-activity-featured-section]').hidden=true;controls();$('[data-activity-status]').textContent=c.loading;$('[data-activity-retry]').hidden=true;root.setAttribute('aria-busy','true');
  try{
   void getActivities(base,{source:state.source,...filterParams(),recommend:'1',placement:'center',locale},{signal:controller.signal}).then(next=>{if(current!==generation)return;const cards=$('[data-activity-featured]');cards.replaceChildren(...next.items.map(a=>activityCard(a,{locale,copy:c,base})));$('[data-activity-featured-section]').hidden=!next.items.length;observeActivities(cards,base,'center');}).catch(()=>{});
   const next=await getActivities(base,{source:state.source,...range(),...filterParams(),locale},{signal:controller.signal});if(current!==generation)return;data=next;state.requestState='ready';
   const selected=form.elements.artist.value;if(state.source==='official'){artistStop();artistPicker?.destroy();form.elements.artist.replaceChildren(new Option(c.allArtists,''),...(data.artists||[]).map(a=>new Option(a,a)));if(selected&&!data.artists.includes(selected))form.elements.artist.add(new Option(selected,selected));form.elements.artist.value=selected;artistPicker=new TomSelect(form.elements.artist,{create:false,allowEmptyOption:true,dropdownParent:'body'});artistPicker.control_input.setAttribute('aria-label',c.allArtists);form.elements.artist.setAttribute('aria-hidden','true');const dropdown=artistPicker.dropdown;dropdown.dataset.communityLocationDropdown='';if(typeof dropdown.showPopover==='function'){dropdown.setAttribute('popover','manual');artistPicker.on('dropdown_open',()=>{dropdown.showPopover();const position=()=>window.CommunityLocationPosition?.(artistPicker.control,dropdown,{placement:'bottom-start',isCurrent:()=>artistPicker?.isOpen});artistStop();position();artistStop=window.CommunityLocationWatch?.(artistPicker.control,dropdown,position)||(()=>{});});artistPicker.on('dropdown_close',()=>{artistStop();if(dropdown.matches(':popover-open'))dropdown.hidePopover();});}}
   $('[data-activity-status]').textContent=[data.cache?.stale?c.cached+(data.cache.fetchedAt?' · '+c.fetched+' '+new Date(data.cache.fetchedAt).toLocaleString(locale):''):'',!data.items.length?(Object.values(filterParams()).some(Boolean)?c.emptyFiltered:c.emptyRange):''].filter(Boolean).join(' · ');render();
  }catch(e){if(e.name==='AbortError')return;state.requestState='error';render();$('[data-activity-status]').textContent=c.unavailable;$('[data-activity-retry]').hidden=false;}
  finally{if(current===generation)root.setAttribute('aria-busy','false');}
 }
 function changed(){state.month=form.elements.month.value||today().slice(0,7);state.date='';sync();void load();}
 form.onsubmit=e=>e.preventDefault();form.onchange=e=>{if(['country','subdivisionCode','cityId'].includes(e.target.name))return;if(e.target.name==='month')state.range='month';if(e.target.name==='mode'&&form.elements.mode.value==='online')picker.set({});changed();};form.elements.q.oninput=()=>{clearTimeout(searchTimer);searchTimer=setTimeout(changed,300);};
 root.querySelectorAll('[data-activity-tab]').forEach(a=>a.onclick=e=>{e.preventDefault();memory[state.source]=location.search;state.source=a.dataset.activityTab;root.dataset.source=state.source;const url=new URL(a.href);url.search=memory[state.source]||'';url.searchParams.set('source',state.source);history.pushState(null,'',url);read();void load();});
 root.querySelectorAll('[data-activity-view]').forEach(b=>b.onclick=()=>{state.view=b.dataset.activityView;sync();render();});
 root.querySelectorAll('[data-activity-range]').forEach(b=>b.onclick=()=>{state.range=b.dataset.activityRange;state.view='agenda';state.date='';sync();void load();});
 $('[data-activity-today]').onclick=()=>{state.month=today().slice(0,7);form.elements.month.value=state.month;state.range='month';state.date=today();sync();void load();};
 $('[data-activity-deadlines]').onchange=e=>{state.deadlines=e.target.checked;sync();render();};$('[data-activity-retry]').onclick=()=>load();
 $('[data-activity-clear]').onclick=()=>{for(const key of keys.filter(k=>k!=='month'))form.elements.namedItem(key).value='';artistPicker?.clear(true);picker.set({});changed();};
 $('[data-activity-day-close]').onclick=()=>{state.date='';sync();$('[data-activity-day]').hidden=true;};
 $('[data-activity-copy-subscription]').onclick=async()=>{try{await navigator.clipboard.writeText($('[data-activity-subscribe]').dataset.url);$('[data-activity-status]').textContent=c.copied;}catch{$('[data-activity-status]').textContent=$('[data-activity-subscribe]').dataset.url;}};
 const back=()=>{root.dataset.source='community';read();void load();};window.addEventListener('popstate',back);
 read();calendar.render();
 // Native prev/next updates the query and fetches the corresponding source range.
 calendar.on('datesSet',info=>{if(disposed||state.range!=='month')return;const month=calendar.getDate().toISOString().slice(0,7);if(month!==state.month){state.month=month;form.elements.month.value=month;state.date='';sync();void load();}});
 sync(true);void load();
 const cleanup=()=>{disposed=true;generation++;controller?.abort();clearTimeout(searchTimer);stopObserving();artistStop();artistPicker?.destroy();picker.destroy();calendar.destroy();window.removeEventListener('popstate',back);};document.addEventListener('astro:before-swap',cleanup,{once:true});
}
