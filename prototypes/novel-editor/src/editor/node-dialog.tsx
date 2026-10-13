import { useState } from 'react';
import type { Editor } from '@tiptap/core';
import { Plus, Trash2, Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { TextField, ChoiceField } from '@/components/form-fields';
import { SourceEditor } from '@/components/source-editor';
import { inlineLabels, blockLabels, parseInlineSource, serializeInline } from './extensions';
import { safeUrl } from '../../../../src/lib/visualEditor.mjs';
import { renderInlineShortcode } from '../../../../src/lib/wikiInlineShortcodes.mjs';
import { resolveMediaEmbed } from '../../../../src/lib/mediaEmbed.mjs';
import { validLyricsTiming } from '../../../../src/lib/editorLyrics.mjs';

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
    {!inlineLabels[attrs.kind] ? <Field><FieldLabel>特殊语法原文</FieldLabel><SourceEditor value={serializeInline(attrs)} onChange={value => { const parsed = parseInlineSource(value); if (parsed) setAttrs(parsed); }} height="140px" /></Field> : null}
  </FieldGroup>;
}
function MediaFields({ item, onChange }: { item: any; onChange: (item: any) => void }) {
  return <FieldGroup><ChoiceField label="媒体平台" value={item.provider || 'youtube'} onChange={provider => onChange({ ...item, provider })} options={providers} />
    <TextField label="媒体链接" value={item.url || ''} onChange={url => onChange({ ...item, url })} placeholder="粘贴官方平台链接" />
  </FieldGroup>;
}
function LyricsFields({ rows, onChange }: { rows: any[]; onChange: (rows: any[]) => void }) {
  const changeRow = (index: number, patch: any) => onChange(rows.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row));
  return <FieldGroup>{rows.map((row, index) => <section key={index} className="wiki-lyric-fields">
    <div className="flex items-center justify-between"><strong>第 {index + 1} 行</strong><Button size="icon-sm" variant="ghost" aria-label={`删除第 ${index + 1} 行歌词`} onClick={() => onChange(rows.filter((_row, rowIndex) => rowIndex !== index))}><Trash2 /></Button></div>
    {(row.units?.length ? row.units : [row]).map((unit: any, unitIndex: number) => {
      const changeUnit = (patch: any) => row.units?.length ? changeRow(index, { units: row.units.map((value: any, key: number) => key === unitIndex ? { ...value, ...patch } : value) }) : changeRow(index, patch);
      return <div className="grid gap-3 sm:grid-cols-2" key={unitIndex}><TextField label={row.units?.length ? `原文片段 ${unitIndex + 1}` : '原文'} value={unit.original || ''} onChange={original => changeUnit({ original })} />
        <TextField label={`时间戳 ${row.units?.length ? unitIndex + 1 : ''}`} value={unit.time || ''} onChange={time => changeUnit({ time })} placeholder="00:01.000" />
        <TextField label={`振假名 ${row.units?.length ? unitIndex + 1 : ''}`} value={unit.kana || ''} onChange={kana => changeUnit({ kana })} />
        <TextField label={`罗马字 ${row.units?.length ? unitIndex + 1 : ''}`} value={unit.romaji || ''} onChange={romaji => changeUnit({ romaji })} /></div>;
    })}
    <TextField label="译文" value={row.translation || ''} onChange={translation => changeRow(index, { translation })} />
    <Button size="sm" variant="outline" onClick={() => changeRow(index, { units: [...(row.units?.length ? row.units : [{ original: row.original, kana: row.kana, romaji: row.romaji, time: row.time }]), { original: '', kana: '', romaji: '', time: '' }] })}><Plus data-icon="inline-start" />添加逐字片段</Button>
  </section>)}<Button variant="outline" onClick={() => onChange([...rows, { original: '', kana: '', romaji: '', translation: '', time: '' }])}><Plus data-icon="inline-start" />添加歌词行</Button></FieldGroup>;
}
function DomainFields({ attrs, setAttrs }: { attrs: any; setAttrs: (attrs: any) => void }) {
  const data = attrs.data;
  const change = (patch: any) => setAttrs({ ...attrs, edited: true, data: { ...data, ...patch } });
  if (data.type === 'preserved') return <FieldGroup><Field><FieldLabel>原文片段</FieldLabel><SourceEditor value={attrs.source || data.text || ''} onChange={source => setAttrs({ ...attrs, source, edited: false, data: { ...data, text: source } })} height="420px" /></Field></FieldGroup>;
  if (data.type === 'lyrics') return <LyricsFields rows={data.rows || []} onChange={rows => change({ rows })} />;
  if (data.type === 'media') return <FieldGroup><MediaFields item={data} onChange={value => change(value)} /><TextField label="来源说明" value={data.caption || ''} onChange={caption => change({ caption })} /></FieldGroup>;
  if (data.type === 'media-switcher') return <FieldGroup><TextField label="标题" value={data.title || ''} onChange={title => change({ title })} />{(data.items || []).map((item: any, index: number) => <section className="wiki-media-fields" key={index}>
    <div className="flex items-center justify-between"><strong>媒体 {index + 1}</strong><Button variant="ghost" size="icon-sm" disabled={data.items.length <= 2} aria-label={`删除媒体 ${index + 1}`} onClick={() => change({ items: data.items.filter((_item: any, key: number) => key !== index) })}><Trash2 /></Button></div>
    <MediaFields item={item} onChange={value => change({ items: data.items.map((entry: any, key: number) => key === index ? value : entry) })} />
  </section>)}<Button variant="outline" disabled={data.items.length >= 6} onClick={() => change({ items: [...data.items, { provider: 'youtube', url: '' }] })}><Plus data-icon="inline-start" />添加媒体</Button></FieldGroup>;
  if (data.type === 'details') return <FieldGroup><TextField label="折叠标题" value={data.title || ''} onChange={title => change({ title })} /><Field><FieldLabel>说明正文</FieldLabel><SourceEditor value={data.text || ''} onChange={text => change({ text })} /></Field></FieldGroup>;
  return <FieldGroup><Field><FieldLabel>公式</FieldLabel><SourceEditor value={data.text || ''} onChange={text => change({ text })} language="plain" height="180px" label="数学公式源码" /></Field></FieldGroup>;
}
export function NodeDialog({ target, onClose, locale }: { target: NodeEditTarget | null; onClose: () => void; locale: string }) {
  const [lastTarget, setLastTarget] = useState(target);
  const [attrs, setAttrs] = useState<any>(() => target ? structuredClone(target.attrs) : null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  if (target !== lastTarget) {
    setLastTarget(target); setAttrs(target ? structuredClone(target.attrs) : null); setError('');
  }
  const save = () => {
    if (!target || !attrs) return;
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
      const chain = target.editor.chain().focus().setTextSelection(target.range);
      if (target.range.from === target.range.to) chain.insertContent({ type: 'text', text: attrs.text || attrs.href, marks: [{ type: 'link', attrs: { href: attrs.href } }] }).run();
      else chain.setLink({ href: attrs.href }).run();
    } else if (target.position !== undefined) {
      const node = target.editor.state.doc.nodeAt(target.position);
      if (!node || node.type.name !== target.type) return setError('该内容的位置已改变，请重新选择。');
      target.editor.chain().focus().command(({ tr }) => { tr.setNodeMarkup(target.position!, undefined, { ...node.attrs, ...nextAttrs }); return true; }).run();
    } else target.editor.chain().focus().setTextSelection(target.range).insertContent({ type: target.type, attrs: nextAttrs }).run();
    onClose();
  };
  const title = target?.type === 'wikiInline' ? inlineLabels[attrs?.kind] || '特殊语法' : target?.type === 'wikiBlock' ? blockLabels[attrs?.data?.type] || 'Wiki 内容' : target?.type === 'image' ? '图片与来源' : '链接';
  return <Dialog open={Boolean(target)} onOpenChange={open => { if (!open) onClose(); }}><DialogContent className="wiki-editor-dialog sm:max-w-2xl"><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{target?.type === 'wikiBlock' && attrs?.data?.type === 'lyrics' ? '保留逐字注音、罗马字、翻译与时间信息。' : '修改内容后应用到当前词条。'}</DialogDescription></DialogHeader>
    <div className="wiki-dialog-body">{attrs && target ? target.type === 'wikiInline' ? <InlineFields attrs={attrs} setAttrs={setAttrs} /> : target.type === 'wikiBlock' ? <DomainFields attrs={attrs} setAttrs={setAttrs} /> : target.type === 'image' ? <FieldGroup>
      <TextField label="图片地址" value={attrs.src || ''} onChange={src => setAttrs({ ...attrs, src })} />
      <Field><FieldLabel htmlFor="local-image-upload">上传本地图片</FieldLabel><input id="local-image-upload" className="wiki-file-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={uploading} onChange={async event => { const file = event.target.files?.[0]; if (!file) return; setUploading(true); try { setAttrs({ ...attrs, src: await uploadLocalImage(file) }); toast.success('图片已保存到本地原型'); } catch (error: any) { setError(error.message); } finally { setUploading(false); } }} /></Field>
      <TextField label="替代文字" value={attrs.alt || ''} onChange={alt => setAttrs({ ...attrs, alt })} />
      <TextField label="来源与说明" value={attrs.caption || ''} onChange={caption => setAttrs({ ...attrs, caption })} multiline />
    </FieldGroup> : <FieldGroup><TextField label="链接地址" value={attrs.href || ''} onChange={href => setAttrs({ ...attrs, href })} />{target.range.from === target.range.to ? <TextField label="显示文字" value={attrs.text || ''} onChange={text => setAttrs({ ...attrs, text })} /> : null}</FieldGroup> : null}</div>
    {error ? <Alert variant="destructive"><AlertCircle /><AlertDescription>{error}</AlertDescription></Alert> : null}
    <Separator /><DialogFooter><Button variant="outline" onClick={onClose}>取消</Button><Button disabled={uploading} onClick={save}>{uploading ? '正在保存图片…' : '应用'}</Button></DialogFooter>
  </DialogContent></Dialog>;
}
