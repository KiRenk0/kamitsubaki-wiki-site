import test from 'node:test';
import assert from 'node:assert/strict';
import {archiveFactDrift,archiveFactCopy} from '../src/lib/archiveFactDrift.mjs';

test('fact review retains both original values and portable edit targets without exposing local paths',()=>{
 const master={filePath:'F:\\private-checkout\\src\\content\\people\\test\\zh.md',data:{locale:'zh',lifecycle:{activity:'active',startedAt:'2014'}}};
 const translation={filePath:'/private-checkout/src/content/people/test/en.md',data:{locale:'en',lifecycle:{activity:'unknown'}}};
 const issue=archiveFactDrift('test','lifecycle',master,translation);
 assert.deepEqual(issue.canonical,{locale:'zh',value:master.data.lifecycle,sourceFile:'src/content/people/test/zh.md'});
 assert.deepEqual(issue.translation,{locale:'en',value:translation.data.lifecycle,sourceFile:'src/content/people/test/en.md'});
 assert.equal(JSON.stringify(issue).includes('private-checkout'),false);
 assert.equal(archiveFactDrift('test','lifecycle',master,{...translation,filePath:'src/content/../private.md'}).translation.sourceFile,null);
 for(const locale of ['zh','zh-tw','zh-hk','ja','en'])assert.ok(archiveFactCopy(locale).note);
});
