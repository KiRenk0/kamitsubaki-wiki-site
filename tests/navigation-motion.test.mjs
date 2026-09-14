import test from 'node:test';
import assert from 'node:assert/strict';
import {pageDirection} from '../src/lib/navigationMotion.mjs';
test('history back uses the reverse transition',()=>assert.equal(pageDirection({navigationType:'traverse',from:{index:4},entry:{index:3}}),'back'));
test('history forward and ordinary links use forward transitions',()=>{
 assert.equal(pageDirection({navigationType:'traverse',from:{index:2},entry:{index:3}}),'forward');
 assert.equal(pageDirection({navigationType:'push',from:{index:4},entry:{index:3}}),'forward');
});
test('unsupported navigation information and reload are safe',()=>{
 assert.equal(pageDirection(undefined),'forward');
 assert.equal(pageDirection({navigationType:'reload'}),'forward');
 assert.equal(pageDirection({navigationType:'traverse',entry:{index:NaN},from:{index:4}}),'forward');
});
