import {authorableRelations} from './entityContract.mjs';
/** Schema v2 is the only authored encyclopedia model; no legacy transforms. */
export function createEntitySchema(z){
 const id=z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
 const text=z.string().min(1);
 const date=z.string().regex(/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/);
 const url=z.string().refine(s=>/^https?:\/\/[^\s]+$/.test(s)||/^\/(?!\/)[^\s]*$/.test(s),'Expected HTTP URL or absolute site path');
 const roles=z.array(z.enum(['virtual-singer','singer-songwriter','vocalist','composer','lyricist','arranger','producer','illustrator','visual-director','scenario-writer','virtual-group','software-voice','mixer']));
 const lifecycle=z.object({activity:z.enum(['active','hiatus','ended','unknown']),startedAt:date.optional(),endedAt:date.nullable().optional(),archive:z.object({mode:z.enum(['none','permanent']),archiveDate:date.nullable().optional(),archiveNote:z.string().nullable().optional()}).optional()});
 const relations=z.array(z.object({type:z.enum(Object.keys(authorableRelations)),target:id,startDate:date.optional(),endDate:date.optional()}));
 const affiliations=z.array(z.object({organization:id,current:z.boolean(),type:z.string().optional(),startDate:date.optional(),endDate:date.optional(),endReason:z.enum(['independent','completed','transferred']).optional()}));
 const track=z.object({songId:id.optional(),title:z.string().optional(),disc:z.number().int().positive().optional(),number:z.string().optional(),artist:z.string().optional(),duration:z.string().optional(),legacySongId:z.string().optional()});
 const base={generated:z.boolean().optional(),generatedFrom:z.string().optional(),generatedFromHash:z.string().optional(),schemaVersion:z.literal(2),id,locale:z.enum(['zh','ja','en','zh-tw','zh-hk']),
  name:text.optional(),title:text.optional(),romanizedName:text.optional(),romanizedTitle:text.optional(),ruby:z.string().optional(),summary:z.string().optional(),aliases:z.array(z.string()).optional(),relations:relations.optional(),sources:z.array(z.object({id:z.string().optional(),title:text,url:url.optional(),type:z.string().optional(),publisher:z.string().optional(),page:z.string().optional(),publishedAt:date.optional()}).strict()).optional(),
  presentation:z.object({image:url.optional(),sortOrder:z.number().optional(),badge:z.string().optional(),theme:z.object({name:z.string().optional(),accentColor:z.string(),mutedColor:z.string().optional(),surfaceColor:z.string().optional(),highlightColor:z.string().optional(),palette:z.array(z.object({label:z.string(),value:z.string()})).optional()}).optional(),morphing:z.object({group:id,slot:z.string(),order:z.number()}).optional()}).optional(),
  officialLinks:z.array(z.object({url,label:z.string().optional(),platform:z.string().optional()})).optional(),
  seo:z.object({titleOverride:z.string().optional(),description:z.string().optional(),image:z.string().optional(),keywords:z.array(z.string()).optional(),noindex:z.boolean().optional()}).optional(),
  license:z.object({code:z.enum(['CC-BY-NC-SA-4.0','CC-BY-NC-SA-3.0-CN','rights-reserved','authorized-use']),attribution:z.string().optional(),sourceTitle:z.string().optional(),sourceUrl:url.optional(),modifications:z.string().optional(),note:z.string().optional()}).optional(),
  contentStatus:z.enum(['stub','published']).optional(),researchImport:z.object({source:z.string(),sha256:z.string(),importedAt:date}).optional(),
  tags:z.array(z.string()).optional(),
 };
 const entity=(type,fields)=>z.object({...base,entityType:z.literal(type),...fields}).strict();
 const person={name:text,romanizedName:text,roles:roles.min(1),lifecycle,affiliations:affiliations.optional()};
 return z.discriminatedUnion('entityType',[
  entity('person',person),entity('virtual-avatar',person),entity('unit',person),
  entity('software-voice',{name:text,romanizedName:text,voiceEngines:z.array(z.object({engine:text,releaseDate:date.optional()})),relations,commercialLicense:z.object({url:url.optional(),summary:z.string().optional()}).optional(),roles:roles.optional(),lifecycle:lifecycle.optional(),affiliations:affiliations.optional()}),
  entity('work-track',{title:text,romanizedTitle:text,releaseDate:date.optional(),duration:z.string().regex(/^\d{1,3}:\d{2}(?::\d{2})?$/).optional(),performers:z.array(z.object({entity:id,role:text})),credits:z.array(z.object({role:text,entity:id.optional(),name:text.optional()}).refine(c=>!!(c.entity||c.name),'Credit requires entity or name')),genres:z.array(z.string()).optional(),media:z.array(z.object({platform:text,type:text,id:z.string().optional(),url:url.optional()})).optional(),lyricsSources:z.array(z.object({label:text,href:url,provider:z.string(),checkedAt:date})).optional()}),
  entity('work-release',{title:text,romanizedTitle:z.string().optional(),releaseType:z.enum(['album','ep','single','soundtrack','live-album']),releaseDate:date.optional(),primaryArtist:id.optional(),label:id.optional(),catalogNumber:z.string().optional(),duration:z.string().optional(),tracks:z.array(track),editions:z.array(z.object({id,name:text,format:text,catalogNumber:z.string().optional(),bonusItems:z.array(z.string()).optional()})).optional()}),
  entity('project',{status:z.enum(['active','completed','frozen']).optional(),subProjects:z.array(z.object({id:id.optional(),entity:id.optional(),name:z.string().optional(),type:z.string().optional(),url:url.optional()})).optional(),releaseDate:date.optional()}),
  entity('organization',{orgType:z.enum(['parent-company','creative-studio','creative-network','record-label','platform']),parentOrg:id.optional()}),
  entity('live-event',{eventType:z.enum(['oneman-live','joint-live','xr-sinka-live','exhibition','event']),dateRange:z.object({start:date,end:date.optional()}).optional(),venue:z.object({name:text,city:z.string().optional(),country:z.string().optional(),isVirtual:z.boolean().optional()}).optional(),headliners:z.array(id),guestPerformers:z.array(id).optional(),organizer:id.optional(),setlist:z.array(track).optional()}),
  entity('lore-concept',{loreCategory:z.enum(['glossary-term','fictional-resident','geography','concept']),belongToUniverse:id.optional()}),
  entity('editorial-article',{title:text,articleCategory:z.enum(['business','art-philosophy','profile','infrastructure','archival']),author:text.optional(),publishDate:date.optional(),relatedEntities:z.array(id).optional()}),
 ]).superRefine((d,c)=>{
  if(d.contentStatus!=='stub'){
   for(const key of ({'work-release':['releaseDate'],'project':['status'],'live-event':['dateRange'],'editorial-article':['author','publishDate']}[d.entityType]||[]))if(d[key]===undefined)c.addIssue({code:'custom',path:[key],message:'Required for published entries'});
  }
  if(!d.name&&!d.title)c.addIssue({code:'custom',path:['name'],message:'An entity requires a name or title'});
  if(d.entityType==='software-voice'&&!d.relations.some(r=>r.type==='based-on-voice'))c.addIssue({code:'custom',path:['relations'],message:'Voice source required'});
 });
}
