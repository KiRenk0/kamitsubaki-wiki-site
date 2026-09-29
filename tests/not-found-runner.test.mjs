import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
import test from 'node:test';

const projectUrl=path=>new URL(path,import.meta.url);

test('the static 404 fallback sends visitors to the matching language recovery page',async()=>{
 const page=await readFile(projectUrl('../src/pages/404.astro'),'utf8');
 assert.match(page,/noindex:true/);
 assert.match(page,/zh-tw\|zh-hk\|zh\|ja\|en/);
 assert.match(page,/new URL\(`\/\$\{locale\}\/404\/`/);
 assert.match(page,/location\.replace\(destination\)/);
});

test('localized 404 gives search, archive, guides and home priority',async()=>{
 const page=await readFile(projectUrl('../src/pages/[locale]/404.astro'),'utf8');
 assert.match(page,/<WorkspaceLayout [\s\S]*noindex>/);
 assert.match(page,/data-search-open/);
 for(const path of ['/explore/','/docs/'])assert.ok(page.includes(path));
 assert.match(page,/not-found-extra[\s\S]*games\/memory-corridor/);
 await access(projectUrl('../src/pages/[locale]/games/memory-corridor.astro'));
});
