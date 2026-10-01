import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {createHash} from 'node:crypto';
import YAML from 'yaml';
export const hash=value=>createHash('sha256').update(value).digest('hex');
export async function walk(root){let result=[];for(const e of await readdir(root,{withFileTypes:true})){const p=join(root,e.name);if(e.isDirectory())result.push(...await walk(p));else result.push(p);}return result;}
export function parseDocument(text){const m=text.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u);if(!m)throw Error('Missing frontmatter');return {data:YAML.parse(m[1]),body:text.slice(m[0].length)};}
export async function readEntries(root='src/content'){const paths=(await walk(root)).filter(p=>/\/(zh|ja|en)\.md$/.test(p)&&!p.includes('/contribute/'));return Promise.all(paths.map(async path=>({path,...parseDocument(await readFile(path,'utf8'))})));}
export async function writeDocument(path,data,body){await mkdir(dirname(path),{recursive:true});await writeFile(path,'---\n'+YAML.stringify(data,{lineWidth:0,defaultStringType:'QUOTE_DOUBLE',defaultKeyType:'PLAIN'}).trimEnd()+'\n---\n'+body);}
export async function writeYaml(path,data){await mkdir(dirname(path),{recursive:true});await writeFile(path,YAML.stringify(data,{lineWidth:0,defaultStringType:'QUOTE_DOUBLE',defaultKeyType:'PLAIN'}));}
