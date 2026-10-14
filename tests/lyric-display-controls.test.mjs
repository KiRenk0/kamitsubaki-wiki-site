import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {JSDOM} from 'jsdom';
import {renderMarkdownFragment} from '../src/lib/markdown.mjs';
import {personalToolsCopy} from '../src/lib/personalToolsCopy.mjs';

const require = createRequire(import.meta.url);
const {build} = createRequire(require.resolve('vite'))('esbuild');
const [site,practice] = await Promise.all([
  build({entryPoints:['src/scripts/siteInteractions.js'],bundle:true,platform:'browser',format:'iife',write:false}),
  build({entryPoints:['src/scripts/lyricsPractice.js'],bundle:true,platform:'browser',format:'iife',write:false}),
]);
const source = (locale = 'zh',timed = true) => `{{lyrics-controls::${locale}}}

<div class="my-lyric-box"><div class="lyric-line"><div class="jp-lyric">${timed?'[00:00.00]':''}<ruby>歌<rt class="furi">うた</rt><rt class="roma">uta</rt></ruby>${timed?'[00:01.00]':''}<ruby>声<rt class="furi">こえ</rt><rt class="roma">koe</rt></ruby></div><div class="trans-lyric">${timed?'[00:00.00]':''}A song</div></div><div class="lyric-line"><div class="jp-lyric">${timed?'[00:03.00]':''}<ruby>夜<rt class="furi">よる</rt><rt class="roma">yoru</rt></ruby></div><div class="trans-lyric">${timed?'[00:03.00]':''}Night</div></div></div>`;
const markup = await renderMarkdownFragment(source());
const styles = await readFile(new URL('../src/styles/readerInteractive.css',import.meta.url),'utf8');
const proseStyles = await readFile(new URL('../src/styles/readerFormats.css',import.meta.url),'utf8');
const lyricStyles = styles.slice(styles.indexOf('/* Safe interactive patterns'),styles.indexOf('/* Synchronized Lyrics Player Styles */'));

function fixture(html = markup,{scripts = true,study = false} = {}) {
  // Load prose rules last to verify the lyric menu wins by scope, not import order.
  const dom = new JSDOM(`<style>${lyricStyles}\n${proseStyles}</style><article class="wiki-reader">${html}</article>${study?practiceMarkup():''}`,{url:'https://wiki.example/zh/database/music/songs/test/',runScripts:'outside-only'});
  const w = dom.window,document = w.document;
  w.matchMedia = () => ({matches:true,addEventListener(){},removeEventListener(){}});
  let frame = 0;
  w.requestAnimationFrame = () => ++frame;
  w.cancelAnimationFrame = () => {};
  if (scripts) {
    w.eval(site.outputFiles[0].text);
    document.dispatchEvent(new w.Event('DOMContentLoaded'));
    if (study) w.eval(practice.outputFiles[0].text);
  }
  const controls = document.querySelector('.my-lyric-controls');
  const box = controls.nextElementSibling;
  const button = action => controls.querySelector(`[data-lyric-action="${action}"]`);
  return {dom,w,document,controls,box,button,menu:controls.querySelector(':scope > details')};
}

function practiceMarkup() {
  const copy = {...personalToolsCopy('en'),play:'Auto-advance',pause:'Pause',progress:'Learned'};
  return `<details data-practice data-hints="kana" data-translation="show"><summary>Practice <span data-practice-summary></span></summary><div data-practice-tools hidden><button data-hint="kana"></button><button data-hint="romaji"></button><button data-hint="none"></button><button data-translation-toggle></button><div data-practice-stage><span data-line-status></span><div data-practice-line></div><button data-answer></button></div><button data-previous></button><button data-play></button><button data-next></button><span data-progress-text></span><progress data-practice-progress></progress><button data-mastered></button><select data-jump></select><input data-start><input data-end><input data-interval><button data-practice-reset></button><button data-practice-undo></button></div><p data-practice-empty></p><span data-practice-status></span><script type="application/json" data-practice-copy>${JSON.stringify(copy)}</script></details>`;
}

