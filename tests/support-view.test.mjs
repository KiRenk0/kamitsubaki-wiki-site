import test from 'node:test';
import assert from 'node:assert/strict';
import { renderSupportData, validSupportPayload, supportLink, supporterAvatar } from '../src/lib/supportView.mjs';

const t=zh=>({zh,en:zh});
const copy=new Proxy({}, {get:(_,key)=>key});
function payload() {return {data:{currency:'CNY',channels:[{id:'main',name:t('Afdian'),description:t('Support'),url:'https://example.com/support'}],costs:[],sponsors:[],annualReports:[{year:2026,currency:'CNY',received:0,spent:10.25,asOf:'2026-09-08',note:null,reportUrl:null,entries:[{date:'2026-09-08',type:'expense',amount:10.25,description:t('Hosting')}]}]}};}

test('support view renders zero, negative balance, ledger and empty sponsor wall from the public contract',()=>{
  const input=payload();assert.equal(validSupportPayload(input),true);
  const view=renderSupportData(input.data,copy,'en');
  assert.match(view.channels,/https:\/\/example.com\/support/);assert.match(view.reports,/CNY.*0\.00/);assert.match(view.reports,/-CNY.*10\.25/);
  assert.match(view.reports,/Hosting/);assert.match(view.wall,/wallEmpty/);
  input.data.annualReports[0].received=null;assert.match(renderSupportData(input.data,copy,'en').reports,/is-pending/);
});
test('support view rejects incomplete API data and escapes all stored labels and links',()=>{
  for(const input of [null,{}, {data:[]}, {data:{channels:[]}}])assert.equal(validSupportPayload(input),false);
  const input=payload();input.data.sponsors=[{name:'Hidden',public:false}];assert.equal(validSupportPayload(input),false);
  input.data.sponsors=[{name:'<img src=x onerror=alert(1)>',public:true,url:'javascript:alert(1)'}];
  input.data.channels[0].name=t('</h3><script>alert(1)</script>');
  const view=renderSupportData(input.data,copy,'en');assert.doesNotMatch(view.wall,/<img|javascript:/);assert.doesNotMatch(view.channels,/<script>/);
  assert.match(view.wall,/&lt;img/);assert.equal(supportLink('https://user:pass@example.com'),'');
});


test('unified supporters expose only display fields and constrain avatars to public assets',()=>{
 const data=payload().data;data.sponsors=[{name:'Display',public:true,email:'private@example.com',orderNo:'12345678901234567890',amountMinor:99999,avatarUrl:'/api/supporters/avatars/00000000-0000-4000-8000-000000000001'}];
 const view=renderSupportData(data,copy,'en','http://127.0.0.1:8788');assert.match(view.wall,/127.0.0.1:8788/);assert.doesNotMatch(view.wall,/private@example|12345678901234567890|99999/);
 for(const raw of ['javascript:alert(1)','https://unknown.example/a.png','https://pic1.afdiancdn.com:8443/a.png','https://api.kamitsubaki.wiki/api/private/avatar'])assert.equal(supporterAvatar(raw),'');
 assert.equal(supporterAvatar('https://pic1.afdiancdn.com/avatar/a.png'),'https://pic1.afdiancdn.com/avatar/a.png');
 data.channels[0].id='afdian';assert.equal(renderSupportData(data,copy,'en',undefined,true).channels,'');
});
