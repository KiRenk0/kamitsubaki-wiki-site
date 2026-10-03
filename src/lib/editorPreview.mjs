import katex from 'katex';
import { renderRich } from './editorRichText.mjs';
import { escapeHtml, safeUrl, parseVisualBlocks } from './visualEditor.mjs';
import { renderMediaEmbed, resolveMediaEmbed } from './mediaEmbed.mjs';
import { youtubeEditorEmbedUrl } from './editorPlaybackClock.mjs';
import { renderInlineShortcode } from './wikiInlineShortcodes.mjs';

export function previewRich(source) {
  const template = document.createElement('template'); template.innerHTML = renderRich(source);
  template.content.querySelectorAll('[data-ve-source]').forEach(chip => chip.replaceWith(...chip.childNodes));
  return template.innerHTML;
}
export function spotifyCoverEndpoint(target) {
  const media=resolveMediaEmbed('spotify',target);
  if(!media)return null;
  const path=new URL(media.src).pathname.match(/^\/embed\/(track|album|artist|playlist|episode|show)\/([A-Za-z0-9]+)$/);
  if(!path)return null;
  return `https://open.spotify.com/oembed?url=${encodeURIComponent(`https://open.spotify.com/${path[1]}/${path[2]}`)}`;
}
export function trustedSpotifyThumbnail(value) {
  if(typeof value!=='string'||value.length>2048)return null;
  try {
    const url=new URL(value),host=url.hostname.toLowerCase();
    return url.protocol==='https:'&&!url.username&&!url.password&&!url.port&&(host==='i.scdn.co'||host==='spotifycdn.com'||host.endsWith('.spotifycdn.com'))?url.href:null;
  }catch{return null;}
}
export async function fetchSpotifyCover(target,fetcher=fetch) {
  const endpoint=spotifyCoverEndpoint(target);if(!endpoint)return null;
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),4500);
  try {
    const response=await fetcher(endpoint,{mode:'cors',credentials:'omit',referrerPolicy:'no-referrer',signal:controller.signal});
    if(!response.ok)return null;
    return trustedSpotifyThumbnail((await response.json())?.thumbnail_url);
  }catch{return null;}
  finally{clearTimeout(timer);}
}
const spotifyCoverCache=new Map();
const coverTimers=new WeakMap();
function cachedSpotifyCover(target) {
  const cached=spotifyCoverCache.get(target);
  if(cached&&cached.expires>Date.now())return cached.promise;
  const entry={promise:fetchSpotifyCover(target),expires:Date.now()+30_000};
  spotifyCoverCache.set(target,entry);
  entry.promise.then(url=>{entry.expires=Date.now()+(url?60*60_000:30_000);});
  return entry.promise;
}
export function hydrateEditorMediaCovers(root) {
  const active=root.querySelectorAll('.ve-block.is-active [data-media-cover-url], [data-preview-block].is-active [data-media-cover-url]');
  for(const node of active) {
    const target=node.getAttribute('data-media-cover-url');
    if(!target||node.dataset.mediaCoverRequested===target)continue;
    node.dataset.mediaCoverRequested=target;
    void cachedSpotifyCover(target).then(url=>{
      if(!url||!node.isConnected||node.getAttribute('data-media-cover-url')!==target)return;
      const image=node.ownerDocument.createElement('img');image.alt='';image.loading='lazy';image.decoding='async';
      image.addEventListener('error',()=>image.remove(),{once:true});
      image.src=url;node.prepend(image);
    });
  }
}
export function scheduleEditorMediaCovers(root) {
  clearTimeout(coverTimers.get(root));
  coverTimers.set(root,setTimeout(()=>hydrateEditorMediaCovers(root),300));
}
export function previewMedia(provider, url, caption = '') {
  const media = resolveMediaEmbed(provider,url);
  if (!media) return `<p class="ve-placeholder">${escapeHtml(provider)} · URL</p>`;
  // Keep live players stable and opt-in while an author is typing.
  const source=new URL(media.src),id=['v','bvid','aid','i','id','songid'].map(key=>source.searchParams.get(key)).find(Boolean)||source.pathname.split('/').filter(Boolean).at(-1)||'';
  const publicUrl=media.provider==='youtube'?`https://www.youtube.com/watch?v=${encodeURIComponent(id)}`
    :media.provider==='bilibili'?`https://www.bilibili.com/video/${encodeURIComponent(source.searchParams.get('bvid')||`av${source.searchParams.get('aid')}`)}?p=${encodeURIComponent(source.searchParams.get('p')||'1')}`
    :media.provider==='spotify'?`https://open.spotify.com/${source.pathname.replace(/^\/embed\//,'')}`
    :media.provider==='netease'?`https://music.163.com/#/${({0:'playlist',1:'album',2:'song'})[source.searchParams.get('type')]||'song'}?id=${encodeURIComponent(source.searchParams.get('id')||'')}`
    :media.provider==='qq-music'?`https://y.qq.com/n/ryqq/songDetail/${encodeURIComponent(source.searchParams.get('songid')||'')}`
    :media.provider==='apple-music'?media.src.replace('embed.music.apple.com','music.apple.com')
    :media.src;
  const coverLabel=media.provider==='bilibili'?'Bilibili':media.provider==='netease'?'网易云音乐':media.label;
  const cover=`<span class="ve-media-thumb ve-media-cover ve-media-cover--${escapeHtml(media.provider)}" ${media.provider==='spotify'?`data-media-cover-url="${escapeHtml(publicUrl)}"`:''}><span aria-hidden="true">${escapeHtml(coverLabel)}</span>${media.provider==='youtube'&&id?`<img src="https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg" alt="" loading="lazy" />`:''}</span>`;
  return `<div class="ve-media">${cover}<div><strong>${escapeHtml(caption || media.label)}</strong><p class="ve-media-resolved">✓ ${escapeHtml(media.label)} · ${escapeHtml(id)}</p><p><a href="${escapeHtml(publicUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a></p><button type="button" data-load-media data-provider="${escapeHtml(provider)}" data-url="${escapeHtml(url)}">▶ ${escapeHtml(media.label)}</button></div></div>`;
}
const mediaProviders = ['youtube','bilibili','apple-music','spotify','netease','qq-music'];
const mediaProviderLabel = provider => ({youtube:'YouTube MV',bilibili:'Bilibili','apple-music':'Apple Music',spotify:'Spotify',netease:'NetEase Music','qq-music':'QQ Music'})[provider] || provider;

