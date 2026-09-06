/* Resolve the Wiki theme before paint, including the runner nested inside the explorer. */
(() => {
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let parentRoot;
  try { if (window.frameElement?.id === 'memory-corridor-frame') root.dataset.wikiEmbedded = 'true'; } catch { /* Cross-origin frame. */ }
  try { if (window.parent !== window) parentRoot = window.parent.document.documentElement; } catch { /* Standalone or cross-origin embedding. */ }
  try {
    if (window.frameElement?.id === 'runnerFrame') {
      root.dataset.runnerEmbedded = 'true';
      if (parentRoot?.dataset.wikiEmbedded === 'true') root.dataset.wikiEmbedded = 'true';
    }
  } catch { /* Cross-origin frame. */ }
  const sync = () => {
    let theme = parentRoot?.dataset.theme;
    if (theme !== 'light' && theme !== 'dark') {
      let preference;
      try { preference = localStorage.getItem('kamitsubaki-theme'); } catch { /* System theme works without storage. */ }
      theme = preference === 'light' || preference === 'dark' ? preference : system.matches ? 'dark' : 'light';
    }
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f7f8f4' : '#020908');
  };
  sync();
  if (parentRoot) new MutationObserver(sync).observe(parentRoot, {attributes:true, attributeFilter:['data-theme']});
  system.addEventListener('change', sync);
  window.addEventListener('storage', event => { if (event.key === 'kamitsubaki-theme' || event.key === null) sync(); });
})();
