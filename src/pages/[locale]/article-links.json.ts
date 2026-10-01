import type {APIRoute} from 'astro';
import {getEntityRegistry,entityLocales} from '../../lib/entityRegistry.mjs';
import legacy from '../../data/article-legacy.json';
export function getStaticPaths(){return entityLocales.map(locale=>({params:{locale}}));}
export const GET:APIRoute=async({params})=>{const registry=await getEntityRegistry();return Response.json({entries:registry.list(params.locale).map(e=>({data:{id:e.data.id,name:e.data.name,title:e.data.title,romanizedName:e.data.romanizedName,romanizedTitle:e.data.romanizedTitle,entityType:e.data.entityType,performers:e.data.performers,primaryArtist:e.data.primaryArtist},url:e.url,body:''})),legacy:legacy.filter(e=>e.locale==='zh').map(e=>registry.resolveEntity(e.id,params.locale)).filter(Boolean),redirects:[...registry.legacyRoutes]});};
