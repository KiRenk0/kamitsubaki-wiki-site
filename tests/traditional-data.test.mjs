import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {traditionalDefinition,uiOverrides} from '../src/i18n/traditional-data.generated.mjs';

test('Pages-compatible ESM data exactly preserves both authoritative Chinese dictionaries',()=>{
  for(const [value,file] of [[traditionalDefinition,'traditional-definition.generated.json'],[uiOverrides,'traditional-ui-overrides.json']])
    assert.deepEqual(value,JSON.parse(readFileSync(new URL('../src/i18n/'+file,import.meta.url),'utf8')));
});
