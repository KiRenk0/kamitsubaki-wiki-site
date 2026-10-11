import test from 'node:test';
import assert from 'node:assert/strict';
import {editorArticleImageCopy,normalizeArticleImageUrl} from '../src/lib/editorArticleImage.mjs';

test('article image URLs accept public HTTPS images and site image paths',()=>{
  const base='https://kamitsubaki.wiki/zh/articles/submit/';
  assert.equal(normalizeArticleImageUrl('https://images.kamitsubaki.wiki/gallery/a.webp',base),'https://images.kamitsubaki.wiki/gallery/a.webp');
  assert.equal(normalizeArticleImageUrl('/images/example.jpg?size=large',base),'/images/example.jpg?size=large');
  assert.equal(normalizeArticleImageUrl(' /images/example.jpg#fragment ',base),'/images/example.jpg');
});

test('article image URLs reject local previews and private or unsafe paths',()=>{
  const base='https://kamitsubaki.wiki/zh/articles/submit/';
  for(const candidate of ['blob:https://kamitsubaki.wiki/abc','data:image/png;base64,abc','file:///tmp/image.png','http://example.com/image.jpg','https://localhost:8788/image','https://127.0.0.1/image','https://192.168.1.8/image','https://172.18.0.4/image','//evil.test/image','/api/gallery/revisions/123/image','https://api.kamitsubaki.wiki/api/gallery/revisions/123/image','images/example.jpg','https://user:pass@example.com/image.jpg','https://example.com/a\\b.jpg']){
    assert.equal(normalizeArticleImageUrl(candidate,base),null,candidate);
  }
});

test('article image instructions are provided for every site locale',()=>{
  for(const locale of ['zh','zh-tw','zh-hk','ja','en']){
    const copy=editorArticleImageCopy(locale);
    for(const key of ['open','description','url','alt','source','checking','ready','invalid','unavailable','insert','gallery'])assert.ok(copy[key],`${locale}.${key}`);
  }
});
