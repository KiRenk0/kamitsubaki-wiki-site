import assert from 'node:assert/strict';
import test from 'node:test';
import { parse } from 'yaml';
import { newDraft, newBlock, blockMarkdown, exportMarkdown, importMarkdown, validateDraft, validPath, safeUrl } from '../src/lib/visualEditor.mjs';
import { renderMarkdownDocument } from '../src/lib/markdown.mjs';

const metadata = source => parse(source.match(/^---\n([\s\S]*?)\n---/)[1]);
test('exports typed metadata for all five supported article types', () => {
  const records = {
    artists: {name:'花譜',romanizedName:'KAF',image:'/images/kaf.jpg'},
    songs: {title:'歌',artist:'花譜',artistId:'kaf',releaseDate:'2026-09-05',duration:'04:30'},
    albums: {title:'专辑',artist:'花譜',trackCount:3},
    projects: {title:'企划',description:'简介'},
    logs: {title:'演出',date:'2026-09-05'},
  };
  for (const [kind, values] of Object.entries(records)) {
    const draft = newDraft(kind); Object.assign(draft.meta, values, {translationKey:'test-entry'});
    assert.deepEqual(validateDraft(draft), []);
    const result = metadata(exportMarkdown(draft));
    for (const [key,value] of Object.entries(values)) assert.equal(result[key],value);
    assert.equal(result.locale,'zh');
    assert.ok(exportMarkdown(draft).startsWith('---\nlocale: zh\n'));
  }
});
test('requires fields, valid music IDs, duration, integer track counts and matching file paths', () => {
  const draft = newDraft('songs');
  assert.ok(validateDraft(draft).includes('artistId'));
  Object.assign(draft.meta,{title:'x',artist:'x',translationKey:'x',artistId:'bad ID',duration:'3:99:9',releaseDate:'tomorrow'});
  draft.path = 'src/content/songs/kaf/originals/x/en.md';
  for (const f of ['artistId','duration','releaseDate','path']) assert.ok(validateDraft(draft).includes(f));
  assert.equal(validPath('src/content/artists/../kaf/zh.md'),false);
  assert.equal(validPath('src/content/songs/kaf/originals/new-song/zh.md'),true);
  assert.equal(safeUrl('javascript:alert(1)'),false);
  assert.equal(safeUrl('//evil.test/x'),false);
});
test('preserves unknown nested frontmatter, comments and complex sections while editing adjacent paragraphs', () => {
  const source = `---\nlocale: zh\ntranslationKey: sample\nname: 花譜\nromanizedName: KAF\nstatusLabel: STATUS\nstatus: ACTIVE\nimage: /image.jpg\n# keep this attribution\nlicense:\n  code: authorized-use\n  attribution: original author\ncustom:\n  nested: [a, b]\n---\n\n## 概述\n\nOriginal **paragraph**.\n\n## 歌词\n\n{{lyrics-controls::zh}}\n\n<div class="my-lyric-box">original\n\ncontent</div>\n\n## 来源\n\n[Official](https://example.com/)\n`;
  const draft = importMarkdown(source,'projects');
  assert.equal(draft.kind,'artists');
  const paragraph = draft.blocks.find(b => b.type === 'paragraph');
  paragraph.text = 'Updated **paragraph**.';
  draft.meta.name = 'Updated name';
  const exported = exportMarkdown(draft);
  assert.match(exported, /# keep this attribution/);
  assert.deepEqual(metadata(exported).custom,{nested:['a','b']});
  assert.equal(metadata(exported).license.attribution,'original author');
  assert.match(exported, /Updated \*\*paragraph\*\*/);
  assert.ok(exported.includes('{{lyrics-controls::zh}}\n\n<div class="my-lyric-box">original\n\ncontent</div>'));
  assert.ok(exported.includes('[Official](https://example.com/)'));
});
test('rejects malformed YAML, derived locales and oversized imports without producing a partial draft', () => {
  for (const source of ['plain text','---\nlocale: [bad\n---\ntext','---\nlocale: zh-tw\n---\ntext','x'.repeat(1_000_001)]) assert.throws(()=>importMarkdown(source,'projects'));
});
test('table, media, ruby, disclosures and lyric exports render through the real site pipeline', async () => {
  const blocks = [
    {...newBlock('table'),rows:[['艺人','说明'],['花譜','A | B']]},
    {...newBlock('media'),provider:'apple-music',url:'https://music.apple.com/jp/album/x/1688351143?i=1688351157'},
    {...newBlock('ruby'),text:'花譜',kana:'かふ',romaji:'kaf'},
    {...newBlock('details'),title:'背景',text:'A < B'},
    {...newBlock('lyrics'),rows:[{original:'花譜 <script>alert(1)</script>',kana:'かふ',romaji:'kaf',translation:'译文 & 文本'}]},
  ];
  const markdown = blocks.map(b=>blockMarkdown(b,'zh')).join('\n\n');
  const {html} = await renderMarkdownDocument(markdown);
  assert.match(html, /<table>/);
  assert.match(html, /A \| B/);
  assert.match(html, /embed.music.apple.com/);
  assert.match(html, /<ruby>花譜<rt class="furi">かふ/);
  assert.match(html, /<details/);
  assert.match(html, /my-lyric-box/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /(?:&lt;|&#x3C;)script(?:&gt;|>)/);
});
test('media validates with the same providers as the published reader', () => {
  const draft = newDraft('projects');
  draft.blocks = [{...newBlock('media'),provider:'youtube',url:'https://evil.test/watch?v=id'}];
  assert.ok(validateDraft(draft).includes('url'));
  draft.blocks[0].url = 'https://www.youtube.com/watch?v=abc123';
  assert.ok(!validateDraft(draft).includes('url'));
});

test('existing artist and song sources round-trip without edits, including all advanced markup', async () => {
  const {readFile} = await import('node:fs/promises');
  for(const path of ['src/content/artists/vwp/kaf/zh.md','src/content/songs/kaf/originals/不可解-inexplicable/zh.md']) {
    const source=await readFile(new URL('../'+path,import.meta.url),'utf8');
    const draft=importMarkdown(source,'projects',path);
    assert.equal(exportMarkdown(draft),source);
    if(draft.kind==='artists') assert.ok(draft.blocks.filter(b=>b.type==='paragraph').length>10);
    else assert.ok(draft.blocks.some(b=>b.type==='lyrics'));
  }
});

test('every documented inline shortcode and advanced block renders with the site renderer',async()=>{
  const specs={ruby:['花譜','かふ','kaf'],spoiler:['结局'],mark:['重点'],abbr:['V.W.P','Virtual Witch Phenomenon'],kbd:['Ctrl+K'],time:['今天','2026-09-06'],small:['附注'],sub:['2'],sup:['2'],'zh-variant':['软件','軟體','軟件']};
  const inline=Object.entries(specs).map(([kind,args])=>({...newBlock('inline'),kind,args}));
  const switcher={...newBlock('media-switcher'),title:'视听',items:[{provider:'youtube',url:'https://youtu.be/abc123'},{provider:'bilibili',url:'BV1xx411c7mD'}]};
  const code={...newBlock('code'),language:'js',text:'const literal = "```";\nconsole.log(literal);'};
  const math={...newBlock('math'),text:'x^2 + y^2 = 1'};
  const {html}=await renderMarkdownDocument([...inline,switcher,code,math].map(b=>blockMarkdown(b)).join('\n\n'));
  for(const marker of ['<ruby>','wiki-spoiler','<mark>','<abbr','<kbd>','<time','<small>','<sub>','<sup>','wiki-media-switcher','<pre','katex'])assert.ok(html.includes(marker),marker);
});

test('timed lyric units export timestamps in the expected places and reject reversed timing', async()=>{
  const draft=newDraft('songs');
  const lyric={...newBlock('lyrics'),rows:[{translation:'译文',units:[{original:'花',kana:'はな',romaji:'hana',time:'00:01.00'},{original:'譜',kana:'ふ',romaji:'fu',time:'00:02.500'}]}]};
  draft.blocks=[lyric];
  const text=blockMarkdown(lyric);
  assert.match(text,/\[00:01.00\]<ruby>花/);assert.match(text,/\[00:02.500\]<ruby>譜/);assert.match(text,/<div class="cn-lyric">\[00:01.00\]译文/);
  const {html}=await renderMarkdownDocument(text);assert.match(html,/data-time="1"/);
  lyric.rows[0].units[1].time='00:00.50';assert.ok(validateDraft(draft).includes('lyrics'));
});

test('source requests only expose valid content collections and stable Unicode buckets',async()=>{
  const {sourceRequest,sourceBucket}=await import('../src/lib/editorSource.mjs');
  assert.equal(sourceRequest('src/content/artists/../../.env/zh.md'),null);
  assert.equal(sourceRequest('/etc/passwd'),null);
  assert.equal(sourceRequest('src/content/site/zh.json'),null);
  assert.match(sourceRequest('src/content/artists/vwp/kaf/zh.md'),/^\/zh\/editor-source\/artists\/[0-7]\.json$/);
  assert.equal(sourceBucket('é'),sourceBucket('é'.normalize('NFD')));
});

test('advanced metadata validates licensing, link fields and canonical artist membership',async()=>{
  const {advancedErrors}=await import('../src/lib/editorMetadata.mjs');
  assert.deepEqual(advancedErrors({license:{code:'CC-BY-NC-SA-4.0'}}),[]);
  assert.ok(advancedErrors({license:{code:'CC-BY-NC-SA-3.0-CN'}}).includes('license'));
  assert.ok(advancedErrors({officialLinks:[{label:'x',href:'javascript:alert(1)'}]}).includes('officialLinks'));
  assert.ok(advancedErrors({artistId:'kaf',artistIds:['rim']}).includes('artistIds'));
  assert.deepEqual(advancedErrors({artistId:'kaf',artistIds:['kaf','rim']}),[]);
});

test('optional empty metadata is omitted and imported lyric controls follow content language', async()=>{
  const draft=newDraft('songs');
  draft.meta.duration=''; draft.meta.license={code:'CC-BY-NC-SA-4.0',sourceUrl:''};
  const meta=metadata(exportMarkdown(draft));
  assert.equal(meta.duration,undefined); assert.equal(meta.license.sourceUrl,undefined);
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(new URL('../src/content/songs/kaf/originals/不可解-inexplicable/zh.md',import.meta.url),'utf8');
  const imported=importMarkdown(source,'songs'); imported.meta.locale='en';
  assert.match(exportMarkdown(imported),/\{\{lyrics-controls::en\}\}/);
});
