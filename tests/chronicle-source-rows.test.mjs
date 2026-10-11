import test from 'node:test';
import assert from 'node:assert/strict';
import {removeChronicleSourceRow} from '../src/lib/chronicleSourceRows.mjs';

function fixture(count){
 const rows=Array.from({length:count},(_,index)=>{
  const inputs=[{value:`Title ${index+1}`},{value:`https://example.org/${index+1}`}];
  return {inputs,querySelectorAll:()=>inputs,remove(){rows.splice(rows.indexOf(this),1);}};
 });
 return {rows,form:{querySelectorAll:()=>rows}};
}

test('deleting an early source preserves every later source row and its data',()=>{
 const {rows,form}=fixture(3),second=rows[1],third=rows[2];
 removeChronicleSourceRow(form,rows[0]);
 assert.deepEqual(rows,[second,third]);
 assert.deepEqual(rows.map(row=>row.inputs.map(input=>input.value)),[['Title 2','https://example.org/2'],['Title 3','https://example.org/3']]);
});

test('the last source row stays available with only its own fields cleared',()=>{
 const {rows,form}=fixture(1),last=rows[0];
 removeChronicleSourceRow(form,last);
 assert.equal(rows[0],last);
 assert.deepEqual(last.inputs.map(input=>input.value),['','']);
});
