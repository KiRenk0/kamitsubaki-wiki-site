import {readFile,writeFile} from 'node:fs/promises';import {readEntries,writeYaml,hash} from './io.mjs';
const source='../citiao_consolidated/OBJECTIVE_WIKI_DATABASE/04_TIMELINE_CHRONOLOGY/00_MASTER_TIMELINE_TABLE.md';
const entries=(await readEntries()).filter(e=>e.data.locale==='zh'&&e.data.id);const aliases=new Map();
for(const e of entries.filter(e=>!['work-track','work-release','editorial-article','lore-concept'].includes(e.data.entityType)))for(const name of [e.data.name,e.data.romanizedName,e.data.id])if(name&&name.length>1)aliases.set(name.toLowerCase(),e.data.id);
for(const [name,id]of Object.entries({'花谱':'kaf','花譜':'kaf','理芽':'rim','ヰ世界情绪':'isekaijoucho','神椿工作室':'kamitsubaki-studio','カンザキイオリ':'kanzaki-iori','V.W.P':'vwp','音楽的同位体':'musical-isotope','梓川':'azsagawa','大沼パセリ':'onuma-parsley'}))aliases.set(name.toLowerCase(),id);
const years=new Map(),ids=new Set();let invalid=[];
for(const line of (await readFile(source,'utf8')).split('\n')){if(!/^\|\s*`?\d{4}[.\-]/.test(line))continue;const cells=line.split('|').slice(1,-1).map(s=>s.replace(/[`*]/g,'').trim());if(cells.length<4)continue;const [rawDate,title,subjects,category]=cells;
 const date=rawDate.replaceAll('.','-');if(!/^\d{4}(?:-\d{2}){0,2}$/.test(date)){invalid.push({date,title});continue;}
 const id='event-'+hash(date+'|'+title).slice(0,16);if(ids.has(id))continue;ids.add(id);
 const hay=(subjects+' '+title).toLowerCase();const related=[...new Set([...aliases].filter(([name])=>hay.includes(name)).map(([,id])=>id))].map(entity=>({entity,role:'subject'}));
 const tracks=[];if(/同位体|cevio|synthesizer/i.test(hay))tracks.push('isotope-synth');if(/神椿市|アニメ|动画|game|ゲーム|游戏|sinka|深化|少女革命/i.test(hay))tracks.push('project-verse');if(/mbo|kddi|资本|厂牌|組織|组织|pndr|工作室.*成立/i.test(hay))tracks.push('organization-biz');if(!tracks.length||/live|ライブ|演出|专辑|album|单曲|ep|配信/i.test(hay))tracks.push('music-live');
 const announcement=/発表|決定|告知|公告|宣布|发表|公布|知らせ|予約|预告|情報/.test(title)||category.includes('公告');
 const eventTypes=announcement?['announcement']:/演出|live|ライブ/i.test(title)?['live']:/发售|发布|发行|リリース|発売/.test(title)?['release']:['announcement'];
 const e={id,date:{start:date,precision:date.length===10?'day':date.length===7?'month':'year'},text:{zh:{title,summary:title}},tracks:[...new Set(tracks)],eventTypes,importance:'regular',related,sources:[{title:'神椿全景编年大事记总表',type:'compiled-research',reference:'citiao_consolidated/OBJECTIVE_WIKI_DATABASE/04_TIMELINE_CHRONOLOGY/00_MASTER_TIMELINE_TABLE.md'}],importedCategory:category};
 const year=Number(date.slice(0,4));if(!years.has(year))years.set(year,[]);years.get(year).push(e);
}
for(const [year,events]of years)await writeYaml(`src/data/chronicle/${year}.yml`,{schemaVersion:1,year,events});
await writeFile('docs/v3/reports/chronicle-import.json',JSON.stringify({events:ids.size,invalid,source},null,2));console.log({events:ids.size,invalid:invalid.length});
