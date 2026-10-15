import test from 'node:test';
import assert from 'node:assert/strict';
import {createAiStreamParser,parseAiStreamChunk} from '../src/lib/aiStream.mjs';
test('library parser preserves split CRLF, multiline JSON and independent response state',()=>{
 const a=createAiStreamParser(),b=createAiStreamParser();
 assert.deepEqual(a.feed('event: delta\r'),[]);assert.deepEqual(b.feed('event: delta\ndata: {"text":"B"}\n\n'),[{type:'delta',data:{text:'B'}}]);
 assert.deepEqual(a.feed('\ndata: {"text":\r\ndata: "花譜"}\r\n\r'),[]);assert.deepEqual(a.feed('\n'),[{type:'delta',data:{text:'花譜'}}]);
});
test('library adapter ignores heartbeat and reports malformed business JSON',()=>{
 const p=createAiStreamParser();assert.deepEqual(p.feed(': ping\n\nevent: delta\ndata: {bad}\n\n'),[{type:'error',data:{code:'invalid_stream_event'}}]);
 const first=parseAiStreamChunk('event: delta\ndata: {"text":"par');assert.equal(first.events.length,0);
 assert.deepEqual(parseAiStreamChunk('t"}\n\n',first.remainder).events,[{type:'delta',data:{text:'part'}}]);
});
