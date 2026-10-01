import {entityLabel} from './entityLabels.mjs';
export function buildEntityMusicCatalog(registry,locale){
 const name=id=>{const d=registry.resolveEntity(id,locale)?.data;return d?.name||d?.title||id;};
 const card=e=>{const d=e.data;const artists=d.performers?.map(p=>p.entity)||[d.primaryArtist].filter(Boolean);const cover=artists.map(id=>registry.resolveEntity(id,locale)?.data.presentation?.image).find(Boolean);return {href:e.url,title:d.title,subtitle:artists.map(name).join(' / '),image:d.presentation?.image||cover||null,primaryInfo:d.duration||d.releaseDate||null,secondaryInfo:d.duration?d.releaseDate:null};};
 return {songs:registry.list(locale).filter(e=>e.data.entityType==='work-track').map(card),albums:registry.list(locale).filter(e=>e.data.entityType==='work-release').map(card)};
}
export function buildEntityProjectCards(registry,locale){return registry.list(locale).filter(e=>e.data.entityType==='project').map(e=>({id:e.data.id,href:e.url,title:e.data.title||e.data.name,description:e.data.summary||'',categoryTitle:entityLabel('project',locale),categorySlug:'projects',kind:e.data.status}));}
