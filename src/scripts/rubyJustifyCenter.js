const SELECTOR = '.my-lyric-box .jp-lyric ruby, .labs-practice-line ruby';

const findVisibleRt = (ruby) => {
  for (const rt of ruby.querySelectorAll('rt')) {
    if (getComputedStyle(rt).display !== 'none') return rt;
  }
  return null;
};

// Batch writes and reads: long lyric pages must not force layout for every ruby.
let scheduled=false;
const runAll = () => {
 if(scheduled)return;scheduled=true;
 requestAnimationFrame(()=>{
  scheduled=false;
  const rubies=[...document.querySelectorAll(SELECTOR)];
  rubies.forEach(r=>{r.style.paddingInlineStart='';r.style.paddingInlineEnd='';});
  const pads=rubies.map(ruby=>{const rt=findVisibleRt(ruby);if(!rt)return null;const a=ruby.getBoundingClientRect(),b=rt.getBoundingClientRect();return {ruby,left:Math.max(0,a.left-b.left),right:Math.max(0,b.right-a.right)};});
  pads.forEach(p=>{if(p&&(p.left>=.5||p.right>=.5)){p.ruby.style.paddingInlineStart=p.left.toFixed(2)+'px';p.ruby.style.paddingInlineEnd=p.right.toFixed(2)+'px';}});
 });
};

const observeContainers = () => {
  const containers = document.querySelectorAll('.my-lyric-box, .labs-practice');
  containers.forEach((container) => {
    const observer = new MutationObserver(runAll);
    observer.observe(container, { attributes: true, attributeFilter: ['class'] });
  });
};

export const initRubyJustifyCenter = () => {
  if (typeof document === 'undefined') return;

  const start = () => {
    runAll();
    observeContainers();
  };

  if (document.fonts?.ready) {
    document.fonts.ready.then(start);
  } else {
    start();
  }

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(runAll, 200);
  });
};
