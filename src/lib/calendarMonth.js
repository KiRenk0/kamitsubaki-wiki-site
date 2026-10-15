import zhCN from '@fullcalendar/core/locales/zh-cn.js';
import zhTW from '@fullcalendar/core/locales/zh-tw.js';
import ja from '@fullcalendar/core/locales/ja.js';
const calendarLocale=locale=>locale==='ja'?{...ja,timeHint:'時間',eventHint:'予定'}:['zh-tw','zh-hk'].includes(locale)?{...zhTW,timeHint:'時間',eventHint:'活動'}:locale==='zh'?{...zhCN,timeHint:'时间',eventHint:'活动'}:'en';
// Shared presentation extracted from the official EventsCalendar.
// Providers supply date-only ranges; this layer never infers an event timezone or duration.
export function addCalendarDays(day, amount) {
 return new Date(Date.parse(day+'T12:00:00Z')+amount*86400000).toISOString().slice(0,10);
}
export function shiftCalendarMonth(month, amount) {
 const date=new Date(month+'-01T12:00:00Z');date.setUTCMonth(date.getUTCMonth()+amount);return date.toISOString().slice(0,7);
}
export function calendarMonthRange(month,{weekStartsOn=0,includeOutside=false}={}) {
 const first=month+'-01',year=Number(month.slice(0,4)),number=Number(month.slice(5)),last=new Date(Date.UTC(year,number,0)).toISOString().slice(0,10);
 if(!includeOutside)return {from:first,to:last};
 const weekday=(new Date(first+'T12:00Z').getUTCDay()-weekStartsOn+7)%7,from=addCalendarDays(first,-weekday);return {from,to:addCalendarDays(from,41)};
}
const calendarInstances=new WeakMap();
let calendarModules;
function loadCalendar(){return calendarModules ||= Promise.all([import('@fullcalendar/core'),import('@fullcalendar/daygrid')]);}
export function renderCalendarMonth(options){
 const {grid}=options;let state=calendarInstances.get(grid);
 if(!state){state={options,calendar:null,generation:0};calendarInstances.set(grid,state);}
 state.options=options;const generation=++state.generation;
 const focused=grid.contains(grid.ownerDocument.activeElement)?grid.ownerDocument.activeElement?.dataset?.calendarDate:null;
 const render=async()=>{
  const [{Calendar},{default:dayGridPlugin}]=await loadCalendar();if(generation!==state.generation||!grid.isConnected)return;
  const o=state.options,doc=grid.ownerDocument;
  const dayKey=date=>`${date.getUTCFullYear()}-${String(date.getUTCMonth()+1).padStart(2,'0')}-${String(date.getUTCDate()).padStart(2,'0')}`;
  const groupsFor=day=>{const groups=new Map();for(const entry of o.entries||[]){if(entry.startDate<=day&&entry.endDate>=day){const id=entry.groupId||entry.id;if(!groups.has(id))groups.set(id,[]);groups.get(id).push(entry);}}return groups;};
  const classes=arg=>{const day=dayKey(arg.date),groups=groupsFor(day);return ['calendar-month-cell','events-calendar__day',...(day===o.today?['is-today']:[]),...(day===o.selected?['is-selected']:[]),...(groups.size?['has-events']:[])];};
  const content=arg=>{
   const day=dayKey(arg.date),groups=groupsFor(day),button=doc.createElement('button');button.type='button';button.className='dui-btn dui-btn-ghost calendar-month-date';button.dataset.uiKit='';button.dataset.calendarDate=day;button.dataset.eventsCalendarDate=day;button.setAttribute('aria-pressed',String(day===o.selected));button.setAttribute('aria-label',(o.dateLabel?o.dateLabel(day):new Intl.DateTimeFormat(o.locale||'en',{month:'long',day:'numeric',weekday:'short',timeZone:'UTC'}).format(arg.date))+' · '+groups.size);
   const number=doc.createElement('span');number.textContent=String(arg.date.getUTCDate());button.append(number);
   if(groups.size){const count=doc.createElement('i');count.textContent=String(groups.size);count.setAttribute('aria-hidden','true');button.append(count);}
   button.onclick=()=>state.options.onSelect(day);const nodes=[button];
   if(o.renderEntry){let count=0;for(const group of groups.values()){if(++count>2)break;nodes.push(o.renderEntry(group));}if(groups.size>2){const more=doc.createElement('small');more.className='calendar-month-more';more.textContent='+'+(groups.size-2);nodes.push(more);}}
   return {domNodes:nodes};
  };
  if(!state.calendar){
   state.calendar=new Calendar(grid,{plugins:[dayGridPlugin],locale:calendarLocale(o.locale),timeZone:'UTC',initialView:'dayGridMonth',initialDate:o.month+'-01',headerToolbar:false,dayHeaders:false,firstDay:o.weekStartsOn||0,fixedWeekCount:true,showNonCurrentDates:Boolean(o.showOutside),height:'auto',navLinks:false,editable:false,now:o.today+'T12:00:00',dayCellClassNames:classes,dayCellContent:content});state.calendar.render();
  }else state.calendar.batchRendering(()=>{state.calendar.setOption('locale',calendarLocale(o.locale));state.calendar.setOption('firstDay',o.weekStartsOn||0);state.calendar.setOption('showNonCurrentDates',Boolean(o.showOutside));state.calendar.setOption('dayCellClassNames',classes);state.calendar.setOption('dayCellContent',content);state.calendar.gotoDate(o.month+'-01');});
  grid.dataset.calendarEngine='fullcalendar';if(focused)grid.querySelector(`[data-calendar-date="${focused}"]`)?.focus({preventScroll:true});
 };
 // A closed floating dialog must not fetch the calendar runtime for every reader.
 if(typeof IntersectionObserver!=='undefined'&&!grid.getClientRects().length){
  state.pending=render;if(!state.observer){state.observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){state.observer.disconnect();state.observer=null;state.pending?.();}});state.observer.observe(grid);}return Promise.resolve();
 }
 return render();
}
export function destroyCalendarMonth(grid){const state=calendarInstances.get(grid);if(state){state.generation++;state.observer?.disconnect();state.calendar?.destroy();calendarInstances.delete(grid);}}

