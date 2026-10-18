import test from 'node:test';
import assert from 'node:assert/strict';
import workspaceBoundary from '../scripts/workspace-boundary.mjs';

const variables = {
 WORKSPACE_ISOLATED:'true', PUBLIC_WORKSPACE_ISOLATED:'true',
 PUBLIC_WORKSPACE_API_ORIGIN:'http://127.0.0.1:18002',
 PUBLIC_WORKSPACE_WIKI_ORIGIN:'http://127.0.0.1:18000',
 PUBLIC_WORKSPACE_COMPANION_ORIGIN:'http://127.0.0.1:18001',
};
function withEnvironment(values, fn) {
 const previous={...process.env};
 try { Object.assign(process.env,values); fn(); }
 finally { for(const key of Object.keys(process.env))if(!(key in previous))delete process.env[key]; Object.assign(process.env,previous); }
}
test('workspace CSP restricts resources and exact registered service connections',()=>{
 withEnvironment(variables,()=>{
  let handler;workspaceBoundary().configureServer({middlewares:{use(fn){handler=fn;}}});
  const headers={};let continued=false;
  handler({}, {setHeader(k,v){headers[k]=v;}},()=>{continued=true;});
  assert.equal(continued,true);assert.equal(headers['X-Workspace-Environment'],'isolated-local');
  const directives=Object.fromEntries(headers['Content-Security-Policy'].split('; ').map(s=>{const [key,...values]=s.split(' ');return [key,values];}));
  assert.deepEqual(directives['default-src'],["'self'"]);
  for(const type of ['script-src','style-src','font-src','img-src']){
   assert.ok(directives[type]);assert.ok(directives[type].every(s=>!s.includes('https:')&&!s.includes('*')));
  }
  assert.deepEqual(directives['connect-src'],["'self'",...Object.values(variables).slice(2),...Object.values(variables).slice(2).map(s=>s.replace('http:','ws:'))]);
 });
});
test('workspace boundary refuses missing registry and leaves ordinary development unchanged',()=>{
 withEnvironment({...variables,PUBLIC_WORKSPACE_API_ORIGIN:''},()=>assert.throws(()=>workspaceBoundary().configureServer({middlewares:{use(){assert.fail('installed invalid policy');}}}),/origin/));
 withEnvironment({...variables,WORKSPACE_ISOLATED:'false'},()=>workspaceBoundary().configureServer({middlewares:{use(){assert.fail('ordinary mode changed');}}}));
});