test('native display disclosure survives sanitization, stays closed and preserves lyric adjacency in every locale',async () => {
  for (const [locale,label,buttons] of [['zh','歌词显示',3],['zh-tw','歌詞顯示',3],['zh-hk','歌詞顯示',3],['ja','歌詞表示',2],['en','Lyrics display',3]]) {
    const b = fixture(await renderMarkdownFragment(source(locale)),{scripts:false});
    try {
      assert.equal(b.menu.tagName,'DETAILS');
      assert.equal(b.menu.open,false);
      assert.equal(b.menu.querySelector(':scope > summary').textContent,label);
      assert.equal(b.menu.querySelectorAll('[data-lyric-action]').length,buttons);
      assert.equal(b.box.className,'my-lyric-box');
      assert.equal(b.controls.querySelectorAll(':scope > button[data-lyric-action^="sync-"]').length,3);
      assert.equal(b.menu.querySelectorAll('[data-lyric-action^="sync-"]').length,0);
      b.menu.querySelector('summary').click();
      assert.equal(b.menu.open,true,'native summary activation needs no menu script');
      b.menu.querySelector('summary').click();
      assert.equal(b.menu.open,false);
      assert.equal(b.box.className,'my-lyric-box','opening the display menu does not alter defaults');
    } finally {b.w.close();}
  }
});

test('nested display actions change only presentation, preserve labels and restore the initial state',() => {
  const b = fixture();
  try {
    b.menu.querySelector('summary').click();
    const lyrics = b.box.innerHTML;
    for (const [action,className,nextLabel,initialLabel] of [
      ['ruby','hide-ruby','显示注音','隐藏注音'],
      ['translation','hide-translation','显示翻译','隐藏翻译'],
      ['phonetic','show-romaji','切换假名注音','切换罗马音'],
    ]) {
      const button = b.button(action);
      assert.equal(button.getAttribute('aria-pressed'),'false');
      button.click();
      assert.equal(b.box.classList.contains(className),true);
      assert.equal(button.getAttribute('aria-pressed'),'true');
      assert.equal(button.textContent,nextLabel);
      button.click();
      assert.equal(b.box.classList.contains(className),false);
      assert.equal(button.getAttribute('aria-pressed'),'false');
      assert.equal(button.textContent,initialLabel);
      assert.equal(b.box.innerHTML,lyrics,'display toggles never rewrite lyric text or timing');
    }
    assert.equal(b.menu.open,true,'button actions keep the display disclosure open');
  } finally {b.w.close();}
});

test('closed display menu leaves synchronization, word highlighting, playback and reset directly usable',() => {
  const b = fixture();
  try {
    assert.equal(b.menu.open,false);
    const enable = b.button('sync-lyrics'),play = b.button('sync-play-pause'),reset = b.button('sync-reset');
    assert.equal(enable.parentElement,b.controls);
    assert.equal(play.hidden,true);assert.equal(reset.hidden,true);
    enable.click();
    assert.equal(b.box.classList.contains('sync-enabled'),true);
    assert.equal(play.hidden,false);assert.equal(reset.hidden,false);
    assert.equal(b.box.querySelectorAll('.lrc-tag').length,0);
    assert.equal(b.box.querySelectorAll('.lrc-word').length,5);
    const line = b.box.querySelectorAll('.lyric-line')[1];
    line.click();
    assert.equal(line.getAttribute('aria-current'),'true');
    assert.equal(play.getAttribute('aria-pressed'),'true');
    assert.equal(play.textContent,'暂停');
    assert.equal(b.box.querySelector('.lrc-word').style.getPropertyValue('--karaoke-progress'),'100%');
    assert.ok(b.box.querySelector('.lrc-word.is-complete'));
    play.click();
    assert.equal(play.getAttribute('aria-pressed'),'false');
    reset.click();
    assert.equal(play.textContent,'播放');
    assert.equal(b.box.querySelector('.lrc-word').style.getPropertyValue('--karaoke-progress'),'0%');
    assert.equal(b.box.querySelector('.lyric-line').getAttribute('aria-current'),'true');
    enable.click();
    assert.equal(play.hidden,true);assert.equal(reset.hidden,true);
    assert.equal(b.box.classList.contains('sync-enabled'),false);
    enable.click();
    assert.equal(b.box.querySelectorAll('.lrc-word').length,5,'re-enabling does not nest duplicate timed words');
    assert.equal(b.menu.open,false);
  } finally {b.w.close();}
});

test('multiple lyric blocks isolate display state and discard synchronization for an untimed neighbor',async () => {
  const html = await renderMarkdownFragment(source() + '\n\n' + source('zh',false));
  const b = fixture(html);
  try {
    const rows = b.document.querySelectorAll('.my-lyric-controls');
    const secondBox = rows[1].nextElementSibling;
    assert.ok(rows[0].querySelector('[data-lyric-action="sync-lyrics"]'));
    assert.equal(rows[1].querySelector('[data-lyric-action^="sync-"]'),null);
    b.button('ruby').click();
    assert.equal(b.box.classList.contains('hide-ruby'),true);
    assert.equal(secondBox.classList.contains('hide-ruby'),false);
    rows[1].querySelector('[data-lyric-action="translation"]').click();
    assert.equal(secondBox.classList.contains('hide-translation'),true);
    assert.equal(b.box.classList.contains('hide-translation'),false);
  } finally {b.w.close();}
});

