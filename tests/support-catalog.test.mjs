import test from 'node:test';import assert from 'node:assert/strict';
import {supportCatalog,supportTier,withSupportQr} from '../src/lib/supportCatalog.mjs';
import {renderSupportData} from '../src/lib/supportView.mjs';
test('the verified profile QR cannot be reused for an edited or disabled channel',()=>{
 const item={id:'afdian',url:supportCatalog.source};assert.match(withSupportQr(item).qrImageUrl,/afdian.svg$/);
 assert.equal(withSupportQr({...item,url:'https://example.com'}).qrImageUrl,undefined);assert.equal(withSupportQr({...item,qrImageUrl:null}).qrImageUrl,null);
 assert.equal(supportCatalog.tiers.filter(t=>t.monthlyAmount===10).length,5);assert.equal(supportTier('kaf').name,'观测者花组');
});
test('a supporter label is derived from the same tier key used by the console',()=>{
 const data={currency:'CNY',channels:[],costs:[],annualReports:[],sponsors:[{id:'one',name:'<observer>',public:true,tier:'kaf',url:null}]};
 const wall=renderSupportData(data,{},'zh').wall;assert.match(wall,/观测者花组/);assert.match(wall,/&lt;observer&gt;/);assert.doesNotMatch(wall,/<observer>/);
});
