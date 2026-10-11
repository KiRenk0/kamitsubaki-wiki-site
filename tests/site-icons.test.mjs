import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {iconMarkup,setIconLabel} from '../src/lib/icons.mjs';

test('localized action labels retain plain text and accessible names after icon refresh',()=>{
 const doc=new JSDOM().window.document,button=doc.createElement('button');
 button.setAttribute('aria-label','关闭筛选');
 setIconLabel(button,'关闭筛选 ×');
 setIconLabel(button,'关闭筛选 ×');
 assert.equal(button.querySelectorAll('svg').length,1);
 assert.equal(button.querySelector('svg').dataset.icon,'x');
 assert.equal(button.querySelector('svg').getAttribute('aria-hidden'),'true');
 assert.equal(button.getAttribute('aria-label'),'关闭筛选');
 assert.equal(button.textContent.trim(),'关闭筛选');
});
test('icon labels cannot interpret source titles as HTML and preserve numeric dimensions',()=>{
 const doc=new JSDOM().window.document,a=doc.createElement('a');
 setIconLabel(a,'<img src=x onerror=alert(1)> ↗');
 assert.equal(a.querySelector('img'),null);
 assert.match(a.textContent,/<img src=x/);
 assert.equal(a.querySelector('svg').dataset.icon,'arrow-up-right');
 setIconLabel(a,'1920 × 1080 px');
 assert.equal(a.textContent,'1920 × 1080 px');
 assert.equal(a.querySelector('svg'),null);
});
test('invalid icon names fail explicitly and SVG attributes are escaped',()=>{
 assert.throws(()=>iconMarkup('imaginary-custom-icon'),/Unknown site icon/);
 const doc=new JSDOM(iconMarkup('arrow-up-right',{class:'" onload="alert(1)'})).window.document;
 assert.equal(doc.querySelector('svg').getAttribute('onload'),null);
});
