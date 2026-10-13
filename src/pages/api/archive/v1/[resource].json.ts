import type {APIRoute} from 'astro';
import {getArchiveSnapshot,archiveManifest} from '../../../../lib/archiveSnapshot.mjs';
export function getStaticPaths(){return ['manifest','entities','relations','events','calendar','physical','credits','evidence','translations','issues'].map(resource=>({params:{resource}}));}
export const GET:APIRoute=async({params})=>{
 const snapshot=await getArchiveSnapshot();
 const resource=params.resource;
 const data=resource==='manifest'?archiveManifest(snapshot):{version:1,snapshot:snapshot.snapshot,records:
  resource==='calendar'?snapshot.events.filter(event=>event.date.precision==='day').map(event=>({id:event.id,date:event.date,text:event.text,sources:event.sources || []})):
  resource==='physical'?snapshot.physical:
  resource==='credits'?snapshot.entities.flatMap(entity=>(entity.facts.credits || []).map(credit=>({entityId:entity.id,...credit}))):
  resource==='translations'?snapshot.entities.map(entity=>({id:entity.id,narratives:entity.narratives})):
  snapshot[resource as 'entities'|'relations'|'events'|'evidence'|'issues']};
 return new Response(JSON.stringify(data),{headers:{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*','Cache-Control':'public, max-age=0, must-revalidate','ETag':'"'+snapshot.snapshot+'-'+resource+'"'}});
};
