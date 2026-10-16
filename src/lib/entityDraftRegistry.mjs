import {entityRoute} from './entityModel.mjs';

/** Overlay one unsaved entity for reader previews without mutating the shared
 * registry. References to the edited entry use its current name and summary.
 * @param {import('./entityRegistry.mjs').EntityRegistry} registry
 * @param {import('./entityRegistry.mjs').EntityData} data
 * @param {string} body
 */
export function entityDraftRegistry(registry,data,body){
 if(data.schemaVersion!==2||!data.id||!data.locale)return registry;
 let route;try{route=entityRoute(data);}catch{return registry;}
 const resolveEntity=(id,locale='zh')=>id===data.id?{data,body,filePath:registry.resolveEntity(id,data.locale)?.filePath||'',sourceLocale:data.locale,requestedLocale:locale,fallback:data.locale!==locale,url:`/${locale}${route}`} : registry.resolveEntity(id,locale);
 return {...registry,resolveEntity,resolveEntityUrl:(id,locale='zh')=>resolveEntity(id,locale)?.url,list:(locale='zh')=>{
  const entries=registry.list(locale),existing=entries.some(entry=>entry.data.id===data.id);
  const result=entries.map(entry=>entry.data.id===data.id?resolveEntity(data.id,locale):entry);
  if(!existing)result.push(resolveEntity(data.id,locale));return result;
 }};
}
