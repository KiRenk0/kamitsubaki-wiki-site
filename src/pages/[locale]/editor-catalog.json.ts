import type { APIRoute } from 'astro';
import { getBuildCollection as getCollection } from '../../lib/contentAuditContext';
import { entrySourcePath } from '../../lib/editorSourceServer.mjs';
import { editorLocales } from '../../lib/editorSource.mjs';
import { getEntityRegistry } from '../../lib/entityRegistry.mjs';
import { entityRoute } from '../../lib/entityModel.mjs';
import { entityLabel } from '../../lib/entityLabels.mjs';
export const prerender = true;
export function getStaticPaths() { return editorLocales.map(locale=>({params:{locale}})); }
export const GET: APIRoute = async ({params}) => {
  const locale = editorLocales.includes(params.locale ?? '') ? params.locale! : 'zh';
  const kinds = ['songs', 'projects', 'logs', 'people', 'units', 'isotopes', 'releases', 'lives', 'organizations', 'lore'] as const;
  // These exact routes are also used by the static V3 entity pages. Include
  // locale fallbacks, so a link stays valid even without a translated source.
  const entities = (await getEntityRegistry()).list(locale)
    .map(entry => {
      const path = entrySourcePath(entry);
      return {kind:path.split('/')[2],id:entry.data.id,entityType:entry.data.entityType,typeLabel:entityLabel(entry.data.entityType,locale),
        title:entry.data.name || entry.data.title || entry.data.id,
        summary:entry.data.summary||'',image:entry.data.presentation?.image||'',
        romanized:entry.data.romanizedName || entry.data.romanizedTitle || '',
        aliases:Array.isArray(entry.data.aliases) ? entry.data.aliases : [],
        path,sourceLocale:entry.sourceLocale,url:`/${locale}${entityRoute(entry.data)}`};
    }).filter(entry=>kinds.includes(entry.kind as typeof kinds[number]));
  // Older sources remain selectable as metadata IDs, but do not advertise a
  // public link until a canonical V3 page exists for them.
  const legacyGroups = await Promise.all(kinds.map(async kind => (await getCollection(kind))
    .filter(entry=>entry.data.locale === locale && entry.data.schemaVersion !== 2)
    .map(entry=>({kind,id:'id' in entry.data?entry.data.id:entry.id,
      entityType:'entityType' in entry.data?entry.data.entityType:undefined,
      title:'name' in entry.data ? entry.data.name : entry.data.title,
      path:entrySourcePath(entry),url:null}))));
  return new Response(JSON.stringify([...entities,...legacyGroups.flat()]),{headers:{'Content-Type':'application/json; charset=utf-8'}});
};
