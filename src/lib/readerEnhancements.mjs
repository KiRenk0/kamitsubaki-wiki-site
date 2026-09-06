const labels = {
  zh: {copy:'复制代码', copied:'已复制', failed:'复制失败，请选中代码复制', table:'表格，可横向滚动', spoiler:'点击显示或隐藏剧透'},
  'zh-tw': {copy:'複製程式碼', copied:'已複製', failed:'複製失敗，請選取程式碼複製', table:'表格，可橫向捲動', spoiler:'點擊顯示或隱藏劇透'},
  'zh-hk': {copy:'複製代碼', copied:'已複製', failed:'複製失敗，請選取代碼複製', table:'表格，可橫向捲動', spoiler:'點擊顯示或隱藏劇透'},
  en: {copy:'Copy code', copied:'Copied', failed:'Select the code to copy it', table:'Table, scroll horizontally', spoiler:'Reveal or hide spoiler'},
  ja: {copy:'コードをコピー', copied:'コピーしました', failed:'コードを選択してコピーしてください', table:'横にスクロールできる表', spoiler:'ネタバレの表示切替'},
};
/** Enhance already-sanitized reader DOM; never operates on editable document text. */
export function enhanceReader(root, locale = document.documentElement.lang) {
  const tag = locale.toLowerCase();
  const key = labels[tag] ? tag : tag.startsWith('zh') ? (tag.endsWith('-tw') ? 'zh-tw' : tag.endsWith('-hk') ? 'zh-hk' : 'zh') : tag.startsWith('ja') ? 'ja' : 'en';
  const copy = labels[key];
  root.querySelectorAll('pre').forEach(pre => {
    if (pre.closest('[contenteditable="true"], .reader-code')) return;
    const code = pre.querySelector('code');
    if (!code) return;
    const wrapper = document.createElement('div'); wrapper.className = 'reader-code';
    const toolbar = document.createElement('div'); toolbar.className = 'reader-code__toolbar';
    const language = document.createElement('span');
    language.textContent = [...code.classList].find(c => c.startsWith('language-'))?.slice(9) || pre.dataset.language || 'Code';
    const button = document.createElement('button'); button.type = 'button'; button.textContent = copy.copy;
    button.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(code.textContent); button.textContent = copy.copied; }
      catch { button.textContent = copy.failed; const range = document.createRange(); range.selectNodeContents(code); const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range); }
      setTimeout(() => { button.textContent = copy.copy; }, 1800);
    });
    toolbar.append(language,button); pre.before(wrapper); wrapper.append(toolbar,pre);
  });
  root.querySelectorAll('table').forEach(table => {
    if (table.closest('[contenteditable="true"],.reader-table-scroll')) return;
    const wrapper = document.createElement('div'); wrapper.className = 'reader-table-scroll'; wrapper.tabIndex = 0;
    wrapper.setAttribute('role','region'); wrapper.setAttribute('aria-label',copy.table);
    table.before(wrapper); wrapper.append(table);
  });
  root.querySelectorAll('.wiki-spoiler').forEach(spoiler => {
    if (spoiler.closest('[contenteditable="true"]')) return;
    spoiler.tabIndex = 0; spoiler.setAttribute('role','button'); spoiler.setAttribute('aria-expanded',String(spoiler.classList.contains('is-revealed'))); spoiler.setAttribute('aria-label',copy.spoiler);
  });
  root.querySelectorAll('abbr[title]').forEach(abbr => {
    if (abbr.closest('[contenteditable="true"]') || abbr.dataset.readerReady) return;
    abbr.dataset.readerReady = 'true'; abbr.tabIndex = 0;
    abbr.setAttribute('aria-label', `${abbr.textContent}: ${abbr.title}`);
    abbr.addEventListener('click', () => abbr.classList.toggle('is-expanded'));
    abbr.addEventListener('keydown', event => { if (['Enter',' '].includes(event.key)) { event.preventDefault(); abbr.classList.toggle('is-expanded'); } if (event.key === 'Escape') abbr.classList.remove('is-expanded'); });
    abbr.addEventListener('blur', () => abbr.classList.remove('is-expanded'));
  });
}
