import {setLoadingStatus} from '../lib/loadingStatus.mjs';
import {iconMarkup} from '../lib/icons.mjs';
import {setIconLabel} from '../lib/icons.mjs';
import {mountArticleAssets} from './articleAssets.js';
import {mountImageLibrary} from './imageLibrary.js';
import {mountEditorPopovers,openEditorPopover,positionEditorSurface,confirmEditorPopover} from '../lib/editorPopover.mjs';
import {articleCopy} from '../lib/articleCopy.mjs';
import {state as accountState,refreshAuth} from './accountStore.js';
import {mountArticlePicker,ensureArticleDraftUrl,initialArticleRelations,articleEntities} from '../lib/articleEntities.mjs';
import {initializeArticleSubmission} from './articleSubmission.js';
import {entitySourcePath} from '../lib/contentLayout.mjs';
import {revealPanel,enhanceTabRail} from '../lib/uiMotion.mjs';
import {mountEditorSidebar} from '../lib/editorSidebar.mjs';
import { editorStarterCopy, isUntouchedEditorDraft, insertActionGroup, sortInsertActions } from '../lib/editorStarter.mjs';
import { editorArticleImageCopy, normalizeArticleImageUrl } from '../lib/editorArticleImage.mjs';
import {newEntryPath,prepareImage,imageCandidate,attachmentTotalLimit,attachmentFile,imageBase64} from '../lib/editorAttachments.mjs';
import { markdownTrigger, upgradeListBlock } from '../lib/editorWriting.mjs';
import { mountSourceEditor } from '../lib/editorSourceCode.mjs';
import { hasEditorLocalWork, canTraverseEditorHistory, acceptRecoveredArticleDraft } from '../lib/editorWorkingState.mjs';
import { entryDraftStorageKeys, mayOpenScopedEntryDraft, legacyEntryDraftDisposition, entryDraftRecoveryCopy } from '../lib/editorDraftStorage.mjs';
import {editorEnabled,editorApiBase,localEditor} from '../lib/editorConfig.mjs';
import { sourceRequest } from '../lib/editorSource.mjs';
import { editorUiLocaleDestination, editorCreatorReturn } from '../lib/editorLocaleNavigation.mjs';
import { initializeEditorPrDemo } from './editorPrDemo.js';
import { renderRich, richMarkdown, setEditorPrivateImagePreview, inlineKinds, inlineSource, shortcodeChip, editorInlineParts as inlineTokenParts, unwrapEditorInline as unwrapInlineToken } from '../lib/editorRichText.mjs';
import { rubySugarAtCaret, rubySugarMatches } from '../lib/editorRubyAssist.mjs';
import { parseLyricsBatch, formatLyricTimestamp, validLyricsTiming } from '../lib/editorLyrics.mjs';
import { editorLyricsCopy } from '../lib/editorLyricsCopy.mjs';
import { createEditorPlaybackClock } from '../lib/editorPlaybackClock.mjs';
import { searchEditorEntityCatalog, normalizeEditorEntityRecord, buildEditorEntityMention } from '../lib/editorEntityMention.mjs';
import { nestedMetadataOptions, nestedMetadataDefault, metadataDefault, metadataOptions, metadataLabel, metadataChoices, newMetadataItem, advancedErrors } from '../lib/editorMetadata.mjs';
import { metadataPresetKind, metadataPresetCopy, metadataCatalogDisplay, metadataCatalogMatches, resolveMetadataCatalogInput, makeSongCredit, addSongCreditsBatch, songCreditRoles, voiceEngineShortcuts, personActivityStates, reorderReleaseTracks, renumberReleaseTracks, linkReleaseTrack, setVoiceSource, setVoiceEngine, setPersonActivity } from '../lib/editorMetadataPresets.mjs';
import { previewBlock as renderPreviewBlock, renderMediaSwitcherCard, previewMedia, loadPreviewMedia, scheduleEditorMediaCovers } from '../lib/editorPreview.mjs';
import { resolveMediaEmbed } from '../lib/mediaEmbed.mjs';
import { translationReferenceTargets, loadTranslationReference, alignTranslationBlocks } from '../lib/editorTranslationReference.mjs';
import { enhanceReader } from '../lib/readerEnhancements.mjs';
import 'katex/dist/katex.min.css';
import { isApplePlatform, formatShortcut } from '../lib/searchShortcut.mjs';
import { fields, fieldsFor, blockTypes, entryTypes, newDraft, newBlock, blockMarkdown, parseVisualBlocks, importMarkdown, exportMarkdown, validateDraft, safeUrl, validPath, escapeHtml } from '../lib/visualEditor.mjs';

