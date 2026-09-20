import {readFile,access} from 'node:fs/promises';
const urls=new Set();
function visit(value){if(Array.isArray(value))return value.forEach(visit);if(value&&typeof value==='object')for(const [key,item]of Object.entries(value)){if(['path','href','url'].includes(key)&&typeof item==='string'&&/^\/(zh|ja|en|zh-tw|zh-hk)\//.test(item))urls.add(item.split(/[?#]/)[0]);else visit(item);}}
for(const locale of ['zh','ja','en','zh-tw','zh-hk'])for(const endpoint of ['search-index','home-catalog','catalog-index','labs-catalog','game-index'])visit(JSON.parse(await readFile(`dist/${locale}/${endpoint}.json`,'utf8')));
const missing=[];for(const url of urls){const path=decodeURI(url);let found=false;for(const candidate of [`dist${path}`,`dist${path.replace(/\/$/,'')}/index.html`]){try{await access(candidate);found=true;break;}catch{}}if(!found)missing.push(url);}
console.log(JSON.stringify({checked:urls.size,missing},null,2));if(missing.length)process.exitCode=1;
