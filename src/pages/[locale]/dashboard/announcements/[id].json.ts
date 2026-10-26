import type {APIRoute} from 'astro';
import {getCollection} from '../../../../lib/contentAuditContext';
import {getLocalizedEntries} from '../../../../lib/homeData.mjs';
import {renderAnnouncement} from '../../../../lib/announcements.mjs';
import {supportedLocales} from '../../../../lib/i18n.mjs';
export const prerender=true;
export async function getStaticPaths(){
 const entries=await getCollection('announcements');
 return supportedLocales.flatMap(locale=>getLocalizedEntries(entries,locale).filter(e=>import.meta.env.DEV||!e.data.draft).map(entry=>({params:{locale,id:entry.data.translationKey||entry.id},props:{entry}})));
}
export const GET:APIRoute=async({props})=>Response.json(await renderAnnouncement(props.entry),{headers:{'Cache-Control':import.meta.env.DEV?'no-store':'public, max-age=60'}});
