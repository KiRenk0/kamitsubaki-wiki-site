import { sourceRequest } from '../lib/editorSource.mjs';
import { renderRich, richMarkdown, inlineKinds, inlineSource, inlineParts, shortcodeChip } from '../lib/editorRichText.mjs';
import { metadataDefaults, metadataOptions, metadataLabel, metadataChoices, newMetadataItem, advancedErrors } from '../lib/editorMetadata.mjs';
import { previewBlock as renderPreviewBlock, previewMedia, loadPreviewMedia } from '../lib/editorPreview.mjs';
import { enhanceReader } from '../lib/readerEnhancements.mjs';
import 'katex/dist/katex.min.css';
import { fields, blockTypes, entryTypes, newDraft, newBlock, parseVisualBlocks, importMarkdown, exportMarkdown, validateDraft, safeUrl, validPath, escapeHtml } from '../lib/visualEditor.mjs';

const initialize = () => {
  const root = document.querySelector('[data-visual-editor]');
  if (!root || root.dataset.ready) return;
  root.dataset.ready = 'true';
  const $ = selector => root.querySelector(selector);
  const copy = JSON.parse($('[data-editor-copy]').textContent);
  const uiLocale = root.dataset.locale.startsWith('zh') ? 'zh' : root.dataset.locale;
  const key = `kamitsubaki-visual-editor-v1:${root.dataset.contentLocale}`;
  const md = renderRich;
  let draft = newDraft('projects', root.dataset.contentLocale);
  let saving = true;
  let activeBlockId = draft.blocks[0]?.id, sourcePending = null, sourceTimer;
  const sourceKey = key + ':source';
  if (window.innerWidth <= 900) root.setAttribute('data-sidebar-hidden','');
  try {
    const saved = JSON.parse(localStorage.getItem(key) || 'null');
    if (saved?.version === 1 && entryTypes.includes(saved.kind) && Array.isArray(saved.blocks) && saved.blocks.length < 1000 && saved.meta) {
      exportMarkdown(saved); draft = saved;
    }
  } catch { saving = false; }
  draft.blocks = draft.blocks.flatMap(block => block.type === 'preserved' ? parseVisualBlocks(block.text) : [block]);
  const target = new URLSearchParams(location.search).get('target');
  let history = [JSON.stringify(draft)], cursor = 0, historyTimer;
  function save() {
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
  }
  function updateHistory() { $('[data-undo]').disabled = cursor === 0; $('[data-redo]').disabled = cursor === history.length - 1; }
  function changed(structural = false) { save(); output(); clearTimeout(historyTimer); if (structural) checkpoint(); else historyTimer = setTimeout(checkpoint, 350); }
  const label = key => fields[draft.kind].find(f => f.key === key)?.labels[uiLocale] || copy.blocks[key] || copy[key] || metadataLabel(key,uiLocale);
  function renderFields() {
    $('[data-kind]').value = draft.kind;
    $('[data-locale-select]').value = draft.meta.locale;
    $('[data-path]').value = draft.path;
    $('[data-document-title]').value = draft.meta.name || draft.meta.title || '';
    renderAdvanced();
    $('[data-fields]').innerHTML = fields[draft.kind].map(f => `<label>${escapeHtml(f.labels[uiLocale])}${f.required ? ' <span aria-hidden="true">*</span>' : ''}<input data-field="${f.key}" type="${f.type}" ${f.required ? 'required' : ''} value="${escapeHtml(draft.meta[f.key] ?? '')}" ${f.key === 'releaseDate' ? 'placeholder="YYYY-MM-DD"' : ''} /></label>`).join('');
  }
  const protectedKeys = new Set(['__proto__','prototype','constructor']);
  const fieldPath = path => encodeURIComponent(JSON.stringify(path));
  const parsePath = value => JSON.parse(decodeURIComponent(value));
  function metadataTree(value,path) {
    const key=String(path.at(-1)), name=metadataLabel(key,uiLocale), attr=fieldPath(path);
    if(Array.isArray(value)) return `<fieldset><legend>${escapeHtml(name)}</legend>${value.map((item,i)=>`<div class="ve-meta-item">${metadataTree(item,[...path,i])}<button data-meta-remove="${fieldPath([...path,i])}" aria-label="${copy.remove}">×</button></div>`).join('')}<button data-meta-add="${attr}">＋ ${copy.row}</button></fieldset>`;
    if(value && typeof value==='object') return `<fieldset><legend>${escapeHtml(name)}</legend>${Object.entries(value).filter(([key])=>!protectedKeys.has(key)).map(([key,val])=>metadataTree(val,[...path,key])).join('')}</fieldset>`;
    const choices=metadataChoices[path.join('.')]||metadataChoices[key];
    if(choices) return `<label>${escapeHtml(name)}<select data-meta-value="${attr}">${[...new Set([...choices,String(value ?? '')])].map(choice=>`<option value="${escapeHtml(choice)}" ${choice===value?'selected':''}>${escapeHtml(choice)}</option>`).join('')}</select></label>`;
    if(typeof value==='boolean')return `<label class="ve-check"><input data-meta-value="${attr}" type="checkbox" ${value?'checked':''} />${escapeHtml(name)}</label>`;
    return `<label>${escapeHtml(name)}<input data-meta-value="${attr}" type="${typeof value==='number'?'number':/Color$|^value$/.test(key)&&/^#[0-9a-f]{6}$/i.test(value)?'color':'text'}" value="${escapeHtml(value ?? '')}" /></label>`;
  }
  function renderAdvanced() {
    const basic=new Set(['locale',...fields[draft.kind].map(f=>f.key)]);
    $('[data-advanced-fields]').innerHTML=Object.entries(draft.meta).filter(([key])=>!basic.has(key)&&!protectedKeys.has(key)).map(([key,value])=>`<details><summary>${escapeHtml(metadataLabel(key,uiLocale))}</summary>${metadataTree(value,[key])}<button data-meta-remove="${fieldPath([key])}">× ${escapeHtml(metadataLabel(key,uiLocale))}</button></details>`).join('');
    const available=metadataOptions(draft.kind).filter(key=>!(key in draft.meta));
    $('[data-advanced-type]').innerHTML=available.map(key=>`<option value="${key}">${escapeHtml(metadataLabel(key,uiLocale))}</option>`).join('');
    $('[data-add-property]').disabled=!available.length;
  }
  function metaParent(path) { if(path.some(key=>protectedKeys.has(String(key))))throw new Error('path');return path.slice(0,-1).reduce((obj,key)=>obj[key],draft.meta); }
  function richControls(b) { return `<div class="ve-rich" contenteditable="true" role="textbox" aria-multiline="true" aria-label="${copy.blocks[b.type]}" data-rich data-placeholder="${copy.emptyParagraph}">${md(b.text)}</div>`; }
  const inlineLabels = kind => kind==='ruby' ? [copy.text,copy.kana,copy.romaji] : kind==='zh-variant' ? [copy.text,copy.taiwan,copy.hongkong] : ['abbr','time'].includes(kind) ? [copy.text,copy.explanation] : [copy.text];
  function unitControls(unit,attr) { return ['original','kana','romaji','time'].map(p=>control(p==='time'?copy.timestamp:copy[p],`${attr}="${p}"`,unit[p]||'')).join(''); }
  function control(labelText, attr, value = '', multiline = false) {
    return `<label>${escapeHtml(labelText)}${multiline ? `<textarea ${attr} rows="3">${escapeHtml(value)}</textarea>` : `<input ${attr} value="${escapeHtml(value)}" />`}</label>`;
  }
  function blockControls(b) {
    if (b.type === 'paragraph') return richControls(b);
    if (b.type === 'heading') return `<select data-prop="level" aria-label="${copy.blocks.heading}">${[2,3,4,5,6].map(level=>`<option value="${level}" ${b.level===String(level)?'selected':''}>H${level}</option>`).join('')}</select>${control(copy.text,'data-prop="text"',b.text)}`;
    if (b.type === 'list') return `<label class="ve-check"><input type="checkbox" data-prop="ordered" ${b.ordered ? 'checked' : ''} />${copy.ordered}</label>${control(copy.lines,'data-prop="text"',b.text,true)}`;
    if (b.type === 'quote') return control(copy.text,'data-prop="text"',b.text,true);
    if (b.type === 'image') return control(copy.url,'data-prop="url"',b.url) + control(copy.text,'data-prop="text"',b.text) + control(copy.caption,'data-prop="caption"',b.caption);
    if (b.type === 'media') return `<select data-prop="provider" aria-label="${copy.blocks.media}">${['youtube','bilibili','apple-music','spotify','netease','qq-music'].map(p => `<option ${b.provider === p ? 'selected' : ''}>${p}</option>`).join('')}</select>${control(copy.url,'data-prop="url"',b.url)}`;
    if (b.type === 'ruby') return control(copy.text,'data-prop="text"',b.text) + control(copy.kana,'data-prop="kana"',b.kana) + control(copy.romaji,'data-prop="romaji"',b.romaji);
    if (b.type === 'details') return control(copy.detailTitle,'data-prop="title"',b.title) + richControls(b);
    if (b.type === 'table') return `<div class="ve-table-edit"><table>${b.rows.map((row, ri) => `<tr>${row.map((cell, ci) => `<td><input aria-label="${ri + 1} / ${ci + 1}" data-cell="${ri}:${ci}" value="${escapeHtml(cell)}" /></td>`).join('')}</tr>`).join('')}</table></div><div class="ve-row-tools"><button data-row>${copy.row}</button><button data-column>${copy.column}</button></div>`;
    if (b.type === 'lyrics') return `<p class="ve-hint">${copy.lyricsTiming}</p>` + b.rows.map((r,i)=>`<fieldset><legend>${i+1}</legend>${r.units?.length ? r.units.map((unit,j)=>`<div class="ve-unit" data-unit-row="${i}" data-unit-index="${j}">${unitControls(unit,'data-unit-prop')}<button data-unit-remove="${i}:${j}" ${r.units.length===1?'disabled':''}>×</button></div>`).join('') : ['original','kana','romaji','time'].map(p=>control(p==='time'?copy.timestamp:copy[p],`data-lyric="${i}:${p}"`,r[p]||'')).join('')}${control(copy.translation,`data-lyric="${i}:translation"`,r.translation)}<div class="ve-row-tools"><button data-unit-add="${i}">${copy.addUnit}</button><button data-remove-row="${i}" ${b.rows.length===1?'disabled':''}>− ${copy.lines}</button></div></fieldset>`).join('')+`<button data-row>${copy.row}</button>`;
    if(b.type==='inline')return `<select data-inline-style aria-label="${copy.specialFormat}">${inlineKinds.map(kind=>`<option value="${kind}" ${b.kind===kind?'selected':''}>${copy.inline[kind]}</option>`).join('')}</select>${inlineLabels(b.kind).map((label,i)=>control(label,`data-inline-arg="${i}"`,b.args[i]||'')).join('')}`;
    if(b.type==='code')return control(copy.languageName,'data-prop="language"',b.language)+control(copy.blocks.code,'data-prop="text"',b.text,true);
    if(b.type==='math')return `<label class="ve-check"><input type="checkbox" data-prop="display" ${b.display?'checked':''} />${copy.displayMath}</label>`+control(copy.formula,'data-prop="text"',b.text,true);
    if(b.type==='media-switcher')return control(copy.text,'data-prop="title"',b.title)+b.items.map((item,i)=>`<fieldset><legend>${i+1}</legend><select data-media="${i}:provider">${['youtube','bilibili','apple-music','spotify','netease','qq-music'].map(provider=>`<option ${provider===item.provider?'selected':''}>${provider}</option>`).join('')}</select>${control(copy.url,`data-media="${i}:url"`,item.url)}<button data-media-remove="${i}" ${b.items.length<=2?'disabled':''}>×</button></fieldset>`).join('')+`<button data-media-add ${b.items.length>=6?'disabled':''}>${copy.addMedia}</button>`;
    if (b.type === 'preserved') return `<p class="ve-hint">${copy.preservedHint}</p><details><summary>${copy.source}</summary><pre>${escapeHtml(b.text)}</pre></details>`;
    return '<hr />';
  }
  function previewBlock(b) { return renderPreviewBlock(b,copy); }
  function canvasBlock(b) {
    if (b.type === 'paragraph') return richControls(b);
    if (b.type === 'heading') return `<input class="ve-heading-input" data-prop="text" value="${escapeHtml(b.text)}" placeholder="${copy.blocks.heading}" aria-label="${copy.blocks.heading}"/>`;
    if (b.type === 'table') return blockControls(b);
    if (b.type === 'quote' || b.type === 'list') return `<textarea data-prop="text" rows="${Math.max(2,b.text.split('\n').length)}" aria-label="${copy.blocks[b.type]}" placeholder="${copy.blocks[b.type]}">${escapeHtml(b.text)}</textarea>`;
    return `<div class="ve-block-visual wiki-reader wiki-prose" data-inspect-block="${escapeHtml(b.id)}" tabindex="0" role="button" aria-label="${copy.properties}: ${copy.blocks[b.type] || copy.preserved}">${previewBlock(b)}</div>`;
  }
  function renderBlocks(focusId) {
    if (!draft.blocks.some(b=>b.id===activeBlockId)) activeBlockId=draft.blocks[0]?.id;
    if(focusId) activeBlockId=focusId;
    $('[data-blocks]').innerHTML = draft.blocks.map((b,i)=>`<section class="ve-block ${b.id===activeBlockId?'is-active':''}" data-block="${escapeHtml(b.id)}" data-type="${b.type}"><span class="ve-block-gutter" draggable="true" data-drag-block="${escapeHtml(b.id)}" aria-hidden="true">⠿</span><header><button data-insert-after="${escapeHtml(b.id)}" aria-label="${copy.insertAfter}">＋</button><button data-duplicate aria-label="${copy.duplicate}">⧉</button><button data-move="-1" aria-label="${copy.up}" ${i===0?'disabled':''}>↑</button><button data-move="1" aria-label="${copy.down}" ${i===draft.blocks.length-1?'disabled':''}>↓</button><button data-remove aria-label="${copy.remove}">×</button></header>${canvasBlock(b)}</section>`).join('');
    renderOutline(); renderInspector();
    if(focusId) blockElement(focusId)?.querySelector('[contenteditable],input,textarea,[data-inspect-block]')?.focus();
  }
  const blockElement = id => [...$('[data-blocks]').children].find(el=>el.dataset.block===id);
  function renderOutline() {
    $('[data-document-name]').textContent=draft.meta.name||draft.meta.title||copy.emptyTitle;
    $('[data-file-label]').textContent=draft.path ? draft.path.split('/').slice(-2).join('/') : `${draft.meta.locale}.md`;
    $('[data-block-count]').textContent=`${draft.blocks.length} ${copy.blockCount}`;
    $('[data-outline]').innerHTML=draft.blocks.map((b,i)=>`<button data-outline-block="${escapeHtml(b.id)}" class="${b.id===activeBlockId?'is-active':''}" title="${escapeHtml(b.text?.slice(0,100)||copy.blocks[b.type]||copy.preserved)}"><small>${b.type==='heading'?'H'+b.level:String(i+1).padStart(2,'0')}</small><span>${escapeHtml((b.title||b.text||'').replace(/\{\{[a-z-]+::([^:}]+)(?:::[^}]*)?\}\}/g,'$1').replace(/<[^>]+>/g,'').replace(/[*#|_`>]/g,'').slice(0,45)||copy.blocks[b.type]||copy.preserved)}</span></button>`).join('')||`<p class="ve-hint">${copy.emptyOutline}</p>`;
  }
  function renderInspector() {
    const block=draft.blocks.find(b=>b.id===activeBlockId);const panel=$('[data-inspector]');
    if(!block) {panel.innerHTML=`<p>${copy.selectBlock}</p>`;return;}
    panel.dataset.block=block.id;
    panel.innerHTML=`<p class="ve-inspector-kind">${copy.blocks[block.type]||copy.preserved}</p>`+(block.type==='paragraph'?`<p class="ve-hint">${copy.paragraphHint}</p>`:blockControls(block));
  }
  function selectBlock(id,{scroll=false,inspect=false}={}) {
    if(!draft.blocks.some(b=>b.id===id))return;
    const changed=activeBlockId!==id; activeBlockId=id;
    $('[data-blocks]').querySelectorAll('.ve-block').forEach(el=>el.classList.toggle('is-active',el.dataset.block===id));
    $('[data-outline]').querySelectorAll('button').forEach(el=>el.classList.toggle('is-active',el.dataset.outlineBlock===id));
    $('[data-preview]').querySelectorAll('[data-preview-block]').forEach(el=>el.classList.toggle('is-active',el.dataset.previewBlock===id));
    if(changed)renderInspector();
    if(scroll)blockElement(id)?.scrollIntoView({block:'center',behavior:'instant'});
    if(inspect) {if(window.innerWidth<=900)setLayout('preview'); changeView('properties');}
  }
  function output() {
    const errors = [...validateDraft(draft), ...advancedErrors(draft.meta)];
    if (draft.needsOriginal) errors.push('loadOriginal');
    if(sourcePending===null && document.activeElement!==$('[data-source]')) $('[data-source]').value=exportMarkdown(draft);
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
    github.hidden = !validPath(draft.path);
    if (!github.hidden) {
      const parts = draft.path.split('/').map(encodeURIComponent);
      const filename = parts.pop();
      github.href = draft.originalMeta ? `https://github.com/LinkTh1rsty/kamitsubaki-wiki-site/edit/main/${parts.join('/')}/${filename}` : `https://github.com/LinkTh1rsty/kamitsubaki-wiki-site/new/main/${parts.join('/')}?filename=${filename}`;
    }
    updateHistory();
  }
  root.addEventListener('input', event => {
    const el = event.target;
    if (!(el instanceof HTMLElement)) return;
    if(el.matches('[data-source]')) {queueSource();return;}
    if(el.matches('[data-document-title]')) {draft.meta[draft.kind==='artists'?'name':'title']=el.value;const field=$(`[data-field="${draft.kind==='artists'?'name':'title'}"]`);if(field)field.value=el.value;changed();return;}
    if (el.matches('[data-meta-value]')) { const path=parsePath(el.dataset.metaValue); metaParent(path)[path.at(-1)]=el.type==='checkbox'?el.checked:el.type==='number'?Number(el.value):el.value; changed(); return; }
    if (el.matches('[data-field]')) {
      const spec = fields[draft.kind].find(f => f.key === el.dataset.field);
      if (!el.value && !spec.required) delete draft.meta[spec.key];
      else draft.meta[spec.key] = spec.type === 'number' && el.value !== '' ? Number(el.value) : el.value;
    } else if (el.matches('[data-path]')) draft.path = el.value.trim();
    else {
      const block = draft.blocks.find(b => b.id === el.closest('[data-block]')?.dataset.block);
      if (!block) return;
      if (el.closest('[data-rich]')) block.text = richMarkdown(el.closest('[data-rich]'));
      else if(el.hasAttribute('data-inline-style')) {block.kind=el.value;block.args=inlineLabels(block.kind).map((_,i)=>block.args[i]||'');renderBlocks();}
      else if(el.hasAttribute('data-inline-arg')) block.args[Number(el.dataset.inlineArg)]=el.value;
      else if(el.hasAttribute('data-media')) {const [i,p]=el.dataset.media.split(':');block.items[Number(i)][p]=el.value;}
      else if(el.hasAttribute('data-unit-prop')) {const unit=el.closest('[data-unit-row]');block.rows[Number(unit.dataset.unitRow)].units[Number(unit.dataset.unitIndex)][el.dataset.unitProp]=el.value;}
      else if (el.dataset.prop) block[el.dataset.prop] = el.type === 'checkbox' ? el.checked : el.value;
      else if (el.dataset.cell) { const [r,c] = el.dataset.cell.split(':').map(Number); block.rows[r][c] = el.value; }
      else if (el.dataset.lyric) { const [r,p] = el.dataset.lyric.split(':'); block.rows[Number(r)][p] = el.value; }
      else return;
    }
    if(el.closest('[data-inspector]')) { const id=activeBlockId,element=blockElement(id),block=draft.blocks.find(b=>b.id===id); if(element&&block) {element.querySelector(':scope > :last-child')?.remove();element.insertAdjacentHTML('beforeend',canvasBlock(block));} }
    if(el.matches('[data-field="name"],[data-field="title"]')) $('[data-document-title]').value=el.value;
    changed();
  });
  root.addEventListener('paste', event => {
    if (!event.target.closest('[data-rich]')) return;
    event.preventDefault(); document.execCommand('insertText', false, event.clipboardData.getData('text/plain'));
  });
  root.addEventListener('drop', event => { if (event.target.closest('[data-rich]')) event.preventDefault(); });
  root.addEventListener('pointerdown', event => { if (event.target.closest('[data-format],[data-special],[data-inline-preset]')) event.preventDefault(); });
  root.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    const block = draft.blocks.find(b => b.id === (button.closest('[data-block]')?.dataset.block || activeBlockId));
    if(button.hasAttribute('data-add-property')) {checkpoint();const key=$('[data-advanced-type]').value;if(!metadataOptions(draft.kind).includes(key))return;draft.meta[key]=structuredClone(metadataDefaults[key]);renderAdvanced();changed(true);}
    if(button.hasAttribute('data-meta-add')) {checkpoint();const path=parsePath(button.dataset.metaAdd);const array=path.reduce((obj,key)=>obj[key],draft.meta);array.push(newMetadataItem(path.join('.'),array));renderAdvanced();changed(true);}
    if(button.hasAttribute('data-meta-remove')) {checkpoint();const path=parsePath(button.dataset.metaRemove),parent=metaParent(path);if(Array.isArray(parent))parent.splice(Number(path.at(-1)),1);else delete parent[path.at(-1)];renderAdvanced();changed(true);}
    if(button.hasAttribute('data-preview-provider')) {const [id,index]=button.dataset.previewProvider.split(':');const b=draft.blocks.find(b=>b.id===id);if(b){const item=b.items[Number(index)];$(`[data-preview-media="${id}"]`).innerHTML=previewMedia(item.provider,item.url);}}
    if(block && button.hasAttribute('data-media-add')){checkpoint();if(block.items.length<6)block.items.push({provider:'youtube',url:''});renderBlocks(block.id);changed(true);}
    if(block && button.hasAttribute('data-media-remove')){checkpoint();if(block.items.length>2)block.items.splice(Number(button.dataset.mediaRemove),1);renderBlocks(block.id);changed(true);}
    if(block && button.hasAttribute('data-unit-add')){checkpoint();const row=block.rows[Number(button.dataset.unitAdd)];if(!row.units?.length)row.units=[{original:row.original,kana:row.kana,romaji:row.romaji,time:row.time||''}];row.units.push({original:'',kana:'',romaji:'',time:''});renderBlocks(block.id);changed(true);}
    if(block && button.hasAttribute('data-unit-remove')){checkpoint();const [i,j]=button.dataset.unitRemove.split(':').map(Number);if(block.rows[i].units.length>1)block.rows[i].units.splice(j,1);renderBlocks(block.id);changed(true);}
    if(button.hasAttribute('data-load-media')) {loadPreviewMedia(button);return;}
    if (button.dataset.format) {
      const rich=blockElement(activeBlockId)?.querySelector('[data-rich]');
      if(!rich){$('[data-action-status]').textContent=copy.paragraphHint;return;}
      restoreSelection(rich);
      if(button.dataset.format==='link') {openLink(rich);return;}
      document.execCommand(button.dataset.format,false); block.text=richMarkdown(rich);changed();return;
    }
    if(button.hasAttribute('data-duplicate')&&block) {checkpoint();const next=structuredClone(block);next.id=crypto.randomUUID();draft.blocks.splice(draft.blocks.indexOf(block)+1,0,next);renderBlocks(next.id);changed(true);}
    if (button.hasAttribute('data-remove')) { checkpoint(); draft.blocks = draft.blocks.filter(b => b !== block); if(!draft.blocks.length)draft.blocks.push(newBlock('paragraph')); renderBlocks(); changed(true); }
    if (button.dataset.move) { checkpoint(); const i = draft.blocks.indexOf(block), j = i + Number(button.dataset.move); if (j < 0 || j >= draft.blocks.length) return; [draft.blocks[i],draft.blocks[j]] = [draft.blocks[j],draft.blocks[i]]; renderBlocks(block.id); changed(true); }
    if (button.hasAttribute('data-row')) { checkpoint(); block.rows.push(block.type === 'table' ? block.rows[0].map(() => '') : {original:'',kana:'',romaji:'',translation:''}); renderBlocks(block.id); changed(true); }
    if (button.hasAttribute('data-column')) { checkpoint(); block.rows.forEach(row => row.push('')); renderBlocks(block.id); changed(true); }
    if (button.hasAttribute('data-remove-row')) { checkpoint(); block.rows.splice(Number(button.dataset.removeRow),1); renderBlocks(block.id); changed(true); }
  });
  let inlineContext=null;
  function inlineFields(args=[]) {const kind=$('[data-inline-kind]').value;$('[data-inline-args]').innerHTML=inlineLabels(kind).map((label,i)=>control(label,`data-dialog-arg="${i}"`,args[i]||'')).join('');inlinePreview();}
  function openInline(rich,chip=null,preset=null) {
    const selection=window.getSelection(); let range=selection?.rangeCount?selection.getRangeAt(0).cloneRange():null;
    if(!range||!rich.contains(range.commonAncestorContainer)){range=document.createRange();range.selectNodeContents(rich);range.collapse(false);}
    const parts=chip?inlineParts(decodeURIComponent(chip.dataset.veSource)):null;
    inlineContext={rich,chip,range};$('[data-inline-kind]').value=parts?.kind||preset||'ruby';inlineFields(parts?.args||[selection?.toString()||'']);$('#ve-inline-title').textContent=copy.inline[$('[data-inline-kind]').value];$('[data-inline-error]').textContent='';$('[data-inline-dialog]').showModal();
  }
  root.addEventListener('click',event=>{
    const special=event.target.closest('[data-special],[data-inline-preset]');if(special){const rich=blockElement(activeBlockId)?.querySelector('[data-rich]');if(rich){restoreSelection(rich);const preset=special.dataset.inlinePreset;if(['mark','spoiler','kbd','small','sub','sup'].includes(preset)&&window.getSelection()?.toString()){applyInlineSelection(rich,preset);}else openInline(rich,null,preset);special.closest('details')?.removeAttribute('open');}else{$('[data-action-status]').textContent=copy.paragraphHint;}}
    const chip=event.target.closest('[data-ve-source]');if(chip?.closest('[data-rich]'))openInline(chip.closest('[data-rich]'),chip);
  });
  root.addEventListener('keydown',event=>{const chip=event.target.closest('[data-ve-source]');if(chip?.closest('[data-rich]')&&['Enter',' '].includes(event.key)){event.preventDefault();openInline(chip.closest('[data-rich]'),chip);}});
  $('[data-inline-kind]').addEventListener('change',()=>inlineFields([...root.querySelectorAll('[data-dialog-arg]')].map(input=>input.value)));
  $('[data-inline-apply]').addEventListener('click',()=>{
    const kind=$('[data-inline-kind]').value,args=[...root.querySelectorAll('[data-dialog-arg]')].map(input=>input.value.trim()).filter((arg,i)=>kind!=='ruby'||i<2||arg);
    if(args.some(arg=>!arg||/[{}\n]/.test(arg))){$('[data-inline-error]').textContent=copy.missing+copy.argument;return;}
    const {rich,chip,range}=inlineContext;const template=document.createElement('template');template.innerHTML=shortcodeChip(inlineSource(kind,args));const node=template.content.firstChild;
    checkpoint();
    if(chip)chip.replaceWith(node);else {range.deleteContents();range.insertNode(node);}
    const block=draft.blocks.find(b=>b.id===rich.closest('[data-block]').dataset.block);block.text=richMarkdown(rich);changed();$('[data-inline-dialog]').close();rich.focus();
  });
  $('[data-kind]').addEventListener('change', event => {
    if (!window.confirm(copy.replace)) { event.target.value = draft.kind; return; }
    checkpoint(); clearPendingSource(); draft = newDraft(event.target.value, draft.meta.locale); renderFields(); renderBlocks(); changed(true);
  });
  $('[data-locale-select]').addEventListener('change', event => { checkpoint(); draft.meta.locale = event.target.value; renderFields(); changed(true); });
   $('[data-add]').addEventListener('click',()=>insertBlock($('[data-block-type]').value));
  $('[data-undo]').addEventListener('click', () => { checkpoint(); if (!cursor) return; clearPendingSource(); draft = JSON.parse(history[--cursor]); renderFields(); renderBlocks(); save(); output(); });
  $('[data-redo]').addEventListener('click', () => { if (cursor >= history.length - 1) return; clearPendingSource(); draft = JSON.parse(history[++cursor]); renderFields(); renderBlocks(); save(); output(); });
  function changeView(view) {
    root.querySelectorAll('[data-view]').forEach(button=>{const active=button.dataset.view===view;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;});
    $('#ve-preview').hidden=view!=='preview'; $('#ve-properties').hidden=view!=='properties';
  }
  root.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>changeView(button.dataset.view)));
  $('[data-copy]').addEventListener('click', async () => { try { await navigator.clipboard.writeText(exportMarkdown(draft)); $('[data-action-status]').textContent = copy.copied; } catch { changeMode('source'); $('[data-source]').select(); $('[data-action-status]').textContent = copy.copyFailed; } });
  $('[data-download]').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([sourcePending ?? exportMarkdown(draft)], {type:'text/markdown;charset=utf-8'}));
    const link = document.createElement('a'); link.href = url; link.download = `${draft.meta.locale}.md`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  $('[data-import-open]').addEventListener('click', () => { $('[data-import-error]').textContent = ''; $('[data-import-dialog]').showModal(); });
  $('[data-import-file]').addEventListener('change', async event => { const file = event.target.files?.[0]; if (!file) return; if (file.size > 1_000_000) { $('[data-import-error]').textContent = copy.invalid; return; } $('[data-import-text]').value = await file.text(); });
  $('[data-import-apply]').addEventListener('click', () => {
    try {
      const imported = importMarkdown($('[data-import-text]').value, draft.kind, draft.path);
      if (!window.confirm(copy.replace)) return;
      checkpoint(); clearPendingSource(); draft = imported; renderFields(); renderBlocks(); changed(true); $('[data-import-dialog]').close();
    } catch { $('[data-import-error]').textContent = copy.invalid; }
  });
  const hasWork = () => sourcePending!==null || Boolean(draft.meta.name || draft.meta.title || draft.meta.translationKey || draft.blocks.some(b => b.text || ['table','lyrics'].includes(b.type)));
  let loadRequest = 0;
  const originalCache = new Map();
  async function loadOriginal(path, ask = true) {
    const request = sourceRequest(path);
    if (!request) return;
    if (ask && hasWork() && !window.confirm(copy.replace)) return;
    const token = ++loadRequest;
    $('[data-load-status]').textContent = copy.loading;
    root.setAttribute('aria-busy','true');
    $('.ve-workspace').inert = true;
    for (const selector of ['[data-copy]','[data-download]','[data-import-open]','[data-new-entry]']) $(selector).disabled = true;
    try {
      let files = originalCache.get(request);
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
      if (token !== loadRequest) return;
      checkpoint(); clearPendingSource(); draft = imported;
      renderFields(); renderBlocks(); changed(true);
      $('[data-existing-picker]').hidden = false; changeSide('outline');
      $('[data-load-status]').textContent = copy.loaded + ' ' + actualPath;
      const url = new URL(location.href); url.searchParams.set('target',actualPath); window.history.replaceState(null,'',url);
    } catch {
      if (token === loadRequest) {
        $('[data-load-status]').textContent = copy.loadFailed;
        const retry = document.createElement('button'); retry.type = 'button'; retry.textContent = copy.load; retry.addEventListener('click',()=>loadOriginal(path,false)); $('[data-load-status]').append(' ',retry);
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
    const matches = entries.filter(entry => `${entry.title} ${entry.path}`.toLocaleLowerCase().includes(query)).slice(0,12);
    $('[data-entry-results]').innerHTML = matches.length ? matches.map(entry => `<button data-load-path="${escapeHtml(entry.path)}"><strong>${escapeHtml(entry.title)}</strong><small>${escapeHtml(copy.kinds[entry.kind])} · ${escapeHtml(entry.path)}</small></button>`).join('') : `<p>${copy.notFound}</p>`;
  }
  $('[data-existing-open]').addEventListener('click', async () => {
    changeSide('files');
    $('[data-existing-picker]').hidden = false; $('[data-entry-search]').focus();
    const locale = draft.meta.locale;
    if (catalogLocale !== locale) {
      $('[data-entry-results]').textContent = copy.loading;
      try {
        const response = await fetch(`/${locale}/editor-catalog.json`);
        if (!response.ok) throw new Error('catalog');
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('catalog');
        entries = data; catalogLocale = locale;
      } catch { $('[data-entry-results]').textContent = copy.loadFailed; return; }
    }
    renderMatches();
  });
  $('[data-entry-search]').addEventListener('input', renderMatches);
  $('[data-entry-results]').addEventListener('click', event => {
    const path = event.target.closest('[data-load-path]')?.dataset.loadPath;
    if (path) loadOriginal(path);
  });
  $('[data-new-entry]').addEventListener('click', () => {
    if (hasWork() && !window.confirm(copy.replace)) return;
    checkpoint(); clearPendingSource(); draft = newDraft(draft.kind,draft.meta.locale); renderFields(); renderBlocks(); changed(true);
    $('[data-load-status]').textContent = ''; $('[data-existing-picker]').hidden = true;
    const url = new URL(location.href); url.searchParams.delete('target'); window.history.replaceState(null,'',url);
  });
  function applyInlineSelection(rich,kind) {
    const selection=window.getSelection();if(!selection?.rangeCount)return;
    checkpoint();const range=selection.getRangeAt(0),template=document.createElement('template');template.innerHTML=shortcodeChip(inlineSource(kind,[selection.toString()]));const token=template.content.firstChild;
    range.deleteContents();range.insertNode(token);range.setStartAfter(token);range.collapse(true);selection.removeAllRanges();selection.addRange(range);
    const block=draft.blocks.find(b=>b.id===rich.closest('[data-block]').dataset.block);block.text=richMarkdown(rich);changed();$('[data-selection-toolbar]').hidden=true;
  }
  let savedRange=null;
  document.addEventListener('selectionchange',()=>{
    const selection=window.getSelection(),toolbar=$('[data-selection-toolbar]');
    if(!selection?.rangeCount){toolbar.hidden=true;return;}
    const rich=selection.anchorNode?.parentElement?.closest('[data-rich]');
    if(!rich||!root.contains(rich)||!rich.contains(selection.focusNode)){toolbar.hidden=true;return;}
    savedRange=selection.getRangeAt(0).cloneRange();
    if(selection.isCollapsed||root.querySelector('dialog[open]')){toolbar.hidden=true;return;}
    const rect=savedRange.getBoundingClientRect();toolbar.hidden=false;
    const width=toolbar.getBoundingClientRect().width;
    toolbar.style.left=`${Math.max(8,Math.min(innerWidth-width-8,rect.left+rect.width/2-width/2))}px`;
    toolbar.style.top=`${Math.max(60,rect.top-48)}px`;
    for(const button of root.querySelectorAll('[data-format]'))if(['bold','italic','strikeThrough'].includes(button.dataset.format))button.setAttribute('aria-pressed',String(document.queryCommandState(button.dataset.format)));
  });
  $('.ve-canvas').addEventListener('scroll',()=>{$('[data-selection-toolbar]').hidden=true;});
  function restoreSelection(rich) {rich.focus();const selection=window.getSelection();if(savedRange&&rich.contains(savedRange.commonAncestorContainer)){selection.removeAllRanges();selection.addRange(savedRange);}else{const range=document.createRange();range.selectNodeContents(rich);range.collapse(false);selection.removeAllRanges();selection.addRange(range);}}
  let linkContext;
  function openLink(rich) {const selection=window.getSelection();linkContext={rich,range:selection.getRangeAt(0).cloneRange()};$('[data-link-text]').value=selection.toString();$('[data-link-url]').value='';$('[data-link-error]').textContent='';$('[data-link-dialog]').showModal();$('[data-link-url]').focus();}
  $('[data-link-apply]').addEventListener('click',()=>{
    const url=$('[data-link-url]').value.trim(),text=$('[data-link-text]').value||url;
    if(!safeUrl(url)){$('[data-link-error]').textContent=copy.missing+copy.url;return;}
    checkpoint();const link=document.createElement('a');link.href=url;link.textContent=text;
    const {range,rich}=linkContext;range.deleteContents();range.insertNode(link);
    const block=draft.blocks.find(b=>b.id===rich.closest('[data-block]').dataset.block);block.text=richMarkdown(rich);
    $('[data-link-dialog]').close();rich.focus();changed();
  });
  function inlinePreview() {const kind=$('[data-inline-kind]').value,args=[...root.querySelectorAll('[data-dialog-arg]')].map(el=>el.value).filter((value,i)=>kind!=='ruby'||i<2||value);$('[data-inline-preview]').innerHTML=shortcodeChip(inlineSource(kind,args));}
  $('[data-inline-args]').addEventListener('input',inlinePreview);
  function changeSide(side) {root.dataset.side=side;root.removeAttribute('data-sidebar-hidden');root.querySelectorAll('[data-side-panel]').forEach(panel=>panel.hidden=panel.dataset.sidePanel!==side);root.querySelectorAll('[data-side-button]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.sideButton===side)));}
  function setLayout(layout) {root.dataset.layout=layout; if(layout==='preview')changeView('preview');}
  function changeMode(mode) {
    if(mode==='visual'&&sourcePending!==null&&!applySource())return false;
    root.dataset.mode=mode;$('#ve-canvas').hidden=mode!=='visual';$('#ve-source').hidden=mode!=='source';
    root.querySelectorAll('button[data-mode]').forEach(button=>{const active=button.dataset.mode===mode;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;});
    if(mode==='source'){$('[data-source]').value=sourcePending??exportMarkdown(draft);updateSourceLines();$('[data-source]').focus();}
    return true;
  }
  root.querySelectorAll('[data-side-button]').forEach(button=>button.addEventListener('click',()=>{changeSide(button.dataset.sideButton);if(button.dataset.sideButton==='files')$('[data-existing-open]').click();}));
  $('[data-sidebar-toggle]').addEventListener('click',()=>root.toggleAttribute('data-sidebar-hidden'));
  root.querySelectorAll('button[data-layout]').forEach(button=>button.addEventListener('click',()=>setLayout(root.dataset.layout===button.dataset.layout?'split':button.dataset.layout)));
  root.querySelectorAll('button[data-mode]').forEach(button=>button.addEventListener('click',()=>changeMode(button.dataset.mode)));
  root.querySelectorAll('[role="tablist"]').forEach(list=>list.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;const tabs=[...list.querySelectorAll('[role="tab"]')];const index=tabs.indexOf(event.target);if(index<0)return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].click();tabs[next].focus();}));
  root.addEventListener('focusin',event=>{const id=event.target.closest('[data-block]')?.dataset.block;if(id)selectBlock(id);});
  root.addEventListener('click',event=>{
    const outline=event.target.closest('[data-outline-block]');if(outline){setLayout('split');if(!changeMode('visual'))return;selectBlock(outline.dataset.outlineBlock,{scroll:true});if(innerWidth<=900)root.setAttribute('data-sidebar-hidden','');}
    const visual=event.target.closest('[data-inspect-block]');if(visual&&!event.target.closest('a,button,summary'))selectBlock(visual.dataset.inspectBlock,{inspect:true});
    const preview=event.target.closest('[data-preview-block]');if(preview&&!event.target.closest('a,button,summary,.wiki-spoiler,abbr'))selectBlock(preview.dataset.previewBlock,{scroll:true});
    const error=event.target.closest('[data-error-field]');if(error){const field=$(`[data-field="${error.dataset.errorField}"]`);if(field){changeSide('properties');field.focus();}else{const block=draft.blocks.find(b=>b.type===error.dataset.errorField||error.dataset.errorField==='url'&&['image','media'].includes(b.type));if(block)selectBlock(block.id,{scroll:true,inspect:true});}}
  });
  root.addEventListener('keydown',event=>{const visual=event.target.closest('[data-inspect-block]');if(visual&&['Enter',' '].includes(event.key)){event.preventDefault();selectBlock(visual.dataset.inspectBlock,{inspect:true});}});
  function updateSourceLines() {const area=$('[data-source]');$('[data-source-lines]').textContent=Array.from({length:area.value.split('\n').length},(_,i)=>i+1).join('\n');$('[data-source-lines]').scrollTop=area.scrollTop;}
  $('[data-source]').addEventListener('scroll',()=>{$('[data-source-lines]').scrollTop=$('[data-source]').scrollTop;});
  function clearPendingSource() {clearTimeout(sourceTimer);sourcePending=null;$('[data-source-error]').hidden=true;try{localStorage.removeItem(sourceKey);}catch{/* Optional persistence. */}}
  function queueSource() {
    sourcePending=$('[data-source]').value;updateSourceLines();
    try{localStorage.setItem(sourceKey,sourcePending);}catch{saving=false;}
    $('[data-save-status]').textContent=copy.sourcePending;clearTimeout(sourceTimer);sourceTimer=setTimeout(applySource,500);
  }
  function applySource() {
    if(sourcePending===null)return true;
    try {const next=importMarkdown(sourcePending,draft.kind,draft.path);checkpoint();draft=next;clearPendingSource();renderFields();renderBlocks();changed(true);return true;}
    catch {$('[data-source-error]').textContent=copy.sourceError;$('[data-source-error]').hidden=false;$('[data-copy]').disabled=true;return false;}
  }
  $('[data-source]').addEventListener('keydown',event=>{if(event.key==='Tab'){event.preventDefault();const area=event.target;area.setRangeText('  ',area.selectionStart,area.selectionEnd,'end');queueSource();}});
  function insertBlock(type) {
    if(!blockTypes.includes(type))return;
    if(sourcePending!==null&&!applySource())return;
    checkpoint();const block=newBlock(type),index=draft.blocks.findIndex(b=>b.id===activeBlockId);
    draft.blocks.splice(index<0?draft.blocks.length:index+1,0,block);changeMode('visual');setLayout('split');renderBlocks(block.id);changed(true);blockElement(block.id)?.scrollIntoView({block:'center'});
    if(!['paragraph','heading','table','list','quote','divider'].includes(type)){changeView('properties');if(innerWidth<=900)root.dataset.layout='preview';}
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
    ...blockTypes.map(type=>({label:copy.blocks[type],shortcut:copy.insert,keywords:type,run:()=>insertBlock(type)})),
  ];
  function renderCommands() {const query=$('[data-command-search]').value.toLocaleLowerCase().replace(/^\//,'').trim();commandItems=commandActions().filter(item=>(!insertOnly||item.shortcut===copy.insert)&&`${item.label} ${item.keywords||''}`.toLocaleLowerCase().includes(query));commandIndex=0;$('[data-command-results]').innerHTML=commandItems.length?commandItems.map((item,i)=>`<button id="ve-command-${i}" data-command-index="${i}" role="option" aria-selected="${i===0}"><span>${escapeHtml(item.label)}</span><small>${escapeHtml(item.shortcut||'')}</small></button>`).join(''):`<p class="ve-hint">${copy.noCommands}</p>`;updateCommandSelection();}
  function updateCommandSelection() {const buttons=[...root.querySelectorAll('[data-command-index]')];buttons.forEach((b,i)=>b.setAttribute('aria-selected',String(i===commandIndex)));const current=buttons[commandIndex];if(current){$('[data-command-search]').setAttribute('aria-activedescendant',current.id);current.scrollIntoView({block:'nearest'});}else $('[data-command-search]').removeAttribute('aria-activedescendant');}
  function openCommands(onlyInsert=false) {insertOnly=onlyInsert;$('[data-command-search]').value='';renderCommands();$('[data-command-dialog]').showModal();$('[data-command-search]').focus();}
  function runCommand(index) {const command=commandItems[index];if(!command)return;$('[data-command-dialog]').close();command.run();}
  root.querySelectorAll('[data-command-open]').forEach(button=>button.addEventListener('click',()=>openCommands()));
  root.querySelectorAll('[data-insert-open]').forEach(button=>button.addEventListener('click',()=>openCommands(true)));
  root.addEventListener('click',event=>{const after=event.target.closest('[data-insert-after]');if(after){selectBlock(after.dataset.insertAfter);openCommands(true);}});
  $('[data-command-search]').addEventListener('input',renderCommands);
  $('[data-command-results]').addEventListener('click',event=>{const button=event.target.closest('[data-command-index]');if(button)runCommand(Number(button.dataset.commandIndex));});
  $('[data-command-search]').addEventListener('keydown',event=>{if(event.isComposing)return;if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();commandIndex=(commandIndex+(event.key==='ArrowDown'?1:-1)+commandItems.length)%Math.max(1,commandItems.length);updateCommandSelection();}if(event.key==='Enter'){event.preventDefault();runCommand(commandIndex);}});
  function openFind() {$('[data-find-dialog]').showModal();$('[data-find-text]').focus();}
  $('[data-find-open]').addEventListener('click',openFind);
  for (const dialog of [$('[data-command-dialog]'),$('[data-find-dialog]')]) dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();});
  let findOffset=0,lastFind='';
  function findNext() {
    const query=$('[data-find-text]').value.toLocaleLowerCase();if(!query)return;
    if(query!==lastFind){findOffset=0;lastFind=query;}
    if(root.dataset.mode==='source'){const area=$('[data-source]'),haystack=area.value.toLocaleLowerCase();let index=haystack.indexOf(query,findOffset);if(index<0)index=haystack.indexOf(query);if(index<0){$('[data-find-status]').textContent=copy.noMatches;return;}findOffset=index+query.length;$('[data-find-dialog]').close();area.focus();area.setSelectionRange(index,findOffset);area.scrollTop=Math.max(0,area.value.slice(0,index).split('\n').length-4)*22;return;}
    const matches=draft.blocks.filter(b=>JSON.stringify([b.title,b.text,b.rows,b.args]).toLocaleLowerCase().includes(query));
    if(!matches.length){$('[data-find-status]').textContent=copy.noMatches;return;}
    const block=matches[findOffset%matches.length];findOffset++;$('[data-find-dialog]').close();setLayout('split');selectBlock(block.id,{scroll:true});blockElement(block.id)?.querySelector('[data-rich],input,textarea')?.focus();
  }
  $('[data-find-next]').addEventListener('click',findNext);$('[data-find-text]').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();findNext();}});
  $('[data-problems-toggle]').addEventListener('click',()=>{$('[data-problems]').hidden=!$('[data-problems]').hidden;});
  $('[data-problems-close]').addEventListener('click',()=>{$('[data-problems]').hidden=true;});
  $('[data-ui-locale]').addEventListener('change',event=>{const url=new URL(location.href);url.pathname=`/${event.target.value}/contribute/editor/`;location.href=url.href;});
  root.addEventListener('keydown',event=>{
    if(event.isComposing||event.target.closest('dialog'))return;
    const mod=event.metaKey||event.ctrlKey;
    if(mod&&((event.key.toLowerCase()==='k')||(event.shiftKey&&event.key.toLowerCase()==='p'))){event.preventDefault();openCommands();return;}
    if(mod&&event.key.toLowerCase()==='p'){event.preventDefault();$('[data-existing-open]').click();return;}
    if(mod&&event.key.toLowerCase()==='f'){event.preventDefault();openFind();return;}
    if(mod&&event.key.toLowerCase()==='s'){event.preventDefault();if(sourcePending!==null)applySource();save();return;}
    if(mod&&event.key.toLowerCase()==='b'&&!event.target.closest('[data-rich]')){event.preventDefault();root.toggleAttribute('data-sidebar-hidden');return;}
    if(mod&&event.key.toLowerCase()==='z'&&!event.target.matches('[data-source]')){event.preventDefault();(event.shiftKey?$('[data-redo]'):$('[data-undo]')).click();return;}
    if(event.key==='/'&&event.target.closest('[data-rich]')&&!event.target.closest('[data-rich]').textContent.trim()){event.preventDefault();openCommands(true);}
    if(event.key==='Enter'&&event.target.matches('.ve-heading-input')){event.preventDefault();insertBlock('paragraph');}
  });
  let draggedBlock=null;
  root.addEventListener('dragstart',event=>{const handle=event.target.closest('[data-drag-block]');if(!handle)return;draggedBlock=handle.dataset.dragBlock;event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',draggedBlock);});
  root.addEventListener('dragover',event=>{const block=event.target.closest('.ve-canvas [data-block]');if(!draggedBlock||!block)return;event.preventDefault();root.querySelectorAll('.is-dragover').forEach(el=>el.classList.remove('is-dragover'));block.classList.add('is-dragover');});
  root.addEventListener('drop',event=>{const target=event.target.closest('.ve-canvas [data-block]');if(!draggedBlock||!target)return;event.preventDefault();const from=draft.blocks.findIndex(b=>b.id===draggedBlock),to=draft.blocks.findIndex(b=>b.id===target.dataset.block);if(from>=0&&to>=0&&from!==to){checkpoint();const [block]=draft.blocks.splice(from,1);draft.blocks.splice(to,0,block);renderBlocks(block.id);changed(true);}draggedBlock=null;root.querySelectorAll('.is-dragover').forEach(el=>el.classList.remove('is-dragover'));});
  root.addEventListener('dragend',()=>{draggedBlock=null;root.querySelectorAll('.is-dragover').forEach(el=>el.classList.remove('is-dragover'));});
  window.addEventListener('beforeunload',event=>{if(!saving){event.preventDefault();event.returnValue='';}});

  renderFields(); renderBlocks(); output();
  $('[data-save-status]').textContent = saving ? copy.saved : copy.unsaved;
  try { const recovered=localStorage.getItem(sourceKey);if(recovered!==null){sourcePending=recovered;changeMode('source');$('[data-source-error]').hidden=false;$('[data-source-error]').textContent=copy.sourceRecovered;} } catch { /* Optional draft recovery. */ }
  if (target && sourceRequest(target) && !(draft.path === target && draft.originalMeta)) loadOriginal(target, hasWork());
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, {once:true});
else initialize();
