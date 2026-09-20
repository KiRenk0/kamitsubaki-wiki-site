import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import YAML from 'yaml';
import {dateBounds,eventBounds,eventEra,timelineBounds,clusterEvents,DAY} from '../src/lib/chronicleTimeline.mjs';
const {eras}=YAML.parse(await readFile(new URL('../src/data/taxonomy/eras.yml',import.meta.url),'utf8'));
const event=(start,end)=>({id:start,date:{start,...end&&{end}}});
test('four editorial era boundaries are inclusive without inventing dates',()=>{
 assert.equal(eventEra(event('2020-12-31'),eras),eras[0].id);
 assert.equal(eventEra(event('2021-01-01'),eras),eras[1].id);
 assert.equal(eventEra(event('2023'),eras),eras[2].id);
 assert.equal(eventEra(event('2025-01'),eras),eras[3].id);
 assert.equal(eventEra(event('2018-09'),eras),undefined);
});
test('partial dates preserve year/month intervals and leap days',()=>{
 assert.equal((dateBounds('2024-02').end-dateBounds('2024-02').start)/DAY,29);
 assert.equal((dateBounds('2024').end-dateBounds('2024').start)/DAY,366);
 assert.equal((eventBounds(event('2024-01-13','2024-01-14')).end-dateBounds('2024-01-13').start)/DAY,2);
});
test('display ends at data year, never the 2099 era sentinel',()=>assert.equal(new Date(timelineBounds([event('2026-09')],eras).end).getUTCFullYear(),2027));
test('zoom separates dense events without losing or modifying them',()=>{
 const events=[event('2024-01-01'),event('2024-02-01'),event('2024-08-01')],start=dateBounds('2024').start,end=dateBounds('2024').end;
 assert.equal(clusterEvents(events,start,end,148).length,1);
 assert.equal(clusterEvents(events,start,end,3000).length,3);
 assert.deepEqual(clusterEvents(events,start,end,3000).flatMap(c=>c.events),events);
});
