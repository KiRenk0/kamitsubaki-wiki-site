import {handleSpoilerActivation} from './spoilerInteraction.mjs';
import {DEFAULT_KARAOKE_TAIL_DURATION,formatKaraokeProgress,getKaraokeProgress,resolveKaraokeEndTime} from './lyricsTimeline.mjs';
const initialized = new WeakMap();
const rubyBaseLength = (ruby) => {
  let length = 0;
  for (const node of ruby.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) length += node.textContent.length;
  }
  return Math.max(1, length);
};

const applySequentialRubyProgress = (word, progress) => {
  const rubies = word._karaokeRubies;
  if (!rubies || rubies.length === 0) return;

  let total = 0;
  for (const entry of rubies) total += entry.weight;

  let cursor = 0;
  for (const entry of rubies) {
    const start = cursor / total;
    const end = (cursor + entry.weight) / total;
    cursor += entry.weight;
    const span = end - start;
    const unit = span > 0 ? Math.min(1, Math.max(0, (progress - start) / span)) : (progress >= end ? 1 : 0);
    entry.el.style.setProperty('--karaoke-progress', formatKaraokeProgress(unit));
    entry.el.classList.toggle('is-active', unit > 0 && unit < 1);
    entry.el.classList.toggle('is-complete', unit >= 1);
  }
};

const associatedLyricBox = controls => {
  const box = controls?.nextElementSibling;
  return box instanceof HTMLElement && box.classList.contains('my-lyric-box') ? box : null;
};
/** Shared reader behavior for published pages and already-sanitized previews.
 * @param {Document | HTMLElement} root
 */
