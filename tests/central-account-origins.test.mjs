import test from 'node:test';
import assert from 'node:assert/strict';
import {centralAccountProductionOrigins,centralAccountReturnOrigins,centralAccountFrontendOrigin,centralAccountReturnTo} from '../src/lib/centralAccountOrigins.mjs';
const production=['https://kamitsubaki.wiki','https://chat.kamitsubaki.wiki','https://kamitsubaki-companion.pages.dev','https://kamitsubaki-companion-site.pages.dev','https://zh.kamitsubaki.wiki','https://en.kamitsubaki.wiki','https://ja.kamitsubaki.wiki','https://kamitsubaki.wiki.linkth1rsty.cc'];
test('central account client uses the exact production return registry',()=>{
 assert.deepEqual(centralAccountProductionOrigins,production);
 assert.deepEqual(centralAccountReturnOrigins('https://api.kamitsubaki.wiki'),production);
 for(const origin of ['https://preview.kamitsubaki-companion.pages.dev','https://kamitsubaki-companion.pages.dev:444','https://evil.kamitsubaki.wiki'])assert.equal(centralAccountReturnOrigins('https://api.kamitsubaki.wiki').includes(origin),false);
});
test('local account API admits only its four explicitly registered development origins',()=>{
 const local=centralAccountReturnOrigins('http://127.0.0.1:8787');
 assert.deepEqual(local.slice(production.length),['http://127.0.0.1:4322','http://localhost:4322','http://127.0.0.1:4321','http://localhost:4321']);
 assert.equal(local.includes('http://localhost:9999'),false);
 assert.deepEqual(centralAccountReturnOrigins('http://127.0.0.1:9999'),production);
 assert.deepEqual(centralAccountReturnOrigins('https://localhost:8787'),production);
});

test('isolated preview permits only its exact API and frontend origins',()=>{
 const preview=['https://auth-preview.kamitsubaki.wiki','https://wiki-auth-preview.kamitsubaki.wiki','https://chat-auth-preview.kamitsubaki.wiki'];
 assert.deepEqual(centralAccountReturnOrigins(preview[0]),preview);
 for(const origin of [...production,'https://evil.wiki-auth-preview.kamitsubaki.wiki','https://wiki-auth-preview.kamitsubaki.wiki:444','https://unregistered.kamitsubaki.wiki'])assert.equal(centralAccountReturnOrigins(preview[0]).includes(origin),false);
});
test('configured frontend URLs cannot move preview account links into production or an unknown host',()=>{
 const api='https://auth-preview.kamitsubaki.wiki';
 assert.equal(centralAccountFrontendOrigin(api,'https://wiki-auth-preview.kamitsubaki.wiki/zh/'),'https://wiki-auth-preview.kamitsubaki.wiki');
 for(const configured of ['https://kamitsubaki.wiki','https://evil.example','https://user:pass@wiki-auth-preview.kamitsubaki.wiki'])assert.equal(centralAccountFrontendOrigin(api,configured),'https://wiki-auth-preview.kamitsubaki.wiki');
 assert.equal(centralAccountFrontendOrigin(api,'https://chat.kamitsubaki.wiki','companion'),'https://chat-auth-preview.kamitsubaki.wiki');
 assert.equal(centralAccountFrontendOrigin('https://api.kamitsubaki.wiki',null,'companion'),'https://chat.kamitsubaki.wiki');
});
test('trusted preview task URLs retain draft encoding, query and hash without accepting other origins',()=>{
 const api='https://auth-preview.kamitsubaki.wiki',target='https://wiki-auth-preview.kamitsubaki.wiki/ja/chronicle/submit/?draft=A%20B&source=a%2fb#editor';
 assert.equal(centralAccountReturnTo(target,api,'ja'),target);
 assert.equal(centralAccountReturnTo('https://kamitsubaki.wiki/ja/',api,'ja'),'https://wiki-auth-preview.kamitsubaki.wiki/ja/');
 assert.equal(centralAccountReturnTo('https://evil.example/ja/',api,'ja','companion'),'https://chat-auth-preview.kamitsubaki.wiki/ja/');
});
