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
export function renderCalendarMonth({grid,month,selected,today,locale='en',weekStartsOn=0,showOutside=false,entries=[],dateLabel,onSelect,renderEntry}) {
 const doc=grid.ownerDocument,range=calendarMonthRange(month,{weekStartsOn,includeOutside:true}),focusedDate=grid.contains(doc.activeElement)?doc.activeElement?.dataset?.calendarDate:undefined;grid.replaceChildren();
 const formatter=new Intl.DateTimeFormat(locale,{month:'long',day:'numeric',weekday:'short',timeZone:'UTC'});
 for(let index=0;index<42;index++){
  const day=addCalendarDays(range.from,index),outside=!day.startsWith(month),cell=doc.createElement('div');cell.className='events-calendar__day calendar-month-cell';cell.dataset.selected=String(day===selected);
  if(outside){cell.classList.add('events-calendar__day--outside');cell.dataset.outside='true';}
  if(day===today)cell.classList.add('is-today');if(day===selected)cell.classList.add('is-selected');
  if(outside&&!showOutside){cell.setAttribute('aria-hidden','true');grid.append(cell);continue;}
  const matching=entries.filter(entry=>entry.startDate<=day&&entry.endDate>=day),groups=new Map();for(const entry of matching){const id=entry.groupId||entry.id;if(!groups.has(id))groups.set(id,[]);groups.get(id).push(entry);}
  if(groups.size)cell.classList.add('has-events');
  const button=doc.createElement('button');button.type='button';button.className='dui-btn dui-btn-ghost calendar-month-date';button.dataset.uiKit='';button.dataset.calendarDate=day;button.dataset.eventsCalendarDate=day;button.setAttribute('aria-pressed',String(day===selected));button.setAttribute('aria-label',(dateLabel?dateLabel(day):formatter.format(new Date(day+'T12:00Z')))+' · '+groups.size);
  const number=doc.createElement('span');number.textContent=String(Number(day.slice(-2)));button.append(number);
  if(groups.size){const count=doc.createElement('i');count.textContent=String(groups.size);count.setAttribute('aria-hidden','true');button.append(count);}
  button.onclick=()=>onSelect(day);cell.append(button);
  if(renderEntry){let count=0;for(const group of groups.values()){if(++count>2)break;cell.append(renderEntry(group));}if(groups.size>2){const more=doc.createElement('small');more.className='calendar-month-more';more.textContent='+'+(groups.size-2);cell.append(more);}}
  grid.append(cell);
 }
 if(focusedDate)grid.querySelector(`[data-calendar-date="${focusedDate}"]`)?.focus({preventScroll:true});
}

