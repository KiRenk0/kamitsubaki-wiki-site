import { parseDocument } from 'yaml';
import { splitShortcodeArguments } from './shortcodeArguments.mjs';
import { resolveMediaEmbed } from './mediaEmbed.mjs';

export const entryTypes = ['artists', 'songs', 'albums', 'projects', 'logs'];
export const blockTypes = ['paragraph', 'heading', 'list', 'quote', 'image', 'table', 'media', 'ruby', 'details', 'lyrics', 'divider', 'inline', 'media-switcher', 'code', 'math'];
const field = (key, zh, en, ja, required = false, type = 'text') => ({ key, labels: { zh, en, ja }, required, type });
const common = [field('translationKey', '条目标识（各语言一致）', 'Entry key (shared across languages)', '記事キー（言語共通）', true), field('image', '封面图片地址', 'Cover image URL', 'カバー画像 URL')];
const title = field('title', '标题', 'Title', 'タイトル', true);
const artist = field('artist', '艺人名称', 'Artist name', 'アーティスト名', true);
const date = field('releaseDate', '发行日期', 'Release date', '発売日');
export const fields = {
  artists: [field('name', '名称', 'Name', '名前', true), field('romanizedName', '罗马字名称', 'Romanized name', 'ローマ字表記', true), ...common.map(f => f.key === 'image' ? { ...f, required: true } : f), field('profileTagline', '简短介绍', 'Short introduction', '短い紹介'), field('categoryTitle', '所属分类', 'Category', 'カテゴリ'), field('statusLabel', '状态栏标题', 'Status label', '状態ラベル', true), field('status', '活动状态', 'Status', '活動状況', true)],
  songs: [title, artist, field('artistId', '艺人标识（例如 kaf）', 'Artist ID (e.g. kaf)', 'アーティスト ID（例 kaf）', true), ...common, date, field('composer', '作曲', 'Composer', '作曲'), field('lyricist', '作词', 'Lyricist', '作詞'), field('album', '收录专辑', 'Album', '収録アルバム'), field('duration', '时长（分:秒）', 'Duration (MM:SS)', '長さ（分:秒）')],
  albums: [title, artist, ...common, date, field('type', '作品类型', 'Release type', '作品種別'), field('description', '介绍', 'Description', '紹介'), field('label', '厂牌', 'Label', 'レーベル'), field('catalogNumber', '唱片编号', 'Catalog number', '品番'), field('trackCount', '曲目数量', 'Track count', '曲数', false, 'number')],
  projects: [title, ...common.filter(f => f.key !== 'image'), field('description', '简短介绍', 'Description', '短い紹介', true), field('kind', '企划类型', 'Project kind', '企画種別', true), field('order', '排序编号', 'Sort order', '表示順', true, 'number'), date],
  logs: [title, ...common.filter(f => f.key !== 'image'), field('date', '记录日期', 'Record date', '記録日', true), field('type', '记录类型', 'Record type', '記録種別', true), field('order', '排序编号', 'Sort order', '表示順', true, 'number'), field('summary', '摘要', 'Summary', '概要'), field('eventDate', '活动日期', 'Event date', '開催日'), field('eventSource', '官方来源链接', 'Official source URL', '公式出典 URL')],
};
export const escapeText = value => String(value ?? '').replace(/[\\`*_{}\[\]<>#|~]/g, '\\$&');
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
export function safeUrl(value) { return /^(?:https?:\/\/[^\s<>"']+|\/(?!\/)[^\s<>"']*)$/i.test(String(value)); }
export function validPath(path) { return /^src\/content\/(artists|songs|albums|projects|logs)\/(?:[^./\\\s][^/\\\s]*\/)+(zh|ja|en)\.md$/.test(path) && !path.split('/').some(p => p === '..' || p === '.'); }
export function newBlock(type) {
  const b = { id: globalThis.crypto.randomUUID(), type, text: '' };
  if (type === 'heading') b.level = '2';
  if (type === 'list') b.ordered = false;
  if (type === 'image') Object.assign(b, { url: '', caption: '' });
  if (type === 'table') b.rows = [['', ''], ['', '']];
  if (type === 'media') Object.assign(b, { provider: 'youtube', url: '' });
  if (type === 'ruby') Object.assign(b, { kana: '', romaji: '' });
  if (type === 'details') b.title = '';
  if (type === 'inline') Object.assign(b, {kind:'mark',args:['']});
  if (type === 'media-switcher') Object.assign(b,{title:'',items:[{provider:'youtube',url:''},{provider:'bilibili',url:''}]});
  if (type === 'code') b.language = 'text';
  if (type === 'math') b.display = true;
  if (type === 'lyrics') b.rows = [{ original: '', kana: '', romaji: '', translation: '' }];
  return b;
}
export function newDraft(kind = 'projects', locale = 'zh') {
  const meta = { locale, translationKey: '' };
  if (kind === 'artists') Object.assign(meta, { name: '', romanizedName: '', statusLabel: 'STATUS', status: 'ACTIVE', image: '' });
  else meta.title = '';
  if (kind === 'projects') Object.assign(meta, { description: '', kind: 'PROJECT', order: 0 });
  if (kind === 'logs') Object.assign(meta, { date: '', type: 'EVENT', order: 0 });
  return { version: 1, kind, meta, originalMeta: '', path: '', blocks: [newBlock('paragraph')] };
}
const shortcodeArg = s => String(s || '').replaceAll('\\', '\\\\').replaceAll('::', '\\:\\:');
const dest = s => String(s || '').replaceAll('(', '%28').replaceAll(')', '%29');
export function blockMarkdown(b, locale = 'zh') {
  if (b.originalSource !== undefined && b.originalSnapshot === blockSnapshot(b)) return b.type === 'lyrics' ? b.originalSource.replace(/\{\{lyrics-controls::(?:zh|ja|en)\}\}/g, `{{lyrics-controls::${locale}}}`) : b.originalSource;
  switch (b.type) {
    case 'paragraph': return b.text;
    case 'inline': return `{{${b.kind}::${b.args.filter((arg,i)=>b.kind!=='ruby'||i<2||arg).map(shortcodeArg).join('::')}}}`;
    case 'media-switcher': return `{{media-switcher::${shortcodeArg(b.title)}}}\n\n${b.items.map(item => blockMarkdown({...item,type:'media'})).join('\n\n')}\n\n{{/media-switcher}}`;
    case 'code': { const fence = '`'.repeat(Math.max(3,...(b.text.match(/`+/g)||[]).map(run=>run.length+1))); return `${fence}${b.language || 'text'}\n${b.text}\n${fence}`; }
    case 'math': return b.display ? `$$\n${b.text}\n$$` : `$${b.text}$`;
    case 'heading': return `${'#'.repeat(Math.max(2,Math.min(6,Number(b.level)||2)))} ${escapeText(b.text)}`;
    case 'list': return b.text.split('\n').filter(Boolean).map((line, i) => `${b.ordered ? `${i + 1}.` : '-'} ${escapeText(line)}`).join('\n');
    case 'quote': return b.text.split('\n').map(line => `> ${escapeText(line)}`).join('\n');
    case 'image': return `![${escapeText(b.text)}](${dest(b.url)})${b.caption ? `\n\n${escapeText(b.caption)}` : ''}`;
    case 'table': return b.rows.map((row, i) => `| ${row.map(cell => escapeText(cell).replaceAll('\n', '<br>')).join(' | ')} |${i === 0 ? '\n| ' + row.map(() => '---').join(' | ') + ' |' : ''}`).join('\n');
    case 'media': return `@[${b.provider}](${dest(b.url)}${b.caption ? ` "${String(b.caption).replaceAll('\\','\\\\').replaceAll('"','\\"')}"` : ''})`;
    case 'ruby': return `{{ruby::${shortcodeArg(b.text)}::${shortcodeArg(b.kana)}${b.romaji ? `::${shortcodeArg(b.romaji)}` : ''}}}`;
    case 'details': return `{{details::${shortcodeArg(b.title)}}}\n\n${b.text}\n\n{{/details}}`;
    case 'lyrics': return `{{lyrics-controls::${locale}}}\n\n<div class="my-lyric-box">\n\n${b.rows.map(r => `<div class="lyric-line">\n<div class="jp-lyric">${(r.units?.length ? r.units : [r]).map(unit => `${unit.time ? `[${unit.time}]` : ''}${unit.kana || unit.romaji ? `<ruby>${escapeHtml(unit.original)}${unit.kana ? `<rt class="furi">${escapeHtml(unit.kana)}</rt>` : ''}${unit.romaji ? `<rt class="roma">${escapeHtml(unit.romaji)}</rt>` : ''}</ruby>` : escapeHtml(unit.original)}`).join('')}</div>\n<div class="cn-lyric">${(r.units?.[0]?.time || r.time) ? `[${r.units?.[0]?.time || r.time}]` : ''}${escapeHtml(r.translation)}</div>\n</div>`).join('\n\n')}\n\n</div>`;
    case 'divider': return '---';
    case 'preserved': return b.text;
    default: throw new Error('Unknown block');
  }
}
export function exportMarkdown(draft) {
  const doc = parseDocument(draft.originalMeta || '{}');
  if (doc.errors.length) throw new Error('Invalid frontmatter');
  if (!draft.originalMeta) doc.contents.flow = false;
  const old = doc.toJS({ maxAliasCount: 100 });
  const outputMeta = structuredClone(draft.meta);
  if (outputMeta.license?.sourceUrl === '' && old?.license?.sourceUrl !== '') delete outputMeta.license.sourceUrl;
  if (outputMeta.duration === '' && old?.duration !== '') delete outputMeta.duration;
  for (const key of Object.keys(old || {})) if (!(key in outputMeta)) doc.delete(key);
  for (const [key, value] of Object.entries(outputMeta)) {
    if (JSON.stringify(old?.[key]) !== JSON.stringify(value)) doc.set(key, value);
  }
  const body = draft.blocks.map(b => blockMarkdown(b, draft.meta.locale)).join('\n\n');
  return `---\n${doc.toString().trimEnd()}\n---\n\n${body}\n`;
}
export function importMarkdown(source, kind, path = '') {
  if (source.length > 1_000_000) throw new Error('fileSize');
  const match = source.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
  if (!match) throw new Error('frontmatter');
  const doc = parseDocument(match[1]);
  if (doc.errors.length || !doc.contents || !doc.contents.items) throw new Error('frontmatter');
  const meta = doc.toJS({ maxAliasCount: 100 });
  if (!meta || Array.isArray(meta) || !['zh','ja','en'].includes(meta.locale)) throw new Error('localeError');
  kind = meta.name !== undefined ? 'artists' : meta.artistId !== undefined ? 'songs' : meta.artist !== undefined ? 'albums' : meta.kind !== undefined ? 'projects' : meta.date !== undefined && meta.type !== undefined ? 'logs' : kind;
  const trimLines = value => value.replace(/^\s*\n|\n\s*$/g, '');
  const body = trimLines(match[2]);
  const blocks = parseVisualBlocks(body);
  return { version: 1, kind, meta, originalMeta: match[1], path, blocks: blocks.length ? blocks : [newBlock('paragraph')] };
}
export function validateDraft(draft) {
  const errors = [];
  for (const f of fields[draft.kind] || []) {
    const v = draft.meta[f.key];
    if (f.required && (v === undefined || v === null || String(v).trim() === '')) errors.push(f.key);
    if (f.type === 'number' && v !== undefined && (!Number.isFinite(Number(v)) || (f.key === 'trackCount' && (!Number.isInteger(Number(v)) || Number(v) < 0)))) errors.push(f.key);
  }
  for (const key of ['releaseDate', 'eventDate']) if (draft.meta[key] && !/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/.test(draft.meta[key])) errors.push(key);
  if (draft.meta.artistId && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.meta.artistId)) errors.push('artistId');
  if (draft.meta.duration && !/^\d{1,2}:\d{2}(?::\d{2})?$/.test(draft.meta.duration)) errors.push('duration');
  if (draft.path && (!validPath(draft.path) || !draft.path.startsWith(`src/content/${draft.kind}/`) || !draft.path.endsWith(`/${draft.meta.locale}.md`))) errors.push('path');
  for (const b of draft.blocks) {
    if (b.type === 'image' && !safeUrl(b.url)) errors.push('url');
    if (b.type === 'media' && !resolveMediaEmbed(b.provider, b.url)) errors.push('url');
    if (b.type === 'inline' && (!['ruby','spoiler','mark','abbr','kbd','time','small','sub','sup','zh-variant'].includes(b.kind) || b.args.filter((arg,i)=>b.kind!=='ruby'||i<2||arg).some(arg => !String(arg).trim() || /[{}\n]/.test(arg)))) errors.push('inline');
    if (b.type === 'media-switcher' && (!b.title || /[{}\n]/.test(b.title) || b.items.length < 2 || b.items.length > 6 || b.items.some(item=>!resolveMediaEmbed(item.provider,item.url)))) errors.push('media-switcher');
    if (b.type === 'code' && !/^[a-z0-9_-]+$/i.test(b.language)) errors.push('code');
    if (b.type === 'lyrics') {
      let previous = -1;
      for (const row of b.rows) for (const unit of row.units?.length ? row.units : [row]) if (unit.time) {
        const match = unit.time.match(/^(\d{2}):([0-5]\d)\.(\d{2,3})$/);
        const time = match ? Number(match[1])*60+Number(match[2])+Number('0.'+match[3]) : -1;
        if (!match || time < previous) errors.push('lyrics');
        previous = time;
      }
    }
    if (b.type === 'ruby' && (!b.text || !b.kana || /[{}\n]/.test(b.text + b.kana + b.romaji))) errors.push('ruby');
    if (b.type === 'details' && (!b.title || /[{}\n]/.test(b.title))) errors.push('details');
  }
  return [...new Set(errors)];
}

