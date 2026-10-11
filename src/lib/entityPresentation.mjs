import {DATABASE_ARTWORK_FALLBACKS,DATABASE_PLACEHOLDER_IMAGE} from './databaseArtwork.mjs';

/** @typedef {Partial<import('./entityRegistry.mjs').EntityData>} PresentationData */
/** @typedef {import('./entityRegistry.mjs').EntityEdge & {entry: import('./entityRegistry.mjs').ResolvedEntity}} ReaderRelation */

/** @param {PresentationData|null|undefined} data @returns {'artist'|'music'|null} */
export function entityPresentationKind(data){
 if(['person','virtual-avatar','unit','software-voice'].includes(data?.entityType||''))return 'artist';
 if(['work-track','work-release'].includes(data?.entityType||''))return 'music';
 return null;
}

/** @param {unknown} date */
function year(date){return typeof date==='string'&&/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/.test(date)?date.slice(0,4):'';}

/** Activity dates come only from metadata; an archive or unknown state never implies Present.
 * @param {PresentationData|null|undefined} data
 */
export function entityActivityYears(data){
 const lifecycle=data?.lifecycle;const start=year(lifecycle?.startedAt);
 if(!start)return '';
 const end=year(lifecycle?.endedAt);
 if(end)return `${start} — ${end}`;
 return lifecycle?.activity==='active'&&lifecycle?.archive?.mode!=='permanent'?`${start} — PRESENT`:start;
}

/** @param {ReaderRelation[]} relations */
function uniqueRelations(relations){
 const seen=new Set();
 return relations.filter(relation=>{if(seen.has(relation.target))return false;seen.add(relation.target);return true;});
}

/** Group documented incoming participation, leaving unrelated edges in the research path.
 * @param {ReaderRelation[]} relations
 */
export function entityReaderRelations(relations){
 const workEdges=relations.filter(relation=>relation.inverse===true&&['credited-to','performed-by','primaryArtist'].includes(relation.type));
 const liveEdges=relations.filter(relation=>relation.inverse===true&&['headlined-by','guest-performer'].includes(relation.type)&&relation.entry?.data.entityType==='live-event');
 const articleEdges=relations.filter(relation=>relation.entry?.data.entityType==='editorial-article');
 const excluded=new Set([...workEdges,...liveEdges,...articleEdges].map(relation=>relation.target));
 return {
  music:uniqueRelations(workEdges.filter(relation=>relation.entry?.data.entityType==='work-track')),
  albums:uniqueRelations(workEdges.filter(relation=>relation.entry?.data.entityType==='work-release')),
  live:uniqueRelations(liveEdges),
  other:uniqueRelations(relations.filter(relation=>!excluded.has(relation.target))),
  works:uniqueRelations(workEdges),
  articles:uniqueRelations(articleEdges),
 };
}

/** @param {PresentationData|null|undefined} data
 * @param {Pick<import('./entityRegistry.mjs').EntityRegistry,'resolveEntity'>} registry
 * @param {string} locale
 * @returns {{id:string,title:string,url:string}[]}
 */
export function entityLeadArtists(data,registry,locale){
 const ids=[...(data?.primaryArtist?[data.primaryArtist]:[]),...(data?.performers||[]).map(performer=>performer.entity)].filter(id=>Boolean(id));
 return [...new Set(ids)].flatMap(id=>{
  const entry=registry.resolveEntity(id,locale);
  return entry?[{id:entry.data.id,title:entry.data.name||entry.data.title||entry.data.id,url:entry.url}]:[];
 });
}

/** Treat legacy remote nameplates as missing artwork, using confirmed local covers when available.
 * @param {PresentationData|null|undefined} data
 * @returns {{src:string,placeholder:boolean}}
 */
export function entityArtwork(data){
 const authored=typeof data?.presentation?.image==='string'?data.presentation.image.trim():'';
 if(authored&&!/^https?:\/\/(?:www\.)?placehold\.co(?:[/?#]|$)/i.test(authored))return {src:authored,placeholder:false};
 const fallback=DATABASE_ARTWORK_FALLBACKS[data?.id||''];
 return fallback?{src:fallback,placeholder:false}:{src:DATABASE_PLACEHOLDER_IMAGE.src,placeholder:true};
}
