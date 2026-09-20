import type {APIRoute} from 'astro';
import {getEntityRegistry,entityLocales} from '../../lib/entityRegistry.mjs';
export function getStaticPaths(){return entityLocales.map(locale=>({params:{locale}}));}
export const GET:APIRoute=async({params})=>{const r=await getEntityRegistry();return new Response(JSON.stringify({version:2,locale:params.locale,entities:r.list(params.locale).map(e=>({...e.data,path:e.url})),relations:r.list(params.locale).flatMap(e=>r.getOutgoingRelations(e.data.id))}),{headers:{'Content-Type':'application/json; charset=utf-8'}});};
