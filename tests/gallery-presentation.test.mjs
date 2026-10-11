import test from 'node:test';
import assert from 'node:assert/strict';
import {galleryPhotoPresentation,galleryDisplayText} from '../src/lib/galleryPresentation.mjs';
const names=[['花譜','花谱'],['KAF','花谱']];
test('Chinese display follows subject, work, purpose without mutating source or credits',()=>{
 const photo={title:'花譜 — 不可解 key visual',author:'花譜',sourceTitle:'花譜 公式ライブKV'};
 const original=structuredClone(photo);
 assert.equal(galleryPhotoPresentation(photo,{subject:'花谱',names,locale:'zh'}).fullTitle,'花谱｜不可解｜主视觉');
 assert.deepEqual(photo,original);
 assert.equal(galleryPhotoPresentation({title:'春猿火 — META official music-video key visual'},{subject:'春猿火'}).fullTitle,'春猿火｜META｜MV 主视觉');
 assert.equal(galleryDisplayText('KAF / KAFKA',names),'花谱 / KAFKA');
});
test('original non-Chinese titles and unknown filenames have safe display fallbacks',()=>{
 assert.equal(galleryDisplayText('花譜 — 不可解',names,'ja'),'花譜 — 不可解');
 assert.equal(galleryPhotoPresentation({title:'a'.repeat(32)+'.png'},{subject:'花谱',type:'设定图'}).fullTitle,'花谱｜设定图');
 assert.equal(galleryDisplayText('公式ファンアート'), '官方同人插画');
});
test('set original frames remain distinguishable',()=>{
 assert.equal(galleryPhotoPresentation({title:'META',setId:'meta',sourceTitle:'公開原画 カット32'},{subject:'春猿火'}).fullTitle,'春猿火｜META｜镜头 32原画');
});

test('display edits never replace a newer editorial title or truncate a work name',async()=>{
 const {default:titles}=await import('../src/data/gallery-display-titles.json',{with:{type:'json'}});
 const [id,edit]=Object.entries(titles)[0];
 assert.equal(galleryPhotoPresentation({id,title:edit.original}).fullTitle,edit.subject+'｜'+edit.title);
 assert.equal(galleryPhotoPresentation({id,title:'新修订标题'}).title,'新修订标题');
 assert.equal(galleryPhotoPresentation({title:'花谱の夏祭り'},{subject:'花谱'}).title,'花谱の夏祭り');
});
