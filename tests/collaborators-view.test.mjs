import test from 'node:test';
import assert from 'node:assert/strict';
import { collaboratorLink, validCollaborators, renderCollaborators } from '../src/lib/collaboratorsView.mjs';
const text={zh:'简介',ja:'紹介',en:'Intro'};
const person={id:'test',enabled:true,name:'Example',avatar:'/images/contributors/test.png',collaboration:text,introduction:text,quote:text,contacts:[]};
test('collaborators renderer preserves order, locales, empty lists and safe profile links',()=>{
 const data={contributors:[person,{...person,id:'other',name:'Second'}]};
 assert.ok(validCollaborators(data));const html=renderCollaborators(data,'ja',{open:'Open',quote:'Quote',contact:'Contact'});
 assert.ok(html.cards.indexOf('Example')<html.cards.indexOf('Second'));assert.match(html.details,/紹介/);
 assert.equal(renderCollaborators({contributors:[]},'en',{}).cards,'');
 assert.equal(collaboratorLink('mailto:test@example.com'),'mailto:test@example.com');
 for(const value of ['javascript:alert(1)','data:text/html,test','https://user:pass@example.com','mailto:test@example.com?subject=test'])assert.equal(collaboratorLink(value),'');
 assert.equal(collaboratorLink('/images/../private.png',true),'');
});
test('collaborators reject private or malformed records and escape all public text',()=>{
 assert.equal(validCollaborators({contributors:[{...person,enabled:false}]}),false);
 assert.equal(validCollaborators({contributors:[{...person,contacts:[null]}]}),false);
 assert.equal(validCollaborators({contributors:[person,person]}),false);
 const html=renderCollaborators({contributors:[{...person,name:'<script>alert(1)</script>',contacts:[{label:'<img onerror=alert(1)>',href:'javascript:alert(1)'}]}]},'zh',{open:'Open',quote:'Quote',contact:'Contact'});
 assert.doesNotMatch(html.cards+html.details,/<script>|<img onerror|href="javascript:/);
});
