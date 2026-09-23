import {entityLabel} from '../../lib/entityLabels.mjs';
import type {APIRoute} from 'astro';
import {getEntityRegistry,entityLocales} from '../../lib/entityRegistry.mjs';
export function getStaticPaths(){return entityLocales.map(locale=>({params:{locale}}));}
export const GET:APIRoute=async({params})=>{
 const registry=await getEntityRegistry();
 return Response.json({entities:registry.list(params.locale).filter(e=>e.data.entityType!=='editorial-article').map(e=>({id:e.data.id,name:e.data.name||e.data.title||e.data.id,aliases:e.data.aliases||[],type:e.data.entityType,typeLabel:entityLabel(e.data.entityType,params.locale),image:e.data.presentation?.image||'',path:e.url}))});
};
