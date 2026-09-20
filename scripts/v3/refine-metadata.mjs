import {readFile,writeFile} from 'node:fs/promises';
import {readEntries,writeDocument} from './io.mjs';
const entries=await readEntries();const changes=[];
const redirectPath='src/data/entity-redirects.json';
let redirects={};try{redirects=JSON.parse(await readFile(redirectPath,'utf8'));}catch{}
const named=new Map();for(const e of entries.filter(e=>e.data.locale==='zh'))for(const name of [e.data.id,e.data.name,e.data.romanizedName])if(name)named.set(name.toLowerCase(),e.data.id);
const organizations=['kyokai-studio','allt-studio','unknown-lab'];
const obsolete=['categoryTitle','categorySubtitle','categorySlug','categoryOrder','itemOrder','statusLabel','inactive','image','theme','code','artistId','artistIds','featuredEntries','designCredits','debutDate','meta','order','kind','profileTagline','description'];
for(const e of entries){const d=e.data;if(d.schemaVersion!==2)continue;const before=structuredClone(d);
 if(d.legacy){redirects[`/${d.legacy.collection}/${d.legacy.entryPath}/`]=d.id;}
 if(organizations.includes(d.id)){d.entityType='organization';d.orgType='creative-studio';d.parentOrg='thinkr';d.name=d.name||d.title;delete d.title;delete d.status;}
 if(d.id==='sooda'){d.entityType='unit';d.roles=['virtual-group'];d.lifecycle??={activity:'unknown'};}
 if(d.id==='thinkr')d.orgType='parent-company';
 if(['girls-revolution','girls-revolution-label','sinsekai-record','anarchic-record','phenomenon-record'].includes(d.id))d.orgType='record-label';
 if(d.id==='pndr')d.orgType='platform';
 if(['bema','loluet'].includes(d.id))d.roles=['vocalist'];
 if(d.id==='kaika')d.name=d.locale==='zh'?'廻花':d.locale==='ja'?'廻花':'KAIKA';
 if(d.id==='kawasaki')d.name=d.locale==='en'?'Kawasaki':'川サキ';
 if(d.id==='tsukisimasouki')d.name=d.locale==='en'?'Souki Tsukishima':d.locale==='ja'?'月島総記':'月岛总记';
 d.summary??=d.profileTagline||d.description;
 d.presentation??={};if(d.order!==undefined)d.presentation.sortOrder??=d.order;
 if(d.debutDate&&d.lifecycle)d.lifecycle.startedAt??=d.debutDate;
 for(const value of d.designCredits||[]){const name=String(value).split(/[:：]/).at(-1).trim();const target=named.get(name.toLowerCase());if(target&&['virtual-avatar','software-voice'].includes(d.entityType)&&!d.relations?.some(r=>r.type==='character-designed-by'&&r.target===target))(d.relations??=[]).push({type:'character-designed-by',target});}
 if(d.legacy?.fields?.featuredEntries)for(const link of d.legacy.fields.featuredEntries){const route=link.href.replace(/^\/(zh|ja|en|zh-tw|zh-hk)/,'').replace(/\/?$/,'/');const target=entries.find(x=>x.data.legacy&&`/${x.data.legacy.collection}/${x.data.legacy.entryPath}/`===route)?.data;if(!target||target.id===d.id)continue;const type=target.entityType==='project'?'related-project':target.entityType==='organization'?'affiliated-with':null;if(type&&!d.relations?.some(r=>r.type===type&&r.target===target.id))(d.relations??=[]).push({type,target:target.id});}
 if(d.seo?.title){d.seo.titleOverride=d.seo.title;delete d.seo.title;}
 for(const key of obsolete)delete d[key];
 if(['person','virtual-avatar','unit','software-voice'].includes(d.entityType))delete d.status;
 // Archived values remain in the immutable migration audit; live metadata contains only v2 fields.
 delete d.legacy;
 if(JSON.stringify(before)!==JSON.stringify(d)){changes.push({path:e.path,id:d.id,before,after:d});await writeDocument(e.path,d,e.body);}
}
await writeFile(redirectPath,JSON.stringify(redirects,null,2)+'\n');
await writeFile('docs/v3/reports/metadata-refinement.json',JSON.stringify(changes,null,2)+'\n');
console.log({refined:changes.length,redirects:Object.keys(redirects).length});
