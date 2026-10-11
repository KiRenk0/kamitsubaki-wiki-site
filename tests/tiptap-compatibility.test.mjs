import test from 'node:test';
import assert from 'node:assert/strict';
import {createTiptapProbe,compatibilityCases,hasNode} from '../scripts/lib/tiptapCompatibility.mjs';

test('Tiptap baseline preserves ordinary Markdown and supports reversible formatting/undo',async()=>{
 const probe=createTiptapProbe();try{
  for(const fixture of compatibilityCases().filter(c=>['standard-markdown','table','code'].includes(c.name)))assert.equal((await probe.check(fixture.source)).sameRenderedContent,true,fixture.name);
  const editor=probe.editor;probe.roundTrip('花譜 日本語');editor.commands.setTextSelection({from:1,to:3});editor.commands.toggleBold();assert.equal(editor.getMarkdown(),'**花譜** 日本語');
  editor.commands.toggleBold();assert.equal(editor.getMarkdown(),'花譜 日本語');
  editor.commands.insertContentAt(7,' English');assert.match(editor.getMarkdown(),/English/);editor.commands.undo();assert.doesNotMatch(editor.getMarkdown(),/English/);editor.commands.redo();assert.match(editor.getMarkdown(),/English/);
 }finally{probe.close();}
});

test('compatibility gate detects lost blackouts, timed lyrics and image-caption association',async()=>{
 const probe=createTiptapProbe();try{
  for(const locale of ['zh','zh-tw','zh-hk','ja','en']){
   const fixtures=compatibilityCases(locale);
   for(const name of ['html-spoiler','timed-lyrics'])assert.equal((await probe.check(fixtures.find(c=>c.name===name).source)).sameRenderedContent,false,locale+':'+name);
   const image=fixtures.find(c=>c.name==='image-caption');assert.equal(probe.roundTrip(image.source).output.includes(image.protectedText),false);
   const ruby=fixtures.find(c=>c.name==='shortcode-ruby'),result=probe.roundTrip(ruby.source);
   assert.equal(result.output,ruby.source);assert.equal(hasNode(result.document,'ruby'),false,'preserved plain text is not a ruby editor node');
  }
 }finally{probe.close();}
});
