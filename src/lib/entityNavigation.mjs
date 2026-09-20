import {resolveLocaleCopy} from './i18n.mjs';
import {navigationCategories,inNavigationCategory} from './classificationRules.mjs';
export {navigationCategories,inNavigationCategory,primaryNavigationCategory,memberNavigationGroup} from './classificationRules.mjs';
export function categoryLabel(category,locale){return resolveLocaleCopy({zh:category.labels[0],en:category.labels[1],ja:category.labels[2]},locale);}
export function categoryEntities(registry,category,locale){return registry.list(locale).filter(e=>inNavigationCategory(e.data,category)).sort((a,b)=>{const rank=id=>{const n=category.featured?.indexOf(id)??-1;return n<0?999:n;};return rank(a.data.id)-rank(b.data.id)||(a.data.presentation?.sortOrder??999)-(b.data.presentation?.sortOrder??999)||(a.data.name||a.data.title).localeCompare(b.data.name||b.data.title);});}