export function renderMediaSwitcherCard(block, copy, {editable = false, activeIndex = 0} = {}) {
  const items = Array.isArray(block.items) ? block.items : [];
  const selected = Math.max(0, Math.min(activeIndex, items.length - 1));
  const current = items[selected] || {provider:'youtube',url:''};
  const media = resolveMediaEmbed(current.provider,current.url);
  const panelId = `ve-media-panel-${block.id}-${editable?'edit':'preview'}`;
  const tabs = items.map((item,index) => `<button type="button" role="tab" aria-selected="${index===selected}" aria-controls="${escapeHtml(panelId)}" tabindex="${index===selected?0:-1}" data-preview-provider="${escapeHtml(block.id)}:${index}" ${editable?`data-media-drag="${escapeHtml(block.id)}:${index}" draggable="true"`:''}><span class="${resolveMediaEmbed(item.provider,item.url)?'is-valid':'is-invalid'}" aria-hidden="true">●</span>${escapeHtml(mediaProviderLabel(item.provider))}</button>`).join('');
  const title = editable
    ? `<label class="ve-media-switcher-title"><span>${escapeHtml(copy.mediaTitle)}</span><input data-prop="title" value="${escapeHtml(block.title||'')}" aria-label="${escapeHtml(copy.mediaTitle)}" /></label>`
    : `<strong>${escapeHtml(block.title||'')}</strong>`;
  const controls = editable ? `<div class="ve-media-switcher-fields"><label><span>${escapeHtml(copy.mediaPlatform)}</span><select data-media="${selected}:provider" aria-label="${escapeHtml(copy.mediaPlatform)} ${selected+1}">${mediaProviders.map(provider=>`<option value="${provider}" ${provider===current.provider?'selected':''}>${escapeHtml(mediaProviderLabel(provider))}</option>`).join('')}</select></label><label class="ve-media-switcher-url"><span>${escapeHtml(copy.url)}</span><input type="text" inputmode="url" data-media="${selected}:url" value="${escapeHtml(current.url||'')}" aria-label="${escapeHtml(copy.url)} ${selected+1}" autocomplete="url" spellcheck="false" /></label><button type="button" data-media-remove="${selected}" ${items.length<=2?'disabled':''} aria-label="${escapeHtml(copy.removeMedia)} ${selected+1}">×</button></div><p class="ve-media-switcher-status ${media?'is-valid':current.url?.trim()?'is-invalid':''}" role="status">${media?`✓ ${escapeHtml(copy.mediaResolved)}`:escapeHtml(current.url?.trim()?copy.mediaUnresolved:copy.mediaPaste)}</p>` : '';
  return `<div class="ve-media-switcher ${editable?'ve-media-switcher-editor':''}" data-media-active="${selected}">${title}<div class="ve-media-tabs" role="tablist" aria-label="${escapeHtml(copy.blocks['media-switcher'])}">${tabs}</div>${controls}<div id="${escapeHtml(panelId)}" role="tabpanel" data-preview-media="${escapeHtml(block.id)}">${previewMedia(current.provider,current.url)}</div>${editable?`<button type="button" class="ve-media-switcher-add" data-media-add ${items.length>=6?'disabled':''}>＋ ${escapeHtml(copy.addMedia)}</button>`:''}</div>`;
}
export function previewBlock(b, copy, depth = 0) {
  const text = escapeHtml(b.text);
  switch (b.type) {
    case 'paragraph': return previewRich(b.text);
    case 'heading': { const level=Math.max(2,Math.min(6,Number(b.level)||2)); return `<h${level}>${text}</h${level}>`; }
    case 'list': { const tag=b.ordered?'ol':'ul'; return `<${tag}>${b.text.split('\n').filter(Boolean).map(t=>`<li>${escapeHtml(t)}</li>`).join('')}</${tag}>`; }
    case 'quote': return `<blockquote>${text.replaceAll('\n','<br>')}</blockquote>`;
    case 'image': return safeUrl(b.url) ? `<figure><img src="${escapeHtml(b.url)}" alt="${text}" loading="lazy"/><figcaption>${escapeHtml(b.caption)}</figcaption></figure>` : `<p class="ve-placeholder">＋ ${copy.blocks.image}</p>`;
    case 'media': return previewMedia(b.provider,b.url,b.caption);
    case 'media-switcher': return renderMediaSwitcherCard(b,copy);
    case 'table': { const row=(cells,tag)=>`<tr>${cells.map(cell=>`<${tag}>${escapeHtml(cell).replaceAll('\n','<br>')}</${tag}>`).join('')}</tr>`; return `<table><thead>${row(b.rows[0]||[],'th')}</thead><tbody>${b.rows.slice(1).map(cells=>row(cells,'td')).join('')}</tbody></table>`; }
    case 'ruby': return `<p>${renderInlineShortcode('ruby',[b.text,b.kana,...(b.romaji?[b.romaji]:[])]) || text}</p>`;
    case 'details': return `<details><summary>${escapeHtml(b.title || copy.detailTitle)}</summary>${depth<8?parseVisualBlocks(b.text).map(child=>previewBlock(child,copy,depth+1)).join(''):previewRich(b.text)}</details>`;
    case 'inline': { const result=renderInlineShortcode(b.kind,b.args.filter((arg,i)=>b.kind!=='ruby'||i<2||arg)); return `<p>${typeof result==='string'?result:escapeHtml(result?.value || b.args[0])}</p>`; }
    case 'code': return `<pre data-language="${escapeHtml(b.language)}"><code>${text}</code></pre>`;
    case 'math': return katex.renderToString(b.text,{throwOnError:false,displayMode:b.display,trust:false});
    case 'lyrics': return `<div class="ve-lyrics my-lyric-box">${b.rows.map(r=>`<div class="lyric-line"><div class="jp-lyric">${(r.units?.length?r.units:[r]).map(unit=>`<ruby>${escapeHtml(unit.original)}<rt>${escapeHtml(unit.kana)}</rt></ruby>`).join('')}</div><div class="cn-lyric">${escapeHtml(r.translation)}</div></div>`).join('')}</div>`;
    case 'divider': return '<hr/>';
    default: return previewRich(b.text);
  }
}
export function loadPreviewMedia(button, { youtubeApi = false, origin = '' } = {}) {
  const html=renderMediaEmbed(button.dataset.provider,button.dataset.url);
  if(!html)return null;
  const template=document.createElement('template');template.innerHTML=html;
  const figure=template.content.firstElementChild;
  if(youtubeApi){
    const iframe=figure?.querySelector('iframe');
    const apiSrc=iframe&&youtubeEditorEmbedUrl(iframe.getAttribute('src'),origin);
    if(apiSrc)iframe.setAttribute('src',apiSrc);
  }
  button.closest('.ve-media').replaceWith(template.content);
  return figure;
}
