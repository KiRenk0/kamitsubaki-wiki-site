import type {APIRoute} from 'astro';
import {getEntityRegistry,entityLocales} from '../../lib/entityRegistry.mjs';
export function getStaticPaths(){return entityLocales.map(locale=>({params:{locale}}));}
export const GET:APIRoute=async({params})=>{
 const r=await getEntityRegistry();const entries=r.list(params.locale).flatMap(e=>{
  const issues=[];if(e.fallback)issues.push({kind:'missing-translation',refs:[e.requestedLocale]});if(!e.data.summary)issues.push({kind:'missing-summary'});if(!e.data.sources?.length)issues.push({kind:'missing-sources'});
  if(e.data.entityType==='work-track'&&!e.data.credits?.length)issues.push({kind:'missing-credits'});
  return issues.length?[{id:e.data.id,path:e.url,entityType:e.data.entityType,issues}]:[];
 });return new Response(JSON.stringify({version:2,entries}),{headers:{'Content-Type':'application/json; charset=utf-8'}});
};