const agendaInstances=new WeakMap();
let agendaModules;
export async function renderCalendarAgenda(options){
 const {grid}=options;let state=agendaInstances.get(grid);
 if(!state){state={generation:0};agendaInstances.set(grid,state);}state.options=options;
 const generation=++state.generation;
 const [{Calendar},{default:listPlugin}]=await (agendaModules ||= Promise.all([import('@fullcalendar/core'),import('@fullcalendar/list')]));
 if(generation!==state.generation||!grid.isConnected)return;
 const o=state.options,range=o.selected?{from:o.selected,to:o.selected}:calendarMonthRange(o.month),events=[];
 // Domain points share one activity row per day; FullCalendar owns the list and date headers.
 for(let day=range.from;day<=range.to;day=addCalendarDays(day,1)){
  const groups=new Map();for(const point of o.entries||[]){if(point.startDate<=day&&point.endDate>=day){const id=point.groupId||point.id;if(!groups.has(id))groups.set(id,[]);groups.get(id).push(point);}}
  for(const [id,group] of groups)events.push({id:day+':'+id,start:day,end:addCalendarDays(day,1),allDay:true,extendedProps:{group,day}});
 }
 const empty=()=>{const node=grid.ownerDocument.createElement('div');node.className='community-empty';if(o.selected){const heading=grid.ownerDocument.createElement('h3');heading.textContent=o.dateLabel(o.selected);node.append(heading);}const message=grid.ownerDocument.createElement('p');message.textContent=o.empty;node.append(message);return {domNodes:[node]};};
 const eventContent=arg=>({domNodes:[o.renderEntry(arg.event.extendedProps.group,arg.event.extendedProps.day)]});
 const settings={plugins:[listPlugin],locale:calendarLocale(o.locale),timeZone:'UTC',initialView:o.selected?'listDay':'listMonth',initialDate:range.from,headerToolbar:false,height:'auto',listDayFormat:false,listDaySideFormat:false,dayHeaderContent:arg=>o.dateLabel(arg.date.toISOString().slice(0,10)),eventContent,noEventsContent:empty,events,eventOrder:'start',editable:false,navLinks:false};
 if(!state.calendar){state.calendar=new Calendar(grid,settings);state.calendar.render();}
 else state.calendar.batchRendering(()=>{state.calendar.setOption('locale',calendarLocale(o.locale));state.calendar.setOption('eventContent',eventContent);state.calendar.setOption('noEventsContent',empty);state.calendar.changeView(o.selected?'listDay':'listMonth',range.from);state.calendar.removeAllEventSources();state.calendar.addEventSource(events);});
 grid.dataset.calendarEngine='fullcalendar';
}