function blockSnapshot(block) { return JSON.stringify(Object.fromEntries(Object.entries(block).filter(([key])=>!['id','originalSource','originalSnapshot'].includes(key)))); }
function keepOriginal(block, source) { block.originalSource = source; block.originalSnapshot = blockSnapshot(block); return block; }
const decode = value => String(value || '').replace(/&(?:amp|lt|gt|quot|apos|#39|#x[0-9a-f]+|#\d+);/gi,entity=>{ const common={'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&#39;':"'"}; if(common[entity]) return common[entity]; const code=entity.startsWith('&#x') ? parseInt(entity.slice(3,-1),16) : parseInt(entity.slice(2,-1),10); return Number.isFinite(code)&&code<=0x10ffff ? String.fromCodePoint(code) : entity; });
function mediaBlock(text) {
  const match = text.trim().match(/^@\[([^\]]+)\]\((.+)\)$/);
  if (!match) return null;
  const caption = match[2].match(/^(.*?)\s+"(.*)"$/);
  const target = caption ? caption[1] : match[2];
  const media = resolveMediaEmbed(match[1],target);
  return media ? {...newBlock('media'),provider:media.provider,url:target,caption:caption?.[2] || ''} : null;
}
function lyricBlock(source) {
  const rows = [];
  for (const segment of source.split(/<div\s+class=["']lyric-line["'][^>]*>/).slice(1)) {
    const jp = segment.match(/<div\s+class=["']jp-lyric["'][^>]*>([\s\S]*?)<\/div>/)?.[1];
    const translation = segment.match(/<div\s+class=["'](?:cn-lyric|trans-lyric)["'][^>]*>([\s\S]*?)<\/div>/)?.[1] || '';
    if (jp === undefined || /<(?!\/?(?:ruby|rt|rp)\b)/i.test(jp) || /<(?!br\b)/i.test(translation)) return null;
    const units = []; let time = '';
    for (const token of jp.match(/\[\d{2}:\d{2}\.\d{2,3}\]|<ruby[^>]*>[\s\S]*?<\/ruby>|[^<\[]+/g) || []) {
      if (/^\[/.test(token)) { time=token.slice(1,-1); continue; }
      let original=token, kana='',romaji='';
      if (token.startsWith('<ruby')) {
        kana=decode(token.match(/<rt(?:\s+class=["']furi["'])?>([\s\S]*?)<\/rt>/)?.[1]||'');
        romaji=decode(token.match(/<rt\s+class=["']roma["']>([\s\S]*?)<\/rt>/)?.[1]||'');
        original=token.replace(/<rt[^>]*>[\s\S]*?<\/rt>|<rp[^>]*>[\s\S]*?<\/rp>|<\/?ruby[^>]*>/g,'');
      }
      original=decode(original).trim(); if(original) units.push({original,kana,romaji,time}); time='';
    }
    rows.push({original:units.map(u=>u.original).join(''),kana:'',romaji:'',translation:decode(translation.replace(/^\s*\[\d{2}:\d{2}\.\d{2,3}\]/,'')).trim(),units});
  }
  return rows.length ? {...newBlock('lyrics'),rows} : null;
}
export function parseVisualBlocks(body) {
  const lines = body.replaceAll('\r\n','\n').split('\n'); const blocks=[];
  const push=(block,source)=>blocks.push(keepOriginal(block,source));
  for (let i=0;i<lines.length;) {
    if(!lines[i].trim()) {i++;continue;}
    const start=i, line=lines[i]; let block;
    const fence=line.match(/^(`{3,}|~{3,})([a-z0-9_-]*)\s*$/i);
    if(fence) {i++;const content=[];while(i<lines.length&&!new RegExp(`^${fence[1][0]}{${fence[1].length},}\\s*$`).test(lines[i]))content.push(lines[i++]);if(i<lines.length)i++;block={...newBlock('code'),text:content.join('\n'),language:fence[2]||'text'};}
    else if(line.trim()==='$$') {i++;const content=[];while(i<lines.length&&lines[i].trim()!=='$$')content.push(lines[i++]);if(i<lines.length)i++;block={...newBlock('math'),text:content.join('\n')};}
    else if(/^\{\{(?:details|media-switcher)::/.test(line)) {
      const name=line.startsWith('{{details')?'details':'media-switcher', open=line.match(/^\{\{[a-z-]+(::(?:\\.|[^{}])+)\}\}$/); i++; let depth=1;const inner=[];
      while(i<lines.length){if(lines[i].startsWith(`{{${name}::`))depth++;if(lines[i]===`{{/${name}}}`&&--depth===0){i++;break;}inner.push(lines[i++]);}
      if(!open||depth!==0)block={...newBlock('preserved'),text:lines.slice(start,i).join('\n')};
      else if(name==='details')block={...newBlock('details'),title:splitShortcodeArguments(open[1])[0],text:inner.join('\n').trim()};
      else {const items=inner.filter(s=>s.trim()).map(mediaBlock);block=items.every(Boolean)&&items.length>=2&&items.length<=6?{...newBlock('media-switcher'),title:splitShortcodeArguments(open[1])[0],items}: {...newBlock('preserved'),text:lines.slice(start,i).join('\n')};}
    }
    else if(/^\{\{lyrics-controls::/.test(line)||/<div\s+class=["']my-lyric-box["']/.test(line)) {
      let depth=0,opened=false;
      do {const current=lines[i++];depth+=(current.match(/<div\b/g)||[]).length-(current.match(/<\/div>/g)||[]).length;if(current.includes('my-lyric-box'))opened=true;} while(i<lines.length&&(!opened||depth>0));
      const source=lines.slice(start,i).join('\n');block=lyricBlock(source)||{...newBlock('preserved'),text:source};
    }
    else if(/^#{2,6} /.test(line)) {const match=line.match(/^(#{2,6}) (.*)$/);block={...newBlock('heading'),level:String(match[1].length),text:match[2]};i++;}
    else if(mediaBlock(line)){block=mediaBlock(line);i++;}
    else if(/^!\[[^\]]*\]\([^\n]+\)$/.test(line)){const match=line.match(/^!\[([^\]]*)\]\((.+)\)$/);block={...newBlock('image'),text:match[1],url:match[2]};i++;}
    else if(/^---+$/.test(line)){block=newBlock('divider');i++;}
    else if(/^<(?:div|details|figure|table)\b/i.test(line)) {const tag=line.match(/^<([a-z]+)/i)[1];let depth=0;do{depth+=(lines[i].match(new RegExp(`<${tag}\\b`,'gi'))||[]).length-(lines[i].match(new RegExp(`</${tag}>`,'gi'))||[]).length;i++;}while(i<lines.length&&depth>0);block={...newBlock('paragraph'),text:lines.slice(start,i).join('\n')};}
    else {i++;while(i<lines.length&&lines[i].trim()&&!/^#{2,6} |^\{\{(?:details|media-switcher|lyrics-controls)::|^@\[/.test(lines[i]))i++;block={...newBlock('paragraph'),text:lines.slice(start,i).join('\n')};}
    push(block,lines.slice(start,i).join('\n'));
  }
  return blocks;
}
