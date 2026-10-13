import { useEffect, useState } from 'react';
import type { Editor } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
import { blockLabels, inlineLabels } from '@/editor/extensions';
import { openLink } from '@/editor/toolbar';
import type { NodeEditTarget } from '@/editor/node-dialog';

import { MetadataFields } from './metadata-fields';
import { Plus, X, SlidersHorizontal, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FieldGroup } from '@/components/ui/field';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TextField, ChoiceField } from './form-fields';

import type { WikiMetadata } from '@/lib/wiki-document';

export const entityTypeLabels: Record<string, string> = { 'virtual-avatar': '虚拟艺人', person: '人物', unit: '组合', 'software-voice': '音乐同位体', 'work-track': '歌曲', 'work-release': '唱片', project: '企划', organization: '组织', 'live-event': '演出', 'lore-concept': '设定', 'editorial-article': '文章' };
export type OutlineItem = { text: string; level: number; position: number };
export function PropertiesPanel({ metadata, onChange, locked, editor, open, pending = false }: { metadata: WikiMetadata; onChange: (value: WikiMetadata) => void; editor: Editor | null; open: (target: NodeEditTarget) => void; locked: boolean; pending?: boolean }) {
  const [advanced, setAdvanced] = useState(false);
  const [tag, setTag] = useState('');
  const [addingTag, setAddingTag] = useState(false);
  const nameKey = metadata.name !== undefined ? 'name' : 'title';
  const tags = Array.isArray(metadata.tags) ? metadata.tags : [];
  const addTag = () => { const value = tag.trim(); if (value && !tags.includes(value)) onChange({ ...metadata, tags: [...tags, value] }); setTag(''); setAddingTag(false); };
  if (pending) return <aside className="wiki-properties-content"><h2>词条属性</h2><Alert><AlertDescription>请先应用或放弃源码修改，再调整文档属性。</AlertDescription></Alert></aside>;
  return <aside className="wiki-properties-content"><h2>词条属性</h2><SelectionProperties editor={editor} open={open} /><FieldGroup>
    <TextField label="标题" value={metadata[nameKey] || ''} onChange={value => onChange({ ...metadata, [nameKey]: value })} />
    <ChoiceField label="语言" value={metadata.locale || 'zh'} disabled={locked} onChange={locale => onChange({ ...metadata, locale })} options={[['zh', '简体中文'], ['ja', '日本語'], ['en', 'English']]} />
    <ChoiceField label="类型" value={metadata.entityType || 'editorial-article'} disabled={locked} onChange={entityType => onChange({ ...metadata, entityType })} options={Object.entries(entityTypeLabels)} />
    <TextField label="简介" value={metadata.summary || ''} multiline onChange={summary => onChange({ ...metadata, summary })} />
    {['work-track', 'work-release'].includes(metadata.entityType) ? <TextField label="发行日期" value={metadata.releaseDate || ''} onChange={releaseDate => onChange({ ...metadata, releaseDate })} placeholder="2026-10-13" /> : null}
  </FieldGroup><section className="wiki-property-tags"><h3>标签</h3><div className="flex flex-wrap gap-2">{tags.map((value: string, index: number) => <Badge variant="secondary" key={value + index}>{value}<Button variant="ghost" size="icon-xs" aria-label={`移除标签 ${value}`} onClick={() => onChange({ ...metadata, tags: tags.filter((_tag: string, key: number) => key !== index) })}><X /></Button></Badge>)}</div>
    {addingTag ? <div className="wiki-tag-input"><TextField label="新标签" value={tag} onChange={setTag} /><Button size="sm" onClick={addTag}>添加</Button></div> : <Button variant="ghost" size="sm" onClick={() => setAddingTag(true)}><Plus data-icon="inline-start" />添加标签</Button>}
  </section><Separator />
    <Button variant="ghost" className="wiki-advanced-button" onClick={() => setAdvanced(true)}><SlidersHorizontal data-icon="inline-start" />全部属性</Button><p className="wiki-storage-format">Markdown + Frontmatter</p>
    <MetadataDialog open={advanced} metadata={metadata} locked={locked} onChange={onChange} onClose={() => setAdvanced(false)} />
  </aside>;
}
function SelectionProperties({ editor, open }: { editor: Editor | null; open: (target: NodeEditTarget) => void }) {
  if (!editor) return null;
  const selection = editor.state.selection;
  const node = selection instanceof NodeSelection ? selection.node : null;
  if (node && ['wikiInline', 'wikiBlock', 'image'].includes(node.type.name)) {
    const label = node.type.name === 'wikiInline' ? inlineLabels[node.attrs.kind] || '特殊文字' : node.type.name === 'wikiBlock' ? blockLabels[node.attrs.data.type] || 'Wiki 内容' : '图片与来源';
    return <section className="wiki-selection-properties"><h3>当前选择 · {label}</h3><p>{node.attrs.args?.[0] || node.attrs.data?.title || node.attrs.alt || ''}</p>{node.attrs.data?.type !== 'preserved' ? <Button variant="outline" size="sm" onClick={() => open({ editor, position: selection.from, range: { from: selection.from, to: selection.to }, type: node.type.name as NodeEditTarget['type'], attrs: node.attrs })}>编辑{label}</Button> : null}</section>;
  }
  if (editor.isActive('table')) return <section className="wiki-selection-properties"><h3>当前选择 · 表格</h3><p>通过上方的行、列和单元格菜单调整表格。拖动列边缘可调整宽度。</p></section>;
  if (editor.isActive('link')) return <section className="wiki-selection-properties"><h3>当前选择 · 链接</h3><Button variant="outline" size="sm" onClick={() => openLink(editor, open)}>编辑链接</Button><Button variant="ghost" size="sm" onClick={() => editor.chain().focus().extendMarkRange('link').unsetLink().run()}>移除链接</Button></section>;
  return null;
}
function MetadataDialog({ open, metadata, locked, onChange, onClose }: { open: boolean; metadata: WikiMetadata; locked: boolean; onChange: (value: WikiMetadata) => void; onClose: () => void }) {
  const [value, setValue] = useState<WikiMetadata>({}); const [error, setError] = useState('');
  useEffect(() => { if (open) { setValue(structuredClone(metadata)); setError(''); } }, [open]);
  const apply = () => {
    try {
      const next = value;
      if (!next || Array.isArray(next) || typeof next !== 'object' || !['zh', 'ja', 'en'].includes(next.locale)) throw new Error('请提供包含有效语言的属性对象。');
      if (locked && (next.id !== metadata.id || next.entityType !== metadata.entityType || next.locale !== metadata.locale)) throw new Error('已有词条的永久 ID、类型和语言需要保持不变。');
      onChange(next); onClose();
    } catch (error: any) { setError(error.message); }
  };
  return <Dialog open={open} onOpenChange={value => { if (!value) onClose(); }}><DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>全部词条属性</DialogTitle><DialogDescription>通过表单编辑关系、来源与展示配置，已有资料会保留。</DialogDescription></DialogHeader>
    <div className="wiki-dialog-body"><MetadataFields value={value} onChange={setValue} locked={locked} /></div>{error ? <Alert variant="destructive"><AlertCircle /><AlertDescription>{error}</AlertDescription></Alert> : null}
    <DialogFooter><Button variant="outline" onClick={onClose}>取消</Button><Button onClick={apply}>应用属性</Button></DialogFooter>
  </DialogContent></Dialog>;
}
