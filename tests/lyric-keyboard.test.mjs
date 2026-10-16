import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {JSDOM} from 'jsdom';
import {renderMarkdownFragment} from '../src/lib/markdown.mjs';

const require = createRequire(import.meta.url);
const {build} = createRequire(require.resolve('vite'))('esbuild');
const site = (await build({entryPoints:['src/scripts/siteInteractions.js'],bundle:true,platform:'browser',format:'iife',write:false})).outputFiles[0].text;
const markup = await renderMarkdownFragment(`{{lyrics-controls::zh}}

<div class="my-lyric-box"><div class="lyric-line"><div class="jp-lyric">[00:00.00]歌[00:01.00]声</div></div><div class="lyric-line"><div class="jp-lyric">[00:02.00]空[00:03.00]色</div></div></div>`);

function mount() {
  const dom = new JSDOM(`<article class="wiki-reader">${markup}</article>`,{url:'https://wiki.example/zh/database/music/songs/test/',runScripts:'outside-only'});
  const w = dom.window;
  w.matchMedia = () => ({matches:true,addEventListener(){},removeEventListener(){}});
  w.requestAnimationFrame = () => 1;
  w.cancelAnimationFrame = () => {};
  w.eval(site);
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  const controls = w.document.querySelector('.my-lyric-controls');
  return {w,controls,box:controls.nextElementSibling,button:action => controls.querySelector(`[data-lyric-action="${action}"]`)};
}

test('synchronized lyric lines can be focused and played with the keyboard, and stop being tab stops when sync ends', () => {
  const b = mount();
  try {
    const enable = b.button('sync-lyrics'),lines = [...b.box.querySelectorAll('.lyric-line')];
    assert.equal(lines[0].hasAttribute('tabindex'),false,'plain lyrics add no tab stops');
    enable.click();
    for (const line of lines) {
      assert.equal(line.getAttribute('tabindex'),'0');
      assert.equal(line.getAttribute('role'),'button');
    }
    lines[1].dispatchEvent(new b.w.KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));
    assert.equal(lines[1].getAttribute('aria-current'),'true');
    assert.equal(b.button('sync-play-pause').getAttribute('aria-pressed'),'true');
    enable.click();
    for (const line of lines) assert.equal(line.hasAttribute('tabindex'),false);
  } finally {b.w.close();}
});

test('the play button keeps its accessible name when a label attribute is missing', () => {
  const b = mount();
  try {
    b.button('sync-lyrics').click();
    const play = b.button('sync-play-pause'),name = play.textContent;
    delete play.dataset.alternateLabel;
    play.click();
    assert.equal(play.textContent,name);
    assert.ok(play.textContent.trim().length > 0);
  } finally {b.w.close();}
});
