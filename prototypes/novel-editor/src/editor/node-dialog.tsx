import { useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/core';
import { Plus, Trash2, Upload, AlertCircle, Clock, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { TextField, ChoiceField } from '@/components/form-fields';
import { EntrySearch } from '@/components/entity-picker';
import { RichContentField } from './rich-content-field';
import katex from 'katex';
import { renderNestedMarkdown } from './extensions';
import { inlineLabels, blockLabels, serializeInline } from './extensions';
import { safeUrl } from '../../../../src/lib/visualEditor.mjs';
import { renderInlineShortcode } from '../../../../src/lib/wikiInlineShortcodes.mjs';
import { resolveMediaEmbed } from '../../../../src/lib/mediaEmbed.mjs';
import { sampleEditorPlayback } from '../../../../src/lib/editorPlaybackClock.mjs';
import { validLyricsTiming, parseLyricsBatch, formatLyricTimestamp } from '../../../../src/lib/editorLyrics.mjs';

export type NodeEditTarget = { editor: Editor; type: 'wikiInline' | 'wikiBlock' | 'image' | 'link'; attrs: any; position?: number; range: { from: number; to: number } };
const providers: [string, string][] = [['youtube', 'YouTube'], ['bilibili', 'Bilibili'], ['spotify', 'Spotify'], ['apple-music', 'Apple Music'], ['netease', '网易云音乐'], ['qq-music', 'QQ 音乐']];
export async function uploadLocalImage(file: File) {
  if (file.size > 10_000_000) throw new Error('图片不能超过 10 MB');
  const response = await fetch('/__novel/assets', { method: 'POST', body: file, headers: { 'Content-Type': file.type } });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || '图片保存失败');
  return result.url as string;
}
function InlineFields({ attrs, setAttrs }: { attrs: any; setAttrs: (attrs: any) => void }) {
  const labels = attrs.kind === 'ruby' ? ['文字', '振假名', '罗马字（可选）'] : attrs.kind === 'abbr' ? ['缩写', '完整名称'] : attrs.kind === 'time' ? ['显示文字', '日期或时间'] : attrs.kind === 'zh-variant' ? ['简体中文', '台湾繁体', '香港繁体'] : attrs.kind === 'math' ? ['公式'] : ['文字'];
  return <FieldGroup><ChoiceField label="格式" value={attrs.kind} onChange={kind => setAttrs({ ...attrs, kind, source: '', syntax: kind === 'math' ? 'math' : 'shortcode' })} options={Object.entries(inlineLabels)} />
    {labels.map((label, index) => <TextField key={label} label={label} value={attrs.args[index] || ''} onChange={value => { const args = [...attrs.args]; args[index] = value; setAttrs({ ...attrs, args, source: '' }); }} />)}
    <div className="wiki-content-preview" aria-label="格式预览" dangerouslySetInnerHTML={{ __html: attrs.kind === 'math' ? katex.renderToString(attrs.args[0] || '', { throwOnError: false, trust: false }) : renderNestedMarkdown(serializeInline({ ...attrs, source: '' })) }} />
  </FieldGroup>;
}
function MediaFields({ item, onChange }: { item: any; onChange: (item: any) => void }) {
  return <FieldGroup><ChoiceField label="媒体平台" value={item.provider || 'youtube'} onChange={provider => onChange({ ...item, provider })} options={providers} />
    <TextField label="媒体链接" value={item.url || ''} onChange={url => onChange({ ...item, url, provider: providers.find(([provider]) => resolveMediaEmbed(provider, url))?.[0] || item.provider })} placeholder="粘贴官方平台链接" />
  </FieldGroup>;
}
function LyricsFields({ rows, onChange }: { rows: any[]; onChange: (rows: any[]) => void }) {
  const [batch, setBatch] = useState(''); const [layout, setLayout] = useState('original-only'); const [importError, setImportError] = useState('');
  const [audioUrl, setAudioUrl] = useState(''); const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl]);
  const importLines = () => {
    try {
      const imported = parseLyricsBatch(batch, { layout }).rows;
      const next = rows.length === 1 && rows[0].original === '歌词' && !rows[0].time && !rows[0].translation ? imported : [...rows, ...imported];
      if (!validLyricsTiming(next)) throw new Error('时间需要依次递增。');
      onChange(next); setBatch(''); setImportError('');
    } catch { setImportError('请检查歌词行数、原文译文配对和时间顺序。'); }
  };
  const sampleTime = () => { const sample = sampleEditorPlayback(audio.current ? [audio.current] : [], []); return sample ? formatLyricTimestamp(sample.seconds, 3) : null; };
  const changeRow = (index: number, patch: any) => onChange(rows.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row));
  return <FieldGroup><details className="wiki-lyrics-import"><summary>批量添加歌词</summary><FieldGroup><ChoiceField label="粘贴格式" value={layout} onChange={setLayout} options={[["original-only", "每行一句原文"], ["alternating", "原文和译文交替"], ["auto", "识别带时间的歌词"]]} /><TextField label="粘贴歌词" value={batch} onChange={setBatch} multiline placeholder="一行一句，也可以粘贴 LRC 歌词" /><Button variant="outline" disabled={!batch.trim()} onClick={importLines}>添加这些歌词</Button>{importError ? <p role="alert">{importError}</p> : null}</FieldGroup></details>
    <Field><FieldLabel htmlFor="lyrics-audio">播放音频校时</FieldLabel><input id="lyrics-audio" type="file" accept="audio/*" onChange={event => { const file = event.target.files?.[0]; if (file) { setAudioUrl(URL.createObjectURL(file)); setPlaying(false); } }} />{audioUrl ? <audio ref={audio} controls src={audioUrl} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} /> : <p>选择音频并播放后，点击歌词旁的“记录时间”。</p>}</Field>
    {rows.map((row, index) => <section key={index} className="wiki-lyric-fields">
    <div className="flex items-center justify-between"><strong>第 {index + 1} 行</strong><Button size="icon-sm" variant="ghost" aria-label={`删除第 ${index + 1} 行歌词`} onClick={() => onChange(rows.filter((_row, rowIndex) => rowIndex !== index))}><Trash2 /></Button></div>
    {(row.units?.length ? row.units : [row]).map((unit: any, unitIndex: number) => {
      const changeUnit = (patch: any) => row.units?.length ? changeRow(index, { units: row.units.map((value: any, key: number) => key === unitIndex ? { ...value, ...patch } : value) }) : changeRow(index, patch);
      return <div className="grid gap-3 sm:grid-cols-2" key={unitIndex}><TextField label={row.units?.length ? `原文片段 ${unitIndex + 1}` : '原文'} value={unit.original || ''} onChange={original => changeUnit({ original })} />
        <TextField label={`时间戳 ${row.units?.length ? unitIndex + 1 : ''}`} value={unit.time || ''} onChange={time => changeUnit({ time })} placeholder="00:01.000" /><Button size="sm" variant="outline" disabled={!playing} onClick={() => { const time = sampleTime(); if (time) changeUnit({ time }); }}><Clock data-icon="inline-start" />记录时间</Button>
        <TextField label={`振假名 ${row.units?.length ? unitIndex + 1 : ''}`} value={unit.kana || ''} onChange={kana => changeUnit({ kana })} />
        <TextField label={`罗马字 ${row.units?.length ? unitIndex + 1 : ''}`} value={unit.romaji || ''} onChange={romaji => changeUnit({ romaji })} />{row.units?.length > 1 ? <Button variant="ghost" size="sm" onClick={() => changeRow(index, { units: row.units.filter((_: any, key: number) => key !== unitIndex) })}>删除片段 {unitIndex + 1}</Button> : null}</div>;
    })}
    <TextField label="译文" value={row.translation || ''} onChange={translation => changeRow(index, { translation })} />
    <Button size="sm" variant="outline" onClick={() => changeRow(index, { units: [...(row.units?.length ? row.units : [{ original: row.original, kana: row.kana, romaji: row.romaji, time: row.time }]), { original: '', kana: '', romaji: '', time: '' }] })}><Plus data-icon="inline-start" />添加逐字片段</Button>
  </section>)}<Button variant="outline" onClick={() => onChange([...rows, { original: '', kana: '', romaji: '', translation: '', time: '' }])}><Plus data-icon="inline-start" />添加歌词行</Button></FieldGroup>;
}
function DomainFields({ attrs, setAttrs }: { attrs: any; setAttrs: (attrs: any) => void }) {
  const data = attrs.data;
  const change = (patch: any) => setAttrs({ ...attrs, edited: true, data: { ...data, ...patch } });
  if (data.type === 'preserved') return <Alert><AlertDescription>这是保留的旧内容，保存时会完整保留原文。可在正文中移动或删除它。</AlertDescription></Alert>;
  if (data.type === 'lyrics') return <LyricsFields rows={data.rows || []} onChange={rows => change({ rows })} />;
  if (data.type === 'media') return <FieldGroup><MediaFields item={data} onChange={value => change(value)} /><TextField label="来源说明" value={data.caption || ''} onChange={caption => change({ caption })} /></FieldGroup>;
  if (data.type === 'media-switcher') return <FieldGroup><TextField label="标题" value={data.title || ''} onChange={title => change({ title })} />{(data.items || []).map((item: any, index: number) => <section className="wiki-media-fields" key={index}>
    <div className="flex items-center justify-between"><strong>媒体 {index + 1}</strong><div className="flex gap-1"><Button variant="ghost" size="icon-sm" disabled={index === 0} aria-label={`上移媒体 ${index + 1}`} onClick={() => { const items = [...data.items]; [items[index - 1], items[index]] = [items[index], items[index - 1]]; change({ items }); }}><ArrowUp /></Button><Button variant="ghost" size="icon-sm" disabled={index === data.items.length - 1} aria-label={`下移媒体 ${index + 1}`} onClick={() => { const items = [...data.items]; [items[index], items[index + 1]] = [items[index + 1], items[index]]; change({ items }); }}><ArrowDown /></Button><Button variant="ghost" size="icon-sm" disabled={data.items.length <= 2} aria-label={`删除媒体 ${index + 1}`} onClick={() => change({ items: data.items.filter((_item: any, key: number) => key !== index) })}><Trash2 /></Button></div></div>
    <MediaFields item={item} onChange={value => change({ items: data.items.map((entry: any, key: number) => key === index ? value : entry) })} />
  </section>)}<Button variant="outline" disabled={data.items.length >= 6} onClick={() => change({ items: [...data.items, { provider: 'youtube', url: '' }] })}><Plus data-icon="inline-start" />添加媒体</Button></FieldGroup>;
  if (data.type === 'details') return <FieldGroup><TextField label="折叠标题" value={data.title || ''} onChange={title => change({ title })} /><Field><FieldLabel>说明正文</FieldLabel><RichContentField value={data.text || ''} onChange={text => change({ text })} locale={data.locale} /></Field></FieldGroup>;
  if (data.type === 'math') return <FieldGroup><ChoiceField label="常用公式" value="custom" onChange={text => { if (text !== 'custom') change({ text }); }} options={[["custom", "选择模板或直接输入"], ["x^2 + y^2 = 1", "平方和"], ["\\frac{a}{b}", "分数"], ["\\sqrt{x}", "平方根"], ["\\sum_{i=1}^{n} x_i", "求和"]]} /><TextField label="公式" value={data.text || ''} onChange={text => change({ text })} placeholder="例如 x² 或 x^2" /><div className="wiki-content-preview" aria-label="公式预览" dangerouslySetInnerHTML={{ __html: katex.renderToString(data.text || '', { displayMode: true, throwOnError: false, trust: false }) }} /></FieldGroup>;
  return <Alert><AlertDescription>此内容会按原格式保留。</AlertDescription></Alert>;
}
export function NodeDialog({ target, onClose, locale }: { target: NodeEditTarget | null; onClose: () => void; locale: string }) {
  const [lastTarget, setLastTarget] = useState(target);
  const [attrs, setAttrs] = useState<any>(() => target ? structuredClone(target.attrs) : null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const activeTarget = useRef(target); activeTarget.current = target;
  const anchor = useRef<{ position?: number; from: number; to: number; invalid: boolean }>({ from: 0, to: 0, invalid: false });
  useEffect(() => {
    if (!target) return;
    anchor.current = { position: target.position, ...target.range, invalid: false };
    const moved = ({ transaction }: any) => {
      if (!transaction.docChanged) return;
      const current = anchor.current;
      if (current.position !== undefined) {
        const result = transaction.mapping.mapResult(current.position, 1);
        current.position = result.pos; current.invalid ||= result.deleted;
      }
      current.from = transaction.mapping.map(current.from, 1); current.to = transaction.mapping.map(current.to, -1);
    };
    target.editor.on('transaction', moved);
    return () => { target.editor.off('transaction', moved); };
  }, [target]);
  if (target !== lastTarget) {
    setLastTarget(target); setAttrs(target ? structuredClone(target.attrs) : null); setError(''); setUploading(false);
  }
  const save = () => {
    if (!target || !attrs) return;
    if (target.editor.isDestroyed || anchor.current.invalid) return setError('当前内容已关闭或移除，请重新选择。');
    const range = { from: anchor.current.from, to: anchor.current.to };
    const position = anchor.current.position;
    const count = target.type === 'wikiInline' ? inlineLabels[attrs.kind] ? ({ ruby: 3, abbr: 2, time: 2, 'zh-variant': 3 } as Record<string, number>)[attrs.kind] || 1 : attrs.args.length : 0;
    const nextAttrs = structuredClone(attrs);
    if (target.type === 'wikiInline') nextAttrs.args = attrs.args.slice(0, count).filter((arg: string, index: number) => attrs.kind !== 'ruby' || index < 2 || arg);
    if (target.type === 'wikiInline' && !attrs.args[0]?.trim()) return setError('请填写文字或公式。');
    if (target.type === 'wikiInline' && inlineLabels[attrs.kind] && attrs.kind !== 'math' && nextAttrs.args.some((arg: string) => /[{}\r\n]/.test(arg))) return setError('特殊格式的文字不能包含大括号或换行，请改用正文。');
    if (target.type === 'wikiInline' && inlineLabels[attrs.kind] && attrs.kind !== 'math' && !renderInlineShortcode(attrs.kind, nextAttrs.args)) return setError('请补全该格式需要的内容。');
    if ((target.type === 'image' || target.type === 'link') && !safeUrl(attrs.src || attrs.href)) return setError('请填写 HTTPS 链接或以 / 开头的站内地址。');
    if (target.type === 'wikiBlock') {
      const data = attrs.data;
      if (['details', 'media-switcher'].includes(data.type) && /[{}\r\n]/.test(data.title || '')) return setError('标题不能包含大括号或换行。');
      if (data.type === 'lyrics' && (!data.rows?.length || !validLyricsTiming(data.rows) || data.rows.some((row: any) => !(row.units?.length ? row.units.map((unit: any) => unit.original).join('') : row.original)?.trim()))) return setError('歌词不能为空；时间戳需使用 00:01.000 格式，并按时间递增。');
      if (data.type === 'media' && !resolveMediaEmbed(data.provider, data.url)) return setError('媒体链接无法识别，请检查平台和链接。');
      if (data.type === 'media-switcher' && (!data.title?.trim() || data.items.length < 2 || data.items.some((item: any) => !resolveMediaEmbed(item.provider, item.url)))) return setError('请填写标题，并提供至少两个有效媒体链接。');
      if (data.type === 'details' && !data.title?.trim()) return setError('请填写折叠标题。');
      nextAttrs.data.locale = locale;
    }
    if (target.type === 'link') {
      const chain = target.editor.chain().focus();
      if (range.from === range.to || attrs.text !== target.attrs.text) chain.insertContentAt(range, { type: 'text', text: attrs.text || attrs.href, marks: [{ type: 'link', attrs: { href: attrs.href } }] }).run();
      else chain.setTextSelection(range).setLink({ href: attrs.href }).run();
    } else if (position !== undefined) {
      const node = target.editor.state.doc.nodeAt(position);
      if (!node || node.type.name !== target.type) return setError('该内容的位置已改变，请重新选择。');
      target.editor.chain().focus().command(({ tr }) => { tr.setNodeMarkup(position!, undefined, { ...node.attrs, ...nextAttrs }); return true; }).run();
    } else target.editor.chain().focus().insertContentAt(range, { type: target.type, attrs: nextAttrs }).run();
    onClose();
  };
  const title = target?.type === 'wikiInline' ? inlineLabels[attrs?.kind] || '特殊语法' : target?.type === 'wikiBlock' ? blockLabels[attrs?.data?.type] || 'Wiki 内容' : target?.type === 'image' ? '图片与来源' : '链接';
  return <Dialog open={Boolean(target)} onOpenChange={open => { if (!open) onClose(); }}><DialogContent className="wiki-editor-dialog sm:max-w-2xl"><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{target?.type === 'wikiBlock' && attrs?.data?.type === 'lyrics' ? '保留逐字注音、罗马字、翻译与时间信息。' : '填写内容并查看预览，应用后即可继续写作。'}</DialogDescription></DialogHeader>
    <div className="wiki-dialog-body" key={target?.range.from + '-' + target?.type + '-' + target?.position}>{attrs && target ? target.type === 'wikiInline' ? <InlineFields attrs={attrs} setAttrs={setAttrs} /> : target.type === 'wikiBlock' ? <DomainFields attrs={attrs} setAttrs={setAttrs} /> : target.type === 'image' ? <FieldGroup>
      <details><summary className="wiki-link-picker-heading">从站内素材选择</summary><EntrySearch imagesOnly onSelect={entry => setAttrs({ ...attrs, src: entry.image || '', alt: entry.title, caption: '站内词条：' + entry.title })} /></details>
      <TextField label="图片地址" value={attrs.src || ''} onChange={src => setAttrs({ ...attrs, src })} />
      <Field><FieldLabel htmlFor="local-image-upload">上传本地图片</FieldLabel><input id="local-image-upload" className="wiki-file-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={uploading} onChange={async event => { const file = event.target.files?.[0]; if (!file) return; setUploading(true); try { const url = await uploadLocalImage(file); if (activeTarget.current !== target) return; setAttrs((current: any) => ({ ...current, src: url })); toast.success('图片已保存到本地原型'); } catch (error: any) { if (activeTarget.current === target) setError(error.message); } finally { if (activeTarget.current === target) setUploading(false); } }} /></Field>
      {safeUrl(attrs.src) ? <img className="wiki-dialog-image-preview" src={attrs.src} alt={attrs.alt || '所选图片预览'} /> : null}
      <TextField label="替代文字" value={attrs.alt || ''} onChange={alt => setAttrs({ ...attrs, alt })} />
      <TextField label="来源与说明" value={attrs.caption || ''} onChange={caption => setAttrs({ ...attrs, caption })} multiline />
    </FieldGroup> : <FieldGroup><details><summary className="wiki-link-picker-heading">选择 Wiki 词条链接</summary><EntrySearch onSelect={entry => { if (entry.url) setAttrs({ ...attrs, href: entry.url, text: entry.title }); else setError('这个旧词条暂时没有可用的阅读链接。'); }} /></details><TextField label="链接地址" value={attrs.href || ''} onChange={href => setAttrs({ ...attrs, href })} /><TextField label="显示文字" value={attrs.text || ''} onChange={text => setAttrs({ ...attrs, text })} /></FieldGroup> : null}</div>
    {error ? <Alert variant="destructive"><AlertCircle /><AlertDescription>{error}</AlertDescription></Alert> : null}
    <Separator /><DialogFooter><Button variant="outline" onClick={onClose}>取消</Button><Button disabled={uploading} onClick={save}>{uploading ? '正在保存图片…' : '应用'}</Button></DialogFooter>
  </DialogContent></Dialog>;
}
