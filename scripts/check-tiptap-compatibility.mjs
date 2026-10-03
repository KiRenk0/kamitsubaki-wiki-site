import {readdir,readFile,writeFile} from 'node:fs/promises';
import {resolve,relative,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createTiptapProbe,compatibilityCases,hasNode} from './lib/tiptapCompatibility.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),probe=createTiptapProbe(),results=[];
const locales=['zh','zh-tw','zh-hk','ja','en'];
try{
 for(const locale of locales)for(const fixture of compatibilityCases(locale)){
  const result=await probe.check(fixture.source);
  results.push({kind:'fixture',locale,name:fixture.name,exactSource:result.exactSource,sameRenderedContent:result.sameRenderedContent,protectedSource:!fixture.protectedText||result.output.includes(fixture.protectedText),editableAsDomainNode:!fixture.requiresNode||hasNode(result.document,fixture.requiresNode)});
 }
 // Deterministic real-content sample: one entry per content collection in each
 // language, plus a known complex biography and timed-lyric song. Frontmatter
 // belongs to the existing metadata editor, so is not fed through Tiptap.
 async function files(dir){const out=[];for(const entry of await readdir(dir,{withFileTypes:true})){const path=resolve(dir,entry.name);if(entry.isDirectory())out.push(...await files(path));else if(entry.name.endsWith('.md'))out.push(path);}return out.sort();}
 const content=await files(resolve(root,'src/content')),selected=new Set();
 for(const path of content){const locale=path.split('/').at(-1).replace('.md','');if(!locales.includes(locale))continue;const group=relative(resolve(root,'src/content'),path).split('/')[0]+'/'+locale;if(![...selected].some(p=>relative(resolve(root,'src/content'),p).split('/')[0]+'/'+p.split('/').at(-1).replace('.md','')===group))selected.add(path);}
 for(const locale of locales)for(const dir of ['people/solo/kaf','songs/kaf/kaf-originals-track-1688351157']){const path=resolve(root,'src/content',dir,locale+'.md');if(content.includes(path))selected.add(path);}
 for(const path of selected){
  const source=await readFile(path,'utf8'),body=source.replace(/^(?:\uFEFF)?---\r?\n[\s\S]*?\r?\n---\r?\n/,'');
  const result=await probe.check(body);results.push({kind:'content',name:relative(root,path),exactSource:result.exactSource,sameRenderedContent:result.sameRenderedContent});
 }
}finally{probe.close();}
const fixtures=results.filter(r=>r.kind==='fixture'),content=results.filter(r=>r.kind==='content');
const report={versions:{tiptap:'3.31.4'},decision:'NOT_READY_FOR_EDITOR_REPLACEMENT',scope:'Node + jsdom serialization and editor commands; not real-browser IME/mobile QA',fixtures:{total:fixtures.length,sameRenderedContent:fixtures.filter(r=>r.sameRenderedContent).length,missingDomainNodes:fixtures.filter(r=>!r.editableAsDomainNode).length,lostProtectedSource:fixtures.filter(r=>!r.protectedSource).length},content:{total:content.length,sameRenderedContent:content.filter(r=>r.sameRenderedContent).length},results};
report.decision=results.every(r=>r.sameRenderedContent&&r.protectedSource!==false&&r.editableAsDomainNode!==false)?'SERIALIZATION_GATE_PASSED_BROWSER_QA_REQUIRED':'NOT_READY_FOR_EDITOR_REPLACEMENT';
console.log(JSON.stringify({...report,results:undefined},null,2));
for(const name of new Set(fixtures.filter(r=>!r.sameRenderedContent||!r.protectedSource||!r.editableAsDomainNode).map(r=>r.name)))console.log('Needs adaptation:',name);
const jsonArg=process.argv.indexOf('--json');if(jsonArg>=0)await writeFile(process.argv[jsonArg+1],JSON.stringify(report,null,2)+'\n');
if(process.argv.includes('--strict')&&report.decision==='NOT_READY_FOR_EDITOR_REPLACEMENT')process.exitCode=1;