const initialize = async () => {
  const root = document.querySelector('[data-visual-editor]');
  if (!root || root.dataset.ready) return;
  root.dataset.ready = 'true';
  const popovers=mountEditorPopovers(root);
  const $ = selector => root.querySelector(selector);
  const returnTo=new URLSearchParams(location.search).get('returnTo');
  const creatorReturn=editorCreatorReturn(location.origin,returnTo,root.dataset.locale);
  if(creatorReturn){const back=$('.ve-home');back.href=creatorReturn.href;setIconLabel(back,'← '+creatorReturn.label);}
  const copy = JSON.parse($('[data-editor-copy]').textContent);
  const confirmReplace=()=>confirmEditorPopover(root,copy.replace,{accept:copy.apply,cancel:copy.cancel});
  const starterCopy = editorStarterCopy(root.dataset.locale);
  const referenceCopy=({zh:{tab:'翻译参考',empty:'此条目还没有可读取的其他语言原稿。',loading:'正在读取参考原稿…',missing:'此语言尚无原稿。',error:'参考原稿加载失败，请重试。',retry:'重试',alignment:'按段落顺序对照；结构不同处请人工核对。'},'zh-tw':{tab:'翻譯參考',empty:'此條目尚無可讀取的其他語言原稿。',loading:'正在讀取參考原稿…',missing:'此語言尚無原稿。',error:'參考原稿載入失敗，請重試。',retry:'重試',alignment:'按段落順序對照；結構不同處請人工核對。'},'zh-hk':{tab:'翻譯參考',empty:'此條目尚無可讀取的其他語言原稿。',loading:'正在讀取參考原稿…',missing:'此語言尚無原稿。',error:'參考原稿載入失敗，請重試。',retry:'重試',alignment:'按段落次序對照；結構不同處請人手核對。'},ja:{tab:'翻訳の参照',empty:'参照できる他言語の原稿がありません。',loading:'参照原稿を読み込み中…',missing:'この言語の原稿はまだありません。',error:'参照原稿を読み込めません。再試行してください。',retry:'再試行',alignment:'段落順で対照します。構成が違う箇所は確認してください。'},en:{tab:'Translation reference',empty:'No other language source is available for this entry.',loading:'Loading reference source…',missing:'No source exists in this language yet.',error:'Could not load the reference source. Try again.',retry:'Retry',alignment:'Aligned by paragraph order; check sections with different structure.'}})[root.dataset.locale] || {tab:'Translation reference',empty:'No reference is available.',loading:'Loading…',missing:'Missing source.',error:'Could not load.',retry:'Retry',alignment:'Aligned by paragraph order.'};
  const toolbarScroll = $('.ve-toolbar-scroll');
  const toolbarArrows = [...root.querySelectorAll('[data-toolbar-scroll]')];
  function updateToolbarScroll() {
    const max = toolbarScroll.scrollWidth - toolbarScroll.clientWidth;
    toolbarArrows.forEach(button => { button.disabled = Number(button.dataset.toolbarScroll) < 0 ? toolbarScroll.scrollLeft <= 1 : toolbarScroll.scrollLeft >= max - 1; });
  }
  toolbarArrows.forEach(button => button.addEventListener('click', () => {
    toolbarScroll.scrollBy({left: Number(button.dataset.toolbarScroll) * Math.max(120, toolbarScroll.clientWidth * .65), behavior: 'instant'});
    updateToolbarScroll();
  }));
  toolbarScroll.addEventListener('scroll', updateToolbarScroll, {passive:true});
  toolbarScroll.addEventListener('wheel', event => {
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    const max = toolbarScroll.scrollWidth - toolbarScroll.clientWidth;
    if ((delta > 0 && toolbarScroll.scrollLeft < max - 1) || (delta < 0 && toolbarScroll.scrollLeft > 1)) {
      event.preventDefault();
      toolbarScroll.scrollLeft += delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? toolbarScroll.clientWidth : 1);
    }
  }, {passive:false});
  new ResizeObserver(updateToolbarScroll).observe(toolbarScroll);
  document.fonts.ready.then(updateToolbarScroll);
  updateToolbarScroll();
  const kbdLabel = text => formatShortcut(text, { platform: navigator.platform ?? '', userAgent: navigator.userAgent });
  if (!isApplePlatform({ platform: navigator.platform ?? '', userAgent: navigator.userAgent })) {
    root.querySelectorAll('kbd').forEach(el => { el.textContent = kbdLabel(el.textContent); });
    root.querySelectorAll('[title],[aria-label]').forEach(el => {
      if (el.getAttribute('title')?.includes('⌘')) el.setAttribute('title', kbdLabel(el.getAttribute('title')));
      if (el.getAttribute('aria-label')?.includes('⌘')) el.setAttribute('aria-label', kbdLabel(el.getAttribute('aria-label')));
    });
  }
  const creationDictionary=JSON.parse(root.dataset.creationCopy || '{}');
  const tc = text => creationDictionary[text] || text;
  const uiLocale = root.dataset.locale.startsWith('zh') ? 'zh' : root.dataset.locale;
  const presetCopy=metadataPresetCopy(root.dataset.locale);
  const lyricsCopy=editorLyricsCopy(root.dataset.locale);
  const articleMode=root.dataset.articleMode==='true';
  if(articleMode){const url=ensureArticleDraftUrl(location.href,()=>crypto.randomUUID());window.history.replaceState(null,'',url);}
  const prDemo = !articleMode && editorEnabled;
  const articleOwner=articleMode?(await refreshAuth())?.userId||(accountState.auth==='guest'?'guest':'unverified'):null;
  const entryOwner=articleMode?null:await (async()=>{
    if(prDemo&&localEditor){
      try{
        const response=await fetch(editorApiBase+'/api/editor/session',{credentials:'include',cache:'no-store',signal:AbortSignal.timeout(8000)});
        const session=response.ok?await response.json():null;
        if(typeof session?.account?.id==='string'&&session.account.id)return 'mock:'+session.account.id;
      }catch{/* Keep unverified local work separate until the local service returns. */}
      return 'unverified';
    }
    const viewer=await refreshAuth();
    return viewer?.userId||(accountState.auth==='guest'?'guest':'unverified');
  })();
  const articleIdentity=new URLSearchParams(location.search).get('draft')||new URLSearchParams(location.search).get('id');
  const entryKeys=articleMode?null:entryDraftStorageKeys(prDemo,entryOwner,root.dataset.contentLocale);
  const key = articleMode?`kamitsubaki-article-workbench-v2:${articleOwner}:${articleIdentity}:${root.dataset.contentLocale}`:entryKeys.key;
  const guestKey=articleMode?`kamitsubaki-article-workbench-v2:guest:${articleIdentity}:${root.dataset.contentLocale}`:null;
  const unverifiedKey=articleMode?`kamitsubaki-article-workbench-v2:unverified:${articleIdentity}:${root.dataset.contentLocale}`:null;
  const legacyKey=articleMode?`kamitsubaki-article-workbench-v1:${articleIdentity}:${root.dataset.contentLocale}`:null;
  const md = renderRich;
  let draft = newDraft(articleMode?'articles':'projects', root.dataset.contentLocale);
  let saving = true, restoredArticle=false;
  let activeBlockId = draft.blocks[0]?.id, sourcePending = null, sourceTimer, sourceEditor = null;
  const lyricPageByBlock=new Map();const mediaTabByBlock=new Map();let activeLyricRow=0;
  const lyricClock={startedAt:null,elapsed:0};
  let lyricTicker=null,playbackStatus='idle';
  const playbackClock=createEditorPlaybackClock(root,{onStatus:status=>{playbackStatus=status;updateLyricClock();}});
  const sourceKey = key + ':source';
  if (window.innerWidth <= 900) root.setAttribute('data-sidebar-hidden','');
  const readStoredDraft=raw=>{
    try{
      const candidate=JSON.parse(raw||'null');
      if(candidate?.version!==1||!entryTypes.includes(candidate.kind)||!Array.isArray(candidate.blocks)||candidate.blocks.length>=1000||!candidate.meta)return null;
      exportMarkdown(candidate);return candidate;
    }catch{return null;}
  };
  if(!articleMode){
    try{
      const legacy=readStoredDraft(localStorage.getItem(entryKeys.legacyKey));
      if(!localStorage.getItem(key)&&legacyEntryDraftDisposition(legacy,entryOwner)==='migrate'){
        const pending=localStorage.getItem(entryKeys.legacyKey+':source');
        if(pending!==null&&localStorage.getItem(sourceKey)===null)localStorage.setItem(sourceKey,pending);
        localStorage.setItem(key,JSON.stringify(legacy));
        localStorage.removeItem(entryKeys.legacyKey);
        localStorage.removeItem(entryKeys.legacyKey+':source');
      }
      const previous=readStoredDraft(localStorage.getItem(entryKeys.legacyKey+':previous'));
      if(!localStorage.getItem(key+':previous')&&legacyEntryDraftDisposition(previous,entryOwner)==='migrate'){
        localStorage.setItem(key+':previous',JSON.stringify(previous));
        localStorage.removeItem(entryKeys.legacyKey+':previous');
      }
    }catch{/* Keep the original local copy when migration cannot complete. */}
  }
  try {
    const saved = readStoredDraft(localStorage.getItem(key));
    if (saved && (articleMode?saved.kind==='articles'&&(!saved.ownerId||saved.ownerId===articleOwner):mayOpenScopedEntryDraft(saved,entryOwner))) {
      draft = saved;restoredArticle=true;
    }
  } catch { saving = false; }
  if(articleMode&&!restoredArticle&&!new URL(location.href).searchParams.has('id'))draft.meta.relatedEntities=initialArticleRelations(location.href);
  const unchangedArticle=articleMode&&draft.articleBodySnapshot===JSON.stringify(draft.blocks);
  draft.blocks = draft.blocks.flatMap(block => block.type === 'preserved' ? parseVisualBlocks(block.text) : [block]).map(upgradeListBlock);
  if(unchangedArticle)draft.articleBodySnapshot=JSON.stringify(draft.blocks);
  const target = articleMode?null:new URLSearchParams(location.search).get('target');
  const serializeDraft=()=>articleMode?(draft.articleBodySnapshot===JSON.stringify(draft.blocks)?draft.articleOriginalBody:draft.blocks.map(b=>blockMarkdown(b,draft.meta.locale)).join('\n\n')):exportMarkdown(draft);
  let history = [JSON.stringify(draft)], cursor = 0, historyTimer;
  function save() {
    if(articleMode)draft.ownerId=articleOwner==='guest'||articleOwner==='unverified'?null:articleOwner;
    else draft.ownerId=entryOwner==='guest'||entryOwner==='unverified'?null:entryOwner;
    try { localStorage.setItem(key, JSON.stringify(draft)); saving = true; } catch { saving = false; }
    $('[data-save-status]').textContent = sourcePending !== null ? copy.sourcePending : saving ? copy.saved : copy.unsaved;
  }
  function checkpoint() {
    clearTimeout(historyTimer);
    const state = JSON.stringify(draft);
    if (state === history[cursor]) return;
    history = history.slice(0, cursor + 1); history.push(state);
    if (history.length > 40) history.shift();
    cursor = history.length - 1;
    updateHistory();
    refreshAttachmentPreviews();
  }
  function updateHistory() { const pending=JSON.stringify(draft)!==history[cursor]; $('[data-undo]').disabled = cursor === 0 && !pending; $('[data-redo]').disabled = pending || cursor === history.length - 1; }
  function changed(structural = false) { save(); output();if(articleMode)root.dispatchEvent(new CustomEvent('article-draft-change')); clearTimeout(historyTimer); if (structural) checkpoint(); else historyTimer = setTimeout(checkpoint, 350); }
  const label = key => key.includes('.')?key.split('.').map(k=>/^\d+$/.test(k)?String(Number(k)+1):metadataLabel(k,uiLocale)).join(' / '):fieldsFor(draft).find(f => f.key === key)?.labels[uiLocale] || copy.blocks[key] || copy[key] || metadataLabel(key,uiLocale);
  let catalogRecords=[],catalogRequestId=0;
  let songBatchRole='composer',songBatchQuery='',songBatchDraftKey='',songBatchSelectedIds=new Set();
  const creditTypes=['person','virtual-avatar','unit','software-voice'],songTypes=['work-track'],voiceTypes=['person','virtual-avatar'];
  function renderMetadataPreset(){
    const kind=metadataPresetKind(draft.meta);if(!kind)return '';
    const meta=draft.meta;
    if(kind==='song')return `<section class="ve-preset" data-preset="song"><h3>${escapeHtml(presetCopy.song)}</h3><div class="ve-credit-batch"><strong>${escapeHtml(presetCopy.batchCredit)}</strong><label>${escapeHtml(presetCopy.role)}<select data-credit-batch-role>${songCreditRoles.map(role=>`<option value="${escapeHtml(role)}" ${role===songBatchRole?'selected':''}>${escapeHtml(presetCopy[role]||role)}</option>`).join('')}</select></label><label>${escapeHtml(presetCopy.batchSearch)}<input type="search" data-credit-batch-search value="${escapeHtml(songBatchQuery)}" autocomplete="off" /></label><div class="ve-credit-batch-results" data-credit-batch-results role="group" aria-label="${escapeHtml(presetCopy.batchSearch)}"></div><div class="ve-credit-batch-actions"><small data-credit-batch-count></small><button type="button" data-credit-batch-add disabled>${escapeHtml(presetCopy.batchAdd)}</button></div></div>${(meta.credits||[]).map((credit,i)=>`<div class="ve-preset-row" data-credit-row="${i}"><label>${escapeHtml(presetCopy.role)}<select data-credit="${i}:role">${[...new Set([...songCreditRoles,credit.role||'composer'])].map(role=>`<option value="${escapeHtml(role)}" ${role===credit.role?'selected':''}>${escapeHtml(presetCopy[role]||role)}</option>`).join('')}</select></label><label>${escapeHtml(presetCopy.contributor)}<input data-credit="${i}:entity" list="editor-credit-options" value="${escapeHtml(metadataCatalogDisplay(catalogRecords,credit.entity,{entityTypes:creditTypes}))}" /></label><label>${escapeHtml(presetCopy.creditedName)}<input data-credit="${i}:name" value="${escapeHtml(credit.name||'')}" /></label><button type="button" data-credit-remove="${i}" aria-label="${escapeHtml(copy.remove)}">${iconMarkup('x')}</button></div>`).join('')}<button type="button" data-credit-add>${iconMarkup('plus')} ${escapeHtml(presetCopy.addCredit)}</button></section>`;
    if(kind==='album')return `<section class="ve-preset" data-preset="album"><h3>${escapeHtml(presetCopy.album)}</h3>${(meta.tracks||[]).map((track,i)=>`<div class="ve-preset-row ve-track-row" data-track-row="${i}" draggable="true"><span class="ve-track-handle" aria-hidden="true">${iconMarkup('grip-vertical')}</span><label>${escapeHtml(presetCopy.number)}<input type="number" min="1" data-track="${i}:number" value="${escapeHtml(track.number||String(i+1))}" /></label><label>${escapeHtml(presetCopy.title)}<input data-track="${i}:title" value="${escapeHtml(track.title||'')}" /></label><label>${escapeHtml(presetCopy.linkSong)}<input data-track="${i}:songId" list="editor-song-options" value="${escapeHtml(metadataCatalogDisplay(catalogRecords,track.songId,{entityTypes:songTypes}))}" /></label><button type="button" data-track-remove="${i}" aria-label="${escapeHtml(copy.remove)}">${iconMarkup('x')}</button></div>`).join('')}<button type="button" data-track-add>${iconMarkup('plus')} ${escapeHtml(presetCopy.addTrack)}</button></section>`;
    if(kind==='isotope'){const source=meta.relations?.find(edge=>edge.type==='based-on-voice')?.target||'';return `<section class="ve-preset" data-preset="isotope"><h3>${escapeHtml(presetCopy.isotope)}</h3><label>${escapeHtml(presetCopy.voiceSource)}<input data-voice-source list="editor-voice-options" value="${escapeHtml(metadataCatalogDisplay(catalogRecords,source,{entityTypes:voiceTypes}))}" /></label><div class="ve-preset-options">${voiceEngineShortcuts.map(engine=>`<label><input type="checkbox" data-voice-engine="${escapeHtml(engine)}" ${meta.voiceEngines?.some(item=>item.engine===engine)?'checked':''}/>${escapeHtml(engine)}</label>`).join('')}</div><label>${escapeHtml(presetCopy.addEngine)}<input data-voice-custom value="" /></label><button type="button" data-voice-add>${iconMarkup('plus')} ${escapeHtml(presetCopy.addEngine)}</button>${(meta.voiceEngines||[]).filter(item=>!voiceEngineShortcuts.includes(item.engine)).map(item=>`<button type="button" data-voice-remove="${escapeHtml(item.engine)}">${escapeHtml(item.engine)} ${iconMarkup('x')}</button>`).join('')}</section>`;}
    const activity=meta.lifecycle?.activity||'unknown';return `<fieldset class="ve-preset" data-preset="person"><legend>${escapeHtml(presetCopy.person)}</legend><div class="ve-preset-options">${personActivityStates.map(state=>`<label><input type="radio" name="ve-person-activity" data-person-activity="${state}" ${activity===state?'checked':''}/>${escapeHtml(presetCopy[state])}</label>`).join('')}</div></fieldset>`;
  }
  function renderSongBatchResults(){
    const list=$('[data-credit-batch-results]');if(!list)return;
    const matches=metadataCatalogMatches(catalogRecords,{entityTypes:creditTypes,query:songBatchQuery,limit:18});
    list.innerHTML=matches.length?matches.map(item=>`<label><input type="checkbox" data-credit-batch-id="${escapeHtml(item.id)}" ${songBatchSelectedIds.has(item.id)?'checked':''}/><span>${escapeHtml(item.title||item.id)} <small>· ${escapeHtml(item.id)}</small></span></label>`).join(''):`<p class="ve-hint">${escapeHtml(presetCopy.batchEmpty)}</p>`;
    $('[data-credit-batch-count]').textContent=presetCopy.batchSelected.replace('{n}',String(songBatchSelectedIds.size));
    $('[data-credit-batch-add]').disabled=!songBatchSelectedIds.size;
  }
  function renderFields() {
    const batchKey=draft.meta.id||draft.path;
    if(batchKey!==songBatchDraftKey){songBatchDraftKey=batchKey;songBatchRole='composer';songBatchQuery='';songBatchSelectedIds=new Set();}
    $('[data-kind]').value = draft.kind;
    $('[data-locale-select]').value = draft.meta.locale;
    $('[data-path]').value = draft.path;
    $('[data-document-title]').value = draft.meta.name || draft.meta.title || '';
    if(articleMode){const c=articleCopy(root.dataset.locale);$('[data-fields]').innerHTML=`<label>${uiLocale==='en'?'Summary':uiLocale==='ja'?'概要':'摘要'}<textarea data-article-property="summary">${escapeHtml(draft.meta.summary||'')}</textarea></label><label>${c.category}<select data-article-property="articleCategory">${Object.entries(c.categories).map(([value,label])=>`<option value="${value}" ${draft.meta.articleCategory===value?'selected':''}>${label}</option>`).join('')}</select></label><div data-article-picker></div>`;
      mountArticlePicker($('[data-article-picker]'),{locale:root.dataset.locale,selected:()=>draft.meta.relatedEntities||[],onChange:ids=>{draft.meta.relatedEntities=ids;changed(true);}});return;}

    renderAdvanced();
    $('[data-fields]').innerHTML = fieldsFor(draft).map(f => f.key==='entityType'&&draft.kind==='people'&&!draft.originalMeta?`<label>${escapeHtml(f.labels[uiLocale])}<select data-field="entityType">${['person','virtual-avatar'].map(t=>`<option value="${t}" ${draft.meta.entityType===t?'selected':''}>${t}</option>`).join('')}</select></label>`:`<label>${escapeHtml(f.labels[uiLocale])}${f.required ? ' <span aria-hidden="true">*</span>' : ''}<input data-field="${f.key}" type="${f.type}" ${f.required ? 'required' : ''} ${(draft.originalMeta&&f.key==='id')||f.key==='entityType'&&draft.kind!=='people'?'readonly':''} value="${escapeHtml(draft.meta[f.key] ?? '')}" ${f.key === 'releaseDate' ? 'placeholder="YYYY-MM-DD"' : ''} /></label>`).join('')+renderMetadataPreset();
    renderSongBatchResults();
  }
  const protectedKeys = new Set(['__proto__','prototype','constructor']);
  const fieldPath = path => encodeURIComponent(JSON.stringify(path));
  const parsePath = value => JSON.parse(decodeURIComponent(value));
  function metadataTree(value,path) {
    const key=String(path.at(-1)), name=metadataLabel(key,uiLocale), attr=fieldPath(path);
    if(Array.isArray(value)) return `<fieldset><legend>${escapeHtml(name)}</legend>${value.map((item,i)=>`<div class="ve-meta-item">${metadataTree(item,[...path,i])}<button data-meta-remove="${fieldPath([...path,i])}" aria-label="${copy.remove}">${iconMarkup('x')}</button></div>`).join('')}<button data-meta-add="${attr}">${iconMarkup('plus')} ${copy.row}</button></fieldset>`;
    if(value && typeof value==='object') return `<fieldset><legend>${escapeHtml(name)}</legend>${Object.entries(value).filter(([key])=>!protectedKeys.has(key)).map(([key,val])=>`<div class="ve-meta-item">${metadataTree(val,[...path,key])}<button data-meta-remove="${fieldPath([...path,key])}" aria-label="${copy.remove}">${iconMarkup('x')}</button></div>`).join('')}${nestedMetadataOptions(path,value).map(key=>`<button data-meta-property="${attr}" data-property="${key}">${iconMarkup('plus')} ${escapeHtml(metadataLabel(key,uiLocale))}</button>`).join('')}</fieldset>`;
    const choices=metadataChoices[path.filter(k=>typeof k!=='number').join('.')]||metadataChoices[key]||(typeof path.at(-1)==='number'?metadataChoices[path.at(-2)]:undefined);
    if(choices) return `<label>${escapeHtml(name)}<select data-meta-value="${attr}">${[...new Set([...choices,String(value ?? '')])].map(choice=>`<option value="${escapeHtml(choice)}" ${choice===value?'selected':''}>${escapeHtml(choice)}</option>`).join('')}</select></label>`;
    if(typeof value==='boolean')return `<label class="ve-check"><input data-meta-value="${attr}" type="checkbox" ${value?'checked':''} />${escapeHtml(name)}</label>`;
    return `<label>${escapeHtml(name)}<input ${referenceFields.has(key)||typeof path.at(-1)==='number'&&referenceFields.has(path.at(-2))?'list="entity-reference-options"':''} data-meta-value="${attr}" type="${typeof value==='number'?'number':/Color$|^value$/.test(key)&&/^#[0-9a-f]{6}$/i.test(value)?'color':'text'}" value="${escapeHtml(value ?? '')}" /></label>`;
  }
  const referenceFields=new Set(['entity','target','organization','songId','primaryArtist','parentOrg','organizer','belongToUniverse','headliners','guestPerformers','relatedEntities']);
  function refreshPresetReferenceDisplays(){
    for(const input of root.querySelectorAll('[data-credit$=":entity"]'))if(input!==document.activeElement){
      const index=Number(input.dataset.credit.split(':')[0]);input.value=metadataCatalogDisplay(catalogRecords,draft.meta.credits?.[index]?.entity,{entityTypes:creditTypes});
    }
    for(const input of root.querySelectorAll('[data-track$=":songId"]'))if(input!==document.activeElement){
      const index=Number(input.dataset.track.split(':')[0]);input.value=metadataCatalogDisplay(catalogRecords,draft.meta.tracks?.[index]?.songId,{entityTypes:songTypes});
    }
    const voice=root.querySelector('[data-voice-source]');if(voice&&voice!==document.activeElement){
      const id=draft.meta.relations?.find(edge=>edge.type==='based-on-voice')?.target;
      voice.value=metadataCatalogDisplay(catalogRecords,id,{entityTypes:voiceTypes});
    }
  }
  async function loadReferenceOptions(){
    const locale=draft.meta.locale,requestId=++catalogRequestId;catalogRecords=[];
    for(const id of ['entity-reference-options','editor-credit-options','editor-song-options','editor-voice-options'])root.querySelector('#'+id)?.replaceChildren();
    try{
      const response=await fetch(`/${locale}/editor-catalog.json`);if(!response.ok)return;
      const records=await response.json();if(!Array.isArray(records)||requestId!==catalogRequestId||draft.meta.locale!==locale)return;
      catalogRecords=records;
      const options=[['entity-reference-options',null],['editor-credit-options',creditTypes],['editor-song-options',songTypes],['editor-voice-options',voiceTypes]];
      for(const [id,types] of options){
        let list=root.querySelector('#'+id);if(!list){list=document.createElement('datalist');list.id=id;root.append(list);}
        list.innerHTML=records.filter(item=>item.id&&(!types||types.includes(item.entityType))).map(item=>{
          const value=types?metadataCatalogDisplay(records,item.id,{entityTypes:types}):item.id;
          return `<option value="${escapeHtml(value)}" label="${escapeHtml(item.kind||'')}"></option>`;
        }).join('');
      }
      refreshPresetReferenceDisplays();
      renderSongBatchResults();
      const rich=document.activeElement?.closest?.('[data-rich]');if(rich)updateEntityMention(rich);
    }catch{/* Linking requires a loaded catalog; manual names remain editable. */}
  }
  function renderAdvanced() {
    const basic=new Set(['locale',...fieldsFor(draft).map(f=>f.key)]);
    $('[data-advanced-fields]').innerHTML=Object.entries(draft.meta).filter(([key])=>!basic.has(key)&&!protectedKeys.has(key)&&!['legacy','schemaVersion','researchImport','translation'].includes(key)).map(([key,value])=>`<details><summary>${escapeHtml(metadataLabel(key,uiLocale))}</summary>${metadataTree(value,[key])}<button data-meta-remove="${fieldPath([key])}">${iconMarkup('x')} ${escapeHtml(metadataLabel(key,uiLocale))}</button></details>`).join('');
    const available=metadataOptions(draft.kind,draft.meta).filter(key=>!(key in draft.meta));
    $('[data-advanced-type]').innerHTML=available.map(key=>`<option value="${key}">${escapeHtml(metadataLabel(key,uiLocale))}</option>`).join('');
    $('[data-add-property]').disabled=!available.length;
  }
  function metaParent(path) { if(path.some(key=>protectedKeys.has(String(key))))throw new Error('path');return path.slice(0,-1).reduce((obj,key)=>obj[key],draft.meta); }
  function richControls(b) { return `<div class="ve-rich" contenteditable="true" role="textbox" aria-multiline="true" aria-label="${copy.blocks[b.type]}" data-rich data-placeholder="${copy.emptyParagraph}">${md(b.type==='list'?blockMarkdown(b):b.text)}</div>`; }
  const inlineLabels = kind => kind==='ruby' ? [copy.text,copy.kana,copy.romaji] : kind==='zh-variant' ? [copy.text,copy.taiwan,copy.hongkong] : ['abbr','time'].includes(kind) ? [copy.text,copy.explanation] : [copy.text];
  function unitControls(unit,attr) { return ['original','kana','romaji','time'].map(p=>control(p==='time'?copy.timestamp:copy[p],`${attr}="${p}"`,unit[p]||'')).join(''); }
  function control(labelText, attr, value = '', multiline = false) {
    return `<label>${escapeHtml(labelText)}${multiline ? `<textarea ${attr} rows="3">${escapeHtml(value)}</textarea>` : `<input ${attr} value="${escapeHtml(value)}" />`}</label>`;
  }
  function lyricHasMedia(){return [...draft.blocks.flatMap(b=>b.type==='media'?[b]:b.type==='media-switcher'?b.items:[]),...(draft.meta.media||[])].some(item=>resolveMediaEmbed(item.provider||item.platform,item.url));}
  function lyricClockSeconds(){return (lyricClock.elapsed+(lyricClock.startedAt===null?0:performance.now()-lyricClock.startedAt))/1000;}
  function lyricClockReading(){return playbackClock.sample()||(lyricClock.startedAt!==null||lyricClock.elapsed>0?{source:'manual',seconds:lyricClockSeconds()}:null);}
  function lyricClockLabel(reading){return reading?.source==='youtube'?lyricsCopy.youtubeClock:reading?.source==='html5'?lyricsCopy.html5Clock:lyricsCopy.clock;}
  function lyricClockHint(reading){return reading?.source==='youtube'?lyricsCopy.youtubeActive:reading?.source==='html5'?lyricsCopy.html5Active:reading?.source==='manual'?lyricsCopy.manualActive:playbackStatus==='connecting'?lyricsCopy.youtubeConnecting:playbackStatus==='unavailable'?lyricsCopy.youtubeUnavailable:playbackStatus==='manual'?lyricsCopy.manualPlatform:lyricsCopy.timerHint;}
  function ensureLyricTicker(){if(!lyricTicker)lyricTicker=setInterval(updateLyricClock,100);}
  root.addEventListener('play',event=>{if(event.target?.matches?.('audio,video'))ensureLyricTicker();},true);
  function lyricGrid(b){
    const size=20,page=Math.min(lyricPageByBlock.get(b.id)||0,Math.max(0,Math.ceil(b.rows.length/size)-1)),start=page*size,end=Math.min(b.rows.length,start+size);lyricPageByBlock.set(b.id,page);
    const reading=lyricClockReading(),clockValue=formatLyricTimestamp(reading?.seconds)||'00:00.00';
    const rows=b.rows.slice(start,end).map((row,offset)=>{const i=start+offset,units=row.units?.length?row.units:null,time=units?.[0]?.time||row.time||'';
      const original=units?`<span class="ve-lyric-original">${escapeHtml(units.map(unit=>unit.original).join(''))}</span>`:`<input data-lyric="${i}:original" value="${escapeHtml(row.original||'')}" aria-label="${escapeHtml(copy.original)} ${i+1}" placeholder="${escapeHtml(copy.original)}" />`;
      const reading=units?`<span class="ve-lyric-reading">${escapeHtml(units.map(unit=>unit.kana||unit.romaji||'').join(''))}</span>`:`<input data-lyric="${i}:kana" value="${escapeHtml(row.kana||'')}" aria-label="${escapeHtml(copy.kana)} ${i+1}" placeholder="${escapeHtml(lyricsCopy.reading)}" />`;
      const details=units?`<details class="ve-lyric-details"><summary>${escapeHtml(lyricsCopy.units)}</summary>${units.map((unit,j)=>`<div class="ve-unit" data-unit-row="${i}" data-unit-index="${j}">${unitControls(unit,'data-unit-prop')}<button data-unit-remove="${i}:${j}" ${units.length===1?'disabled':''}>${iconMarkup('x')}</button></div>`).join('')}<button data-unit-add="${i}">${escapeHtml(copy.addUnit)}</button></details>`:`<details class="ve-lyric-details"><summary>${escapeHtml(copy.romaji)}</summary>${control(copy.romaji,`data-lyric="${i}:romaji"`,row.romaji||'')}<button data-unit-add="${i}">${escapeHtml(copy.addUnit)}</button></details>`;
      return `<div class="ve-lyric-row" data-lyric-row="${i}"><span class="ve-lyric-number">${i+1}</span>${original}${reading}<input data-lyric="${i}:translation" value="${escapeHtml(row.translation||'')}" aria-label="${escapeHtml(copy.translation)} ${i+1}" placeholder="${escapeHtml(copy.translation)}" /><input data-lyric="${i}:time" value="${escapeHtml(time)}" aria-label="${escapeHtml(copy.timestamp)} ${i+1}" placeholder="mm:ss.xx" /><button type="button" data-lyric-tap="${i}" title="Ctrl + Space">◷</button><button type="button" data-remove-row="${i}" ${b.rows.length===1?'disabled':''} aria-label="${escapeHtml(copy.remove)}">${iconMarkup('x')}</button>${details}</div>`;
    }).join('');
    return `<div class="ve-lyrics-editor"><p class="ve-hint">${escapeHtml(lyricsCopy.rights)}</p><div class="ve-lyrics-tools"><button type="button" data-lyric-import>${iconMarkup('plus')} ${escapeHtml(lyricsCopy.import)}</button><button type="button" data-row>${iconMarkup('plus')} ${escapeHtml(copy.row)}</button></div><div class="ve-lyric-clock"><strong data-lyric-clock-source>${escapeHtml(lyricClockLabel(reading))}</strong><output data-lyric-clock-readout>${clockValue}</output><div><button type="button" data-lyric-clock="start" ${lyricHasMedia()?'':'disabled'}>${escapeHtml(lyricsCopy.start)}</button><button type="button" data-lyric-clock="pause">${escapeHtml(lyricsCopy.pause)}</button><button type="button" data-lyric-clock="reset">${escapeHtml(lyricsCopy.reset)}</button></div><small data-lyric-clock-hint>${escapeHtml(lyricClockHint(reading))}</small></div><div class="ve-lyric-grid"><div class="ve-lyric-head"><span>#</span><span>${escapeHtml(copy.original)}</span><span>${escapeHtml(lyricsCopy.reading)}</span><span>${escapeHtml(copy.translation)}</span><span>${escapeHtml(copy.timestamp)}</span><span></span></div>${rows}</div><div class="ve-lyric-pages"><button type="button" data-lyric-page="-1" ${page===0?'disabled':''}>${escapeHtml(lyricsCopy.previous)}</button><span>${start+1}–${end} / ${b.rows.length} ${escapeHtml(lyricsCopy.rows)}</span><button type="button" data-lyric-page="1" ${end>=b.rows.length?'disabled':''}>${escapeHtml(lyricsCopy.next)}</button></div></div>`;
  }
  const lyricImportDialog=document.createElement('dialog');lyricImportDialog.className='ve-entry-dialog ve-lyric-import-dialog';
  lyricImportDialog.innerHTML=`<div class="ve-lyric-import-head"><h2>${escapeHtml(lyricsCopy.import)}</h2><button type="button" data-lyric-import-close aria-label="${escapeHtml(copy.cancel)}">${iconMarkup('x')}</button></div><p class="ve-hint">${escapeHtml(lyricsCopy.rights)} <a href="/${root.dataset.locale}/docs/contribute/rights/" target="_blank" rel="noopener">${iconMarkup('arrow-up-right')}</a></p><label>${escapeHtml(lyricsCopy.format)}<select data-lyric-layout><option value="auto">${escapeHtml(lyricsCopy.auto)}</option><option value="alternating">${escapeHtml(lyricsCopy.alternating)}</option><option value="original-only">${escapeHtml(lyricsCopy.original)}</option></select></label><label>${escapeHtml(lyricsCopy.paste)}<textarea data-lyric-paste rows="12" spellcheck="false"></textarea></label><div class="ve-lyric-import-preview"><strong>${escapeHtml(lyricsCopy.preview||'Preview')}</strong><div data-lyric-import-preview role="status"></div></div><label>${escapeHtml(lyricsCopy.action)}<select data-lyric-action><option value="replace">${escapeHtml(lyricsCopy.replace)}</option><option value="append">${escapeHtml(lyricsCopy.append)}</option></select></label><p data-lyric-import-error role="alert"></p><div class="ve-row-tools"><button type="button" data-lyric-import-close>${escapeHtml(copy.cancel)}</button><button type="button" class="ve-primary" data-lyric-import-apply disabled>${escapeHtml(lyricsCopy.apply)}</button></div>`;
  root.append(lyricImportDialog);let lyricImportBlockId=null,lyricImportTrigger=null;
  function closeLyricImportDrawer({restoreFocus=false}={}){
    if(!lyricImportDialog.open)return;
    lyricImportDialog.close();
    if(restoreFocus&&lyricImportTrigger?.isConnected)lyricImportTrigger.focus();
  }
  lyricImportDialog.addEventListener('close',()=>root.removeAttribute('data-lyric-drawer-open'));
  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape'||!lyricImportDialog.open||document.querySelector('dialog[open]:not(.ve-lyric-import-dialog)'))return;
    event.preventDefault();closeLyricImportDrawer({restoreFocus:true});
  });
  function updateLyricClock(){const reading=lyricClockReading(),value=formatLyricTimestamp(reading?.seconds)||'00:00.00';root.querySelectorAll('[data-lyric-clock-readout]').forEach(node=>node.textContent=value);root.querySelectorAll('[data-lyric-clock-source]').forEach(node=>node.textContent=lyricClockLabel(reading));root.querySelectorAll('[data-lyric-clock-hint]').forEach(node=>node.textContent=lyricClockHint(reading));}
  function stampLyricRow(index){const block=draft.blocks.find(b=>b.id===activeBlockId&&b.type==='lyrics');if(!block||!block.rows[index])return;const reading=lyricClockReading();if(!reading){$('[data-action-status]').textContent=lyricsCopy.timerMissing;return;}const value=formatLyricTimestamp(reading.seconds);if(!value)return;checkpoint();block.rows[index].time=value;if(block.rows[index].units?.length)block.rows[index].units[0].time=value;const field=root.querySelector(`[data-lyric="${index}:time"]`);if(field)field.value=value;activeLyricRow=index;changed(true);if(!validLyricsTiming(block.rows))$('[data-action-status]').textContent=lyricsCopy.timing;}
  function lyricsImportError(error){const code=error?.code||'',message=code==='input-size'?lyricsCopy.size:code==='empty-input'?lyricsCopy.empty:['unpaired-line','mismatched-timestamp'].includes(code)?lyricsCopy.unpaired:/timestamp/.test(code)?lyricsCopy.timing:lyricsCopy.invalid;return message+(error?.line?` · ${lyricsCopy.line.replace('{line}',String(error.line))}`:'');}
  function previewLyricsImport(){
    const panel=lyricImportDialog.querySelector('[data-lyric-import-preview]'),apply=lyricImportDialog.querySelector('[data-lyric-import-apply]');
    const input=lyricImportDialog.querySelector('[data-lyric-paste]').value;
    apply.disabled=true;panel.replaceChildren();
    if(!input.trim()){panel.textContent=lyricsCopy.previewEmpty||lyricsCopy.paste;return;}
    try{
      const result=parseLyricsBatch(input,{layout:lyricImportDialog.querySelector('[data-lyric-layout]').value});
      const heading=document.createElement('p');heading.textContent=`${lyricsCopy.detectedLayout||lyricsCopy.format}: ${result.layout==='alternating'?lyricsCopy.alternating:lyricsCopy.original} · ${result.rows.length} ${lyricsCopy.rows}`;panel.append(heading);
      const warning=document.createElement('p');warning.className='ve-hint';warning.textContent=lyricsCopy.previewWarning||lyricsCopy.rights;panel.append(warning);
      const table=document.createElement('div');table.className='ve-lyric-import-sample';
      for(const row of result.rows.slice(0,6)){const item=document.createElement('div');for(const value of [row.time||'—',row.original,row.translation||'—']){const cell=document.createElement('span');cell.textContent=value;item.append(cell);}table.append(item);}
      panel.append(table);if(result.rows.length>6){const more=document.createElement('small');more.textContent=`… ${result.rows.length-6} ${lyricsCopy.rows}`;panel.append(more);}
      apply.disabled=false;
    }catch(error){panel.textContent=lyricsImportError(error);}
  }
  lyricImportDialog.querySelector('[data-lyric-paste]').addEventListener('input',previewLyricsImport);
  lyricImportDialog.querySelector('[data-lyric-layout]').addEventListener('change',previewLyricsImport);
  lyricImportDialog.querySelectorAll('[data-lyric-import-close]').forEach(button=>button.addEventListener('click',()=>closeLyricImportDrawer({restoreFocus:true})));
  lyricImportDialog.querySelector('[data-lyric-import-apply]').addEventListener('click',async()=>{
    const block=draft.blocks.find(b=>b.id===lyricImportBlockId&&b.type==='lyrics');if(!block)return;
    const errorNode=lyricImportDialog.querySelector('[data-lyric-import-error]');errorNode.textContent='';
    try{const imported=parseLyricsBatch(lyricImportDialog.querySelector('[data-lyric-paste]').value,{layout:lyricImportDialog.querySelector('[data-lyric-layout]').value});
      const action=lyricImportDialog.querySelector('[data-lyric-action]').value,existing=block.rows.filter(row=>row.original||row.translation||row.units?.length);
      if(action==='replace'&&existing.length&&!await confirmEditorPopover(root,lyricsCopy.confirm,{accept:copy.apply,cancel:copy.cancel}))return;
      const rows=action==='append'?[...existing,...imported.rows]:imported.rows;if(!validLyricsTiming(rows))throw Object.assign(Error('timing'),{code:'reversed-timestamp'});
      checkpoint();block.rows=rows;lyricPageByBlock.set(block.id,action==='append'?Math.floor((rows.length-1)/20):0);activeLyricRow=action==='append'?rows.length-imported.rows.length:0;renderBlocks(block.id);changed(true);closeLyricImportDrawer();lyricImportDialog.querySelector('[data-lyric-paste]').value='';previewLyricsImport();
    }catch(error){errorNode.textContent=lyricsImportError(error);}
  });
  document.addEventListener('astro:before-swap',()=>{if(lyricTicker)clearInterval(lyricTicker);playbackClock.dispose();},{once:true});
  function blockControls(b) {
    if (b.type === 'paragraph' || b.type === 'list') return richControls(b);
    if (b.type === 'heading') return `<select data-prop="level" aria-label="${copy.blocks.heading}">${[2,3,4,5,6].map(level=>`<option value="${level}" ${b.level===String(level)?'selected':''}>H${level}</option>`).join('')}</select>${control(copy.text,'data-prop="text"',b.text)}`;
    if (b.type === 'list') return `<label class="ve-check"><input type="checkbox" data-prop="ordered" ${b.ordered ? 'checked' : ''} />${copy.ordered}</label>${control(copy.lines,'data-prop="text"',b.text,true)}`;
    if (b.type === 'quote') return control(copy.text,'data-prop="text"',b.text,true);
    if (b.type === 'image') return control(copy.url,'data-prop="url"',b.url) + control(copy.text,'data-prop="text"',b.text) + control(copy.caption,'data-prop="caption"',b.caption);
    if (b.type === 'media') return `<select data-prop="provider" aria-label="${copy.blocks.media}">${['youtube','bilibili','apple-music','spotify','netease','qq-music'].map(p => `<option ${b.provider === p ? 'selected' : ''}>${p}</option>`).join('')}</select>${control(copy.url,'data-prop="url"',b.url)}`;
    if (b.type === 'ruby') return control(copy.text,'data-prop="text"',b.text) + control(copy.kana,'data-prop="kana"',b.kana) + control(copy.romaji,'data-prop="romaji"',b.romaji);
    if (b.type === 'details') return control(copy.detailTitle,'data-prop="title"',b.title) + richControls(b);
    if (b.type === 'table') return `<div class="ve-table-edit"><table>${b.rows.map((row, ri) => `<tr>${row.map((cell, ci) => `<td><input aria-label="${ri + 1} / ${ci + 1}" data-cell="${ri}:${ci}" value="${escapeHtml(cell)}" /></td>`).join('')}</tr>`).join('')}</table></div><div class="ve-row-tools"><button data-row>${copy.row}</button><button data-column>${copy.column}</button></div>`;
    if (b.type === 'lyrics') return lyricGrid(b);
    if(b.type==='inline')return `<select data-inline-style aria-label="${copy.specialFormat}">${inlineKinds.map(kind=>`<option value="${kind}" ${b.kind===kind?'selected':''}>${copy.inline[kind]}</option>`).join('')}</select>${inlineLabels(b.kind).map((label,i)=>control(label,`data-inline-arg="${i}"`,b.args[i]||'')).join('')}`;
    if(b.type==='code')return control(copy.languageName,'data-prop="language"',b.language)+control(copy.blocks.code,'data-prop="text"',b.text,true);
    if(b.type==='math')return `<label class="ve-check"><input type="checkbox" data-prop="display" ${b.display?'checked':''} />${copy.displayMath}</label>`+control(copy.formula,'data-prop="text"',b.text,true);
    if(b.type==='media-switcher')return control(copy.text,'data-prop="title"',b.title)+b.items.map((item,i)=>`<fieldset><legend>${i+1}</legend><select data-media="${i}:provider">${['youtube','bilibili','apple-music','spotify','netease','qq-music'].map(provider=>`<option ${provider===item.provider?'selected':''}>${provider}</option>`).join('')}</select>${control(copy.url,`data-media="${i}:url"`,item.url)}<button data-media-remove="${i}" ${b.items.length<=2?'disabled':''}>${iconMarkup('x')}</button></fieldset>`).join('')+`<button data-media-add ${b.items.length>=6?'disabled':''}>${copy.addMedia}</button>`;
    if (b.type === 'preserved') return `<p class="ve-hint">${copy.preservedHint}</p><details><summary>${copy.source}</summary><pre>${escapeHtml(b.text)}</pre></details>`;
    return '<hr />';
  }
  function previewBlock(b) {if(articleMode&&b.type==='image'&&b.url?.startsWith('/_private/article-assets/'))return `<figure><img data-article-reference="${escapeHtml(b.url)}" alt="${escapeHtml(b.text)}"/><figcaption>${escapeHtml(b.caption||'')}</figcaption></figure>`;return b.type==='media-switcher'?renderMediaSwitcherCard(b,copy,{activeIndex:mediaTabByBlock.get(b.id)||0}):renderPreviewBlock(b,copy); }
  function canvasBlock(b) {
    if (b.type === 'paragraph' || b.type === 'list') return richControls(b);
    if (b.type === 'heading') return `<input class="ve-heading-input" data-prop="text" value="${escapeHtml(b.text)}" placeholder="${copy.blocks.heading}" aria-label="${copy.blocks.heading}"/>`;
    if (b.type === 'table') return blockControls(b);
    if (b.type === 'lyrics') return lyricGrid(b);
    if (b.type === 'details') return `<details class="ve-details-canvas" open><summary>${escapeHtml(b.title||copy.detailTitle)}</summary>${control(copy.detailTitle,'data-prop="title"',b.title)}${richControls(b)}</details>`;
    if (b.type === 'media-switcher') return renderMediaSwitcherCard(b,copy,{editable:true,activeIndex:mediaTabByBlock.get(b.id)||0});
    if (b.type === 'quote' || b.type === 'list') return `<textarea data-prop="text" rows="${Math.max(2,b.text.split('\n').length)}" aria-label="${copy.blocks[b.type]}" placeholder="${copy.blocks[b.type]}">${escapeHtml(b.text)}</textarea>`;
    return `<div class="ve-block-visual wiki-reader wiki-prose" data-inspect-block="${escapeHtml(b.id)}" tabindex="0" role="button" aria-label="${copy.properties}: ${copy.blocks[b.type] || copy.preserved}">${previewBlock(b)}</div>`;
  }
  function renderBlocks(focusId) {
    if (!draft.blocks.some(b=>b.id===activeBlockId)) activeBlockId=draft.blocks[0]?.id;
    if(focusId) activeBlockId=focusId;
    $('[data-blocks]').innerHTML = draft.blocks.map((b,i)=>`<section class="ve-block ${b.id===activeBlockId?'is-active':''}" data-block="${escapeHtml(b.id)}" data-type="${b.type}"><span class="ve-block-gutter" draggable="true" data-drag-block="${escapeHtml(b.id)}" aria-hidden="true">${iconMarkup('grip-vertical')}</span><header><button data-insert-after="${escapeHtml(b.id)}" aria-label="${copy.insertAfter}">${iconMarkup('plus')}</button><button data-duplicate aria-label="${copy.duplicate}">${iconMarkup('copy')}</button><button data-move="-1" aria-label="${copy.up}" ${i===0?'disabled':''}>${iconMarkup('arrow-up')}</button><button data-move="1" aria-label="${copy.down}" ${i===draft.blocks.length-1?'disabled':''}>${iconMarkup('arrow-down')}</button><button data-remove aria-label="${copy.remove}">${iconMarkup('x')}</button></header>${canvasBlock(b)}</section>`).join('');
    renderOutline(); renderInspector();
    if(focusId) blockElement(focusId)?.querySelector('[contenteditable],input,textarea,[data-inspect-block]')?.focus();
  }
  const blockElement = id => [...$('[data-blocks]').children].find(el=>el.dataset.block===id);
  function syncMediaSwitcherInspector(block,field) {
    if(block.type!=='media-switcher')return;
    const inspector=$('[data-inspector]');if(inspector.dataset.block!==block.id)return;
    const selector=field.dataset.media?`[data-media="${field.dataset.media}"]`:field.dataset.prop==='title'?'[data-prop="title"]':null;
    const peer=selector&&inspector.querySelector(selector);
    if(peer&&peer!==field)peer.value=field.value;
  }
  function refreshMediaSwitcherCanvas(block,field) {
    if(block.type!=='media-switcher'||!field.closest('.ve-media-switcher-editor'))return;
    const host=blockElement(block.id)?.querySelector('.ve-media-switcher-editor');if(!host)return;
    const index=Number(host.dataset.mediaActive)||0,item=block.items[index];if(!item)return;
    if(field.dataset.media?.endsWith(':provider')) {
      host.outerHTML=renderMediaSwitcherCard(block,copy,{editable:true,activeIndex:index});
      blockElement(block.id)?.querySelector(`.ve-media-switcher-editor [data-media="${index}:provider"]`)?.focus();
      return;
    }
    if(!field.dataset.media?.endsWith(':url'))return;
    const media=resolveMediaEmbed(item.provider,item.url);
    const status=host.querySelector('.ve-media-switcher-status');
    status.classList.toggle('is-valid',Boolean(media));status.classList.toggle('is-invalid',Boolean(!media&&item.url.trim()));
    status.textContent=media?`✓ ${copy.mediaResolved}`:item.url.trim()?copy.mediaUnresolved:copy.mediaPaste;
    const tab=host.querySelectorAll('[data-preview-provider]')[index];
    tab?.querySelector('span')?.classList.toggle('is-valid',Boolean(media));
    tab?.querySelector('span')?.classList.toggle('is-invalid',!media);
    host.querySelector('[data-preview-media]').innerHTML=previewMedia(item.provider,item.url);
  }
  function renderOutline() {
    $('[data-document-name]').textContent=draft.meta.name||draft.meta.title||copy.emptyTitle;
    $('[data-file-label]').textContent=articleMode?`${draft.meta.locale} · ${uiLocale==='en'?'Article':uiLocale==='ja'?'文章':'文章'}`:draft.path ? draft.path.split('/').slice(-2).join('/') : `${draft.meta.locale}.md`;
    $('[data-block-count]').textContent=`${draft.blocks.length} ${copy.blockCount}`;
    $('[data-outline]').innerHTML=draft.blocks.map((b,i)=>`<button data-outline-block="${escapeHtml(b.id)}" class="${b.id===activeBlockId?'is-active':''}" title="${escapeHtml(b.text?.slice(0,100)||copy.blocks[b.type]||copy.preserved)}"><small>${b.type==='heading'?'H'+b.level:String(i+1).padStart(2,'0')}</small><span>${escapeHtml((b.title||b.text||'').replace(/\{\{[a-z-]+::([^:}]+)(?:::[^}]*)?\}\}/g,'$1').replace(/<[^>]+>/g,'').replace(/[*#|_`>]/g,'').slice(0,45)||copy.blocks[b.type]||copy.preserved)}</span></button>`).join('')||`<p class="ve-hint">${copy.emptyOutline}</p>`;
  }
  function renderInspector() {
    const block=draft.blocks.find(b=>b.id===activeBlockId);const panel=$('[data-inspector]');
    if(!block) {panel.innerHTML=`<p>${copy.selectBlock}</p>`;return;}
    panel.dataset.block=block.id;
    panel.innerHTML=`<p class="ve-inspector-kind">${copy.blocks[block.type]||copy.preserved}</p>`+(block.type==='paragraph'?`<p class="ve-hint">${copy.paragraphHint}</p>`:block.type==='lyrics'?`<p class="ve-hint">${escapeHtml(lyricsCopy.rights)}</p>`:blockControls(block));
  }
  function selectBlock(id,{scroll=false,inspect=false}={}) {
    if(!draft.blocks.some(b=>b.id===id))return;
    const changed=activeBlockId!==id; activeBlockId=id;
    $('[data-blocks]').querySelectorAll('.ve-block').forEach(el=>el.classList.toggle('is-active',el.dataset.block===id));
    $('[data-outline]').querySelectorAll('button').forEach(el=>el.classList.toggle('is-active',el.dataset.outlineBlock===id));
    $('[data-preview]').querySelectorAll('[data-preview-block]').forEach(el=>el.classList.toggle('is-active',el.dataset.previewBlock===id));
    if(changed)renderInspector();
    highlightReference();
    scheduleEditorMediaCovers(root);
    if(scroll)blockElement(id)?.scrollIntoView({block:'center',behavior:'instant'});
    if(inspect) {if(window.innerWidth<=900)setLayout('preview'); changeView('properties');}
  }
  function output() {
    const starter=$('[data-editor-starter]');
    if(starter)starter.hidden=!isUntouchedEditorDraft(draft,articleMode);
    const domainStrip=$('[data-editor-domain-strip]');
    if(domainStrip)domainStrip.hidden=!starter?.hidden;
    if(draft.create&&draft.meta.schemaVersion===2){try{draft.path=entitySourcePath(draft.meta);}catch{/* Incomplete metadata is reported by validation. */}}
    if(referenceFor&&referenceFor.split('|')[0]!==draft.path)invalidateReference();
    const errors = articleMode?[]:[...validateDraft(draft), ...advancedErrors(draft.meta)];
    if (draft.needsOriginal) errors.push('loadOriginal');
    if(sourcePending===null && !sourceEditor?.hasFocus() && document.activeElement!==$('[data-source]')) {
      $('[data-source]').value=serializeDraft();sourceEditor?.setText($('[data-source]').value);
    }
    updateSourceLines(); renderOutline();
    const preview=$('[data-preview]');
    let heading=preview.querySelector('[data-preview-heading]');
    if(!heading) { heading=document.createElement('div'); heading.dataset.previewHeading=''; preview.prepend(heading); }
    const headingHtml=`<h1>${escapeHtml(draft.meta.name||draft.meta.title||copy.emptyTitle)}</h1>${draft.meta.profileTagline||draft.meta.description?`<p class="ve-deck">${escapeHtml(draft.meta.profileTagline||draft.meta.description)}</p>`:''}`;
    if(heading.innerHTML!==headingHtml) heading.innerHTML=headingHtml;
    const current=new Map([...preview.querySelectorAll(':scope > [data-preview-block]')].map(el=>[el.dataset.previewBlock,el]));
    let previous=heading;
    for(const block of draft.blocks) {
      const signature=JSON.stringify(block);let node=current.get(block.id);
      if(!node){node=document.createElement('div');node.className='ve-preview-block';node.dataset.previewBlock=block.id;}
      if(node.dataset.signature!==signature){node.innerHTML=previewBlock(block);node.dataset.signature=signature;enhanceReader(node,root.dataset.locale);}
      node.classList.toggle('is-active',block.id===activeBlockId);
      if(previous.nextElementSibling!==node)previous.after(node); previous=node; current.delete(block.id);
    }
    current.forEach(node=>node.remove());
    preview.querySelectorAll('a').forEach(a=>{a.target='_blank';a.rel='noopener noreferrer';});
    $('[data-validation]').innerHTML=errors.length?errors.map(error=>`<button data-error-field="${escapeHtml(error)}">${escapeHtml(label(error))}</button>`).join(''):`<p>${copy.ready}</p>`;
    $('[data-problem-count]').textContent=String(errors.length);
    $('[data-copy]').disabled=sourcePending!==null;
    $('[data-download]').disabled=false;
    const github = $('[data-github]');
    github.hidden = articleMode || !validPath(draft.path);
    if (!github.hidden) {
      const parts = draft.path.split('/').map(encodeURIComponent);
      const filename = parts.pop();
      github.href = draft.originalMeta ? `https://github.com/LinkTh1rsty/kamitsubaki-wiki-site/edit/main/${parts.join('/')}/${filename}` : `https://github.com/LinkTh1rsty/kamitsubaki-wiki-site/new/main/${parts.join('/')}?filename=${filename}`;
    }
    updateHistory();
    if(articleMode)void refreshAttachmentPreviews();
    scheduleEditorMediaCovers(root);
  }
  let composing=false;
  root.addEventListener('compositionstart',()=>{composing=true;checkpoint();});
  root.addEventListener('compositionend',event=>{composing=false;const rich=event.target.closest('[data-rich]');if(rich)syncRich(rich);});
  root.addEventListener('input', event => {
    if(event.isComposing||composing)return;
    const el = event.target;
    if (!(el instanceof HTMLElement)) return;
    if(el.matches('[data-credit-batch-search]')){songBatchQuery=el.value;renderSongBatchResults();return;}
    if(el.matches('[data-credit-batch-id]')){el.checked?songBatchSelectedIds.add(el.dataset.creditBatchId):songBatchSelectedIds.delete(el.dataset.creditBatchId);$('[data-credit-batch-count]').textContent=presetCopy.batchSelected.replace('{n}',String(songBatchSelectedIds.size));$('[data-credit-batch-add]').disabled=!songBatchSelectedIds.size;return;}
    if(el.matches('[data-credit-batch-role]')){songBatchRole=el.value;return;}
    if(el.matches('[data-article-property]')){const key=el.dataset.articleProperty;draft.meta[key]=el.value;changed();return;}
    if(el.matches('[data-source]')) {queueSource();return;}
    if(el.matches('[data-credit]')){const [i,p]=el.dataset.credit.split(':');const credit=draft.meta.credits?.[Number(i)];if(credit){if(p==='entity')return;if(el.value)credit[p]=el.value;else delete credit[p];changed();}return;}
    if(el.matches('[data-track]')){const [i,p]=el.dataset.track.split(':');const track=draft.meta.tracks?.[Number(i)];if(track){if(p==='songId')return;if(el.value)track[p]=el.value;else delete track[p];changed();}return;}
    if(el.matches('[data-voice-engine]')){draft.meta=setVoiceEngine(draft.meta,el.dataset.voiceEngine,el.checked);changed(true);return;}
    if(el.matches('[data-person-activity]')){draft.meta=setPersonActivity(draft.meta,el.dataset.personActivity);changed(true);return;}
    if(el.matches('[data-document-title]')) {draft.meta['name' in draft.meta?'name':'title']=el.value;const field=$(`[data-field="${'name' in draft.meta?'name':'title'}"]`);if(field)field.value=el.value;changed();return;}
    if (el.matches('[data-meta-value]')) { const path=parsePath(el.dataset.metaValue); metaParent(path)[path.at(-1)]=el.type==='checkbox'?el.checked:el.type==='number'?Number(el.value):el.value; changed(); return; }
    if (el.matches('[data-field]')) {
      const spec = fieldsFor(draft).find(f => f.key === el.dataset.field);
      if (!el.value && !spec.required) delete draft.meta[spec.key];
      else draft.meta[spec.key] = spec.type === 'number' && el.value !== '' ? Number(el.value) : el.value;
    } else if (el.matches('[data-path]')) draft.path = el.value.trim();
    else {
      const block = draft.blocks.find(b => b.id === el.closest('[data-block]')?.dataset.block);
      if (!block) return;
      if (el.closest('[data-rich]')) { block.text = richMarkdown(el.closest('[data-rich]')); if(block.type==='list')block.type='paragraph'; }
      else if(el.hasAttribute('data-inline-style')) {block.kind=el.value;block.args=inlineLabels(block.kind).map((_,i)=>block.args[i]||'');renderBlocks();}
      else if(el.hasAttribute('data-inline-arg')) block.args[Number(el.dataset.inlineArg)]=el.value;
      else if(el.hasAttribute('data-media')) {const [i,p]=el.dataset.media.split(':');block.items[Number(i)][p]=el.value;syncMediaSwitcherInspector(block,el);refreshMediaSwitcherCanvas(block,el);}
      else if(el.hasAttribute('data-unit-prop')) {const unit=el.closest('[data-unit-row]');block.rows[Number(unit.dataset.unitRow)].units[Number(unit.dataset.unitIndex)][el.dataset.unitProp]=el.value;}
      else if (el.dataset.prop) {block[el.dataset.prop] = el.type === 'checkbox' ? el.checked : el.value;syncMediaSwitcherInspector(block,el);if(block.type==='details'&&el.dataset.prop==='title')el.closest('.ve-details-canvas')?.querySelector('summary')?.replaceChildren(document.createTextNode(el.value||copy.detailTitle));}
      else if (el.dataset.cell) { const [r,c] = el.dataset.cell.split(':').map(Number); block.rows[r][c] = el.value; }
      else if (el.dataset.lyric) { const [r,p] = el.dataset.lyric.split(':'); const row=block.rows[Number(r)];row[p]=el.value;if(p==='time'&&row.units?.length)row.units[0].time=el.value; }
      else return;
    }
    if(el.closest('[data-inspector]')) { const id=activeBlockId,element=blockElement(id),block=draft.blocks.find(b=>b.id===id); if(element&&block) {element.querySelector(':scope > :last-child')?.remove();element.insertAdjacentHTML('beforeend',canvasBlock(block));} }
    if(el.matches('[data-field="name"],[data-field="title"]')) $('[data-document-title]').value=el.value;
    if(el.matches('[data-field="entityType"]'))renderFields();
    changed();
    if(el.closest('[data-rich]'))queueMicrotask(()=>updateEntityMention(el.closest('[data-rich]')));
  });
  root.addEventListener('change',event=>{
    const el=event.target;if(!(el instanceof HTMLElement))return;
    if(el.matches('[data-credit$=":entity"]')){
      const index=Number(el.dataset.credit.split(':')[0]),credit=draft.meta.credits?.[index];if(!credit)return;
      const selection=resolveMetadataCatalogInput(catalogRecords,el.value,{entityTypes:creditTypes});
      try{
        if(selection.status==='matched'){draft.meta.credits[index]=makeSongCredit({...credit,entity:selection.id},catalogRecords);el.value=metadataCatalogDisplay(catalogRecords,selection.id,{entityTypes:creditTypes});changed(true);}
        else if(selection.status==='empty'){delete credit.entity;changed(true);}
        else throw new Error(selection.status);
      }catch(error){el.value=metadataCatalogDisplay(catalogRecords,credit.entity,{entityTypes:creditTypes});$('[data-action-status]').textContent=error.message==='ambiguous'?presetCopy.ambiguous:copy.notFound;}
      return;
    }
    if(el.matches('[data-track$=":songId"]')){
      const index=Number(el.dataset.track.split(':')[0]),track=draft.meta.tracks?.[index];if(!track)return;
      const selection=resolveMetadataCatalogInput(catalogRecords,el.value,{entityTypes:songTypes});
      try{
        if(selection.status==='matched')draft.meta.tracks[index]=linkReleaseTrack(track,selection.id,catalogRecords);
        else if(selection.status==='empty')delete track.songId;
        else throw new Error(selection.status);
        renderFields();changed(true);
      }catch(error){el.value=metadataCatalogDisplay(catalogRecords,track.songId,{entityTypes:songTypes});$('[data-action-status]').textContent=error.message==='ambiguous'?presetCopy.ambiguous:copy.notFound;}
      return;
    }
    if(el.matches('[data-voice-source]')){
      const previous=draft.meta.relations?.find(edge=>edge.type==='based-on-voice')?.target||'';
      const selection=resolveMetadataCatalogInput(catalogRecords,el.value,{entityTypes:voiceTypes});
      try{
        if(selection.status==='matched')draft.meta=setVoiceSource(draft.meta,selection.id,catalogRecords);
        else if(selection.status==='empty')draft.meta.relations=(draft.meta.relations||[]).filter(edge=>edge.type!=='based-on-voice');
        else throw new Error(selection.status);
        el.value=metadataCatalogDisplay(catalogRecords,selection.id,{entityTypes:voiceTypes});changed(true);
      }catch(error){el.value=metadataCatalogDisplay(catalogRecords,previous,{entityTypes:voiceTypes});$('[data-action-status]').textContent=error.message==='ambiguous'?presetCopy.ambiguous:copy.notFound;}
    }
  });
  root.addEventListener('focusin',event=>{const row=event.target.closest?.('[data-lyric-row]');if(row)activeLyricRow=Number(row.dataset.lyricRow);});
  root.addEventListener('keydown',event=>{
    const field=event.target.closest?.('.ve-lyric-row input[data-lyric]');
    if(!field||event.isComposing||composing||!['Tab','Enter'].includes(event.key))return;
    const rowElement=field.closest('[data-lyric-row]'),block=draft.blocks.find(b=>b.id===field.closest('[data-block]')?.dataset.block);
    if(!block||block.type!=='lyrics')return;
    const rowIndex=Number(rowElement.dataset.lyricRow),column=field.dataset.lyric.split(':')[1];
    const editableAt=index=>block.rows[index]?.units?.length?['translation','time']:['original','kana','translation','time'];
    const focusCell=(index,key)=>{
      if(index<0||index>=block.rows.length)return false;
      if(Math.floor(index/20)!==(lyricPageByBlock.get(block.id)||0)){lyricPageByBlock.set(block.id,Math.floor(index/20));renderBlocks(block.id);}
      const next=root.querySelector(`[data-block="${block.id}"] [data-lyric="${index}:${key}"]`)||root.querySelector(`[data-block="${block.id}"] [data-lyric="${index}:translation"]`);
      if(!next)return false;activeLyricRow=index;next.focus();next.select();return true;
    };
    if(event.key==='Enter'){
      event.preventDefault();let next=rowIndex+1;
      if(next>=block.rows.length){checkpoint();block.rows.push({original:'',kana:'',romaji:'',translation:''});lyricPageByBlock.set(block.id,Math.floor(next/20));renderBlocks(block.id);changed(true);}
      focusCell(next,column);return;
    }
    const columns=editableAt(rowIndex),position=columns.indexOf(column);
    if(position<0)return;
    const adjacent=position+(event.shiftKey?-1:1);
    if(adjacent>=0&&adjacent<columns.length){event.preventDefault();focusCell(rowIndex,columns[adjacent]);return;}
    const nextRow=rowIndex+(event.shiftKey?-1:1);
    if(nextRow>=0&&nextRow<block.rows.length){event.preventDefault();const nextColumns=editableAt(nextRow);focusCell(nextRow,event.shiftKey?nextColumns.at(-1):nextColumns[0]);}
  });
  root.addEventListener('paste', event => {
    if (!event.target.closest('[data-rich]') || event.clipboardData.files.length) return;
    checkpoint(); event.preventDefault(); document.execCommand('insertText', false, event.clipboardData.getData('text/plain'));
  });
  root.addEventListener('drop', event => { if (event.target.closest('[data-rich]')) event.preventDefault(); });
  root.addEventListener('pointerdown', event => { if (event.target.closest('[data-format],[data-special],[data-inline-preset],[data-toolbar-scroll],[data-clear-format],[data-edit-inline]')) event.preventDefault(); });
  root.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    const block = draft.blocks.find(b => b.id === (button.closest('[data-block]')?.dataset.block || activeBlockId));
    if(button.hasAttribute('data-credit-batch-add')){
      if(!songBatchSelectedIds.size)return;
      try{const updated=addSongCreditsBatch(draft.meta,songBatchRole,[...songBatchSelectedIds],catalogRecords),added=updated.credits.length-(draft.meta.credits?.length||0);
        if(added){checkpoint();draft.meta=updated;songBatchSelectedIds.clear();renderFields();changed(true);}
        $('[data-action-status]').textContent=added?presetCopy.batchAdded.replace('{n}',String(added)):presetCopy.batchDuplicate;
      }catch{$('[data-action-status]').textContent=copy.notFound;}
      return;
    }
    if(block?.type==='lyrics'&&button.hasAttribute('data-lyric-import')){if(lyricImportDialog.open&&lyricImportBlockId===block.id){closeLyricImportDrawer({restoreFocus:true});return;}lyricImportBlockId=block.id;lyricImportTrigger=button;lyricImportDialog.querySelector('[data-lyric-import-error]').textContent='';previewLyricsImport();root.setAttribute('data-lyric-drawer-open','');openEditorPopover(root,lyricImportDialog,button);lyricImportDialog.querySelector('[data-lyric-paste]').focus();return;}
    if(block?.type==='lyrics'&&button.hasAttribute('data-lyric-page')){lyricPageByBlock.set(block.id,Math.max(0,(lyricPageByBlock.get(block.id)||0)+Number(button.dataset.lyricPage)));renderBlocks(block.id);return;}
    if(block?.type==='lyrics'&&button.hasAttribute('data-lyric-tap')){stampLyricRow(Number(button.dataset.lyricTap));return;}
    if(button.hasAttribute('data-lyric-clock')){const action=button.dataset.lyricClock;if(action==='start'){if(!lyricHasMedia()){$('[data-action-status]').textContent=lyricsCopy.timerMissing;return;}if(lyricClock.startedAt===null)lyricClock.startedAt=performance.now();ensureLyricTicker();}else if(action==='pause'){if(lyricClock.startedAt!==null){lyricClock.elapsed+=performance.now()-lyricClock.startedAt;lyricClock.startedAt=null;}}else if(action==='reset'){lyricClock.startedAt=null;lyricClock.elapsed=0;}updateLyricClock();return;}
    if(button.hasAttribute('data-credit-add')){checkpoint();(draft.meta.credits ||= []).push({role:'composer'});renderFields();changed(true);return;}
    if(button.hasAttribute('data-credit-remove')){checkpoint();draft.meta.credits?.splice(Number(button.dataset.creditRemove),1);renderFields();changed(true);return;}
    if(button.hasAttribute('data-track-add')){checkpoint();const tracks=(draft.meta.tracks ||= []);tracks.push({disc:1,number:String(tracks.length+1),title:''});renderFields();changed(true);return;}
    if(button.hasAttribute('data-track-remove')){checkpoint();draft.meta.tracks?.splice(Number(button.dataset.trackRemove),1);renderFields();changed(true);return;}
    if(button.hasAttribute('data-voice-add')){const value=$('[data-voice-custom]')?.value.trim();if(!value)return;checkpoint();draft.meta=setVoiceEngine(draft.meta,value,true);renderFields();changed(true);return;}
    if(button.hasAttribute('data-voice-remove')){checkpoint();draft.meta=setVoiceEngine(draft.meta,button.dataset.voiceRemove,false);renderFields();changed(true);return;}
    if(button.hasAttribute('data-add-property')) {checkpoint();const key=$('[data-advanced-type]').value;if(!metadataOptions(draft.kind,draft.meta).includes(key))return;draft.meta[key]=metadataDefault(key,draft.meta);renderAdvanced();changed(true);}
    if(button.hasAttribute('data-meta-property')){checkpoint();const path=parsePath(button.dataset.metaProperty),obj=path.reduce((o,k)=>o[k],draft.meta),key=button.dataset.property;if(nestedMetadataOptions(path,obj).includes(key))obj[key]=nestedMetadataDefault(path,key);renderAdvanced();changed(true);}
    if(button.hasAttribute('data-meta-add')) {checkpoint();const path=parsePath(button.dataset.metaAdd);const array=path.reduce((obj,key)=>obj[key],draft.meta);array.push(newMetadataItem(path.join('.'),array,draft.meta));renderAdvanced();changed(true);}
    if(button.hasAttribute('data-meta-remove')) {checkpoint();const path=parsePath(button.dataset.metaRemove),parent=metaParent(path);if(Array.isArray(parent))parent.splice(Number(path.at(-1)),1);else delete parent[path.at(-1)];renderAdvanced();changed(true);}
    if(button.hasAttribute('data-preview-provider')) {
      const [id,rawIndex]=button.dataset.previewProvider.split(':'),selected=Number(rawIndex),b=draft.blocks.find(item=>item.id===id);
      if(b?.type==='media-switcher'&&b.items[selected]) {
        const focusCanvas=Boolean(button.closest('.ve-canvas'));
        mediaTabByBlock.set(id,selected);
        const canvasCard=blockElement(id)?.querySelector('.ve-media-switcher-editor');
        if(canvasCard)canvasCard.outerHTML=renderMediaSwitcherCard(b,copy,{editable:true,activeIndex:selected});
        const previewNode=[...root.querySelectorAll('[data-preview-block]')].find(node=>node.dataset.previewBlock===id);
        const previewCard=previewNode?.querySelector('.ve-media-switcher');
        if(previewCard)previewCard.outerHTML=renderMediaSwitcherCard(b,copy,{activeIndex:selected});
        const focusedCard=focusCanvas?blockElement(id)?.querySelector('.ve-media-switcher-editor'):previewNode?.querySelector('.ve-media-switcher');
        focusedCard?.querySelectorAll('[data-preview-provider]')[selected]?.focus();
        scheduleEditorMediaCovers(root);
      }
      return;
    }
    if(block?.type==='media-switcher' && button.hasAttribute('data-media-add')){if(block.items.length>=6)return;checkpoint();const index=block.items.length;block.items.push({provider:'youtube',url:''});mediaTabByBlock.set(block.id,index);renderBlocks(block.id);changed(true);blockElement(block.id)?.querySelector(`[data-media="${index}:url"]`)?.focus();return;}
    if(block?.type==='media-switcher' && button.hasAttribute('data-media-remove')){if(block.items.length<=2)return;checkpoint();const index=Number(button.dataset.mediaRemove);block.items.splice(index,1);mediaTabByBlock.set(block.id,Math.min(index,block.items.length-1));renderBlocks(block.id);changed(true);return;}
    if(block && button.hasAttribute('data-unit-add')){checkpoint();const row=block.rows[Number(button.dataset.unitAdd)];if(!row.units?.length)row.units=[{original:row.original,kana:row.kana,romaji:row.romaji,time:row.time||''}];row.units.push({original:'',kana:'',romaji:'',time:''});renderBlocks(block.id);changed(true);}
    if(block && button.hasAttribute('data-unit-remove')){checkpoint();const [i,j]=button.dataset.unitRemove.split(':').map(Number);if(block.rows[i].units.length>1)block.rows[i].units.splice(j,1);renderBlocks(block.id);changed(true);}
    if(button.hasAttribute('data-load-media')) {const provider=resolveMediaEmbed(button.dataset.provider,button.dataset.url)?.provider;const figure=loadPreviewMedia(button,{youtubeApi:provider==='youtube',origin:location.origin});if(figure){ensureLyricTicker();void playbackClock.registerFigure(figure);}return;}
    if (button.dataset.format) {
      const rich=blockElement(activeBlockId)?.querySelector('[data-rich]');
      if(!rich){$('[data-action-status]').textContent=copy.paragraphHint;return;}
      restoreSelection(rich);
      if(button.dataset.format==='link') {openLink(rich);return;}
      checkpoint(); document.execCommand(button.dataset.format,false); syncRich(rich); return;
    }
    if(button.hasAttribute('data-duplicate')&&block) {checkpoint();const next=structuredClone(block);next.id=crypto.randomUUID();draft.blocks.splice(draft.blocks.indexOf(block)+1,0,next);renderBlocks(next.id);changed(true);}
    if (button.hasAttribute('data-remove')) { checkpoint(); draft.blocks = draft.blocks.filter(b => b !== block); if(!draft.blocks.length)draft.blocks.push(newBlock('paragraph')); renderBlocks(); changed(true); }
    if (button.dataset.move) { checkpoint(); const i = draft.blocks.indexOf(block), j = i + Number(button.dataset.move); if (j < 0 || j >= draft.blocks.length) return; [draft.blocks[i],draft.blocks[j]] = [draft.blocks[j],draft.blocks[i]]; renderBlocks(block.id); changed(true); }
    if (button.hasAttribute('data-row')) { checkpoint(); block.rows.push(block.type === 'table' ? block.rows[0].map(() => '') : {original:'',kana:'',romaji:'',translation:''});if(block.type==='lyrics')lyricPageByBlock.set(block.id,Math.floor((block.rows.length-1)/20)); renderBlocks(block.id); changed(true); }
    if (button.hasAttribute('data-column')) { checkpoint(); block.rows.forEach(row => row.push('')); renderBlocks(block.id); changed(true); }
    if (button.hasAttribute('data-remove-row')) { checkpoint(); block.rows.splice(Number(button.dataset.removeRow),1); renderBlocks(block.id); changed(true); }
  });
  root.addEventListener('keydown',event=>{
    const tab=event.target.closest?.('[data-preview-provider]');
    if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    const tabs=[...tab.closest('[role="tablist"]').querySelectorAll('[data-preview-provider]')],index=tabs.indexOf(tab);
    if(index<0)return;
    event.preventDefault();
    const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
    tabs[next]?.click();
  });
  function syncRich(rich, structural=false) {
    const block=draft.blocks.find(b=>b.id===rich.closest('[data-block]')?.dataset.block);
    if(!block)return;
    block.text=richMarkdown(rich);if(block.type==='list')block.type='paragraph';
    changed(structural);
  }
  function replaceRubySugar(rich,node,match,{trailingSpace=false}={}) {
    const template=document.createElement('template');template.innerHTML=shortcodeChip(inlineSource('ruby',[match.text,match.kana]));
    const chip=template.content.firstChild,range=document.createRange();
    range.setStart(node,match.start);range.setEnd(node,match.end);range.deleteContents();range.insertNode(chip);
    const after=trailingSpace?document.createTextNode(' '):null;if(after)chip.after(after);
    const selection=window.getSelection();if(trailingSpace&&selection){const caret=document.createRange();caret.setStart(after,1);caret.collapse(true);selection.removeAllRanges();selection.addRange(caret);}
  }
  root.addEventListener('focusout',event=>{
    const rich=event.target.closest?.('[data-rich]');if(!rich||rich.contains(event.relatedTarget)||composing)return;
    const walker=document.createTreeWalker(rich,NodeFilter.SHOW_TEXT,{acceptNode(node){return node.parentElement?.closest('[data-ve-source],code,pre,a')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;}});
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    let converted=false;
    for(const node of nodes){const matches=rubySugarMatches(node.textContent);for(const match of matches.reverse()){if(!converted)checkpoint();replaceRubySugar(rich,node,match);converted=true;}}
    if(converted)syncRich(rich,true);
  });
  const mentionPopup=document.createElement('div');mentionPopup.className='ve-entity-mention';mentionPopup.hidden=true;mentionPopup.setAttribute('role','listbox');root.append(mentionPopup);
  let mentionContext=null,mentionItems=[],mentionIndex=0;
  function closeEntityMention(){mentionPopup.hidden=true;mentionContext=null;mentionItems=[];}
  function renderEntityMention(){
    mentionPopup.replaceChildren();
    mentionItems.forEach((record,i)=>{const button=document.createElement('button');button.type='button';button.dataset.mentionIndex=String(i);button.setAttribute('role','option');button.setAttribute('aria-selected',String(i===mentionIndex));const title=document.createElement('strong');title.textContent=record.title;const detail=document.createElement('small');detail.textContent=`${record.typeLabel||record.entityType} · ${record.id}`;button.append(title,detail);mentionPopup.append(button);});
    mentionPopup.hidden=!mentionItems.length;
  }
  function updateEntityMention(rich){
    const selection=window.getSelection();if(!selection?.rangeCount||!selection.isCollapsed||!rich?.contains(selection.anchorNode)){closeEntityMention();return;}
    const node=selection.anchorNode;if(node.nodeType!==Node.TEXT_NODE||node.parentElement.closest('[data-ve-source],a,code,pre')){closeEntityMention();return;}
    const prefix=node.textContent.slice(0,selection.anchorOffset),match=prefix.match(/(?:^|[\s(（])((?:\[\[|@))([^\s\[\]@]{0,40})$/u);
    if(!match){closeEntityMention();return;}
    const triggerStart=prefix.length-match[1].length-match[2].length,query=match[2];
    mentionContext={rich,node,start:triggerStart,end:selection.anchorOffset};
    mentionItems=query?searchEditorEntityCatalog(catalogRecords,query,{locale:draft.meta.locale,limit:8}):catalogRecords.map(record=>normalizeEditorEntityRecord(record,draft.meta.locale)).filter(Boolean).slice(0,8);
    mentionIndex=0;renderEntityMention();if(mentionPopup.hidden)return;
    void positionEditorSurface(selection.getRangeAt(0),mentionPopup);
  }
  function chooseEntityMention(index){
    const record=mentionItems[index],context=mentionContext,mention=record&&buildEditorEntityMention(record,{locale:draft.meta.locale});
    if(!mention||!context?.node.isConnected)return false;
    const {rich,node,start,end}=context,range=document.createRange(),link=document.createElement('a');link.href=mention.url;link.textContent=mention.title;
    checkpoint();range.setStart(node,start);range.setEnd(node,end);range.deleteContents();range.insertNode(link);
    const caret=document.createRange();caret.setStartAfter(link);caret.collapse(true);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(caret);
    closeEntityMention();rich.focus();syncRich(rich,true);return true;
  }
  mentionPopup.addEventListener('click',event=>{const item=event.target.closest('[data-mention-index]');if(item)chooseEntityMention(Number(item.dataset.mentionIndex));});
  document.addEventListener('pointerdown',event=>{if(!mentionPopup.hidden&&!mentionPopup.contains(event.target)&&!event.target.closest?.('[data-rich]'))closeEntityMention();});
  root.addEventListener('keydown',event=>{
    const rich=event.target.closest('[data-rich]');
    if(!rich||event.isComposing||composing||event.defaultPrevented)return;
    if(mentionContext?.rich===rich&&!mentionPopup.hidden){if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();mentionIndex=(mentionIndex+(event.key==='ArrowDown'?1:-1)+mentionItems.length)%mentionItems.length;renderEntityMention();return;}if(event.key==='Enter'){event.preventDefault();chooseEntityMention(mentionIndex);return;}if(event.key==='Escape'){event.preventDefault();closeEntityMention();return;}}
    const selection=window.getSelection();
    if(!selection?.rangeCount||!rich.contains(selection.focusNode))return;
    if(!rich.contains(selection.getRangeAt(0).startContainer)||!rich.contains(selection.getRangeAt(0).endContainer))return;
    const range=selection.getRangeAt(0), parent=selection.anchorNode.nodeType===Node.ELEMENT_NODE?selection.anchorNode:selection.anchorNode.parentElement;
    // Enter inside a table belongs to the cell; splitting the surrounding block
    // would detach rows and silently turn the remainder into unrelated content.
    if(parent.closest('td,th')?.closest('[data-rich]')===rich)return;
    const li=parent.closest('li');
    if(event.key==='Tab'&&li&&rich.contains(li)) {
      event.preventDefault();if(!event.shiftKey&&!li.previousElementSibling)return;checkpoint();document.execCommand(event.shiftKey?'outdent':'indent',false);syncRich(rich,true);return;
    }
    if(event.key===' '&&selection.isCollapsed&&!li) {
      if(selection.anchorNode.nodeType===Node.TEXT_NODE){const match=rubySugarAtCaret(selection.anchorNode.textContent.slice(0,selection.anchorOffset));if(match){event.preventDefault();checkpoint();replaceRubySugar(rich,selection.anchorNode,match,{trailingSpace:true});syncRich(rich,true);return;}}
      const line=parent.closest('p,div');
      const prefix=range.cloneRange();prefix.selectNodeContents(line&&rich.contains(line)?line:rich);prefix.setEnd(range.startContainer,range.startOffset);
      const trigger=markdownTrigger(prefix.toString());
      if(trigger){event.preventDefault();checkpoint();prefix.deleteContents();selection.removeAllRanges();selection.addRange(prefix);document.execCommand(trigger.command,false,trigger.value);syncRich(rich,true);return;}
    }
    if(event.key==='Enter'&&!event.shiftKey&&!event.ctrlKey&&!event.metaKey&&!li&&rich.closest('[data-block]')?.dataset.type!=='details') {
      // Split at the caret, preserving inline markup and both sides of a selection.
      event.preventDefault();checkpoint();range.deleteContents();
      const tail=range.cloneRange();tail.setEnd(rich,rich.childNodes.length);
      const rest=document.createElement('div');rest.append(tail.extractContents());
      const block=draft.blocks.find(b=>b.id===rich.closest('[data-block]').dataset.block);
      block.text=richMarkdown(rich);if(block.type==='list')block.type='paragraph';
      const next={...newBlock('paragraph'),text:richMarkdown(rest)};
      draft.blocks.splice(draft.blocks.indexOf(block)+1,0,next);renderBlocks(next.id);changed(true);return;
    }
    if(event.key==='Backspace'&&selection.isCollapsed&&!li){
      const prefix=range.cloneRange();prefix.selectNodeContents(rich);prefix.setEnd(range.startContainer,range.startOffset);
      const index=draft.blocks.findIndex(b=>b.id===rich.closest('[data-block]').dataset.block),previous=draft.blocks[index-1];
      if(!prefix.toString()&&index>0&&previous?.type==='paragraph'&&!prefix.cloneContents().querySelector('img,[data-ve-source]')){
        event.preventDefault();checkpoint();const previousRich=blockElement(previous.id)?.querySelector('[data-rich]');
        if(previousRich){const marker=document.createElement('span');marker.dataset.caretMarker='';previousRich.append(marker);while(rich.firstChild)previousRich.append(rich.firstChild);const caret=document.createRange();caret.setStartBefore(marker);caret.collapse(true);marker.remove();previous.text=richMarkdown(previousRich);draft.blocks.splice(index,1);rich.closest('[data-block]').remove();selection.removeAllRanges();selection.addRange(caret);previousRich.focus();activeBlockId=previous.id;changed(true);return;}
      }
    }
    if(event.key==='Backspace'&&selection.isCollapsed&&!rich.textContent.trim()&&!rich.querySelector('img,[data-ve-source]')&&!li) {
      const index=draft.blocks.findIndex(b=>b.id===rich.closest('[data-block]').dataset.block);
      if(index>0){event.preventDefault();checkpoint();draft.blocks.splice(index,1);const previous=draft.blocks[index-1];renderBlocks(previous.id);const editable=blockElement(previous.id)?.querySelector('[data-rich]');if(editable){const end=document.createRange();end.selectNodeContents(editable);end.collapse(false);selection.removeAllRanges();selection.addRange(end);}changed(true);}
    }
  });
  let inlineContext=null;
  function inlineFields(args=[]) {const kind=$('[data-inline-kind]').value;$('[data-inline-args]').innerHTML=inlineLabels(kind).map((label,i)=>control(label,`data-dialog-arg="${i}"`,args[i]||'')).join('');inlinePreview();}
  function openInline(rich,chip=null,preset=null,selectedRange=null) {
    const selection=window.getSelection(); let range=selectedRange?.cloneRange()||(selection?.rangeCount?selection.getRangeAt(0).cloneRange():null);
    if(!range||!rich.contains(range.commonAncestorContainer)){range=document.createRange();range.selectNodeContents(rich);range.collapse(false);}
    const parts=chip?inlineTokenParts(chip):null;
    inlineContext={rich,chip,range};$('[data-inline-kind]').value=preset||parts?.kind||'ruby';inlineFields(parts&&(!preset||preset===parts.kind)?parts.args:[selectedRange?.toString()||(chip?parts?.args[0]:'')||selection?.toString()||'']);$('#ve-inline-title').textContent=copy.inline[$('[data-inline-kind]').value];$('[data-inline-error]').textContent='';$('[data-inline-remove]').hidden=!chip;openEditorPopover(root,$('[data-inline-dialog]'),chip||range);$('[data-dialog-arg]')?.focus();
  }
  root.addEventListener('click',event=>{
    const special=event.target.closest('[data-special],[data-inline-preset]');if(special){const rich=blockElement(activeBlockId)?.querySelector('[data-rich]');if(rich){restoreSelection(rich);const preset=special.dataset.inlinePreset;if(['mark','spoiler','kbd','small','sub','sup'].includes(preset)&&window.getSelection()?.toString()){applyInlineSelection(rich,preset);}else openInline(rich,selectedInlineToken(rich),preset);special.closest('details')?.removeAttribute('open');}else{$('[data-action-status]').textContent=copy.paragraphHint;}}
    const chip=event.target.closest('[data-ve-source],.wiki-spoiler');if(chip?.closest('[data-rich]'))selectInlineToken(chip.closest('[data-ve-source]')||chip);
  });
  root.addEventListener('pointerover',event=>{const spoiler=event.target.closest('.wiki-spoiler');if(spoiler?.closest('[data-rich]'))spoiler.title=copy.spoilerEditHint;});
  root.addEventListener('dblclick',event=>{const chip=event.target.closest('[data-ve-source],.wiki-spoiler,mark,kbd,small,sub,sup');if(chip?.closest('[data-rich]'))openInline(chip.closest('[data-rich]'),chip.closest('[data-ve-source]')||chip);});
  root.addEventListener('keydown',event=>{
    const chip=event.target.closest('[data-ve-source]');if(!chip?.closest('[data-rich]')||!['Enter',' '].includes(event.key))return;
    event.preventDefault();selectInlineToken(chip);
  });
  $('[data-inline-remove]').addEventListener('click',()=>{
    if(!inlineContext?.chip?.isConnected)return;
    const {rich,chip}=inlineContext;checkpoint();unwrapInlineToken(chip);syncRich(rich);$('[data-inline-dialog]').close();rich.focus();
  });
  $('[data-inline-kind]').addEventListener('change',()=>inlineFields([...root.querySelectorAll('[data-dialog-arg]')].map(input=>input.value)));
  $('[data-inline-apply]').addEventListener('click',()=>{
    const kind=$('[data-inline-kind]').value,args=[...root.querySelectorAll('[data-dialog-arg]')].map(input=>input.value.trim()).filter((arg,i)=>kind!=='ruby'||i<2||arg);
    if(args.some(arg=>!arg||/[{}\n]/.test(arg))){$('[data-inline-error]').textContent=copy.missing+copy.argument;return;}
    const {rich,chip,range}=inlineContext;const template=document.createElement('template');template.innerHTML=shortcodeChip(inlineSource(kind,args));const node=template.content.firstChild;
    checkpoint();
    if(chip)chip.replaceWith(node);else {range.deleteContents();range.insertNode(node);}
    const block=draft.blocks.find(b=>b.id===rich.closest('[data-block]').dataset.block);block.text=richMarkdown(rich);changed();$('[data-inline-dialog]').close();selectInlineToken(node);
  });
  $('[data-kind]').addEventListener('change', async event => {
    if (!await confirmReplace()) { event.target.value = draft.kind; return; }
    checkpoint(); clearPendingSource(); draft = newDraft(event.target.value, draft.meta.locale); renderFields(); renderBlocks(); changed(true);
  });
  $('[data-locale-select]').addEventListener('change', event => { checkpoint(); draft.meta.locale = event.target.value;catalogRecords=[];renderFields(); changed(true);void loadReferenceOptions();invalidateReference(); });
   $('[data-add]').addEventListener('click',()=>insertBlock($('[data-block-type]').value));
  $('[data-undo]').addEventListener('click', () => { if (!canTraverseEditorHistory(sourcePending,applySource)) return; checkpoint(); if (!cursor) return; clearPendingSource(); draft = JSON.parse(history[--cursor]); savedRange=null; renderFields(); renderBlocks(activeBlockId); save(); output(); });
  $('[data-redo]').addEventListener('click', () => { if (!canTraverseEditorHistory(sourcePending,applySource)) return; if (cursor >= history.length - 1) return; clearPendingSource(); draft = JSON.parse(history[++cursor]); savedRange=null; renderFields(); renderBlocks(activeBlockId); save(); output(); });
  const referenceTab=document.createElement('button');referenceTab.type='button';referenceTab.id='ve-reference-tab';referenceTab.dataset.view='reference';referenceTab.setAttribute('role','tab');referenceTab.setAttribute('aria-selected','false');referenceTab.setAttribute('aria-controls','ve-reference');referenceTab.tabIndex=-1;referenceTab.textContent=referenceCopy.tab;
  $('.ve-tabs').insertBefore(referenceTab,$('.ve-tabs [data-layout]'));
  const referencePanel=document.createElement('div');referencePanel.id='ve-reference';referencePanel.className='ve-reference';referencePanel.setAttribute('role','tabpanel');referencePanel.setAttribute('aria-labelledby','ve-reference-tab');referencePanel.hidden=true;
  referencePanel.innerHTML=`<div class="ve-reference-head"><label>${escapeHtml(referenceCopy.tab)}<select data-reference-locale></select></label><button type="button" data-reference-retry>${escapeHtml(referenceCopy.retry)}</button></div><p class="ve-hint">${escapeHtml(referenceCopy.alignment)}</p><p data-reference-status role="status"></p><div data-reference-blocks></div>`;
  $('.ve-output').append(referencePanel);
  let referenceResult=null,referenceFor='',referenceAbort=null,referenceTimer=null;
  function invalidateReference(){referenceAbort?.abort();referenceAbort=null;referenceResult=null;referenceFor='';clearTimeout(referenceTimer);if(!referencePanel.hidden)referenceTimer=setTimeout(()=>void openReference(true),250);}
  function highlightReference(){
    if(referenceResult?.status!=='ready')return;
    const current=draft.blocks.findIndex(block=>block.id===activeBlockId),mapping=alignTranslationBlocks(draft.blocks,referenceResult.blocks)[current];
    referencePanel.querySelectorAll('[data-reference-index]').forEach(node=>node.classList.toggle('is-active',Number(node.dataset.referenceIndex)===mapping?.referenceIndex));
    if(!referencePanel.hidden&&mapping?.referenceIndex!==null)referencePanel.querySelector(`[data-reference-index="${mapping.referenceIndex}"]`)?.scrollIntoView({block:'nearest'});
  }
  function renderReference(result){
    const status=referencePanel.querySelector('[data-reference-status]'),list=referencePanel.querySelector('[data-reference-blocks]');list.replaceChildren();
    if(result.status!=='ready'){status.textContent=result.status==='missing'?referenceCopy.missing:result.status==='error'?referenceCopy.error:referenceCopy.empty;return;}
    status.textContent=result.title;
    for(const block of result.blocks){const row=document.createElement('button');row.type='button';row.className='ve-reference-block';row.dataset.referenceIndex=String(block.index);const number=document.createElement('small');number.textContent=String(block.index+1).padStart(2,'0')+' · '+block.type;const content=document.createElement('span');content.textContent=block.text||block.source;row.append(number,content);list.append(row);}
    highlightReference();
  }
  async function openReference(force=false){
    const targets=translationReferenceTargets(draft.path),select=referencePanel.querySelector('[data-reference-locale]');
    if(!targets.length){referenceAbort?.abort();referenceAbort=null;referenceResult=null;referenceFor='';renderReference({status:'unavailable'});select.replaceChildren();return;}
    const previous=select.value;select.innerHTML=targets.map(target=>`<option value="${target.locale}">${target.locale==='zh'?'简体中文':target.locale==='ja'?'日本語':'English'}</option>`).join('');
    select.value=targets.some(target=>target.locale===previous)?previous:targets.some(target=>target.locale==='ja')?'ja':targets[0].locale;
    const cacheKey=draft.path+'|'+select.value;if(!force&&referenceFor===cacheKey&&referenceResult){renderReference(referenceResult);return;}
    referenceAbort?.abort();referenceAbort=new AbortController();const signal=referenceAbort.signal;referenceFor=cacheKey;referenceResult=null;
    setLoadingStatus(referencePanel.querySelector('[data-reference-status]'),referenceCopy.loading);referencePanel.querySelector('[data-reference-blocks]').replaceChildren();
    const result=await loadTranslationReference(draft.path,select.value,{signal,expectedEntityId:draft.meta.id});
    if(signal.aborted)return;referenceResult=result;renderReference(result);
  }
  referencePanel.querySelector('[data-reference-locale]').addEventListener('change',()=>openReference(true));
  referencePanel.querySelector('[data-reference-retry]').addEventListener('click',()=>openReference(true));
  referencePanel.querySelector('[data-reference-blocks]').addEventListener('click',event=>{const row=event.target.closest('[data-reference-index]');if(!row||referenceResult?.status!=='ready')return;const mapping=alignTranslationBlocks(draft.blocks,referenceResult.blocks).find(item=>item.referenceIndex===Number(row.dataset.referenceIndex));const block=mapping&&draft.blocks[mapping.currentIndex];if(block){setLayout('split');changeMode('visual');selectBlock(block.id,{scroll:true});changeView('reference');}});
  function changeView(view) {
    const previous=root.querySelector('[data-view][aria-selected="true"]')?.dataset.view;
    root.querySelectorAll('[data-view]').forEach(button=>{const active=button.dataset.view===view;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;});
    $('#ve-preview').hidden=view!=='preview'; $('#ve-properties').hidden=view!=='properties';referencePanel.hidden=view!=='reference';
    if(view==='reference')void openReference();
    if(previous!==view)revealPanel(view==='preview'?$('#ve-preview'):view==='reference'?referencePanel:$('#ve-properties'));
  }
  root.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>changeView(button.dataset.view)));
  $('[data-copy]').addEventListener('click', async () => { try { await navigator.clipboard.writeText(serializeDraft()); $('[data-action-status]').textContent = copy.copied; } catch { changeMode('source'); sourceEditor?.selectRange(0,sourceEditor.getText().length); $('[data-action-status]').textContent = copy.copyFailed; } });
  $('[data-download]').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([sourcePending ?? serializeDraft()], {type:'text/markdown;charset=utf-8'}));
    const link = document.createElement('a'); link.href = url; link.download = `${draft.meta.locale}.md`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  $('[data-import-open]').addEventListener('click', () => { $('[data-import-error]').textContent = ''; openEditorPopover(root,$('[data-import-dialog]')); });
  $('[data-import-file]').addEventListener('change', async event => { const file = event.target.files?.[0]; if (!file) return; if (file.size > 1_000_000) { $('[data-import-error]').textContent = copy.invalid; return; } $('[data-import-text]').value = await file.text(); });
  $('[data-import-apply]').addEventListener('click', async () => {
    try {
      const imported = importMarkdown($('[data-import-text]').value, draft.kind, draft.path);
      if (!await confirmReplace()) return;
      checkpoint(); clearPendingSource(); draft = imported; renderFields(); renderBlocks(); changed(true); $('[data-import-dialog]').close();
    } catch { $('[data-import-error]').textContent = copy.invalid; }
  });
  const hasWork = () => hasEditorLocalWork(draft,sourcePending);
  let loadRequest = 0;
  const originalCache = new Map();
  async function loadOriginal(path) {
    const request = sourceRequest(path);
    if (!request) return;
    if (hasWork() && !await confirmReplace()) return;
    const token = ++loadRequest;
    setLoadingStatus($('[data-load-status]'),copy.loading);
    root.setAttribute('aria-busy','true');
    $('.ve-workspace').inert = true;
    for (const selector of ['[data-copy]','[data-download]','[data-import-open]','[data-new-entry]']) $(selector).disabled = true;
    try {
      let backendSource=null;
      if(prDemo){const response=await fetch(editorApiBase+'/api/editor/source?path='+encodeURIComponent(path),{credentials:'include'});if(response.ok)backendSource=await response.json();else if(response.status!==401)throw new Error('source');}
      let files = backendSource?{[path]:backendSource.content}:originalCache.get(request);
      if (!files) {
        const response = await fetch(request);
        if (!response.ok) throw new Error('source');
        files = (await response.json()).files;
        if (!files || typeof files !== 'object') throw new Error('source');
        originalCache.set(request, files);
      }
      const actualPath = Object.keys(files).find(key => key.normalize('NFC') === path.normalize('NFC'));
      if (!actualPath || typeof files[actualPath] !== 'string') throw new Error('source');
      const imported = importMarkdown(files[actualPath], path.split('/')[2], actualPath);
      if(backendSource){imported.baseSha=backendSource.sha;imported.baseContent=backendSource.content;}
      if (token !== loadRequest) return;
      checkpoint(); clearPendingSource(); draft = imported;
      renderFields(); renderBlocks(); changed(true);
      root.dispatchEvent(new CustomEvent('editor-source-loaded'));
      $('[data-existing-picker]').hidden = false; changeSide('outline');
      $('[data-load-status]').textContent = copy.loaded + ' ' + actualPath;
      const url = new URL(location.href); url.searchParams.set('target',actualPath); window.history.replaceState(null,'',url);
    } catch {
      if (token === loadRequest) {
        $('[data-load-status]').textContent = copy.loadFailed;
        const retry = document.createElement('button'); retry.type = 'button'; retry.className = 'context-action'; retry.textContent = copy.load; retry.addEventListener('click',()=>loadOriginal(path)); $('[data-load-status]').append(' ',retry);
      }
    } finally {
      if (token === loadRequest) {
        root.removeAttribute('aria-busy'); $('.ve-workspace').inert = false;
        $('[data-import-open]').disabled = false; $('[data-new-entry]').disabled = false;
        output();
      }
    }
  }
  let entries = [], catalogLocale = '';
  function renderMatches() {
    const query = $('[data-entry-search]').value.trim().toLocaleLowerCase();
    const kind=$('[data-entry-kind]').value;
    const filtered=entries.filter(entry => (!kind||entry.kind===kind) && query.split(/\s+/).every(term=>`${entry.title} ${entry.path}`.toLocaleLowerCase().includes(term)));
    const matches=filtered.slice(0,50);
    $('[data-entry-count]').textContent=`${filtered.length} ${copy.results}${filtered.length>50?' · '+copy.moreResults:''}`;
    $('[data-entry-results]').innerHTML = matches.length ? matches.map(entry => `<button class="ve-entry-result" title="${escapeHtml(entry.title)}" data-load-path="${escapeHtml(entry.path)}"><strong>${escapeHtml(entry.title)}</strong><span class="ve-entry-kind">${escapeHtml(copy.kinds[entry.kind])}</span><small>${escapeHtml(entry.path.replace('src/content/',''))}</small></button>`).join('') : `<p>${copy.notFound}</p>`;
  }
  $('[data-existing-open]').addEventListener('click', async () => {
    changeSide('files');
    $('[data-existing-picker]').hidden = false; $('[data-entry-search]').focus();
    const locale = draft.meta.locale;
    if (catalogLocale !== locale) {
      setLoadingStatus($('[data-entry-results]'),copy.loading); $('[data-entry-retry]').hidden=true;
      try {
        const response = await fetch(`/${locale}/editor-catalog.json`);
        if (!response.ok) throw new Error('catalog');
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('catalog');
        entries = data; catalogLocale = locale;
      } catch { $('[data-entry-results]').textContent = copy.loadFailed; $('[data-entry-retry]').hidden=false; return; }
    }
    renderMatches();
  });
  $('[data-entry-search]').addEventListener('input', renderMatches);
  $('[data-entry-kind]').addEventListener('change',renderMatches);
  $('[data-entry-retry]').addEventListener('click',()=>$('[data-existing-open]').click());
  $('[data-existing-picker]').addEventListener('keydown',event=>{
    if(event.isComposing)return;
    const buttons=[...root.querySelectorAll('[data-load-path]')],index=buttons.indexOf(event.target);
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();buttons[Math.max(0,Math.min(buttons.length-1,index+(event.key==='ArrowDown'?1:-1)))]?.focus();}
    if(event.key==='Enter'&&event.target.matches('[data-entry-search]')){event.preventDefault();buttons[0]?.click();}
    if(event.key==='Escape')hideSidebar();
  });
  $('[data-entry-results]').addEventListener('click', event => {
    const path = event.target.closest('[data-load-path]')?.dataset.loadPath;
    if (path) loadOriginal(path);
  });
  $('[data-new-entry]').addEventListener('click', () => openNewEntry());

  let savedRange=null;
  function selectedInlineTokens(rich,range=savedRange) {
    if(!range||range.collapsed||!rich.contains(range.commonAncestorContainer))return [];
    return [...rich.querySelectorAll('[data-ve-source],.wiki-spoiler,mark,kbd,small,sub,sup')].filter(token=>!token.parentElement.closest('[data-ve-source]')&&range.intersectsNode(token));
  }
  function selectedInlineToken(rich) {const tokens=selectedInlineTokens(rich);return tokens.length===1&&savedRange.toString()===tokens[0].textContent?tokens[0]:null;}
  function selectInlineToken(token) {
    const rich=token.closest('[data-rich]');if(!rich)return;
    activeBlockId=rich.closest('[data-block]').dataset.block;rich.focus({preventScroll:true});
    const range=document.createRange();range.selectNode(token);setInlineSelection(range);updateSelectionToolbar();
  }
  function setInlineSelection(range) {const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);savedRange=range.cloneRange();}
  function applyInlineSelection(rich,kind) {
    const selection=window.getSelection();if(!selection?.rangeCount||selection.isCollapsed)return;
    const range=selection.getRangeAt(0),tokens=selectedInlineTokens(rich,range),matching=tokens.filter(token=>inlineTokenParts(token)?.kind===kind);
    checkpoint();
    if(matching.length){
      // Mark the range boundaries so removing atomic inline tokens keeps the selection.
      const end=document.createComment('end'),start=document.createComment('start'),tail=range.cloneRange();tail.collapse(false);tail.insertNode(end);range.collapse(true);range.insertNode(start);
      matching.forEach(unwrapInlineToken);range.setStartAfter(start);range.setEndBefore(end);start.remove();end.remove();setInlineSelection(range);
    }else{
      // Keep existing emphasis, links and annotations when adding another format.
      const token=document.createElement(kind==='spoiler'?'span':kind);
      if(kind==='spoiler')token.className='wiki-spoiler';
      token.append(range.extractContents());range.insertNode(token);range.selectNode(token);setInlineSelection(range);
    }
    syncRich(rich);updateSelectionToolbar();
  }
  function updateSelectionToolbar() {
    const selection=window.getSelection(),toolbar=$('[data-selection-toolbar]');
    if(root.querySelector('dialog[open]')){toolbar.hidden=true;return;}
    if(!selection?.rangeCount){toolbar.hidden=true;return;}
    const node=selection.anchorNode,rich=(node?.nodeType===1?node:node?.parentElement)?.closest('[data-rich]');
    if(!rich||!root.contains(rich)||!rich.contains(selection.focusNode)){if(!toolbar.contains(document.activeElement))toolbar.hidden=true;return;}
    activeBlockId=rich.closest('[data-block]').dataset.block;savedRange=selection.getRangeAt(0).cloneRange();
    for(const button of root.querySelectorAll('[data-format]'))if(['bold','italic','strikeThrough','insertOrderedList','insertUnorderedList'].includes(button.dataset.format))button.setAttribute('aria-pressed',String(document.queryCommandState(button.dataset.format)));
    if(selection.isCollapsed){toolbar.hidden=true;return;}
    const tokens=selectedInlineTokens(rich),kinds=tokens.map(token=>inlineTokenParts(token)?.kind);
    for(const button of root.querySelectorAll('[data-inline-preset]'))button.setAttribute('aria-pressed',String(kinds.includes(button.dataset.inlinePreset)));
    $('[data-edit-inline]').hidden=!selectedInlineToken(rich);
    toolbar.hidden=false;
    void positionEditorSurface(savedRange,toolbar,{placement:'top'});
  }
  document.addEventListener('selectionchange',updateSelectionToolbar);
  $('.ve-canvas').addEventListener('scroll',()=>{$('[data-selection-toolbar]').hidden=true;});
  root.addEventListener('pointerdown',event=>{if(!event.target.closest('[data-selection-toolbar],[data-rich],dialog,[data-format],[data-inline-preset],[data-special]'))$('[data-selection-toolbar]').hidden=true;});
  root.addEventListener('keydown',event=>{if(event.key==='Escape')$('[data-selection-toolbar]').hidden=true;});
  function restoreSelection(rich) {rich.focus({preventScroll:true});const selection=window.getSelection();if(savedRange&&rich.contains(savedRange.commonAncestorContainer)){selection.removeAllRanges();selection.addRange(savedRange);}else{const range=document.createRange();range.selectNodeContents(rich);range.collapse(false);selection.removeAllRanges();selection.addRange(range);}}
  $('[data-edit-inline]').addEventListener('click',()=>{const rich=blockElement(activeBlockId)?.querySelector('[data-rich]');if(rich){restoreSelection(rich);const token=selectedInlineToken(rich);if(token)openInline(rich,token);}});
  $('[data-clear-format]').addEventListener('click',()=>{
    const rich=blockElement(activeBlockId)?.querySelector('[data-rich]');if(!rich)return;restoreSelection(rich);
    const range=window.getSelection()?.getRangeAt(0);if(!range||range.collapsed)return;checkpoint();
    const tokens=selectedInlineTokens(rich,range),end=document.createComment('end'),start=document.createComment('start'),tail=range.cloneRange();tail.collapse(false);tail.insertNode(end);range.collapse(true);range.insertNode(start);
    tokens.forEach(unwrapInlineToken);range.setStartAfter(start);range.setEndBefore(end);start.remove();end.remove();setInlineSelection(range);
    document.execCommand('removeFormat',false);document.execCommand('unlink',false);syncRich(rich);updateSelectionToolbar();
  });
  let linkContext;
  function openLink(rich) {
    const selection=window.getSelection(),range=selection.getRangeAt(0).cloneRange();
    const node=range.startContainer.nodeType===1?range.startContainer:range.startContainer.parentElement;
    let link=node.closest('a');if(!link){const links=[...rich.querySelectorAll('a')].filter(a=>range.intersectsNode(a));if(links.length===1&&range.toString()===links[0].textContent)link=links[0];}
    if(link&&!link.contains(range.endContainer)&&range.toString()!==link.textContent)link=null;
    linkContext={rich,range,link};$('[data-link-text]').value=link?.textContent||selection.toString();$('[data-link-url]').value=link?.getAttribute('href')||'';$('[data-link-error]').textContent='';$('[data-link-remove]').hidden=!link;openEditorPopover(root,$('[data-link-dialog]'),link||range);$('[data-link-url]').focus();
  }
  $('[data-link-remove]').addEventListener('click',()=>{const {link,rich}=linkContext;if(!link?.isConnected)return;checkpoint();link.replaceWith(...link.childNodes);syncRich(rich);$('[data-link-dialog]').close();rich.focus();});
  $('[data-link-apply]').addEventListener('click',()=>{
    const url=$('[data-link-url]').value.trim(),text=$('[data-link-text]').value||url;
    if(!safeUrl(url)){$('[data-link-error]').textContent=copy.missing+copy.url;return;}
    checkpoint();const link=document.createElement('a');link.href=url;link.textContent=text;
    const {range,rich,link:existing}=linkContext;if(existing)existing.replaceWith(link);else{range.deleteContents();range.insertNode(link);}
    syncRich(rich);$('[data-link-dialog]').close();rich.focus();range.selectNode(link);setInlineSelection(range);updateSelectionToolbar();
  });
  function inlinePreview() {const kind=$('[data-inline-kind]').value,args=[...root.querySelectorAll('[data-dialog-arg]')].map(el=>el.value).filter((value,i)=>kind!=='ruby'||i<2||value);$('[data-inline-preview]').innerHTML=shortcodeChip(inlineSource(kind,args));}
  $('[data-inline-args]').addEventListener('input',inlinePreview);
  const sidebar=mountEditorSidebar(root,{revealPanel,onOpenFiles:()=>$('[data-existing-open]').click()});
  function changeSide(side) {sidebar.open(side);}
  function hideSidebar() {sidebar.close();}
  function setLayout(layout) {
    root.dataset.layout=layout;
    if(layout==='preview')changeView('preview');
    root.querySelectorAll('[data-mobile-pane]').forEach(button=>button.setAttribute('aria-selected',String(button.dataset.mobilePane===(layout==='preview'?'preview':'write'))));
  }
  function changeMode(mode) {
    const previous=root.dataset.mode;
    if(mode==='visual'&&sourcePending!==null&&!applySource())return false;
    root.dataset.mode=mode;$('#ve-canvas').hidden=mode!=='visual';$('#ve-source').hidden=mode!=='source';
    root.querySelectorAll('button[data-mode]').forEach(button=>{const active=button.dataset.mode===mode;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;});
    if(mode==='source'){$('[data-source]').value=sourcePending??serializeDraft();updateSourceLines();sourceEditor?.setText($('[data-source]').value);(sourceEditor||$('[data-source]')).focus();}
    if(previous!==mode)revealPanel(mode==='visual'?$('#ve-canvas'):$('#ve-source'));
    return true;
  }
  const motionCleanups=[...root.querySelectorAll('[role="tablist"]')].map(enhanceTabRail);
  document.addEventListener('astro:before-swap',()=>motionCleanups.forEach(cleanup=>cleanup?.()),{once:true});
  root.querySelector('.ve-tools-menu')?.addEventListener('click',event=>{if(event.target.closest('button,a'))event.currentTarget.open=false;});
  root.querySelectorAll('button[data-layout]').forEach(button=>button.addEventListener('click',()=>setLayout(root.dataset.layout===button.dataset.layout?'split':button.dataset.layout)));
  root.querySelectorAll('[data-mobile-pane]').forEach(button=>button.addEventListener('click',()=>setLayout(button.dataset.mobilePane==='preview'?'preview':'split')));
  requestAnimationFrame(()=>requestAnimationFrame(()=>{root.dataset.motionReady='';}));
  root.querySelectorAll('button[data-mode]').forEach(button=>button.addEventListener('click',()=>changeMode(button.dataset.mode)));
  root.querySelectorAll('[role="tablist"]').forEach(list=>list.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;const tabs=[...list.querySelectorAll('[role="tab"]')];const index=tabs.indexOf(event.target);if(index<0)return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].click();tabs[next].focus();}));
  root.addEventListener('focusin',event=>{const id=event.target.closest('[data-block]')?.dataset.block;if(id)selectBlock(id);});
  root.addEventListener('click',event=>{
    const outline=event.target.closest('[data-outline-block]');if(outline){if(root.dataset.layout==='preview')setLayout('write');if(!changeMode('visual'))return;selectBlock(outline.dataset.outlineBlock,{scroll:true});if(innerWidth<=900){hideSidebar();blockElement(outline.dataset.outlineBlock)?.querySelector('[contenteditable],input,textarea,[data-inspect-block]')?.focus();}}
    const visual=event.target.closest('[data-inspect-block]');if(visual&&!event.target.closest('a,button,summary'))selectBlock(visual.dataset.inspectBlock,{inspect:true});
    const preview=event.target.closest('[data-preview-block]');if(preview&&!event.target.closest('a,button,summary,.wiki-spoiler,abbr'))selectBlock(preview.dataset.previewBlock,{scroll:true});
    const error=event.target.closest('[data-error-field]');if(error){const field=$(`[data-field="${error.dataset.errorField}"]`);if(field){changeSide('properties');field.focus();}else{const block=draft.blocks.find(b=>b.type===error.dataset.errorField||error.dataset.errorField==='url'&&['image','media'].includes(b.type));if(block)selectBlock(block.id,{scroll:true,inspect:true});}}
  });
  root.addEventListener('keydown',event=>{const visual=event.target.closest('[data-inspect-block]');if(visual===event.target&&['Enter',' '].includes(event.key)){event.preventDefault();selectBlock(visual.dataset.inspectBlock,{inspect:true});}});
  function updateSourceLines() {if(sourceEditor)return;const area=$('[data-source]');$('[data-source-lines]').textContent=Array.from({length:area.value.split('\n').length},(_,i)=>i+1).join('\n');$('[data-source-lines]').scrollTop=area.scrollTop;}
  $('[data-source]').addEventListener('scroll',()=>{$('[data-source-lines]').scrollTop=$('[data-source]').scrollTop;});
  function clearPendingSource() {clearTimeout(sourceTimer);sourcePending=null;$('[data-source-error]').hidden=true;try{localStorage.removeItem(sourceKey);}catch{/* Optional persistence. */}}
  function queueSource() {
    sourcePending=$('[data-source]').value;updateSourceLines();
    try{localStorage.setItem(sourceKey,sourcePending);}catch{saving=false;}
    $('[data-save-status]').textContent=copy.sourcePending;clearTimeout(sourceTimer);sourceTimer=setTimeout(applySource,500);
  }
  const codeHost=document.createElement('div');codeHost.className='ve-code-host';$('#ve-source').append(codeHost);
  sourceEditor=mountSourceEditor(codeHost,{onChange:value=>{$('[data-source]').value=value;queueSource();}});
  $('#ve-source').dataset.codeReady='';
  document.addEventListener('astro:before-swap',()=>sourceEditor?.destroy(),{once:true});
  function applySource() {
    if(sourcePending===null)return true;
    if(articleMode){checkpoint();draft.blocks=parseVisualBlocks(sourcePending);draft.articleOriginalBody=sourcePending;draft.articleBodySnapshot=JSON.stringify(draft.blocks);clearPendingSource();renderBlocks();changed(true);return true;}
    try {const next=importMarkdown(sourcePending,draft.kind,draft.path);next.baseSha=draft.baseSha;next.baseContent=draft.baseContent;next.create=draft.create;next.assets=draft.assets;checkpoint();draft=next;clearPendingSource();renderFields();renderBlocks();changed(true);return true;}
    catch {$('[data-source-error]').textContent=copy.sourceError;$('[data-source-error]').hidden=false;$('[data-copy]').disabled=true;return false;}
  }
  $('[data-source]').addEventListener('keydown',event=>{if(event.key==='Tab'){event.preventDefault();const area=event.target;area.setRangeText('  ',area.selectionStart,area.selectionEnd,'end');queueSource();}});
  function insertBlock(type, ordered=false,{replaceEmpty=false}={}) {
    if(!blockTypes.includes(type))return;
    if(sourcePending!==null&&!applySource())return;
    checkpoint();const block=type==='list'?{...newBlock('paragraph'),text:ordered?'1. ':'- '}:newBlock(type),index=draft.blocks.findIndex(b=>b.id===activeBlockId);
    const replace=(insertOnly||replaceEmpty)&&draft.blocks[index]?.type==='paragraph'&&!draft.blocks[index].text.trim();
    draft.blocks.splice(index<0?draft.blocks.length:replace?index:index+1,replace?1:0,block);changeMode('visual');if(root.dataset.layout==='preview')setLayout('write');renderBlocks(block.id);changed(true);blockElement(block.id)?.scrollIntoView({block:'center'});
    if(type==='media-switcher')changeView('preview');
    else if(!['paragraph','heading','table','list','quote','divider','lyrics'].includes(type)){changeView('properties');if(innerWidth<=900)root.dataset.layout='preview';}
  }
  let commandItems=[],commandIndex=0,insertOnly=false;
  const commandActions=()=>[
    {label:copy.editExisting,shortcut:'⌘ P',run:()=>{$('[data-existing-open]').click();}},
    {label:copy.newEntry,run:()=>{$('[data-new-entry]').click();}},
    {label:copy.import,run:()=>{$('[data-import-open]').click();}},
    {label:copy.download,run:()=>{$('[data-download]').click();}},
    {label:copy.undo,shortcut:'⌘ Z',run:()=>{$('[data-undo]').click();}},
    {label:copy.redo,shortcut:'⌘ ⇧ Z',run:()=>{$('[data-redo]').click();}},
    {label:copy.visual,run:()=>changeMode('visual')},
    {label:copy.codeView,run:()=>changeMode('source')},
    {label:copy.searchText,shortcut:'⌘ F',run:()=>openFind()},
    {label:copy.writeOnly,run:()=>setLayout('write')},
    {label:copy.split,run:()=>setLayout('split')},
    {label:copy.metadata,run:()=>changeSide('properties')},
    {type:'numberList',label:copy.numberList,shortcut:copy.insert,keywords:'ordered numbered list 有序 编号',run:()=>insertBlock('list',true)},
    ...blockTypes.map(type=>({type,label:type==='list'?copy.bulletList:copy.blocks[type],shortcut:copy.insert,keywords:`${type} ${{lyrics:'lyric lrc',ruby:'furigana kana',media:'video audio',details:'box fold disclosure','media-switcher':'media sources tabs'}[type]||''}`,run:()=>insertBlock(type)})),
  ];
  function renderCommands() {const query=$('[data-command-search]').value.toLocaleLowerCase().replace(/^\//,'').trim();commandItems=commandActions().filter(item=>(!insertOnly||item.shortcut===copy.insert)&&`${item.label} ${item.keywords||''}`.toLocaleLowerCase().includes(query));commandIndex=0;$('[data-command-results]').innerHTML=commandItems.length?commandItems.map((item,i)=>`<button id="ve-command-${i}" data-command-index="${i}" role="option" aria-selected="${i===0}"><span>${escapeHtml(item.label)}</span><small>${escapeHtml(kbdLabel(item.shortcut||''))}</small></button>`).join(''):`<p class="ve-hint">${copy.noCommands}</p>`;updateCommandSelection();}
  function updateCommandSelection() {const buttons=[...root.querySelectorAll('[data-command-index]')];buttons.forEach((b,i)=>b.setAttribute('aria-selected',String(i===commandIndex)));const current=buttons[commandIndex];if(current){$('[data-command-search]').setAttribute('aria-activedescendant',current.id);current.scrollIntoView({block:'nearest'});}else $('[data-command-search]').removeAttribute('aria-activedescendant');}
  function openCommands(onlyInsert=false) {closeInsert();insertOnly=onlyInsert;$('[data-command-search]').value='';renderCommands();if(popovers.toggle($('[data-command-dialog]')))$('[data-command-search]').focus();}
  function runCommand(index) {const command=commandItems[index];if(!command)return;$('[data-command-dialog]').close();command.run();}
  root.querySelectorAll('[data-command-open]').forEach(button=>button.addEventListener('click',()=>openCommands()));
  const insertPopover=$('[data-insert-popover]'),insertSearch=$('[data-insert-search]'),insertResults=$('[data-insert-results]');
  let insertItems=[],insertIndex=0,insertOrigin=null;
  function closeInsert({restoreFocus=false}={}) {if(insertPopover.open)popovers.close(restoreFocus);}
  insertPopover.addEventListener('close',()=>{if(!insertPopover.open)insertSearch.setAttribute('aria-expanded','false');});
  function renderInsert() {
    const query=insertSearch.value.toLocaleLowerCase().trim();
    insertItems=sortInsertActions(commandActions().filter(item=>item.shortcut===copy.insert&&`${item.label} ${item.keywords||''}`.toLocaleLowerCase().includes(query)));
    insertIndex=0;
    let group='';
    insertResults.innerHTML=insertItems.length?insertItems.map((item,i)=>{
      const next=insertActionGroup(item.type);const heading=!query&&next!==group?`<p class="ve-insert-heading" role="presentation">${escapeHtml(next==='domain'?starterCopy.domainGroup:starterCopy.basicGroup)}</p>`:'';group=next;
      return `${heading}<button type="button" id="ve-insert-${i}" data-insert-index="${i}" role="option" aria-selected="${i===0}"><span>${escapeHtml(item.label)}</span></button>`;
    }).join(''):`<p class="ve-hint">${copy.noCommands}</p>`;
    updateInsertSelection();
  }
  function updateInsertSelection(){const buttons=[...insertResults.querySelectorAll('[data-insert-index]')];buttons.forEach((button,i)=>button.setAttribute('aria-selected',String(i===insertIndex)));const current=buttons[insertIndex];if(current){insertSearch.setAttribute('aria-activedescendant',current.id);current.scrollIntoView({block:'nearest'});}else insertSearch.removeAttribute('aria-activedescendant');}
  function openInsert(origin,rect) {
    if(insertPopover.open&&insertOrigin===origin){closeInsert({restoreFocus:true});return;}
    closeEntityMention();insertOnly=true;insertOrigin=origin;
    insertSearch.value='';insertSearch.setAttribute('aria-expanded','true');renderInsert();
    openEditorPopover(root,insertPopover,rect||origin,{trigger:origin});insertSearch.focus();
  }
  function runInsert(index){const command=insertItems[index];if(!command)return;closeInsert();command.run();}
  root.querySelectorAll('[data-insert-open]').forEach(button=>button.addEventListener('click',()=>openInsert(button)));
  root.addEventListener('click',event=>{const after=event.target.closest('[data-insert-after]');if(after){selectBlock(after.dataset.insertAfter);openInsert(after);}});
  insertSearch.addEventListener('input',renderInsert);
  insertSearch.addEventListener('keydown',event=>{if(event.isComposing)return;if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();insertIndex=(insertIndex+(event.key==='ArrowDown'?1:-1)+insertItems.length)%Math.max(1,insertItems.length);updateInsertSelection();}else if(event.key==='Enter'){event.preventDefault();runInsert(insertIndex);}});
  insertResults.addEventListener('click',event=>{const button=event.target.closest('[data-insert-index]');if(button)runInsert(Number(button.dataset.insertIndex));});
  window.addEventListener('resize',()=>{if(!$('[data-selection-toolbar]').hidden)updateSelectionToolbar();closeEntityMention();});
  root.querySelectorAll('.ve-canvas,.ve-output,.ve-sidebar').forEach(panel=>panel.addEventListener('scroll',()=>closeInsert(),{passive:true}));
  $('[data-command-search]').addEventListener('input',renderCommands);
  $('[data-command-results]').addEventListener('click',event=>{const button=event.target.closest('[data-command-index]');if(button)runCommand(Number(button.dataset.commandIndex));});
  $('[data-command-search]').addEventListener('keydown',event=>{if(event.isComposing)return;if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();commandIndex=(commandIndex+(event.key==='ArrowDown'?1:-1)+commandItems.length)%Math.max(1,commandItems.length);updateCommandSelection();}if(event.key==='Enter'){event.preventDefault();runCommand(commandIndex);}});
  function openFind() {if(popovers.toggle($('[data-find-dialog]')))$('[data-find-text]').focus();}
  $('[data-find-open]').addEventListener('click',openFind);
  for (const dialog of root.querySelectorAll('dialog')) dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();});
  document.addEventListener('click',event=>{for(const details of root.querySelectorAll('.ve-export-menu,.ve-theme-menu,.ve-format-more'))if(details.hasAttribute('open')&&!details.contains(event.target))details.removeAttribute('open');});
  let findOffset=0,lastFind='';
  function findNext() {
    const query=$('[data-find-text]').value.toLocaleLowerCase();if(!query)return;
    if(query!==lastFind){findOffset=0;lastFind=query;}
    if(root.dataset.mode==='source'){const haystack=(sourceEditor?.getText()??$('[data-source]').value).toLocaleLowerCase();let index=haystack.indexOf(query,findOffset);if(index<0)index=haystack.indexOf(query);if(index<0){$('[data-find-status]').textContent=copy.noMatches;return;}findOffset=index+query.length;$('[data-find-dialog]').close();sourceEditor?.selectRange(index,findOffset);return;}
    const matches=draft.blocks.filter(b=>JSON.stringify([b.title,b.text,b.rows,b.args]).toLocaleLowerCase().includes(query));
    if(!matches.length){$('[data-find-status]').textContent=copy.noMatches;return;}
    const block=matches[findOffset%matches.length];findOffset++;$('[data-find-dialog]').close();setLayout('split');selectBlock(block.id,{scroll:true});blockElement(block.id)?.querySelector('[data-rich],input,textarea')?.focus();
  }
  $('[data-find-next]').addEventListener('click',findNext);$('[data-find-text]').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();findNext();}});
  $('[data-problems-toggle]').addEventListener('click',()=>{$('[data-problems]').hidden=!$('[data-problems]').hidden;});
  $('[data-problems-close]').addEventListener('click',()=>{$('[data-problems]').hidden=true;});
  $('[data-ui-locale]').addEventListener('change',event=>{location.href=editorUiLocaleDestination(location.href,event.target.value,{articleMode}).href;});
  root.addEventListener('keydown',event=>{
    if(event.isComposing||event.target.closest('dialog'))return;
    if(event.ctrlKey&&!event.metaKey&&!event.altKey&&event.code==='Space'&&draft.blocks.find(b=>b.id===activeBlockId)?.type==='lyrics'){event.preventDefault();stampLyricRow(activeLyricRow);return;}
    const mod=event.metaKey||event.ctrlKey;
    if(mod&&((event.key.toLowerCase()==='k')||(event.shiftKey&&event.key.toLowerCase()==='p'))){event.preventDefault();openCommands();return;}
    if(mod&&event.key.toLowerCase()==='p'){event.preventDefault();$(articleMode?'[data-article-mine]':'[data-existing-open]').click();return;}
    if(mod&&event.key.toLowerCase()==='f'){event.preventDefault();openFind();return;}
    if(mod&&event.key.toLowerCase()==='s'){event.preventDefault();if(sourcePending!==null)applySource();if(articleMode)$('[data-article-save]').click();else save();return;}
    if(mod&&event.key.toLowerCase()==='b'&&!event.target.closest('[data-rich]')){event.preventDefault();root.hasAttribute('data-sidebar-hidden')?changeSide(root.dataset.side||'outline'):hideSidebar();return;}
    if(mod&&event.key.toLowerCase()==='z'&&!event.target.closest('[data-source],.cm-editor')){event.preventDefault();(event.shiftKey?$('[data-redo]'):$('[data-undo]')).click();return;}
    if(event.key==='/'&&event.target.closest('[data-rich]')&&!event.target.closest('[data-rich]').textContent.trim()){event.preventDefault();const rich=event.target.closest('[data-rich]'),rect=window.getSelection()?.rangeCount?window.getSelection().getRangeAt(0).getBoundingClientRect():null;openInsert(rich,rect?.width||rect?.height?rect:rich.getBoundingClientRect());}
    if(event.key==='Enter'&&event.target.matches('.ve-heading-input')){event.preventDefault();insertBlock('paragraph');}
  });
  let draggedBlock=null,draggedMedia=null,draggedTrack=null;
  root.addEventListener('dragstart',event=>{const track=event.target.closest('[data-track-row]');if(track){draggedTrack=Number(track.dataset.trackRow);event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',String(draggedTrack));return;}const tab=event.target.closest('.ve-canvas [data-media-drag]');if(tab){draggedMedia=tab.dataset.mediaDrag;event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',draggedMedia);return;}const handle=event.target.closest('[data-drag-block]');if(!handle)return;draggedBlock=handle.dataset.dragBlock;event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',draggedBlock);});
  root.addEventListener('dragover',event=>{const track=event.target.closest('[data-track-row]');if(draggedTrack!==null&&track){event.preventDefault();root.querySelectorAll('.is-dragover').forEach(el=>el.classList.remove('is-dragover'));track.classList.add('is-dragover');return;}const tab=event.target.closest('.ve-canvas [data-media-drag]');if(draggedMedia&&tab){event.preventDefault();root.querySelectorAll('.is-dragover').forEach(el=>el.classList.remove('is-dragover'));tab.classList.add('is-dragover');return;}const block=event.target.closest('.ve-canvas [data-block]');if(!draggedBlock||!block)return;event.preventDefault();root.querySelectorAll('.is-dragover').forEach(el=>el.classList.remove('is-dragover'));block.classList.add('is-dragover');});
  root.addEventListener('drop',event=>{const track=event.target.closest('[data-track-row]');if(draggedTrack!==null&&track){event.preventDefault();const to=Number(track.dataset.trackRow);if(draggedTrack!==to){checkpoint();draft.meta.tracks=renumberReleaseTracks(reorderReleaseTracks(draft.meta.tracks,draggedTrack,to));renderFields();changed(true);}draggedTrack=null;root.querySelectorAll('.is-dragover').forEach(el=>el.classList.remove('is-dragover'));return;}const tab=event.target.closest('.ve-canvas [data-media-drag]');if(draggedMedia&&tab){event.preventDefault();const [fromId,fromRaw]=draggedMedia.split(':'),[toId,toRaw]=tab.dataset.mediaDrag.split(':');const b=draft.blocks.find(block=>block.id===fromId),from=Number(fromRaw),to=Number(toRaw);if(b&&fromId===toId&&from!==to&&b.items[from]&&b.items[to]){checkpoint();const [item]=b.items.splice(from,1);b.items.splice(to,0,item);mediaTabByBlock.set(b.id,to);renderBlocks(b.id);changed(true);}draggedMedia=null;root.querySelectorAll('.is-dragover').forEach(el=>el.classList.remove('is-dragover'));return;}const target=event.target.closest('.ve-canvas [data-block]');if(!draggedBlock||!target)return;event.preventDefault();const from=draft.blocks.findIndex(b=>b.id===draggedBlock),to=draft.blocks.findIndex(b=>b.id===target.dataset.block);if(from>=0&&to>=0&&from!==to){checkpoint();const [block]=draft.blocks.splice(from,1);draft.blocks.splice(to,0,block);renderBlocks(block.id);changed(true);}draggedBlock=null;root.querySelectorAll('.is-dragover').forEach(el=>el.classList.remove('is-dragover'));});
  root.addEventListener('dragend',()=>{draggedBlock=null;draggedMedia=null;draggedTrack=null;root.querySelectorAll('.is-dragover').forEach(el=>el.classList.remove('is-dragover'));});
  window.addEventListener('beforeunload',event=>{if(!saving){event.preventDefault();event.returnValue='';}});

  const imageURLs = new Map();
  let selectedImageFiles = [], preparingImages = false, imagePreviewToken = 0, imagePreviewUrls = [], imageInsertion = null, openArticleImageDialog = null;
  function clearImagePreviewUrls(){imagePreviewUrls.forEach(url=>URL.revokeObjectURL(url));imagePreviewUrls=[];}
  async function renderSelectedImages(){
    const token=++imagePreviewToken,list=$('[data-image-previews]');clearImagePreviewUrls();list.replaceChildren();
    $('[data-image-selection]').textContent=selectedImageFiles.length?`${selectedImageFiles.length} ${tc('选择图片')}`:'';
    if(!selectedImageFiles.length)return;
    $('[data-image-selection]').textContent=tc('正在准备图片预览…');
    for(const [index,file] of selectedImageFiles.entries()){
      if(token!==imagePreviewToken)return;
      const row=document.createElement('div');row.className='ve-attachment-preview';row.setAttribute('role','listitem');
      const image=document.createElement('img');image.alt='';const name=document.createElement('strong');name.textContent=file.name;const detail=document.createElement('small');
      const remove=document.createElement('button');remove.type='button';remove.dataset.imageSelectionRemove=String(index);remove.textContent=tc('移除附件');
      row.append(image,name,detail,remove);list.append(row);
      try{const candidate=await imageCandidate(file,{optimize:$('[data-image-optimize]').checked});if(token!==imagePreviewToken)return;const url=URL.createObjectURL(candidate.file);imagePreviewUrls.push(url);image.src=url;detail.textContent=`${candidate.optimized?tc('WebP 投稿副本'):tc('原图')} · ${Math.ceil(file.size/1024)} KB → ${Math.ceil(candidate.file.size/1024)} KB`;}
      catch(error){row.dataset.error='';detail.textContent=tc(error.message||'');}
    }
    if(token===imagePreviewToken)$('[data-image-selection]').textContent=`${selectedImageFiles.length} ${tc('选择图片')}`;
  }
  async function localImageURL(asset) {
    if(imageURLs.has(asset.id))return imageURLs.get(asset.id);
    let blob=await attachmentFile(asset.id);
    if(!blob&&asset.serverUploaded===true){
      try{const response=await fetch(`${editorApiBase}/api/editor/assets/${encodeURIComponent(asset.id)}`,{credentials:'include',cache:'no-store'});if(response.ok)blob=await response.blob();}
      catch{/* Remote recovery can be retried when this panel opens again. */}
      if(!blob)return null;
    }
    if(!blob)return asset.previewUrl || asset.url;
    const url=URL.createObjectURL(blob);imageURLs.set(asset.id,url);return url;
  }
  document.addEventListener('astro:before-swap',()=>{for(const url of imageURLs.values())URL.revokeObjectURL(url);imageURLs.clear();},{once:true});
  async function refreshAttachmentPreviews() {
    if(articleMode&&(accountState.viewer?.userId||(accountState.auth==='guest'?'guest':'unverified'))===articleOwner)for(const ref of draft.meta.articleMediaRefs||[]){
      if((accountState.viewer?.userId||(accountState.auth==='guest'?'guest':'unverified'))!==articleOwner)break;
      if(ref.src||!ref.assetId)continue;const reference=`/_private/article-assets/${ref.assetId}`,cacheKey='article:'+ref.assetId;
      try{let preview=imageURLs.get(cacheKey);if(!preview){const response=await fetch(`${root.dataset.articleApi}/api/articles/assets/${ref.assetId}/image`,{credentials:'include',cache:'no-store',signal:AbortSignal.timeout(15000)});if(!response.ok||(accountState.viewer?.userId||(accountState.auth==='guest'?'guest':'unverified'))!==articleOwner)continue;const blob=await response.blob();if((accountState.viewer?.userId||(accountState.auth==='guest'?'guest':'unverified'))!==articleOwner)continue;preview=URL.createObjectURL(blob);imageURLs.set(cacheKey,preview);}root.querySelectorAll('.ve-canvas img,[data-preview] img').forEach(img=>{if(img.getAttribute('src')===reference||img.dataset.articleReference===reference)setEditorPrivateImagePreview(img,reference,preview);});}catch{/* The stable private reference survives a temporarily unavailable preview. */}
    }
    for(const asset of draft.assets || []) {
      try {const url=await localImageURL(asset);if(url)root.querySelectorAll('.ve-canvas img,[data-preview] img').forEach(img=>{if(img.getAttribute('src')===asset.url)img.src=url;});} catch { /* Missing local files remain recoverable through the attachment panel. */ }
    }
  }
  async function renderAttachments() {
    const list=$('[data-image-list]');list.replaceChildren();
    for(const asset of draft.assets || []) {
      const row=document.createElement('div');row.className='ve-attachment-row';
      row.innerHTML=`<img alt=""/><div><p>${escapeHtml(asset.name || asset.path.split('/').pop())} · ${Math.ceil(asset.size/1024)} KB · ${asset.optimized?tc('WebP 投稿副本'):tc('原图')}</p><p class="ve-hint">${escapeHtml(asset.source)}</p><div class="ve-row-tools"><button data-image-insert="${asset.id}">${tc('插入正文')}</button><button data-image-cover="${asset.id}">${tc('设为封面')}</button><button data-image-remove="${asset.id}">${tc('移除附件')}</button></div></div>`;
      list.append(row);try {const preview=await localImageURL(asset);if(preview)row.querySelector('img').src=preview;else {row.querySelector('img').hidden=true;row.querySelector('.ve-hint').textContent=copy.loadFailed;}}catch{row.querySelector('img').hidden=true;row.querySelector('.ve-hint').textContent=copy.loadFailed;}
    }
  }
  function captureImageInsertion(){
    const selection=window.getSelection(),currentRange=selection?.rangeCount?selection.getRangeAt(0):null;
    const insideRich=range=>range?.commonAncestorContainer?.parentElement?.closest?.('[data-rich]')||range?.commonAncestorContainer?.closest?.('[data-rich]');
    const range=insideRich(currentRange)?currentRange:savedRange;
    const rich=insideRich(range);
    return root.dataset.mode==='source'&&sourceEditor?{mode:'source',...sourceEditor.getSelection()}:rich&&root.contains(rich)?{mode:'visual',blockId:rich.closest('[data-block]')?.dataset.block,range:range.cloneRange()}:{mode:'block',blockId:activeBlockId};
  }
  function insertImageReference(url,alt,source){
    const imageBlock={...newBlock('image'),url,text:alt,caption:source};
    const syntax=blockMarkdown(imageBlock,draft.meta.locale);
    if(imageInsertion?.mode==='source'&&sourceEditor){checkpoint();sourceEditor.replaceRange(imageInsertion.from,imageInsertion.to,syntax);return true;}
    if(!applySource())return false;
    checkpoint();
    const target=draft.blocks.find(b=>b.id===imageInsertion?.blockId),rich=target&&blockElement(target.id)?.querySelector('[data-rich]');
    const range=imageInsertion?.mode==='visual'&&imageInsertion.range;
    if(rich&&range&&rich.contains(range.startContainer)&&rich.contains(range.endContainer)){
      const closestStructure=node=>(node.nodeType===Node.ELEMENT_NODE?node:node.parentElement)?.closest('ul,ol,table');
      const structure=closestStructure(range.startContainer)||closestStructure(range.endContainer);
      if(structure&&rich.contains(structure)){
        // Keep lists and tables intact when the saved caret is inside them;
        // extracting a partial structure detaches items, rows and cells.
        target.text=richMarkdown(rich);if(target.type==='list')target.type='paragraph';
        draft.blocks.splice(draft.blocks.indexOf(target)+1,0,imageBlock);
      }else{
        range.deleteContents();const tail=range.cloneRange();tail.setEnd(rich,rich.childNodes.length);const rest=document.createElement('div');rest.append(tail.extractContents());
        target.text=richMarkdown(rich);if(target.type==='list')target.type='paragraph';const after=richMarkdown(rest),index=draft.blocks.indexOf(target);
        draft.blocks.splice(index+1,0,imageBlock,...(after?[{...newBlock('paragraph'),text:after}]:[]));
      }
    }else{const index=draft.blocks.findIndex(b=>b.id===(imageInsertion?.blockId||activeBlockId));const replace=index>=0&&draft.blocks[index].type==='paragraph'&&!draft.blocks[index].text.trim();draft.blocks.splice(index<0?draft.blocks.length:replace?index:index+1,replace?1:0,imageBlock);}
    changeMode('visual');renderBlocks(imageBlock.id);changed(true);return true;
  }
  const articleAssetDialog=$('[data-article-asset-dialog]');
  const articleAssetUploader=articleMode?mountArticleAssets(root,{api:root.dataset.articleApi,owner:articleOwner,currentOwner:()=>accountState.viewer?.userId||(accountState.auth==='guest'?'guest':'unverified'),onLocalChange:()=>{draft.meta.pendingArticleImage=true;changed();},onInsert:(ref,url)=>{draft.meta.articleMediaRefs=[...(draft.meta.articleMediaRefs||[]).filter(item=>item.assetId!==ref.assetId),ref];if(insertImageReference(url,ref.alt,[ref.caption,ref.sourceTitle,ref.sourceUrl].filter(Boolean).join(' · ')))articleAssetDialog.close();},onPublicInsert:(item,ref)=>{draft.meta.articleMediaRefs=[...(draft.meta.articleMediaRefs||[]).filter(value=>value.galleryId!==item.id),{...ref,galleryId:item.id,src:item.src}];if(insertImageReference(item.src,ref.alt,[ref.caption,ref.sourceTitle,ref.sourceUrl].filter(Boolean).join(' · ')))articleAssetDialog.close();}}):null;
  root.querySelectorAll('[data-article-upload-open]').forEach(button=>button.addEventListener('click',()=>{imageInsertion=captureImageInsertion();sharedImageDialog.close();openEditorPopover(root,articleAssetDialog);void articleAssetUploader.open();}));
  document.addEventListener('astro:before-swap',()=>articleAssetUploader?.dispose(),{once:true});
  const sharedImageDialog=$('[data-shared-image-dialog]');
  const imageLibrary=mountImageLibrary(sharedImageDialog.querySelector('[data-image-library]'),{onChoose:item=>{
    if(articleMode){sharedImageDialog.close();openEditorPopover(root,articleAssetDialog);void articleAssetUploader.open(item);return;}
    if(insertImageReference(item.src,item.title||item.id,[item.sourceTitle,item.sourceUrl].filter(Boolean).join(' · ')))sharedImageDialog.close();
  },...(!articleMode?{onCover:item=>{if(!applySource())return;checkpoint();if(draft.meta.schemaVersion===2)(draft.meta.presentation ||= {}).image=item.src;else draft.meta.image=item.src;renderFields();changed(true);sharedImageDialog.close();changeSide('properties');}}:{})});
  function openImages(files=[]) {
    if(articleMode&&files.length){imageInsertion=captureImageInsertion();openEditorPopover(root,articleAssetDialog);void articleAssetUploader.open().then(()=>articleAssetUploader.selectFile(files[0]));return;}
    imageInsertion=captureImageInsertion();
    $('[data-library-legacy]').hidden=!(draft.assets||[]).length;
    openEditorPopover(root,sharedImageDialog);
    imageLibrary.open(files);
  }
  $('[data-library-legacy]').onclick=()=>{
    selectedImageFiles=[];$('[data-image-files]').value='';void renderSelectedImages();
    $('[data-image-feedback]').textContent='';renderAttachments();openEditorPopover(root,$('[data-attachments-dialog]'));
  };
  $('[data-attachments-open]').addEventListener('click',()=>openImages());
  if(articleMode){
    const dialog=$('[data-article-image-dialog]'),imageCopy=editorArticleImageCopy(root.dataset.locale),urlField=$('[data-article-image-url]'),altField=$('[data-article-image-alt]'),sourceField=$('[data-article-image-source]'),preview=$('[data-article-image-preview]'),status=$('[data-article-image-status]'),insert=$('[data-article-image-insert]');
    let checkToken=0,readyUrl=null;
    const refreshButton=()=>{insert.disabled=!readyUrl||!altField.value.trim()||!sourceField.value.trim();if(readyUrl)status.textContent=!altField.value.trim()?imageCopy.needAlt:!sourceField.value.trim()?imageCopy.needSource:imageCopy.ready;};
    const checkImage=()=>{
      const token=++checkToken,url=normalizeArticleImageUrl(urlField.value,location.href);readyUrl=null;preview.hidden=true;preview.removeAttribute('src');refreshButton();
      if(!url){status.textContent=imageCopy.invalid;return;}
      setLoadingStatus(status,imageCopy.checking);
      const probe=new Image();probe.onload=()=>{if(token!==checkToken)return;readyUrl=url;preview.src=url;preview.hidden=false;status.textContent=imageCopy.ready;refreshButton();};
      probe.onerror=()=>{if(token!==checkToken)return;status.textContent=imageCopy.unavailable;};
      probe.src=url;
    };
    openArticleImageDialog=()=>{
      imageInsertion=captureImageInsertion();urlField.value='';altField.value='';sourceField.value='';readyUrl=null;preview.hidden=true;preview.removeAttribute('src');status.textContent=imageCopy.invalid;refreshButton();openEditorPopover(root,dialog);urlField.focus();
    };
    root.querySelectorAll('[data-article-image-open]').forEach(button=>button.addEventListener('click',()=>openImages()));
    urlField.addEventListener('input',checkImage);
    altField.addEventListener('input',refreshButton);sourceField.addEventListener('input',refreshButton);
    $('[data-article-image-cancel]').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('close',()=>{++checkToken;});
    insert.addEventListener('click',()=>{
      const url=normalizeArticleImageUrl(urlField.value,location.href);
      if(!url||url!==readyUrl){status.textContent=imageCopy.invalid;refreshButton();return;}
      const alt=altField.value.trim(),source=sourceField.value.trim();
      if(!alt){status.textContent=imageCopy.needAlt;return;}if(!source){status.textContent=imageCopy.needSource;return;}
      if(!insertImageReference(url,alt,source)){status.textContent=copy.sourceError;return;}
      dialog.close();
    });
  }
  $('[data-legacy-library-open]').addEventListener('click',()=>{$('[data-attachments-dialog]').close();openImages();});
  $('[data-image-files]').addEventListener('change',event=>{selectedImageFiles=[...event.target.files];void renderSelectedImages();});
  $('[data-image-optimize]').addEventListener('change',()=>{void renderSelectedImages();});
  $('[data-image-previews]').addEventListener('click',event=>{const button=event.target.closest('[data-image-selection-remove]');if(!button)return;selectedImageFiles.splice(Number(button.dataset.imageSelectionRemove),1);void renderSelectedImages();});
  $('[data-attachments-dialog]').addEventListener('close',()=>{++imagePreviewToken;clearImagePreviewUrls();});
  $('[data-image-add]').addEventListener('click',async()=>{
    if(preparingImages)return;
    const targetDraft=draft,button=$('[data-image-add]'),feedback=$('[data-image-feedback]');
    try {
      if(!selectedImageFiles.length)throw Error(tc('请先选择、拖入或粘贴图片。'));
      if((draft.assets?.length || 0)+selectedImageFiles.length>8)throw Error(tc('最多添加 8 张图片。'));
      preparingImages=true;button.disabled=true;feedback.textContent=tc('正在保存图片…');
      const next=[];
      for(const file of selectedImageFiles)next.push(await prepareImage(file,$('[data-image-source]').value,$('[data-image-alt]').value,{optimize:$('[data-image-optimize]').checked}));
      if(draft!==targetDraft)throw Error('词条已变化，请重新选择图片。');
      const assets=[...new Map([...(draft.assets || []),...next].map(a=>[a.id,a])).values()];
      if(assets.reduce((n,a)=>n+a.size,0)>attachmentTotalLimit)throw Error(tc('附件合计不能超过 20 MiB。'));
      checkpoint();draft.assets=assets;changed(true);await renderAttachments();selectedImageFiles=[];$('[data-image-files]').value='';void renderSelectedImages();feedback.textContent=tc('已保存在本机，提交审核时上传。');
    }catch(error){feedback.textContent=tc(error.message);}finally{preparingImages=false;button.disabled=false;}
  });
  $('[data-image-list]').addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    const id=button.dataset.imageInsert || button.dataset.imageCover || button.dataset.imageRemove;
    if(!(button.hasAttribute('data-image-insert')&&imageInsertion?.mode==='source')&&!applySource()){$('[data-image-feedback]').textContent=tc('请先修正源码，再操作附件。');return;}
    const asset=draft.assets?.find(a=>a.id===id);if(!asset)return;
    if(button.hasAttribute('data-image-remove') && serializeDraft().includes(asset.url)){$('[data-image-feedback]').textContent=tc('请先移除正文或封面中的图片引用，再移除附件。');return;}
    if(button.hasAttribute('data-image-insert')) {
      if(!insertImageReference(asset.url,asset.alt||asset.name||'',asset.source)){$('[data-image-feedback]').textContent=tc('请先修正源码，再操作附件。');return;}
      $('[data-attachments-dialog]').close();return;
    }
    checkpoint();
    if(button.hasAttribute('data-image-cover')) {if(draft.meta.schemaVersion===2)(draft.meta.presentation ||= {}).image=asset.url;else draft.meta.image=asset.url;renderFields();$('[data-attachments-dialog]').close();changeSide('properties');}
    if(button.hasAttribute('data-image-remove')){draft.assets=draft.assets.filter(a=>a.id!==id);renderAttachments();}
    changed(true);
  });
  root.addEventListener('paste',event=>{const files=[...(event.clipboardData?.files || [])];if(files.length){event.preventDefault();openImages(files);}},true);
  root.addEventListener('dragover',event=>{if(event.dataTransfer?.types.includes('Files'))event.preventDefault();});
  root.addEventListener('drop',event=>{const files=[...(event.dataTransfer?.files || [])];if(files.length){event.preventDefault();openImages(files);}},true);
  root.querySelectorAll('[data-dialog-close]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
  function openNewEntry(kind=draft.kind) {$('[data-new-feedback]').textContent='';$('[data-new-form]').elements.kind.value=typeof kind==='string'?kind:draft.kind;$('[data-new-form]').elements.locale.value=draft.meta.locale;openEditorPopover(root,$('[data-new-dialog]'));}
  root.querySelectorAll('[data-start-entry-kind]').forEach(button=>button.addEventListener('click',()=>openNewEntry(button.dataset.startEntryKind)));
  $('[data-start-existing]')?.addEventListener('click',()=> $('[data-existing-open]').click());
  root.querySelectorAll('[data-start-attachments]').forEach(button=>button.addEventListener('click',()=> $('[data-attachments-open]').click()));
  root.querySelectorAll('[data-start-block]').forEach(button=>button.addEventListener('click',()=>insertBlock(button.dataset.startBlock,false,{replaceEmpty:true})));
  $('[data-new-open]').addEventListener('click',openNewEntry);
  $('[data-previous-draft]').addEventListener('click',()=>{
    try {
      const previous=JSON.parse(localStorage.getItem(key+':previous') || 'null');
      if(!previous)throw Error(tc('没有上一份本地草稿。'));
      if(sourcePending!==null&&!applySource())throw Error(tc('请先修正源码，再创建新条目。'));
      localStorage.setItem(key+':previous',JSON.stringify(draft));
      checkpoint();clearPendingSource();draft=previous;renderFields();renderBlocks();changed(true);$('[data-new-dialog]').close();
    }catch(error){$('[data-new-feedback]').textContent=tc(error.message);}
  });
  $('[data-new-form]').addEventListener('submit',event=>{
    event.preventDefault();const form=event.target;
    try {
      const kind=form.elements.kind.value,locale=form.elements.locale.value,folder=form.elements.folder.value.trim();
      const path=newEntryPath(kind,locale,folder);
      if(sourcePending!==null&&!applySource())throw Error(tc('请先修正源码，再创建新条目。'));
      localStorage.setItem(key+':previous',JSON.stringify(draft));
      checkpoint();clearPendingSource();draft=newDraft(kind,locale);draft.create=true;draft.path=path;draft.baseSha=null;draft.baseContent='';draft.assets=[];
      draft.meta['name' in draft.meta?'name':'title']=form.elements.title.value.trim();if(draft.meta.schemaVersion===2)draft.meta.id=folder;else draft.meta.translationKey=folder.replaceAll('/','-');
      renderFields();renderBlocks();changed(true);changeSide('properties');$('[data-new-dialog]').close();
      const url=new URL(location.href);url.searchParams.delete('target');url.searchParams.delete('new');window.history.replaceState(null,'',url);
    }catch(error){$('[data-new-feedback]').textContent=tc(error.message);}
  });
  renderFields(); renderBlocks(); output(); loadReferenceOptions();
  $('[data-save-status]').textContent = saving ? copy.saved : copy.unsaved;
  try { const recovered=localStorage.getItem(sourceKey);if(recovered!==null){sourcePending=recovered;changeMode('source');$('[data-source-error]').hidden=false;$('[data-source-error]').textContent=copy.sourceRecovered;} } catch { /* Optional draft recovery. */ }
  const entryEditor = {
    snapshot() {
      if (root.hasAttribute('aria-busy')) throw new Error('词条还在加载，请稍后再试。');
      if (!applySource()) throw new Error('源码存在格式错误，请先修正后再提交。');
      if (!draft.path || !sourceRequest(draft.path) || (draft.needsOriginal && !draft.create)) throw new Error('请先通过“编辑已有词条”载入一个词条。');
      const errors = [...validateDraft(draft), ...advancedErrors(draft.meta)];
      if (errors.length) throw new Error(`请先修正词条属性：${errors.map(label).join('、')}`);
      return { path: draft.path, kind: draft.kind, title: draft.meta.name || draft.meta.title, baseSha:draft.baseSha, baseContent:draft.baseContent, create:draft.create === true, assets:draft.assets || [], content: serializeDraft() };
    },
    async uploadAttachments(api, accountId, snapshot) {
      const ids=[];
      for(const asset of snapshot.assets || []) {
        const blob=await attachmentFile(asset.id);
        if(!blob){if(asset.serverUploaded===true){ids.push(asset.id);continue;}throw Error('图片校验失败，请重新选择。');}
        const receipt=await api('/api/editor/assets','POST',{accountId,content:await imageBase64(blob),source:asset.source,name:asset.name,alt:asset.alt});if(receipt.id!==asset.id||receipt.path!==asset.path||receipt.mime!==asset.mime)throw Error('图片校验失败，请重新选择。');
        ids.push(asset.id);
      }
      return ids;
    },
    async restore(submission) {
      if (hasWork() && !await confirmReplace()) return false;
      const imported = importMarkdown(submission.content, submission.kind, submission.path);
      imported.baseSha=submission.baseSha;imported.baseContent=submission.baseContent??null;imported.create=submission.create === true || (submission.create == null && submission.baseSha == null);imported.assets=(submission.assets || []).map(asset=>({...asset,url:asset.url||(/^public\//.test(asset.path||'')?'/'+asset.path.slice(7):''),serverUploaded:true}));
      checkpoint(); clearPendingSource(); draft = imported; renderFields(); renderBlocks(); changed(true);
      const url = new URL(location.href); url.searchParams.set('target', draft.path);
      window.history.replaceState(null, '', url);
      return true;
    },
  };
  if (prDemo) initializeEditorPrDemo(root, entryEditor);
  const cloudDraftPath = articleMode ? null : new URLSearchParams(location.search).get('draftPath');
  if (prDemo && cloudDraftPath && sourceRequest(cloudDraftPath)) {
    void (async () => {
      try {
        const response = await fetch(editorApiBase+'/api/editor/draft?path='+encodeURIComponent(cloudDraftPath), { credentials:'include',cache:'no-store' });
        if (!response.ok) throw new Error(copy.loadFailed);
        const saved = await response.json();
        if (!saved?.content || saved.path !== cloudDraftPath) throw new Error(copy.loadFailed);
        const restored = await entryEditor.restore({ ...saved, kind:saved.kind||cloudDraftPath.split('/')[2] });
        if (restored) {
          const url=new URL(location.href);url.searchParams.delete('draftPath');window.history.replaceState(null,'',url);
          root.dispatchEvent(new CustomEvent('editor-source-loaded'));
          $('[data-load-status]').textContent = copy.loaded + ' ' + (saved.title||cloudDraftPath);
        }
      } catch (error) {
        $('[data-load-status]').textContent = error.message || copy.loadFailed;
      }
    })();
  }
  if(articleMode){
    const recovery=articleCopy(root.dataset.locale).recovery,candidates=[];
    try{
      if(!restoredArticle&&articleOwner!=='unverified'){
        const signedIn=articleOwner!=='guest';
        for(const [candidate,label,allowed] of [[guestKey,recovery.guest,signedIn],[unverifiedKey,recovery.unverified,signedIn],[legacyKey,recovery.legacy,true]]){
          if(allowed&&candidate&&localStorage.getItem(candidate))candidates.push([candidate,label]);
        }
      }
    }catch{/* Private browsing may disable storage. */}
    if(candidates.length){
      const panel=document.createElement('div');panel.className='ve-draft-recovery';
      for(const [recoveryKey,label] of candidates){
        const button=document.createElement('button');button.type='button';button.textContent=label;panel.append(button);
        button.onclick=async()=>{try{const recovered=JSON.parse(localStorage.getItem(recoveryKey)||'null');if(!recovered||recovered.version!==1||recovered.kind!=='articles'||!Array.isArray(recovered.blocks)||recovered.blocks.length>=1000||!recovered.meta)throw Error(recovery.invalid);if(recovered.ownerId&&recovered.ownerId!==articleOwner)throw Error(recovery.ownerMismatch);if(hasWork()&&!await confirmEditorPopover(root,recovery.replace,{accept:copy.apply,cancel:copy.cancel}))return;draft=acceptRecoveredArticleDraft(recovered,articleOwner,clearPendingSource);history=[JSON.stringify(draft)];cursor=0;renderFields();renderBlocks();changed(true);panel.remove();}catch(error){button.after(document.createTextNode(error.message||recovery.invalid));}};
      }
      $('[data-article-status]')?.after(panel);
    }
    window.addEventListener('kamitsubaki-account-state',()=>{const current=accountState.viewer?.userId||(accountState.auth==='guest'?'guest':'unverified');if(current!==articleOwner){save();location.reload();}});
  }
  if(!articleMode){
    const recoveryCopy=entryDraftRecoveryCopy(root.dataset.locale),candidates=[];
    const addRecovery=(candidateKey,label)=>{
      try{
        const recovered=readStoredDraft(localStorage.getItem(candidateKey));
        const pending=localStorage.getItem(candidateKey+':source');
        if(!recovered&&pending===null)return;
        if(recovered&&legacyEntryDraftDisposition(recovered,entryOwner)==='foreign')return;
        candidates.push([candidateKey,label]);
      }catch{/* Storage may be unavailable in private browsing. */}
    };
    addRecovery(entryKeys.legacyKey,recoveryCopy.legacy);
    addRecovery(entryKeys.legacyKey+':previous',recoveryCopy.previous);
    if(entryOwner!=='guest')addRecovery(entryDraftStorageKeys(prDemo,'guest',root.dataset.contentLocale).key,recoveryCopy.guest);
    if(entryOwner!=='unverified')addRecovery(entryDraftStorageKeys(prDemo,'unverified',root.dataset.contentLocale).key,recoveryCopy.unverified);
    else addRecovery(key,recoveryCopy.unverified);
    if(candidates.length){
      const panel=document.createElement('div');panel.className='ve-entry-recovery';
      for(const [candidateKey,label] of candidates){
        const button=document.createElement('button');button.type='button';button.textContent=label;panel.append(button);
        button.addEventListener('click',async()=>{
          try{
            const recovered=readStoredDraft(localStorage.getItem(candidateKey));
            const pending=localStorage.getItem(candidateKey+':source');
            if(!recovered&&pending===null)throw Error(copy.invalid);
            if(recovered&&legacyEntryDraftDisposition(recovered,entryOwner)==='foreign')throw Error(copy.invalid);
            if(hasWork()&&!await confirmReplace())return;
            checkpoint();clearPendingSource();
            draft=recovered||newDraft('projects',root.dataset.contentLocale);
            draft.ownerId=entryOwner==='guest'||entryOwner==='unverified'?null:entryOwner;
            history=[JSON.stringify(draft)];cursor=0;renderFields();renderBlocks();changed(true);
            if(pending!==null){sourcePending=pending;localStorage.setItem(sourceKey,pending);changeMode('source');$('[data-source-error]').hidden=false;$('[data-source-error]').textContent=copy.sourceRecovered;$('[data-save-status]').textContent=copy.sourcePending;}
            panel.remove();
          }catch(error){button.after(document.createTextNode(error.message||copy.invalid));}
        });
      }
      $('[data-pr-draft-notice]').after(panel);
    }
    const reloadForOwner=next=>{if(next===entryOwner)return;if(hasWork())save();location.reload();};
    if(prDemo&&localEditor)root.addEventListener('kamitsubaki-editor-account-state',event=>reloadForOwner(event.detail?.accountId?'mock:'+event.detail.accountId:'unverified'));
    else window.addEventListener('kamitsubaki-account-state',()=>reloadForOwner(accountState.viewer?.userId||(accountState.auth==='guest'?'guest':'unverified')));
  }
  if(articleMode)window.addEventListener('kamitsubaki-account-state',()=>{if((accountState.viewer?.userId||(accountState.auth==='guest'?'guest':'unverified'))!==articleOwner){for(const [id,url]of imageURLs)if(id.startsWith('article:')){URL.revokeObjectURL(url);imageURLs.delete(id);}root.querySelectorAll('[data-article-reference]').forEach(img=>img.removeAttribute('src'));articleAssetDialog?.close();}});
  if(articleMode)initializeArticleSubmission(root,{
    currentOwner(){return accountState.viewer?.userId||(accountState.auth==='guest'?'guest':'unverified');},
    async validateRelations(){const ids=draft.meta.relatedEntities||[];if(!ids.length)return;const entries=await articleEntities(root.dataset.locale);if(ids.some(id=>!entries.some(e=>e.id===id)))throw Error(articleCopy(root.dataset.locale).invalidRelated);},
    prepareNavigation(){saving=true;},
    persistLocal(){save();},
    subscribe(callback){root.addEventListener('article-draft-change',callback);},
    snapshot(){if(!applySource())throw Error(copy.sourceError);return {locale:draft.meta.locale,content:{title:draft.meta.title||'',summary:draft.meta.summary||'',category:draft.meta.articleCategory||'archival',relatedEntities:draft.meta.relatedEntities||[],body:serializeDraft(),mediaRefs:(draft.meta.articleMediaRefs||[]).filter(ref=>serializeDraft().includes(ref.src||`/_private/article-assets/${ref.assetId}`))}};},
    restore(content,locale){clearPendingSource();draft=newDraft('articles',locale);Object.assign(draft.meta,{title:content.title||'',summary:content.summary||'',articleCategory:content.category||'archival',relatedEntities:content.relatedEntities||[],articleMediaRefs:content.mediaRefs||[]});draft.blocks=parseVisualBlocks(content.body||'');if(!draft.blocks.length)draft.blocks=[newBlock('paragraph')];draft.articleOriginalBody=content.body||'';draft.articleBodySnapshot=JSON.stringify(draft.blocks);history=[JSON.stringify(draft)];cursor=0;renderFields();renderBlocks();changed(true);},
    hasLocalWork(){return hasWork();},
  },articleOwner);
  if (!articleMode && !target && new URLSearchParams(location.search).get('new')==='articles') openNewEntry('articles');
  if (target && sourceRequest(target) && !(draft.path === target && draft.originalMeta)) loadOriginal(target);
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, {once:true});
else initialize();
