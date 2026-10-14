import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {calendarMonthRange,shiftCalendarMonth,renderCalendarMonth} from '../src/lib/calendarMonth.js';
import {getEventDateKey} from '../src/lib/liveEventsClient.js';
test('the official calendar and community adapter retain their own date boundaries',()=>{
 const event={startAt:'2026-10-13T23:30:00-04:00'},official=getEventDateKey(event);assert.equal(official,'2026-10-14');
 const dom=new JSDOM('<div id="official"></div><div id="community"></div>'),doc=dom.window.document;
 try{renderCalendarMonth({grid:doc.querySelector('#official'),month:'2026-10',today:official,selected:official,entries:[{id:'official',startDate:official,endDate:official}],onSelect(){}});renderCalendarMonth({grid:doc.querySelector('#community'),month:'2026-10',today:'2026-10-13',selected:'2026-10-13',weekStartsOn:1,showOutside:true,entries:[{id:'main',groupId:'event',startDate:'2026-10-13',endDate:'2026-10-13'},{id:'deadline',groupId:'event',startDate:'2026-10-13',endDate:'2026-10-13'}],onSelect(){}});
 assert.equal(doc.querySelector('#official [data-calendar-date="2026-10-14"] i').textContent,'1');assert.equal(doc.querySelector('#official [data-calendar-date="2026-10-13"] i'),null);assert.equal(doc.querySelector('#community [data-calendar-date="2026-10-13"] i').textContent,'1');assert.equal(doc.querySelector('#community [data-calendar-date="2026-10-14"] i'),null);
 }finally{dom.window.close();}
});
test('one shared grid covers cross-month dates, deduplicates activity points and emits date selection',()=>{
 const dom=new JSDOM('<div id="grid"></div>'),grid=dom.window.document.querySelector('#grid');let selected;try{renderCalendarMonth({grid,month:'2026-10',selected:'2026-10-31',today:'2026-10-14',locale:'zh',weekStartsOn:1,showOutside:true,entries:[{id:'main',groupId:'one',startDate:'2026-10-30',endDate:'2026-11-02'},{id:'deadline',groupId:'one',startDate:'2026-10-31',endDate:'2026-10-31'}],onSelect(day){selected=day;}});assert.equal(grid.children.length,42);assert.equal(grid.querySelector('[data-calendar-date="2026-10-31"] i').textContent,'1');assert.equal(grid.querySelector('[data-calendar-date="2026-11-02"] i').textContent,'1');grid.querySelector('[data-calendar-date="2026-11-02"]').click();assert.equal(selected,'2026-11-02');assert.equal(grid.querySelector('[data-calendar-date="2026-10-31"]').getAttribute('aria-pressed'),'true');}finally{dom.window.close();}
});
test('the shared month navigation handles leap days, week starts and year rollover',()=>{
 assert.deepEqual(calendarMonthRange('2024-02'),{from:'2024-02-01',to:'2024-02-29'});assert.deepEqual(calendarMonthRange('2026-10',{weekStartsOn:1,includeOutside:true}),{from:'2026-09-28',to:'2026-11-08'});assert.equal(shiftCalendarMonth('2026-12',1),'2027-01');assert.equal(shiftCalendarMonth('2026-01',-1),'2025-12');
});

test('re-rendering a selected date retains keyboard focus on the shared date button',()=>{
 const dom=new JSDOM('<div id="grid"></div>'),grid=dom.window.document.querySelector('#grid');let selected='2026-10-01';const render=()=>renderCalendarMonth({grid,month:'2026-10',selected,today:'2026-10-14',showOutside:true,onSelect(day){selected=day;render();}});try{render();const button=grid.querySelector('[data-calendar-date="2026-10-13"]');button.focus();button.click();assert.equal(selected,'2026-10-13');assert.equal(dom.window.document.activeElement.dataset.calendarDate,'2026-10-13');assert.equal(dom.window.document.activeElement.getAttribute('aria-pressed'),'true');}finally{dom.window.close();}
});
