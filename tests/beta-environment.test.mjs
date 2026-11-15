import test from 'node:test';
import assert from 'node:assert/strict';
import {betaEnvironment} from '../scripts/beta-environment.mjs';
import {workspaceAccountRegistry} from '../src/lib/centralAccountOrigins.mjs';

test('beta commands override inherited production services with a distinct exact local registry',()=>{
 const inherited={PATH:'preserved',PUBLIC_ARCHIVE_API_BASE:'https://production.example',PUBLIC_EDITOR_LOCAL:'true',VISUAL_EXPLORER_LOCAL_ORIGIN:'http://127.0.0.1:9999'};
 const env=betaEnvironment(inherited),registry=workspaceAccountRegistry(env);
 assert.deepEqual(registry,{wiki:'http://127.0.0.1:18430',api:'http://127.0.0.1:18431',companion:'http://127.0.0.1:18432'});
 for(const [key,value]of Object.entries(env))if(/_API_(?:BASE|URL)$/.test(key))assert.equal(value,registry.api,key);
 assert.equal(env.PATH,'preserved');assert.equal(env.WORKSPACE_ISOLATED,'true');assert.equal(env.PUBLIC_EDITOR_LOCAL,'false');
 assert.equal(env.VISUAL_EXPLORER_LOCAL_ORIGIN,undefined);
 assert.equal(inherited.PUBLIC_ARCHIVE_API_BASE,'https://production.example');
});
