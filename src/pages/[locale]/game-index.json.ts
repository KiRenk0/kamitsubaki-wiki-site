import type {APIRoute} from 'astro';
import {getEntityRegistry,entityLocales} from '../../lib/entityRegistry.mjs';
import {entityLabel} from '../../lib/entityLabels.mjs';
export function getStaticPaths(){return entityLocales.map(locale=>({params:{locale}}));}
export const GET:APIRoute=async({params})=>{
 const locale=params.locale||'zh',r=await getEntityRegistry();
 const kind=(type:string)=>['person','virtual-avatar','unit','software-voice'].includes(type)?'artist':type==='work-track'?'song':type==='work-release'?'album':type==='project'?'project':null;
 const entries=r.list(locale).filter(e=>kind(e.data.entityType));
 const keys=new Map(entries.map(e=>[e.data.id,`${kind(e.data.entityType)}:${e.data.id}`]));
 const items=entries.map(e=>({kind:kind(e.data.entityType),id:e.data.id,title:e.data.name||e.data.title,subtitle:e.data.romanizedName||e.data.romanizedTitle,href:e.url,accentColor:e.data.presentation?.theme?.accentColor||'#89f5df',relatedKey:e.data.id,facts:[entityLabel(e.data.entityType,locale),e.data.releaseDate||e.data.lifecycle?.startedAt,e.data.summary].filter(Boolean).slice(0,4),connections:[...new Set(r.getRelations(e.data.id).map(edge=>keys.get(edge.target)).filter(Boolean))].slice(0,18)}));
 return new Response(JSON.stringify({locale,items}),{headers:{'Content-Type':'application/json; charset=utf-8'}});
};
