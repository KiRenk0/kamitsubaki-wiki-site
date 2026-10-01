import classificationMap from '../data/classification-map.json' with {type:'json'};
import categoryData from '../data/navigation-categories.json' with {type:'json'};
export const navigationCategories=categoryData.map(c=>({...c}));
// Curated membership and ordering come only from the approved classification map.
const classificationNodes = classificationMap.tree.flatMap(function flatten(node) { return [node,...(node.children||[]).flatMap(flatten)]; });
for (const category of navigationCategories) {
 const node = classificationNodes.find(node => node.category === category.id);
 category.featured = node?.ids || (node?.children || []).flatMap(child => child.overviewIds || []);
}
function matchesType(data,category){return category.types.includes(data.entityType)&&(!category.roles||data.roles?.some(role=>category.roles.includes(role)));}

const groupBranches=classificationNodes.find(n=>n.category==='groups')?.children||[];
export function memberNavigationGroup(data){
 if(data.classification?.group)return data.classification.group;
 if(data.classification?.primary&&data.classification.primary!=='groups')return undefined;
 if(navigationCategories.some(c=>c.featured?.includes(data.id)))return undefined;
 return groupBranches.find(group=>group.ids?.includes(data.id))?.overviewIds?.[0];
}
export function primaryNavigationCategory(data){
 return navigationCategories.find(c=>c.id===data.classification?.primary)||navigationCategories.find(c=>c.featured?.includes(data.id))||(memberNavigationGroup(data)?navigationCategories.find(c=>c.id==='groups'):navigationCategories.find(c=>matchesType(data,c)));
}
export function inNavigationCategory(data,category){
 return !!category&&(primaryNavigationCategory(data)?.id===category.id||data.classification?.additional?.includes(category.id));
}
export const classificationNodeIds=classificationNodes.map(n=>n.id);
