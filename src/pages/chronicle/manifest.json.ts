import type {APIRoute} from 'astro';
import {loadFeatureData} from '../../lib/featureData.mjs';

export const GET:APIRoute=async()=>{
 const data=await loadFeatureData();
 const events=Object.fromEntries(data.events.filter(event=>event.publicationVersion).map(event=>[event.id,event.publicationVersion]));
 return new Response(JSON.stringify({schemaVersion:1,events}),{headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'public, max-age=60'}});
};
