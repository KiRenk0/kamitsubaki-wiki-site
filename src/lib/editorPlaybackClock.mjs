const apiLoads = new WeakMap();
const youtubeHosts = new Set(['www.youtube.com', 'www.youtube-nocookie.com']);

/** Enable the documented IFrame Player API only for an editor-owned YouTube embed. */
export function youtubeEditorEmbedUrl(source, origin) {
  try {
    const embed = new URL(source);
    const site = new URL(origin);
    if (embed.protocol !== 'https:' || !youtubeHosts.has(embed.hostname)
      || !/^\/embed\/[A-Za-z0-9_-]+$/.test(embed.pathname)
      || !['http:', 'https:'].includes(site.protocol) || site.origin !== origin) return null;
    embed.searchParams.set('enablejsapi', '1');
    embed.searchParams.set('origin', site.origin);
    return embed.toString();
  } catch { return null; }
}

/** The YouTube API invokes one global readiness callback; share a single lazy load. */
export function loadYouTubeIframeAPI(win, doc, { timeoutMs = 15000 } = {}) {
  if (win?.YT?.Player) return Promise.resolve(win.YT);
  if (apiLoads.has(win)) return apiLoads.get(win);
  const loading = new Promise((resolve, reject) => {
    const previous = win.onYouTubeIframeAPIReady;
    let settled = false;
    const script = doc.createElement('script');
    const timeout = win.setTimeout(() => finish(new Error('youtube-api-timeout')), timeoutMs);
    function finish(error) {
      if (settled) return;
      settled = true;
      win.clearTimeout(timeout);
      if (win.onYouTubeIframeAPIReady === ready) win.onYouTubeIframeAPIReady = previous;
      if (error) { script.remove?.(); reject(error); }
      else resolve(win.YT);
    }
    function ready(...args) {
      try { previous?.(...args); } catch { /* Another player must not block the editor. */ }
      finish(win.YT?.Player ? null : new Error('youtube-api-unavailable'));
    }
    win.onYouTubeIframeAPIReady = ready;
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = () => finish(new Error('youtube-api-network'));
    try { doc.head.append(script); } catch (error) { finish(error); }
  });
  apiLoads.set(win, loading);
  void loading.catch(() => { if (apiLoads.get(win) === loading) apiLoads.delete(win); });
  return loading;
}

/** Return a real current time only while a media element or YouTube player is playing. */
export function sampleEditorPlayback(nativeMedia = [], youtubePlayers = [], preferred = null) {
  const candidates = [];
  for (const media of nativeMedia) {
    if (media?.isConnected === false || media?.paused !== false || media?.ended === true) continue;
    const seconds = media.currentTime;
    if (Number.isFinite(seconds) && seconds >= 0) candidates.push({ source: 'html5', seconds, identity: media });
  }
  for (const entry of youtubePlayers) {
    if (entry?.iframe?.isConnected === false) continue;
    try {
      if (entry?.player?.getPlayerState?.() !== 1) continue;
      const seconds = entry.player.getCurrentTime();
      if (Number.isFinite(seconds) && seconds >= 0) candidates.push({ source: 'youtube', seconds, identity: entry.player });
    } catch { /* A detached or failed third-party player has no readable time. */ }
  }
  return candidates.find(candidate => candidate.identity === preferred) || candidates.at(-1) || null;
}

export function createEditorPlaybackClock(root, { win = globalThis.window, doc = globalThis.document, onStatus = () => {} } = {}) {
  const players = new Set();
  const registrations = new WeakMap();
  const pendingStops = new Set();
  let preferred = null;
  let disposed = false;
  const onNativePlay = event => { if (event.target?.matches?.('audio,video')) preferred = event.target; };
  root.addEventListener('play', onNativePlay, true);

  function registerFigure(figure) {
    if (disposed || !figure) return Promise.resolve(false);
    const existing = registrations.get(figure);
    if (existing) return existing;
    const pending = registerFigureOnce(figure);
    registrations.set(figure, pending);
    void pending.then(success => { if (!success) registrations.delete(figure); });
    return pending;
  }

  async function registerFigureOnce(figure) {
    if (disposed || !figure) return false;
    if (figure.dataset?.mediaProvider !== 'youtube') { onStatus('manual'); return false; }
    const iframe = figure.querySelector('iframe');
    if (!iframe || !youtubeEditorEmbedUrl(iframe.getAttribute('src'), win.location.origin)) {
      onStatus('unavailable'); return false;
    }
    onStatus('connecting');
    try {
      const YT = await loadYouTubeIframeAPI(win, doc);
      if (disposed || iframe.isConnected === false) return false;
      const player = await new Promise((resolve, reject) => {
        let instance, settled = false;
        const timeout = win.setTimeout(() => settle(new Error('youtube-player-timeout')), 15000);
        const settle = (error, value) => {
          if (settled) return;
          settled = true;
          win.clearTimeout(timeout);
          pendingStops.delete(stop);
          if (error) { try { instance?.destroy?.(); } catch { /* A broken player can still time out. */ } reject(error); }
          else resolve(value);
        };
        const stop = () => settle(new Error('editor-disposed'));
        pendingStops.add(stop);
        try {
          instance = new YT.Player(iframe, { events: {
            onReady: event => settle(null, event.target || instance),
            onError: () => { if (settled) onStatus('unavailable'); else settle(new Error('youtube-player-error')); },
            onStateChange: event => { if (event.data === 1) preferred = event.target || instance; },
          } });
          if (disposed) stop();
        } catch (error) { settle(error); }
      });
      if (disposed) { player.destroy?.(); return false; }
      const liveIframe = player.getIframe?.() || iframe;
      players.add({ iframe: liveIframe, player });
      onStatus('ready');
      return true;
    } catch {
      if (!disposed) onStatus('unavailable');
      return false;
    }
  }

  return {
    registerFigure,
    sample: () => sampleEditorPlayback(root.querySelectorAll('audio,video'), players, preferred),
    dispose() {
      disposed = true;
      root.removeEventListener('play', onNativePlay, true);
      for (const stop of pendingStops) stop();
      pendingStops.clear();
      for (const entry of players) try { entry.player.destroy?.(); } catch { /* Route is leaving. */ }
      players.clear();
    },
  };
}