export function initializeReaderInteractions(root = document) {
  if (initialized.has(root)) return initialized.get(root);
  const controller = new AbortController();
  // A page may contain several lyric blocks. Keep synchronized controls only
  // beside a block that actually contains valid, sanitized timeline markers.
  root.querySelectorAll('.my-lyric-controls').forEach((controls) => {
    const lyricBox = associatedLyricBox(controls);
    const timelineButtons = controls.querySelectorAll('[data-lyric-action^="sync-"]');
    if (timelineButtons.length === 0) return;

    const hasValidTimeline = lyricBox instanceof HTMLElement
      && lyricBox.classList.contains('my-lyric-box')
      && Array.from(lyricBox.querySelectorAll('.lrc-tag[data-time]')).some((tag) => (
        Number.isFinite(Number.parseFloat(tag.dataset.time ?? ''))
      ));

    if (!hasValidTimeline) timelineButtons.forEach((button) => button.remove());
  });

  // Sync Lyrics Player State
  const syncPlayers = new WeakMap();
  const players = new Set();

  class SyncLyricsPlayer {
    constructor(lyricBox, controls) {
      this.lyricBox = lyricBox;
      this.controls = controls;
      this.playBtn = controls.querySelector('.sync-play-btn');
      this.resetBtn = controls.querySelector('.sync-reset-btn');
      this.lines = Array.from(lyricBox.querySelectorAll('.lyric-line'));
      
      this.playing = false;
      this.currentTime = 0;
      this.lastTick = 0;
      this.animationFrame = null;
      this.originalHTML = lyricBox.innerHTML;
      
      this.initDOM();
      
      this.lyricBox.addEventListener('click', (e) => {
        if (!this.lyricBox.classList.contains('sync-enabled')) return;
        const line = e.target.closest('.lyric-line');
        if (!line) return;
        const time = parseFloat(line.dataset.time);
        if (!isNaN(time)) {
          this.seek(time);
          if (!this.playing) this.togglePlay();
        }
      }, {signal: controller.signal});
    }

    initDOM() {
      // Group timed text into spans that can display a continuous karaoke fill.
      this.lines.forEach(line => {
        let lineStartTime = Infinity;
        const containers = line.querySelectorAll('.jp-lyric, .cn-lyric, .en-lyric, .trans-lyric');
        
        containers.forEach(container => {
          let currentTime = null;
          let currentWordNodes = [];
          let words = [];

          const flush = () => {
             if (currentTime !== null && currentWordNodes.length > 0) {
                words.push({ time: currentTime, nodes: currentWordNodes });
             }
             currentWordNodes = [];
          };

          Array.from(container.childNodes).forEach(child => {
             if (child instanceof HTMLElement && child.classList.contains('lrc-tag')) {
                 flush();
                 currentTime = parseFloat(child.dataset.time);
                 if (Number.isFinite(currentTime) && currentTime < lineStartTime) lineStartTime = currentTime;
             } else {
                 if (Number.isFinite(currentTime)) {
                     currentWordNodes.push(child);
                 }
             }
          });
          flush();

          words.forEach((word, index) => {
             const span = document.createElement('span');
             span.className = 'lrc-word';
             span.dataset.time = word.time;
             if (index < words.length - 1) span.dataset.endTime = words[index + 1].time;
             word.nodes[0].parentNode.insertBefore(span, word.nodes[0]);
             word.nodes.forEach(n => span.appendChild(n));
          });
        });
        
        if (lineStartTime !== Infinity) {
          line.dataset.time = lineStartTime;
          line.classList.add('has-lrc-timing');
        }
      });
      
      // Give every timed unit an end point. The last unit in a line runs until
      // the next line; the final line receives a short, deterministic tail.
      this.words = Array.from(this.lyricBox.querySelectorAll('.lrc-word'));
      this.words.forEach((word) => {
        const rubies = Array.from(word.children).filter((el) => el.tagName === 'RUBY');
        word._karaokeRubies = rubies.map((el) => ({ el, weight: rubyBaseLength(el) }));
        if (rubies.length > 0) {
          for (const ruby of rubies) {
            ruby.style.setProperty('--karaoke-progress', '0%');
          }
        }
      });
      this.timedLines = this.lines
        .filter(line => Number.isFinite(parseFloat(line.dataset.time)))
        .sort((a, b) => parseFloat(a.dataset.time) - parseFloat(b.dataset.time));

      this.timedLines.forEach((line, lineIndex) => {
        const lineWords = Array.from(line.querySelectorAll('.lrc-word'));
        const latestWordTime = Math.max(...lineWords.map(word => parseFloat(word.dataset.time)));
        const nextLineTime = parseFloat(this.timedLines[lineIndex + 1]?.dataset.time);
        const lineEndTime = Number.isFinite(nextLineTime)
          ? nextLineTime
          : latestWordTime + DEFAULT_KARAOKE_TAIL_DURATION;

        line.dataset.endTime = lineEndTime;

        lineWords.forEach(word => {
          const endTime = resolveKaraokeEndTime(
            word.dataset.time,
            word.dataset.endTime,
            lineEndTime,
          );
          if (endTime !== null) word.dataset.endTime = endTime;
          word.style.setProperty('--karaoke-progress', '0%');
        });
      });

      this.duration = Math.max(
        0,
        ...this.timedLines.map(line => parseFloat(line.dataset.endTime)).filter(Number.isFinite),
      );

      // Remove raw lrc-tags to clean up DOM
      this.lyricBox.querySelectorAll('.lrc-tag').forEach(tag => tag.remove());
    }

    setPlaying(playing) {
      this.playing = playing;
      if (!this.playBtn) return;
      this.playBtn.setAttribute('aria-pressed', String(playing));
      this.playBtn.textContent = playing
        ? this.playBtn.dataset.alternateLabel || ''
        : this.playBtn.dataset.primaryLabel || '';
    }

    togglePlay() {
      const shouldPlay = !this.playing;
      if (shouldPlay && this.duration > 0 && this.currentTime >= this.duration) {
        this.currentTime = 0;
        this.updateUI();
      }

      this.setPlaying(shouldPlay);
      if (this.playing) {
        this.lastTick = performance.now();
        this.loop();
      } else {
        cancelAnimationFrame(this.animationFrame);
      }
    }

    reset() {
      this.setPlaying(false);
      this.currentTime = 0;
      cancelAnimationFrame(this.animationFrame);
      this.updateUI();
    }

    dispose() {
      this.reset();
      // Restore sanitized timestamp markers so the same preview can mount again.
      this.lyricBox.innerHTML = this.originalHTML;
      this.lyricBox.classList.remove('sync-enabled');
      const toggle = this.controls.querySelector('[data-lyric-action="sync-lyrics"]');
      if (toggle) { toggle.setAttribute('aria-pressed', 'false'); toggle.textContent = toggle.dataset.primaryLabel || ''; }
      if (this.playBtn) this.playBtn.hidden = true;
      if (this.resetBtn) this.resetBtn.hidden = true;
    }

    seek(time) {
      this.currentTime = time;
      this.lastTick = performance.now();
      this.updateUI();
    }

    loop() {
      if (!this.playing) return;
      const now = performance.now();
      const delta = (now - this.lastTick) / 1000;
      this.lastTick = now;
      this.currentTime += delta;

      if (this.duration > 0 && this.currentTime >= this.duration) {
        this.currentTime = this.duration;
        this.updateUI();
        this.setPlaying(false);
        return;
      }

      this.updateUI();
      this.animationFrame = requestAnimationFrame(() => this.loop());
    }

    updateUI() {
      const time = this.currentTime;
      let activeLine = null;
      
      this.lines.forEach(line => {
        const lineTime = parseFloat(line.dataset.time);
        if (Number.isFinite(lineTime) && time >= lineTime && (!activeLine || lineTime >= parseFloat(activeLine.dataset.time))) {
          activeLine = line;
        }
        line.classList.remove('is-active');
        line.removeAttribute('aria-current');
      });
      
      if (activeLine) {
        activeLine.classList.add('is-active');
        activeLine.setAttribute('aria-current', 'true');
      }

      this.words.forEach(word => {
        const wordTime = parseFloat(word.dataset.time);
        const wordEndTime = parseFloat(word.dataset.endTime);
        const progress = getKaraokeProgress(time, wordTime, wordEndTime);
        const isCurrent = Number.isFinite(wordTime)
          && Number.isFinite(wordEndTime)
          && time >= wordTime
          && time < wordEndTime;

        word.style.setProperty('--karaoke-progress', formatKaraokeProgress(progress));
        word.classList.toggle('is-active', isCurrent);
        word.classList.toggle('is-complete', progress >= 1);
        applySequentialRubyProgress(word, progress);
      });
    }
  }

  root.addEventListener('click', (event) => {
    const button = event.target instanceof Element && event.target.closest('[data-lyric-action]');
    if (!(button instanceof HTMLButtonElement)) return;

    const controls = button.closest('.my-lyric-controls');
    const lyricBox = associatedLyricBox(controls);
    if (!(lyricBox instanceof HTMLElement) || !lyricBox.classList.contains('my-lyric-box')) return;

    const action = button.dataset.lyricAction;
    
    if (action === 'sync-play-pause') {
      let player = syncPlayers.get(lyricBox);
      if (player) player.togglePlay();
      return;
    }
    
    if (action === 'sync-reset') {
      let player = syncPlayers.get(lyricBox);
      if (player) player.reset();
      return;
    }

    let active = false;

    if (action === 'ruby') active = lyricBox.classList.toggle('hide-ruby');
    else if (action === 'translation') active = lyricBox.classList.toggle('hide-translation');
    else if (action === 'phonetic') active = lyricBox.classList.toggle('show-romaji');
    else if (action === 'sync-lyrics') {
      active = lyricBox.classList.toggle('sync-enabled');
      const playBtn = controls.querySelector('.sync-play-btn');
      const resetBtn = controls.querySelector('.sync-reset-btn');
      
      if (active) {
        if (!syncPlayers.has(lyricBox)) {
          const player = new SyncLyricsPlayer(lyricBox, controls);
          syncPlayers.set(lyricBox, player); players.add(player);
        }
        if (playBtn) playBtn.hidden = false;
        if (resetBtn) resetBtn.hidden = false;
        syncPlayers.get(lyricBox).updateUI();
      } else {
        const player = syncPlayers.get(lyricBox);
        if (player) {
          player.reset();
        }
        if (playBtn) playBtn.hidden = true;
        if (resetBtn) resetBtn.hidden = true;
      }
    }
    else return;

    button.setAttribute('aria-pressed', String(active));
    if (action === 'phonetic') {
      button.textContent = active ? button.dataset.alternateLabel || '' : button.dataset.primaryLabel || '';
    } else if (action === 'sync-lyrics') {
      button.textContent = active ? button.dataset.alternateLabel || '' : button.dataset.primaryLabel || '';
    } else if (action !== 'sync-play-pause' && action !== 'sync-reset') {
      button.textContent = active ? button.dataset.showLabel || '' : button.dataset.hideLabel || '';
    }
  }, {signal: controller.signal});

  // Capture before links and delegated card navigation can handle the same click.
  ['click','auxclick','keydown'].forEach(type=>root.addEventListener(type,handleSpoilerActivation,{capture:true,signal:controller.signal}));

  const cleanup = () => { if (initialized.get(root) !== cleanup) return; controller.abort(); for (const player of players) player.dispose(); players.clear(); initialized.delete(root); };
  initialized.set(root, cleanup);
  return cleanup;
}
