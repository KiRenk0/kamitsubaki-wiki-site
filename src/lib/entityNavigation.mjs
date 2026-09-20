import classificationMap from '../data/classification-map.json' with {type:'json'};
import {resolveLocaleCopy} from './i18n.mjs';
/** Navigation categories follow the approved detailed map; they are not entity types. */
export const navigationCategories=[
 {id:'solo',path:'artists/solo',labels:['个人歌手与独立艺人','Solo artists','ソロアーティスト'],types:['person','virtual-avatar'],roles:['virtual-singer','singer-songwriter','vocalist']},
 {id:'groups',path:'artists/groups',labels:['演艺组合','Units & groups','ユニット・グループ'],types:['unit']},
 {id:'creators',path:'creators',labels:['核心词曲创作者','Creators','作詞・作曲家'],types:['person','virtual-avatar'],roles:['composer','lyricist','arranger']},
 {id:'staff',path:'staff',labels:['策划与监督团队','Staff & directors','企画・監督チーム'],types:['person'],roles:['producer','illustrator','visual-director','scenario-writer']},
 {id:'isotopes',path:'isotopes',labels:['官方音乐同位体','Musical isotopes','音楽的同位体'],types:['software-voice']},
 {id:'songs',path:'music/songs',labels:['曲目总库','Songs','楽曲'],types:['work-track']},
 {id:'releases',path:'music/albums',labels:['唱片编目','Releases','音楽作品'],types:['work-release']},
 {id:'projects',path:'projects',labels:['企划宇宙与多媒体 IP','Projects & IP','企画・IP'],types:['project']},
 {id:'lives',path:'lives',labels:['现场演出与大型活动','Lives & events','公演・イベント'],types:['live-event']},
 {id:'organizations',path:'studios',labels:['组织、工作室与厂牌','Organizations & studios','組織・スタジオ'],types:['organization']},
 {id:'lore',path:'lore',labels:['世界观、术语与设定','Lore & universe','世界観・用語'],types:['lore-concept']},
];
// Curated membership and ordering come only from the approved classification map.
const classificationNodes = classificationMap.tree.flatMap(function flatten(node) { return [node,...(node.children||[]).flatMap(flatten)]; });
for (const category of navigationCategories) {
 const node = classificationNodes.find(node => node.category === category.id);
 category.featured = node?.ids || (node?.children || []).flatMap(child => child.overviewIds || []);
}
export function categoryLabel(category,locale){return resolveLocaleCopy({zh:category.labels[0],en:category.labels[1],ja:category.labels[2]},locale);}
function matchesType(data,category){return category.types.includes(data.entityType)&&(!category.roles||data.roles?.some(role=>category.roles.includes(role)));}
export function inNavigationCategory(data,category){if(!category)return false;return primaryNavigationCategory(data)?.id===category.id;}
const groupBranches=classificationMap.tree.find(n=>n.id==='people').children.find(n=>n.id==='groups').children;
export function memberNavigationGroup(data){
 if(navigationCategories.some(c=>c.featured?.includes(data.id)))return undefined;
 return groupBranches.find(group=>group.ids.includes(data.id))?.overviewIds[0];
}
export function primaryNavigationCategory(data){return navigationCategories.find(c=>c.featured?.includes(data.id))||(memberNavigationGroup(data)?navigationCategories.find(c=>c.id==='groups'):navigationCategories.find(c=>matchesType(data,c)));}
export function categoryEntities(registry,category,locale){return registry.list(locale).filter(e=>inNavigationCategory(e.data,category)).sort((a,b)=>{const rank=id=>{const n=category.featured?.indexOf(id)??-1;return n<0?999:n;};return rank(a.data.id)-rank(b.data.id)||(a.data.presentation?.sortOrder??999)-(b.data.presentation?.sortOrder??999)||(a.data.name||a.data.title).localeCompare(b.data.name||b.data.title);});}
