import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
export default function localPagefind(){return {name:'wiki-local-pagefind',configureServer(server){server.middlewares.use(async(request,response,next)=>{
 const path=new URL(request.url,'http://localhost').pathname;if(!path.startsWith('/pagefind/'))return next();
 if(path.split('/').includes('..')){response.statusCode=400;response.end();return;}
 try{const data=await readFile(resolve('dist','.'+path));response.setHeader('Content-Type',path.endsWith('.js')?'text/javascript':path.endsWith('.wasm')?'application/wasm':'application/octet-stream');response.setHeader('Cache-Control','no-store');response.end(data);}catch{return next();}
});}};}
