import test from 'node:test';
import assert from 'node:assert/strict';
import {z} from 'astro/zod';
import {createEntitySchema} from '../src/lib/entitySchema.mjs';
import {createEntityRegistry} from '../src/lib/entityRegistry.mjs';
import {buildClassificationTree,flattenClassification,classificationEntries} from '../src/lib/classificationTree.mjs';
import {entityRoute} from '../src/lib/entityModel.mjs';
import {entitySourcePath} from '../src/lib/contentLayout.mjs';
import {validateContent} from '../../kamitsubaki-wiki-site-backend/src/editor/domain.js';
import YAML from 'yaml';
import {importMarkdown,exportMarkdown,validateDraft} from '../src/lib/visualEditor.mjs';
const person=(id,extra={})=>({schemaVersion:2,id,locale:'zh',entityType:'person',name:id,romanizedName:id,roles:['vocalist'],lifecycle:{activity:'active'},...extra});
const registry=items=>createEntityRegistry(items.map(data=>({data,body:''})));
test('one entry appears in multiple classifications without duplicating its route',()=>{
 const data=person('new-author',{classification:{primary:'solo',additional:['creators','staff']}}),r=registry([data]);
 const tree=flattenClassification(buildClassificationTree(r));
 for(const id of ['solo','creators','staff'])assert.equal(classificationEntries(r,tree.find(n=>n.id===id),'zh')[0].data.id,data.id);
 assert.equal(entityRoute(data),'/database/artists/solo/new-author/');
 assert.equal(r.list().length,1);
});
test('new units create branches and discover members from relations alone',()=>{
 const unit=person('new-unit',{entityType:'unit',roles:['virtual-group']});
 const member=person('new-member',{relations:[{type:'member-of',target:'new-unit'}],classification:{primary:'groups',group:'new-unit',additional:['creators']}});
 const r=registry([unit,member]);const node=flattenClassification(buildClassificationTree(r)).find(n=>n.id==='group-new-unit');
 assert.deepEqual(node.overviewIds,['new-unit']);assert.deepEqual(node.ids,['new-member']);
 assert.equal(entityRoute(member),'/database/artists/groups/new-unit/members/new-member/');
 const path=entitySourcePath(member);assert.equal(path,'src/content/people/groups/new-unit/members/new-member/zh.md');
 assert.equal(validateContent(path,`---\n${YAML.stringify(member)}---\nBody`).id,'new-member');
});
test('unknown categories and unsubstantiated canonical groups are rejected',()=>{
 const schema=createEntitySchema(z);
 assert.equal(schema.safeParse(person('bad',{classification:{primary:'made-up'}})).success,false);
 assert.equal(schema.safeParse(person('bad',{classification:{primary:'groups',group:'new-unit'}})).success,false);
 assert.equal(schema.safeParse(person('bad',{classification:{additional:['typo-category']}})).success,false);
});
test('morph families remain metadata-driven with optional ordering and custom labels',()=>{
 const a=person('form-a',{presentation:{morphing:{group:'new-family',slot:'custom',label:'新形态'}}});
 const b=person('form-b',{presentation:{morphing:{group:'new-family',slot:'real-artist',order:1}}});
 const r=registry([a,b,person('unrelated')]);
 assert.deepEqual(r.morphs('form-a').map(e=>e.data.id),['form-b','form-a']);
 assert.equal(createEntitySchema(z).safeParse(a).success,true);
});

test('editor round trip preserves classification and morph metadata',()=>{
 const data=person('maintained-entry',{classification:{primary:'solo',additional:['creators']},presentation:{morphing:{group:'new-family',slot:'custom',label:'特殊形态',order:3}}});
 const path=entitySourcePath(data);const source=`---\n${YAML.stringify(data)}---\nOriginal body`;
 const draft=importMarkdown(source,'people',path);assert.deepEqual(validateDraft(draft),[]);
 const result=validateContent(path,exportMarkdown(draft));assert.deepEqual(result.classification,data.classification);assert.deepEqual(result.presentation.morphing,data.presentation.morphing);
});
