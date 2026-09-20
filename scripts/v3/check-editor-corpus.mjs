import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {walk} from './io.mjs';
import {importMarkdown,exportMarkdown,validateDraft} from '../../src/lib/visualEditor.mjs';
import {validateContent} from '../../../kamitsubaki-wiki-site-backend/src/editor/domain.js';
let checked=0;const failures=[];
for(const path of (await walk('src/content')).filter(p=>/\/(zh|ja|en)\.md$/.test(p))){
 const source=await readFile(path,'utf8');const frontmatter=source.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];if(!frontmatter||!/^schemaVersion: 2$/m.test(frontmatter))continue;
 try{const draft=importMarkdown(source,path.split('/')[2],path);assert.equal(exportMarkdown(draft),source,'Round-trip changes source');assert.deepEqual(validateDraft(draft),[]);validateContent(path,source);checked++;}catch(e){failures.push({path,error:e.message});}
}
console.log(JSON.stringify({checked,failures},null,2));if(failures.length)process.exitCode=1;
