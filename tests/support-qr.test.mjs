import test from 'node:test';
import assert from 'node:assert/strict';
import {supportImageUrl,supportQrCropStyle} from '../src/lib/supportAssets.mjs';
const channel={qrImageUrl:'https://kamitsubaki.wiki/support-qr/test.png',qrCrop:{sourceUrl:'https://kamitsubaki.wiki/support-qr/test.png',x:100,y:200,width:400,height:400,sourceWidth:1000,sourceHeight:1200}};
test('QR display crop is bound to its source, stays inside it, and never changes the original image URL',()=>{
 assert.equal(supportImageUrl(channel.qrImageUrl),'/support-qr/test.png');
 assert.equal(supportQrCropStyle(channel),'--qr-width:250%;--qr-height:300%;--qr-left:-25%;--qr-top:-50%');
 assert.equal(supportQrCropStyle({...channel,qrImageUrl:'https://example.com/new.png'}),'');
 for(const change of [{width:0},{x:-1},{y:900},{height:300},{sourceWidth:0},{x:1.5}])assert.equal(supportQrCropStyle({...channel,qrCrop:{...channel.qrCrop,...change}}),'');
 assert.equal(supportQrCropStyle({qrImageUrl:channel.qrImageUrl}),'');
});
