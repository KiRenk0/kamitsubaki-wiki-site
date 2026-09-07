import { normalizePracticeState, movePracticeLine } from '../lib/practiceState.mjs';

for (const root of document.querySelectorAll('[data-practice]')) {
  const $ = selector => root.querySelector(selector);
  const lines = [...document.querySelectorAll('.wiki-reader .my-lyric-box .lyric-line')];
  if (!lines.length) continue;
  $('[data-practice-tools]').hidden = false;
  $('[data-practice-empty]').hidden = true;
  const c = JSON.parse($('[data-practice-copy]').textContent);
  const key = `kamitsubaki-practice-v1:${location.pathname.replace(/\/$/,'')}`;
  let state = normalizePracticeState({}, lines.length), timer, readable = true, undo, answer = false;
  const message = value => { $('[data-practice-status]').textContent = value; };
  try { const raw = localStorage.getItem(key); if (raw) state = normalizePracticeState(JSON.parse(raw), lines.length); }
  catch { readable = false; message(c.storage); }
  function persist() {
    if (!readable) return;
    try { localStorage.setItem(key, JSON.stringify(state)); message(''); }
    catch { message(c.storage); }
  }
  const jump = $('[data-jump]');
  lines.forEach((line, index) => {
    const text = (line.querySelector('.jp-lyric') || line).cloneNode(true);
    text.querySelectorAll('rt,.lrc-tag').forEach(node => node.remove());
    const option = document.createElement('option'); option.value = String(index);
    option.textContent = `${index + 1}. ${text.textContent.trim().slice(0,65)}`; jump.append(option);
  });
  function display() {
    root.dataset.hints = state.hints;
    root.dataset.translation = state.translation || answer ? 'show' : 'hide';
    for (const b of root.querySelectorAll('[data-hint]')) b.setAttribute('aria-pressed', String(b.dataset.hint === state.hints));
    $('[data-translation-toggle]').setAttribute('aria-pressed', String(state.translation));
    const hasTranslation = Boolean(lines[state.index].querySelector('.cn-lyric,.trans-lyric'));
    $('[data-answer]').hidden = state.translation || !hasTranslation;
    $('[data-answer]').textContent = answer ? c.hideAnswer : c.showAnswer;
  }
  function render() {
    const clone = lines[state.index].cloneNode(true);
    for (const node of [clone, ...clone.querySelectorAll('*')]) {
      for (const attr of [...node.attributes]) if (attr.name === 'id' || attr.name === 'style' || attr.name.startsWith('data-lrc') || attr.name === 'tabindex') node.removeAttribute(attr.name);
      node.classList.remove('is-active','is-complete','has-lrc-timing');
    }
    clone.querySelectorAll('.lrc-tag').forEach(n => n.remove());
    $('[data-practice-line]').replaceChildren(clone);
    $('[data-line-status]').textContent = `${state.index + 1} / ${lines.length}`;
    $('[data-progress-text]').textContent = `${c.progress} ${state.learned.length} / ${lines.length}`;
    $('[data-practice-summary]').textContent = `${state.learned.length} / ${lines.length}`;
    $('[data-practice-progress]').max = lines.length; $('[data-practice-progress]').value = state.learned.length;
    const learned = state.learned.includes(state.index);
    $('[data-mastered]').setAttribute('aria-pressed', String(learned));
    $('[data-mastered]').textContent = learned ? c.learned : c.mastered;
    for (const name of ['start','end','interval']) $(`[data-${name}]`).value = String(state[name]);
    $('[data-start]').max = $('[data-end]').max = String(lines.length);
    jump.value = String(state.index);
    $('[data-practice-undo]').hidden = !undo;
    display();
  }
  function change(next, keepUndo = false) { if (!keepUndo) undo = undefined; state = normalizePracticeState(next, lines.length); answer = false; render(); persist(); }
  function move(delta) { change({ ...state, index: movePracticeLine(state, delta) }); }
  function stop() {
    if (timer !== undefined) clearInterval(timer); timer = undefined;
    $('[data-play]').textContent = c.play; $('[data-play]').setAttribute('aria-pressed', 'false');
  }
  function run() { stop(); timer = setInterval(() => move(1), state.interval * 1000); $('[data-play]').textContent = c.pause; $('[data-play]').setAttribute('aria-pressed', 'true'); }
  $('[data-previous]').addEventListener('click', () => move(-1));
  $('[data-next]').addEventListener('click', () => move(1));
  $('[data-play]').addEventListener('click', () => timer === undefined ? run() : stop());
  for (const name of ['start','end','interval']) $(`[data-${name}]`).addEventListener('change', event => { change({ ...state, [name]: Number(event.target.value) }); if (timer !== undefined) run(); });
  for (const b of root.querySelectorAll('[data-hint]')) b.addEventListener('click', () => change({ ...state, hints: b.dataset.hint }));
  $('[data-translation-toggle]').addEventListener('click', () => change({ ...state, translation: !state.translation }));
  $('[data-answer]').addEventListener('click', () => { answer = !answer; display(); });
  jump.addEventListener('change', () => {
    const index = Number(jump.value);
    change({ ...state, index, start: Math.min(state.start, index + 1), end: Math.max(state.end, index + 1) });
  });
  $('[data-mastered]').addEventListener('click', () => change({ ...state, learned: state.learned.includes(state.index) ? state.learned.filter(i => i !== state.index) : [...state.learned, state.index] }));
  $('[data-practice-reset]').addEventListener('click', () => { stop(); undo = structuredClone(state); change({ ...state, index: 0, learned: [], start: 1, end: lines.length }, true); if (readable && !$('[data-practice-status]').textContent) message(c.learningReset); });
  $('[data-practice-undo]').addEventListener('click', () => { if (!undo) return; stop(); const previous = undo; undo = undefined; change(previous); });
  $('[data-practice-stage]').addEventListener('keydown', event => {
    if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) return;
    if (!['ArrowLeft','ArrowRight',' '].includes(event.key)) return;
    event.preventDefault();
    if (event.key === ' ') timer === undefined ? run() : stop(); else move(event.key === 'ArrowLeft' ? -1 : 1);
  });
  root.addEventListener('toggle', () => { if (!root.open) stop(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('pagehide', stop);
  render();
}
