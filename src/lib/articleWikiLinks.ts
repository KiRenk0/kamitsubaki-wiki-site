import {renderWikiLinks} from './wikiLinks.mjs';
let pending:Promise<any>|undefined,loadedLocale='';
export async function linkArticleBody(body:HTMLElement,locale:string){
 if(!pending||loadedLocale!==locale){loadedLocale=locale;pending=fetch(`/${locale}/article-links.json`,{signal:AbortSignal.timeout(15000)}).then(r=>{if(!r.ok)throw Error('links');return r.json();}).catch(error=>{pending=undefined;throw error;});}
 const {entries,legacy,redirects}=await pending;
 const byId=new Map([...entries,...legacy].map((e:any)=>[e.data.id,e]));
 const registry={list:()=>entries,resolveEntity:(id:string)=>byId.get(id),legacyRoutes:new Map(redirects)};
 body.innerHTML=renderWikiLinks(body.innerHTML,registry,locale).html;
}
