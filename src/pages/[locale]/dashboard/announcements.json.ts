import type {APIRoute} from 'astro';
import {getCollection} from '../../../lib/contentAuditContext';
import {getLocalizedEntries} from '../../../lib/homeData.mjs';
import {dashboardAnnouncementIndex} from '../../../lib/dashboardAnnouncements.mjs';
import {supportedLocales} from '../../../lib/i18n.mjs';
export const prerender=true;
export function getStaticPaths(){return supportedLocales.map(locale=>({params:{locale}}));}
export const GET:APIRoute=async({params})=>Response.json(dashboardAnnouncementIndex(getLocalizedEntries(await getCollection('announcements'),params.locale),{includeDrafts:import.meta.env.DEV}),{headers:{'Cache-Control':import.meta.env.DEV?'no-store':'public, max-age=60'}});
