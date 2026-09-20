import type {APIRoute} from 'astro';
import {getEntityRegistry,entityLocales} from '../../lib/entityRegistry.mjs';
import {loadFeatureData} from '../../lib/featureData.mjs';
import {buildEntityLabsCatalog} from '../../lib/labsCatalog.mjs';
import {thumbnailUrl} from '../../lib/imageAssets.mjs';
export function getStaticPaths(){return entityLocales.map(locale=>({params:{locale}}));}
export const GET:APIRoute=async({params})=>{const catalog=buildEntityLabsCatalog(await getEntityRegistry(),await loadFeatureData(),params.locale||'zh');for(const node of catalog.nodes)if(node.image)node.image=thumbnailUrl(node.image,192);return new Response(JSON.stringify(catalog),{headers:{'Content-Type':'application/json; charset=utf-8'}});};
