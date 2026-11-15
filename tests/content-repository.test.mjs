import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveContentRepository,contentFileUrl,contentCommitUrl} from '../src/lib/contentRepository.mjs';
import {betaEnvironment} from '../scripts/beta-environment.mjs';

test('beta source edits, new files and history use the beta fork even with inherited main destinations',()=>{
 const env=betaEnvironment({PUBLIC_CONTENT_REPOSITORY:'https://github.com/example/production',PUBLIC_CONTENT_BRANCH:'main'}),repository=resolveContentRepository(env);
 const path='src/content/songs/kaf/狂感覚/ja.md';
 assert.match(contentFileUrl(path,'edit',repository),/^https:\/\/github.com\/KiRenk0\/kamitsubaki-wiki-site\/edit\/beta\/src\/content\//);
 assert.match(contentFileUrl(path,'new',repository),/\/new\/beta\/src\/content\/songs\/kaf\/%E7%8B%82%E6%84%9F%E8%A6%9A\?filename=ja.md$/);
 assert.equal(contentCommitUrl('a'.repeat(40),repository),'https://github.com/KiRenk0/kamitsubaki-wiki-site/commit/'+'a'.repeat(40));
 assert.equal(resolveContentRepository({}).branch,'main');
});

test('source destinations reject external origins, invalid branches, path traversal and invalid commit identifiers',()=>{
 for(const url of ['https://evil.example/owner/repo','https://github.com/owner/repo?redirect=x','https://user:pass@github.com/owner/repo'])assert.throws(()=>resolveContentRepository({PUBLIC_CONTENT_REPOSITORY:url}));
 for(const branch of ['../main','beta?x=main','beta\nmain'])assert.throws(()=>resolveContentRepository({PUBLIC_CONTENT_BRANCH:branch}));
 for(const path of ['src/content/../site/en.md','src/content/a/%2e%2e/en.md','https://example.org/en.md','src/content/a/en.md?branch=main'])assert.throws(()=>contentFileUrl(path));
 assert.throws(()=>contentCommitUrl('../main'));
});
