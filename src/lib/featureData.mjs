import {readFile,readdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import YAML from 'yaml';
import {eventEra} from './chronicleTimeline.mjs';
import {convertChineseContentValue} from './traditionalChinese.mjs';
export async function loadTaxonomy(name){return YAML.parse(await readFile(resolve(`src/data/taxonomy/${name}.yml`),'utf8'));}
let featureCache;
export async function loadFeatureData(){if(import.meta.env?.PROD)return featureCache??=readFeatureData();return readFeatureData();}
async function readFeatureData(){
 const load=async(name,optional=false)=>{const dir=resolve(`src/data/${name}/`);const paths=[];const walk=async folder=>{let entries;try{entries=await readdir(folder,{withFileTypes:true});}catch(error){if(optional&&folder===dir&&error?.code==='ENOENT')return;throw error;}for(const entry of entries){const path=join(folder,entry.name);if(entry.isDirectory())await walk(path);else if(/\.ya?ml$/.test(entry.name))paths.push(path);}};await walk(dir);return Promise.all(paths.map(async path=>YAML.parse(await readFile(path,'utf8'))));};
 const [chronicle,galleries,eras]=await Promise.all([load('chronicle'),load('galleries',true),loadTaxonomy('eras')]);
 const events=chronicle.flatMap(y=>y.events||[]).map(e=>({...e,era:eventEra(e,eras.eras)})).sort((a,b)=>a.date.start.localeCompare(b.date.start)||a.id.localeCompare(b.id));
 return {events,gallery:galleries.flatMap(g=>g.items.map(item=>({...item,subject:g.subject}))),eras:eras.eras,footprints:id=>events.filter(e=>e.related?.some(r=>r.entity===id)||e.articles?.includes(id))};
}
export function featureText(text,locale){const fallback=text?.zh||text?.ja||text?.en||{};if(locale.startsWith('zh-'))return convertChineseContentValue(text?.zh||fallback,locale);return text?.[locale]||fallback;}
export function galleryImageUrl(src,publicBase=''){if(/^https:\/\//.test(src)||/^\/(?!\/)/.test(src))return src;if(!publicBase||src.split('/').some(p=>p==='..'||p==='.')||/[\\?#]/.test(src))return '';return publicBase.replace(/\/$/,'')+'/'+src.split('/').map(encodeURIComponent).join('/');}
