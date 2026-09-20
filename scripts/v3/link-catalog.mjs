import {readEntries,writeDocument} from './io.mjs';import {writeFile} from 'node:fs/promises';
const entries=(await readEntries()).filter(e=>e.data.schemaVersion===2),groups=new Map();for(const e of entries){if(!groups.has(e.data.id))groups.set(e.data.id,[]);groups.get(e.data.id).push(e);}
const names=new Map();for(const e of entries.filter(e=>['person','virtual-avatar','unit','software-voice'].includes(e.data.entityType)))for(const name of [e.data.name,e.data.romanizedName])if(name)names.set(name.toLowerCase(),e.data.id);
names.set('カンザキイオリ','kanzaki-iori');names.set('大沼パセリ','onuma-parsley');
const normalize=t=>String(t||'').normalize('NFKC').toLowerCase().replace(/\s*\(feat\..*?\)/g,'').replace(/\s+/g,' ').trim();
const songNames=new Map();for(const e of entries.filter(e=>e.data.entityType==='work-track')){const performers=e.data.performers.length?e.data.performers.map(p=>p.entity):e.data.legacy?.fields.artistId==='grp'?['sinseiki','tsumitobatsu']:[];for(const p of performers){const key=p+'|'+normalize(e.data.title);if(!songNames.has(key))songNames.set(key,new Set());songNames.get(key).add(e.data.id);}}
let tracks=0,credits=0,performers=0;const ambiguous=[];
for(const e of entries){const d=e.data;let changed=false;if(d.entityType==='work-track'){
 if(!d.performers.length){const old=d.legacy?.fields;const ids=old?.artistId==='grp'?['sinseiki','tsumitobatsu']:old?.artistIds||[old?.artistId];d.performers=ids.filter(id=>groups.has(id)).map(entity=>({entity,role:'lead-vocal'}));changed=true;performers++;}
 for(const credit of d.credits||[])if(!credit.entity&&credit.name&&names.has(credit.name.toLowerCase())){credit.entity=names.get(credit.name.toLowerCase());changed=true;credits++;}
 }
 if(d.entityType==='work-release')for(const track of d.tracks||[]){if(track.songId)continue;const candidates=songNames.get(d.primaryArtist+'|'+normalize(track.title));if(candidates?.size===1){track.songId=[...candidates][0];changed=true;tracks++;}else if(candidates?.size>1)ambiguous.push({release:d.id,title:track.title,candidates:[...candidates]});}
 if(changed)await writeDocument(e.path,d,e.body);
}
await writeFile('docs/v3/reports/catalog-links.json',JSON.stringify({tracks,credits,performers,ambiguous},null,2));console.log({tracks,credits,performers,ambiguous:ambiguous.length});
