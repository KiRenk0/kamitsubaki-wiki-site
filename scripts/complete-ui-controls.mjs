import {readdir,readFile,writeFile} from 'node:fs/promises';
import {relative,dirname,resolve} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {parse}=require(require.resolve('@astrojs/compiler',{paths:[require.resolve('astro')]}));
const check=process.argv.includes('--check');
const root=resolve('src'),exceptions=new Set(['WorkspaceButton.astro','WorkspaceControl.astro']);
const report=[];
async function files(dir){const result=[];for(const f of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,f.name);if(f.isDirectory())result.push(...await files(p));else if(f.name.endsWith('.astro'))result.push(p);}return result;}
function openEnd(source,offset){let quote='',depth=0;for(let i=offset;i<source.length;i++){const c=source[i];if(quote){if(c===quote&&source[i-1]!=='\\')quote='';continue;}if(c==='"'||c==="'"||c==='`'){quote=c;continue;}if(c==='{')depth++;else if(c==='}')depth--;else if(c==='>'&&depth===0)return i;}throw Error('Unclosed tag at '+offset+' '+JSON.stringify(source.slice(offset,offset+120)));}
for(const path of await files(root)){
 if(exceptions.has(path.split('/').at(-1)))continue;
 const source=await readFile(path,'utf8'),{ast}=await parse(source,{position:true});const changes=[];let buttons=0,controls=0;
 function walk(node){
  const anchor=node.type==='element'&&node.name==='a'&&(node.attributes||[]).some(a=>a.name==='class'&&typeof a.value==='string'&&/(?:^|\s)(?:button|account-button|cg-button|sponsor-button|workspace-button)(?:\s|$)/.test(a.value));
  if(node.type==='element'&&(['button','input','select','textarea'].includes(node.name)||anchor)){
   const attrs=node.attributes||[],type=attrs.find(a=>a.name==='type')?.value;
   if(node.name==='input'&&type==='hidden')return;
   const from=Buffer.from(source).subarray(0,node.position.start.offset).toString('utf8').length;if(source.slice(from,from+node.name.length+1)!=='<'+node.name)throw Error(path+' Invalid source position');const open=openEnd(source,from),replacement=node.name==='button'||anchor?'WorkspaceButton':'WorkspaceControl';
   changes.push({start:from+1,end:from+1+node.name.length,value:replacement});
   let extra=node.name==='select'?' as="select"':node.name==='textarea'?' as="textarea"':'';
   if(node.name==='button'||anchor){
    buttons++;if(!anchor&&!attrs.some(a=>a.name==='type'))extra+=' type="submit"';
    if(attrs.some(a=>a.name==='class'&&/primary/.test(a.value)))extra+=' tone="primary"';
   }else controls++;
   if(extra)changes.push({start:from+1+node.name.length,end:from+1+node.name.length,value:extra});
   if(node.name==='input'){if(source[open-1]!=='/')changes.push({start:open,end:open,value:'/'});}
   else {const close=source.indexOf('</'+node.name,open+1);if(close>=from)changes.push({start:close+2,end:close+2+node.name.length,value:replacement});}
  }
  for(const child of node.children||[])walk(child);
 }
 walk(ast);if(!changes.length)continue;
 report.push({file:relative(resolve('.'),path),buttons,controls});
 if(check)continue;
 let next=source;for(const c of changes.sort((a,b)=>b.start-a.start||b.end-a.end))next=next.slice(0,c.start)+c.value+next.slice(c.end);
 const imports=[];for(const [name,count] of [['WorkspaceButton',buttons],['WorkspaceControl',controls]])if(count&&!source.includes('import '+name+' ')){
  let target=relative(dirname(path),resolve(root,'components',name+'.astro')).replaceAll('\\','/');if(!target.startsWith('.'))target='./'+target;imports.push(`import ${name} from '${target}';`);
 }
 if(imports.length){if(next.startsWith('---'))next=next.replace(/^---\s*\n/,'---\n'+imports.join('\n')+'\n');else next='---\n'+imports.join('\n')+'\n---\n'+next;}
 await writeFile(path,next);
}
console.log(JSON.stringify({mode:check?'check':'migrate',files:report.length,buttons:report.reduce((n,r)=>n+r.buttons,0),controls:report.reduce((n,r)=>n+r.controls,0),report},null,2));
if(check&&report.length)process.exitCode=1;
