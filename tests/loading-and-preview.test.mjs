import responsiveMarkdownImages from '../src/lib/responsiveMarkdownImages.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {setLoadingStatus} from '../src/lib/loadingStatus.mjs';
import {applyGalleryPreview,galleryPreviewAttributes} from '../src/lib/galleryPreviewImage.mjs';

test('loading indicators expose a status name and disappear with success or failure text',()=>{
 const doc=new JSDOM('<p></p>').window.document,target=doc.querySelector('p');
 setLoadingStatus(target,'Checking account');assert.equal(target.querySelector('[role="status"]').textContent,'Checking account');
 const spinner=target.querySelector('.loading-status__spinner');setLoadingStatus(target,'Checking account');assert.equal(target.querySelector('.loading-status__spinner'),spinner);
 assert.equal(target.querySelector('.loading-status__spinner').getAttribute('aria-hidden'),'true');
 target.textContent='Retry';assert.equal(target.querySelector('[role="status"]'),null);
});
test('gallery candidates use bounded thumbnail routes while viewer records retain originals',()=>{
 const source='https://images.kamitsubaki.wiki/gallery/photo.jpg',item={src:source,width:3000,height:2000};
 const attrs=galleryPreviewAttributes(source,{api:'https://api.example'});
 assert.match(attrs.srcset,/192w.*480w.*960w/);assert.ok(!attrs.srcset.includes(source));
 const image=new JSDOM().window.Image();applyGalleryPreview(image,item,{api:'https://api.example'});
 assert.equal(item.src,source);assert.match(image.src,/thumbnails\/192/);assert.equal(image.width,3000);
 image.dispatchEvent(new image.ownerDocument.defaultView.Event('error'));
 assert.equal(image.src,source);assert.equal(image.getAttribute('srcset'),null);assert.equal(image.onerror,null);
 for(const source of ['https://evil.example/gallery/a.jpg','data:image/png,x','/images/local.png','https://images.kamitsubaki.wiki/gallery/a.svg'])assert.deepEqual(galleryPreviewAttributes(source,{api:'https://api.example'}),{src:source});
});

test('Markdown responsive candidates retain original dimensions and respect authored picture sources',()=>{
 const image=()=>({type:'element',tagName:'img',properties:{src:'/images/original.jpg',alt:'Art'}}),inline=image(),directed=image();
 const tree={children:[inline,{type:'element',tagName:'picture',children:[directed]}]};
 responsiveMarkdownImages({resolveImage:()=>({src:'/small.webp',srcset:'/small.webp 480w',sizes:'720px',width:2560,height:1829})})(tree);
 assert.equal(inline.properties.src,'/small.webp');assert.equal(inline.properties.dataOriginal,'/images/original.jpg');assert.equal(inline.properties.dataOriginalWidth,2560);assert.equal(inline.properties.loading,'lazy');
 assert.deepEqual(directed.properties,{src:'/images/original.jpg',alt:'Art'});
});

test('published extensionless revisions and community assets receive previews, staging never does',()=>{
 for(const path of ['/gallery/item-1/revision-2','/community-activities/assets/user-1/hash.webp']){
  const src='https://images.kamitsubaki.wiki'+path;
  assert.equal(galleryPreviewAttributes(src,{api:'https://api.example'}).src,'https://api.example/api/gallery/thumbnails/192'+path);
 }
 const privateUrl='https://api.example/api/community-activities/assets/hash';
 assert.deepEqual(galleryPreviewAttributes(privateUrl,{api:'https://api.example'}),{src:privateUrl});
});
