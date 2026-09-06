import { guideSteps, guideStorageKey, guideTask, normalizeGuideTarget, readGuideProgress, nextGuideStep } from '../lib/contributionGuide.mjs';

const root = document.querySelector('[data-contribution-guide]');
if (root) {
  const $ = selector => root.querySelector(selector);
  const $$ = selector => [...root.querySelectorAll(selector)];
  const copy = JSON.parse($('[data-guide-copy]').textContent);
  const params = new URLSearchParams(location.search);
  const target = normalizeGuideTarget(params.get('target'));
  let completed = [];
  let storageWorks = true;
  try { completed = readGuideProgress(localStorage.getItem(guideStorageKey)); } catch { storageWorks = false; }
  if (params.has('target')) {
    $('[data-target]').hidden = false;
    $('[data-target-path]').textContent = target?.path || copy.invalidTarget;
    $('[data-target-hint]').textContent = target ? (target.visual ? copy.targetHint : copy.unsupported) : '';
    if (target) {
      const github = $('[data-github-edit-link]');
      github.hidden = false;
      github.href = target.github;
      if (target.visual) $$('a[href*="/contribute/editor/"]').forEach(link => { const url = new URL(link.href); url.searchParams.set('target', target.path); link.href = url.href; });
    }
  }
  function syncLocaleLinks() {
    document.querySelectorAll('[aria-label="Language switcher"] a').forEach(link => {
      const url = new URL(link.href);
      if (!/\/contribute\/edit\/?$/.test(url.pathname)) return;
      url.search = location.search;
      url.hash = location.hash;
      link.href = url.href;
    });
  }
  function selectTask(task, updateUrl = false) {
    $('[data-task-action]').href = {fix:'#lesson-load',source:'#lesson-sources',translate:'#workshop-translation','new-entry':'#workshop-new-entry'}[task];
    $$('[data-guide-task]').forEach(button => {
      const selected = button.dataset.guideTask === task;
      button.setAttribute('aria-pressed', String(selected));
      if (selected) $('[data-task-hint]').textContent = button.dataset.next;
    });
    if (updateUrl) {
      const url = new URL(location.href);
      url.searchParams.set('task', task);
      url.searchParams.delete('mode');
      history.replaceState(history.state, '', url);
    }
    syncLocaleLinks();
  }
  function renderProgress() {
    $$('[data-step-complete]').forEach(button => {
      const done = completed.includes(button.dataset.stepComplete);
      button.textContent = done ? copy.completed : copy.complete;
      button.setAttribute('aria-pressed', String(done));
      button.closest('[data-guide-step]').dataset.done = String(done);
    });
    $$('[data-lesson-link]').forEach(link => { link.dataset.done = String(completed.includes(link.dataset.lessonLink)); });
    $('[data-guide-progress]').value = completed.length;
    $('[data-progress-count]').textContent = `${completed.length} / ${guideSteps.length}`;
    const next = nextGuideStep(completed);
    const resume = $('[data-resume]');
    resume.href = next ? `#lesson-${next}` : '#guide-finish';
    resume.textContent = next ? `${copy.continue} →` : copy.allDone;
    $('[data-storage-note]').textContent = storageWorks ? copy.storage : copy.storageFailed;
  }
  function saveProgress() {
    try { localStorage.setItem(guideStorageKey, JSON.stringify(completed)); storageWorks = true; } catch { storageWorks = false; }
    renderProgress();
  }
  function revealHash() {
    let hash;
    try { hash = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    // Existing shared links still arrive at the corresponding new learning stage.
    const legacy = hash.match(/^(?:beginner|web|experienced|new-entry)-step-(\d+)$/);
    const destination = legacy ? `lesson-${guideSteps[Math.min(Number(legacy[1]) - 1, guideSteps.length - 1)]}` : hash;
    const element = document.getElementById(destination);
    if (element instanceof HTMLDetailsElement) element.open = true;
    if (element && (element instanceof HTMLDetailsElement || legacy)) requestAnimationFrame(() => element.scrollIntoView({block:'start'}));
    syncLocaleLinks();
  }
  $$('[data-guide-task]').forEach(button => button.addEventListener('click', () => selectTask(button.dataset.guideTask, true)));
  $$('[data-step-complete]').forEach(button => button.addEventListener('click', () => {
    const id = button.dataset.stepComplete;
    completed = completed.includes(id) ? completed.filter(value => value !== id) : [...completed, id];
    saveProgress();
  }));
  $('[data-reset-progress]').addEventListener('click', () => { if (confirm(copy.resetConfirm)) { completed = []; saveProgress(); } });
  $('[data-copy-pr]').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText($('[data-pr-template]').value); $('[data-copy-status]').textContent = copy.copied; }
    catch { $('[data-copy-status]').textContent = copy.copyFailed; $('[data-pr-template]').focus(); $('[data-pr-template]').select(); }
  });
  root.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const details = document.getElementById(link.getAttribute('href').slice(1));
    if (details instanceof HTMLDetailsElement) details.open = true;
  });
  window.addEventListener('hashchange', revealHash);
  window.addEventListener('popstate', () => { selectTask(guideTask(new URLSearchParams(location.search).get('task'))); revealHash(); });
  window.addEventListener('storage', event => { if (event.key === guideStorageKey || event.key === null) { completed = readGuideProgress(event.newValue); renderProgress(); } });
  selectTask(guideTask(params.get('task') || (params.get('mode') === 'new-entry' ? 'new-entry' : null)));
  renderProgress();
  if (!location.hash && params.get('mode') === 'experienced') { $('[id="lesson-submit"]').open = true; }
  revealHash();
}
