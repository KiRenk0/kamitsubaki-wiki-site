const identitiesByEngine=new WeakMap();
async function fuzzyIdentities(engine,query){
 const characters=Array.from(query),cjk=/^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー]+$/u.test(query);
 if((cjk?characters.length<2:characters.length<4)||query.includes(' '))return [];
 if(!identitiesByEngine.has(engine))identitiesByEngine.set(engine,Promise.all([engine.filters(),import('fuse.js/basic')]).then(([filters,{default:Fuse}])=>new Fuse(Object.keys(filters.identity||{}),{includeScore:true,ignoreLocation:true,threshold:.5})));
 const fuse=await identitiesByEngine.get(engine),threshold=(characters.length>=9?2:1)/characters.length;
 return fuse.search(query).filter(result=>result.score<=threshold).slice(0,12).map(result=>result.item);
}
// Pagefind's native CJK index and the browser ICU can disagree on word boundaries.
// Bounded exact-phrase variants use Pagefind's own phrase matching; no body index
// or replacement scoring is kept in the client.
function phraseQueries(query,locale){
 if(query.length<4||query.length>48||!/^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー\s]+$/u.test(query)||typeof Intl.Segmenter==='undefined')return [];
 const words=[...new Intl.Segmenter(locale.startsWith('ja')?'ja':'zh',{granularity:'word'}).segment(query)].filter(part=>part.isWordLike).map(part=>part.segment);
 const variants=[words.join(' ')];
 for(let index=0;index<words.length&&variants.length<6;index++){if(Array.from(words[index]).length<2)continue;variants.push(words.map((word,i)=>i===index?Array.from(word).join(' '):word).join(' '));}
 return [...new Set(variants)].map(value=>'"'+value+'"');
}
export async function searchPagefind(engine,query,kinds,locale='zh'){
 const filters=kinds?{kind:{any:kinds}}:{};
 const [full,exact]=await Promise.all([engine.search(query,{filters}),engine.search(null,{filters:{...filters,identity:query},sort:{identityPriority:'desc'}})]);
 let identities=exact.results,phrases=[];
 if(!identities.length){const queries=phraseQueries(query,locale);if(queries.length)phrases=(await Promise.all(queries.map(value=>engine.search(value,{filters})))).flatMap(result=>result.results);}
 // Spelling compatibility applies only when native retrieval found no match.
 if(!identities.length&&!phrases.length&&!full.results.length){const names=await fuzzyIdentities(engine,query);if(names.length)identities=(await engine.search(null,{filters:{...filters,identity:{any:names}},sort:{identityPriority:'desc'}})).results;}
 const seen=new Set();return [...identities,...phrases,...full.results].filter(result=>{if(seen.has(result.id))return false;seen.add(result.id);return true;});
}
