import {primaryNavigationCategory,memberNavigationGroup} from './classificationRules.mjs';
import map from '../data/classification-map.json' with {type:'json'};
export const collectionByType={person:'people','virtual-avatar':'people',unit:'units','software-voice':'isotopes','work-track':'songs','work-release':'releases',project:'projects',organization:'organizations','live-event':'lives','lore-concept':'lore','editorial-article':'articles'};
const people=map.tree.find(n=>n.id==='people');
const groupNodes=people.children.find(n=>n.id==='groups').children;
const safe=value=>typeof value==='string'&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
function branchFor(id,nodes,path=[]){
 for(const node of nodes){const next=[...path,node.id];const child=branchFor(id,node.children||[],next);if(child)return child;if(node.ids?.includes(id)||node.overviewIds?.includes(id))return next;}
}
export function songFolderArtist(data){
 const performers=(data.performers||[]).filter(p=>safe(p.entity));
 const leads=performers.filter(p=>['lead-vocal','main-vocal','primary'].includes(p.role));
 const ids=[...new Set((leads.length?leads:performers).map(p=>p.entity))].sort();
 return ids.length===1?ids[0]:ids.length>1?'collaborations':'unassigned';
}
export function entityFolder(data){
 if(!safe(data.id))throw Error('Invalid entity ID');
 const collection=collectionByType[data.entityType];if(!collection)throw Error('Invalid entity type');
 let branch=[];
 if(collection==='people'){
   const solo=people.children.find(n=>n.id==='solo');
   const member=groupNodes.find(n=>n.ids.includes(data.id));
   if(data.classification?.primary||data.classification?.group){const group=memberNavigationGroup(data);const category=primaryNavigationCategory(data);branch=group?['groups',group,'members']:[category?.id||'unlisted'];}
   else if(solo.ids.includes(data.id))branch=['solo'];
   else if(member)branch=['groups',member.overviewIds[0],'members'];
   else if(people.children.find(n=>n.id==='creators').ids.includes(data.id))branch=['creators'];
   else if(people.children.find(n=>n.id==='staff').ids.includes(data.id))branch=['staff'];
   else if(map.tree.find(n=>n.id==='lore').children.find(n=>n.id==='characters').ids.includes(data.id))branch=['characters'];
   else branch=['unlisted'];
 }else if(collection==='songs')branch=[songFolderArtist(data)];
 else if(collection==='releases')branch=[map.tree.find(n=>n.id==='music').children.find(n=>n.id==='releases').children.find(n=>n.releaseType===data.releaseType)?.id||'other-releases'];
 else if(collection==='articles')branch=[safe(data.articleCategory)?data.articleCategory:'unclassified'];
 else if(['projects','lives','organizations','lore'].includes(collection))branch=branchFor(data.id,map.tree.find(n=>n.id===collection).children||[])||['unlisted'];
 return [collection,...branch,data.id].join('/');
}
export function entitySourcePath(data){
 if(!['zh','ja','en','zh-tw','zh-hk'].includes(data.locale))throw Error('Invalid content locale');
 return `src/content/${entityFolder(data)}/${data.locale}.md`;
}
