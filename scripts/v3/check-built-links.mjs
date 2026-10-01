import {readFile,readdir,stat} from 'node:fs/promises';
import {join,relative} from 'node:path';
const root='dist',origin='https://kamitsubaki.wiki',urls=new Set(),retiredLinks=new Map();
const localized=/^\/(zh|ja|en|zh-tw|zh-hk)\//;
const retired=/^\/(zh|ja|en|zh-tw|zh-hk)\/(artists|projects|songs|albums)(\/|$)/;
function record(href,source){
 try{const url=new URL(href,origin+source);if(url.origin!==origin||!localized.test(url.pathname)||/^\/(zh|ja|en|zh-tw|zh-hk)\/404\/?$/.test(url.pathname))return;urls.add(url.pathname);if(retired.test(url.pathname)&&!retiredLinks.has(url.pathname))retiredLinks.set(url.pathname,source);}catch{}
}
function visit(value){if(Array.isArray(value))return value.forEach(visit);if(value&&typeof value==='object')for(const [key,item]of Object.entries(value)){if(['path','href','url'].includes(key)&&typeof item==='string'&&localized.test(item))record(item,'/');else visit(item);}}
for(const locale of ['zh','ja','en','zh-tw','zh-hk'])for(const endpoint of ['search-index','home-catalog','catalog-index','labs-catalog','game-index'])visit(JSON.parse(await readFile(`${root}/${locale}/${endpoint}.json`,'utf8')));
async function walk(dir){const files=[];for(const entry of await readdir(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())files.push(...await walk(path));else if(entry.name.endsWith('.html'))files.push(path);}return files;}
const files=await walk(root);let unresolvedReferences=0;
for(let start=0;start<files.length;start+=16)await Promise.all(files.slice(start,start+16).map(async file=>{
 const html=await readFile(file,'utf8'),source='/'+relative(root,file).replaceAll('\\','/').replace(/index\.html$/,'');
 for(const [,href]of html.matchAll(/\bhref=["']([^"']+)["']/g))record(href.replaceAll('&amp;','&'),source);
 unresolvedReferences+=(html.match(/class="wiki-unresolved-link"/g)||[]).length;
}));
const missing=[];
for(const url of urls){let path;try{path=decodeURI(url);}catch{missing.push(url);continue;}let found=false;for(const candidate of [`${root}${path}`,`${root}${path.replace(/\/$/,'')}/index.html`]){try{if((await stat(candidate)).isFile()){found=true;break;}}catch{}}if(!found)missing.push(url);}
console.log(JSON.stringify({htmlPages:files.length,checked:urls.size,missing,retiredLinks:[...retiredLinks].map(([url,source])=>({url,source})),unresolvedReferences},null,2));
if(missing.length||retiredLinks.size)process.exitCode=1;
