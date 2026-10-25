import {setLoadingStatus} from '../lib/loadingStatus.mjs';
import {api,state,locale} from './accountStore.js';
import {benefitsCopy} from '../lib/benefitsCopy.mjs';
const c=benefitsCopy(locale);
function init(){
 const root=document.querySelector('[data-account-benefits]');if(!root||root.dataset.ready)return;root.dataset.ready='true';
 const status=root.querySelector('[data-benefit-status]'),view=root.querySelector('[data-benefit-view]');let owner=null,loaded=false,busy=false,reloadAfterSwitch=false;
 const el=(tag,text,parent=view)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=String(text);parent.append(n);return n;};
 const button=(label,fn,parent=view)=>{const b=el('button',label,parent);b.type='button';b.className='account-button';b.addEventListener('click',fn);return b;};
 const date=v=>v?new Date(v).toLocaleString(locale):c.pending;
 async function call(path,options){const id=state.viewer?.userId;if(!id)throw Error('login_required');const result=await api('/api/supporter-benefits'+(path.startsWith('/?')?path.slice(1):path==='/'?'':path),options);if(state.viewer?.userId!==id)throw Error('account_changed');return result.data;}
 async function perform(task,feedback=c.success){if(busy)return;busy=true;setLoadingStatus(status,c.loading);try{await task();status.textContent=feedback;}catch(e){status.textContent=e.data?.error?.message||c.failure;}finally{busy=false;if(reloadAfterSwitch){reloadAfterSwitch=false;if(state.viewer&&location.hash==='#benefits')queueMicrotask(()=>void load());}}}
 async function load(){if(!state.viewer){owner=null;loaded=false;view.replaceChildren();status.textContent='';return;}if(busy)return;owner=state.viewer.userId;await perform(async()=>{const data=await call('/');view.replaceChildren();renderList(data);loaded=true;},'');}
 function renderList(data){
  const e=data.eligibility;el('p',c.rank+'：'+c.rankLabels[e.rank]+' · '+(e.validUntil?c.until+' '+date(e.validUntil):c.expired));if(e.tiers.length)el('p',c.groups+'：'+e.tiers.map(t=>c.tierLabels[t]||t).join('、'));el('p',c.retained);
  if(!data.items.length)el('p',c.empty);
  const items=el('ul');items.className='account-benefit-items';const appendItems=records=>{for(const item of records){const li=el('li',undefined,items);el('span',item.title+' · '+date(item.published_at)+' ',li);button(c.open,()=>void open(item.id),li);}};appendItems(data.items);
  if(data.hasMore){const more=button(c.more,()=>void perform(async()=>{const next=await call('/?page='+(data.page+1));appendItems(next.items);data.page=next.page;more.disabled=!next.hasMore;}));}
  el('h3',c.history);const history=el('ul');history.className='account-benefit-history';const appendHistory=records=>{for(const order of records)el('li',date(order.paid_at)+' · ¥'+(order.amount_minor/100).toFixed(2)+' · '+(c.tierLabels[order.tier]||order.tier)+' · '+date(order.starts_at)+' — '+date(order.ends_at),history);};appendHistory(data.history||[]);
  if(data.historyHasMore){const more=button(c.more,()=>void perform(async()=>{const next=await call('/?historyPage='+(data.historyPage+1));appendHistory(next.history);data.historyPage=next.historyPage;more.disabled=!next.historyHasMore;}));}
  el('h3',c.preferences);const f=el('form');f.className='account-benefit-preferences';const prefs=data.preferences,inputs={};for(const [key,label] of [['contentUpdates',c.content],['reviewUpdates',c.review],['expiryReminders',c.expiry]]){const l=el('label',undefined,f),i=el('input',undefined,l);i.type='checkbox';i.checked=Boolean(prefs[{contentUpdates:'content_updates',reviewUpdates:'review_updates',expiryReminders:'expiry_reminders'}[key]]);inputs[key]=i;el('span',label,l);el('br',undefined,f);}
  const submit=el('button',c.save,f);submit.type='submit';submit.className='account-button';f.addEventListener('submit',event=>{event.preventDefault();void perform(async()=>{await call('/preferences',{method:'POST',body:{version:prefs.version,...Object.fromEntries(Object.entries(inputs).map(([k,i])=>[k,i.checked]))}});prefs.version++;});});
 }
 async function open(id){await perform(async()=>{const item=await call('/content/'+encodeURIComponent(id));renderContent(item);},'');}
 function renderContent(item){view.replaceChildren();button(c.back,()=>void load());el('h3',item.title);const body=el('div',item.body);body.className='account-benefit-body';body.style.whiteSpace='pre-wrap';if(item.closes_at)el('p',c.deadline+'：'+date(item.closes_at));
  if(item.kind==='poll'){
   const form=el('form'),boxes=[];for(const [i,option] of item.config.options.entries()){const l=el('label',undefined,form),input=el('input',undefined,l);input.type=item.config.maxChoices===1?'radio':'checkbox';input.name='choice';input.value=String(i);input.checked=item.vote?.choices.includes(i)||false;input.disabled=!item.eligibleNow||Date.parse(item.closes_at)<=Date.now();boxes.push(input);el('span',option,l);el('br',undefined,form);}
   if(item.eligibleNow&&Date.parse(item.closes_at)>Date.now()){const submit=el('button',c.vote,form);submit.className='account-button';form.addEventListener('submit',event=>{event.preventDefault();void perform(async()=>{await call('/content/'+item.id+'/vote',{method:'POST',body:{choices:boxes.filter(b=>b.checked).map(b=>Number(b.value)),version:item.vote?.version||0}});renderContent(await call('/content/'+item.id));});});}
   if(item.results){el('h4',c.result);item.results.forEach((total,i)=>el('p',item.config.options[i]+'：'+total));}
  }
  if(item.kind==='beta'){
   el('p',c.eligibility);const applications=item.applications?.length?item.applications:item.application?[{...item.application,delivery:item.delivery}]:[];
   if(applications.length){for(const application of applications){const record=el('section');record.className='account-benefit-application';el('p',c.status+'：'+(c.states[application.state]||application.state),record);el('p',application.application,record);if(application.reason)el('p',c.reason+'：'+application.reason,record);if(application.delivery){const link=el('a',c.entry,record);link.href=application.delivery.url;link.target='_blank';link.rel='noopener noreferrer';if(application.delivery.code)el('p',c.code+'：'+application.delivery.code,record);}}}
   else if(item.eligibleNow&&Date.parse(item.closes_at)>Date.now()){const form=el('form'),label=el('label',c.application,form),text=el('textarea',undefined,label);text.required=true;text.maxLength=4000;const submit=el('button',c.apply,form);submit.className='account-button';form.addEventListener('submit',event=>{event.preventDefault();void perform(async()=>{await call('/content/'+item.id+'/apply',{method:'POST',body:{application:text.value}});renderContent(await call('/content/'+item.id));});});}

  }
 }
 root.querySelector('[data-benefit-refresh]').addEventListener('click',()=>void load());
 function update(){if(owner!==state.viewer?.userId){if(busy)reloadAfterSwitch=true;view.replaceChildren();loaded=false;owner=state.viewer?.userId||null;}if(state.viewer&&location.hash==='#benefits'&&!loaded)void load();if(!state.viewer){view.replaceChildren();status.textContent='';}}
 window.addEventListener('kamitsubaki-account-state',update);window.addEventListener('hashchange',update);window.addEventListener('popstate',update);root.closest('[data-account-page]')?.querySelectorAll('a[href="#benefits"]').forEach(a=>a.addEventListener('click',()=>queueMicrotask(update)));update();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
