import {readFile,readdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import YAML from 'yaml';
import {eventEra} from './chronicleTimeline.mjs';
import {convertChineseContentValue} from './traditionalChinese.mjs';
export async function loadTaxonomy(name){return YAML.parse(await readFile(resolve(`src/data/taxonomy/${name}.yml`),'utf8'));}
let featureCache;
export async function loadFeatureData(){if(import.meta.env?.PROD)return featureCache??=readFeatureData();return readFeatureData();}
async function readFeatureData(){
 const load=async name=>{const dir=resolve(`src/data/${name}/`);const files=(await readdir(dir)).filter(p=>/\.ya?ml$/.test(p));return Promise.all(files.map(async f=>YAML.parse(await readFile(join(dir,f),'utf8'))));};
 const [chronicle,galleries,eras]=await Promise.all([load('chronicle'),load('galleries'),loadTaxonomy('eras')]);
 const events=chronicle.flatMap(y=>y.events||[]).map(e=>({...e,era:eventEra(e,eras.eras)})).sort((a,b)=>a.date.start.localeCompare(b.date.start)||a.id.localeCompare(b.id));
 return {events,gallery:galleries.flatMap(g=>g.items.map(item=>({...item,subject:g.subject}))),eras:eras.eras,footprints:id=>events.filter(e=>e.related?.some(r=>r.entity===id)||e.articles?.includes(id))};
}
export function featureText(text,locale){if(locale.startsWith('zh-'))return convertChineseContentValue(text?.zh||{},locale);return text?.[locale]||text?.zh||{};}
export function galleryImageUrl(src,publicBase=''){if(/^https:\/\//.test(src)||/^\/(?!\/)/.test(src))return src;if(!publicBase||src.split('/').some(p=>p==='..'||p==='.')||/[\\?#]/.test(src))return '';return publicBase.replace(/\/$/,'')+'/'+src.split('/').map(encodeURIComponent).join('/');}
