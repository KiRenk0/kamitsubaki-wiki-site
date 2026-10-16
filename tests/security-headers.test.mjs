import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const headers=readFileSync(new URL('../public/_headers',import.meta.url),'utf8');

test('every page gets HSTS and a restrictive permissions policy',()=>{
 const block=headers.split(/\n(?=\S)/).find(part=>part.startsWith('/*'));
 assert.ok(block,'a catch-all header block exists');
 assert.match(block,/Strict-Transport-Security: max-age=\d{7,}/);
 assert.doesNotMatch(block,/includeSubDomains/,'subdomains stay independently managed');
 assert.match(block,/Permissions-Policy: .*camera=\(\)/);
});

test('framing is not blocked because the admin console previews Wiki pages in an iframe',()=>{
 assert.doesNotMatch(headers,/X-Frame-Options/i);
 assert.doesNotMatch(headers,/frame-ancestors/i);
});