test('without JavaScript lyrics keep their default readable state and nonfunctional tools stay hidden',() => {
  const b = fixture(markup,{scripts:false});
  try {
    assert.equal(b.w.getComputedStyle(b.controls).display,'none');
    assert.equal(b.w.getComputedStyle(b.box).display,'block');
    assert.equal(b.w.getComputedStyle(b.box.querySelector('.roma')).display,'none');
    assert.equal(b.w.getComputedStyle(b.box.querySelector('.trans-lyric')).visibility,'visible');
    assert.equal(b.box.querySelectorAll('.lyric-line').length,2);
    b.document.documentElement.classList.add('has-js');
    assert.equal(b.w.getComputedStyle(b.controls).display,'flex');
    assert.equal(b.w.getComputedStyle(b.menu.querySelector(':scope > div')).display,'none');
    b.menu.open = true;
    assert.equal(b.w.getComputedStyle(b.menu.querySelector(':scope > div')).display,'flex');
    assert.match(lyricStyles,/\.my-lyric-controls button\s*\{[\s\S]*?font-family:\s*inherit;/);
  } finally {b.w.close();}
});

test('lyric menu clears prose disclosure spacing and keeps a 44px touch target without changing normal disclosures',() => {
  const b = fixture(markup + '<details id="ordinary"><summary>Background</summary><p>Prose</p></details>');
  try {
    const summary = b.menu.querySelector('summary');
    const menuStyle = b.w.getComputedStyle(b.menu);
    assert.equal(menuStyle.margin,'0px');
    assert.equal(menuStyle.padding,'0px');
    assert.equal(menuStyle.borderWidth,'0px');
    assert.equal(b.w.getComputedStyle(summary).margin,'0px');
    assert.equal(b.w.getComputedStyle(summary).padding,'5.6px 11.2px');
    for (const control of [summary,...b.controls.querySelectorAll('button')]) {
      assert.equal(b.w.getComputedStyle(control).minHeight,'44px');
    }
    b.menu.open = true;
    assert.equal(b.w.getComputedStyle(summary).marginBottom,'0px');
    assert.equal(b.w.getComputedStyle(b.menu.querySelector(':scope > div')).marginBottom,'0px');
    const ordinary = b.document.getElementById('ordinary');
    assert.equal(b.w.getComputedStyle(ordinary).margin,'22.4px 0px');
    assert.equal(b.w.getComputedStyle(ordinary).padding,'0px 16px');
    assert.equal(b.w.getComputedStyle(ordinary.querySelector('summary')).padding,'12.8px 0px');
  } finally {b.w.close();}
});

test('display preferences and synchronization leave LABs practice and saved learning progress independent',() => {
  const b = fixture(markup,{study:true});
  try {
    const study = b.document.querySelector('[data-practice]');
    assert.equal(study.querySelector('[data-practice-tools]').hidden,false);
    assert.equal(study.querySelector('[data-jump]').options.length,2);
    const original = b.box.textContent;
    b.button('ruby').click();b.button('translation').click();b.button('phonetic').click();
    assert.equal(study.dataset.hints,'kana');assert.equal(study.dataset.translation,'show');
    study.querySelector('[data-next]').click();
    assert.match(study.querySelector('[data-practice-line]').textContent,/夜/);
    study.querySelector('[data-mastered]').click();
    const saved = JSON.parse(b.w.localStorage.getItem('kamitsubaki-practice-v1:/zh/database/music/songs/test'));
    assert.deepEqual(saved.learned,[1]);
    b.button('sync-lyrics').click();
    b.button('sync-reset').click();
    assert.equal(study.querySelector('[data-practice-progress]').value,1);
    assert.deepEqual(JSON.parse(b.w.localStorage.getItem('kamitsubaki-practice-v1:/zh/database/music/songs/test')).learned,[1]);
    assert.match(study.querySelector('[data-practice-line]').textContent,/夜/);
    assert.equal(b.box.textContent,original);
    study.querySelector('[data-hint="romaji"]').click();
    assert.equal(study.dataset.hints,'romaji');
    assert.equal(b.box.classList.contains('show-romaji'),true);
  } finally {b.w.close();}
});
