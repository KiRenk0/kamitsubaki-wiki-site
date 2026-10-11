import {filterReaderRecords} from '../lib/readerRecordFilters.mjs';

/** Enhance only an explicitly opted-in list, retaining all records in its local pool. */
export function initReaderRecordFilters(list){
 if(!list.hasAttribute('data-record-filterable')||list.dataset.recordFilterReady)return;
 const controls=list.querySelector('[data-reader-record-filters]');
 const query=list.querySelector('[data-record-query]'),year=list.querySelector('[data-record-year-filter]');
 const grid=list.querySelector('.reader-record-grid');
 const overflow=list.querySelector('[data-artist-collapsible]');
 const inner=overflow?.querySelector('.artist-collapsible__inner');
 const pending=overflow?.querySelector('template[data-directory-overflow]');
 const more=list.querySelector('.artist-expand-btn'),collapse=list.querySelector('[data-artist-collapse]');
 const status=list.querySelector('[data-record-filter-status]'),empty=list.querySelector('[data-record-filter-empty]'),clear=list.querySelector('[data-record-filter-clear]');
 if(!controls||!query||!year||!grid||!status||!empty||!clear)return;
 list.dataset.recordFilterReady='true';
 const rows=[...grid.children,...(inner?.children||[]),...(pending?.content.children||[])];
 const records=rows.map(element=>({element,search:element.dataset.recordSearch||'',year:element.dataset.recordYear||''}));
 const size=8;
 let matches=records,shown=size,composing=false;
 const measure=()=>{if(overflow&&inner&&overflow.dataset.expanded==='true')overflow.style.setProperty('--artist-collapsible-height',`${inner.scrollHeight}px`);};
 if(overflow&&inner&&typeof ResizeObserver!=='undefined')new ResizeObserver(measure).observe(inner);
 function render(){
  // Filtered lists own expansion state; no delayed legacy collapse can affect replacement rows.
  if(overflow)clearTimeout(overflow._collapseTimer);
  grid.replaceChildren();inner?.replaceChildren();
  const visible=matches.slice(0,shown);
  visible.forEach((record,index)=>{
   const row=record.element;row.hidden=false;
   row.classList.toggle('artist-row-collapsed',index>=size);
   row.setAttribute('data-revealed','');row.style.setProperty('--artist-row-order','0');
   const label=row.querySelector('.reader-record-index');if(label)label.textContent=String(index+1).padStart(2,'0');
   (index<size?grid:inner)?.append(row);
  });
  const expanded=visible.length>size;
  if(overflow){
   overflow.dataset.expanded=String(expanded);overflow.dataset.shown=String(Math.max(0,visible.length-size));
   overflow.dataset.total=String(Math.max(0,matches.length-size));
   overflow.setAttribute('aria-hidden',String(!expanded));overflow.inert=!expanded;
   if(expanded)measure();else overflow.style.setProperty('--artist-collapsible-height','0px');
  }
  if(more){
   const count=Math.min(size,Math.max(0,matches.length-visible.length));
   more.hidden=count===0;more.setAttribute('aria-expanded',String(expanded));
   more.setAttribute('aria-label',`${more.dataset.expandLabel} · ${count}`);
   const countLabel=more.querySelector('[data-artist-expand-count]');if(countLabel)countLabel.textContent=`＋${count}`;
  }
  if(collapse)collapse.hidden=!expanded;
  empty.hidden=matches.length>0;clear.hidden=!query.value&&!year.value;
  status.textContent=(status.dataset.recordResultLabel||'{matched} / {total}').replace('{matched}',String(matches.length)).replace('{total}',String(records.length));
 }
 function apply(){matches=filterReaderRecords(records,query.value,year.value);shown=size;render();}
 query.addEventListener('compositionstart',()=>{composing=true;});
 query.addEventListener('compositionend',()=>{composing=false;apply();});
 query.addEventListener('input',event=>{if(!composing&&!event.isComposing)apply();});
 year.addEventListener('change',apply);
 clear.addEventListener('click',()=>{query.value='';year.value='';apply();query.focus({preventScroll:true});});
 more?.addEventListener('click',()=>{shown+=size;render();if(more.hidden)collapse?.focus({preventScroll:true});});
 collapse?.addEventListener('click',()=>{shown=size;render();more?.focus({preventScroll:true});});
 controls.hidden=false;apply();
}
