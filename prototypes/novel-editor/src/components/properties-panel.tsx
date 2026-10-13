import { useEffect, useState } from 'react';
import { parseDocument, stringify } from 'yaml';
import { FileText, Plus, X, SlidersHorizontal, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FieldGroup } from '@/components/ui/field';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TextField, ChoiceField } from './form-fields';
import { SourceEditor } from './source-editor';
import type { WikiMetadata } from '@/lib/wiki-document';

export const entityTypeLabels: Record<string, string> = { 'virtual-avatar': '虚拟艺人', person: '人物', unit: '组合', 'software-voice': '音乐同位体', 'work-track': '歌曲', 'work-release': '唱片', project: '企划', organization: '组织', 'live-event': '演出', 'lore-concept': '设定', 'editorial-article': '文章' };
export type OutlineItem = { text: string; level: number; position: number };
export function PropertiesPanel({ metadata, onChange, outline, onNavigate, locked }: { metadata: WikiMetadata; onChange: (value: WikiMetadata) => void; outline: OutlineItem[]; onNavigate: (position: number) => void; locked: boolean }) {
  const [advanced, setAdvanced] = useState(false);
  const [tag, setTag] = useState('');
  const [addingTag, setAddingTag] = useState(false);
  const nameKey = metadata.name !== undefined ? 'name' : 'title';
  const tags = Array.isArray(metadata.tags) ? metadata.tags : [];
  const addTag = () => { const value = tag.trim(); if (value && !tags.includes(value)) onChange({ ...metadata, tags: [...tags, value] }); setTag(''); setAddingTag(false); };
  return <aside className="wiki-properties-content"><h2>词条属性</h2><FieldGroup>
    <TextField label="标题" value={metadata[nameKey] || ''} onChange={value => onChange({ ...metadata, [nameKey]: value })} />
    <ChoiceField label="语言" value={metadata.locale || 'zh'} disabled={locked} onChange={locale => onChange({ ...metadata, locale })} options={[['zh', '简体中文'], ['ja', '日本語'], ['en', 'English']]} />
    <ChoiceField label="类型" value={metadata.entityType || 'editorial-article'} disabled={locked} onChange={entityType => onChange({ ...metadata, entityType })} options={Object.entries(entityTypeLabels)} />
  </FieldGroup><section className="wiki-property-tags"><h3>标签</h3><div className="flex flex-wrap gap-2">{tags.map((value: string, index: number) => <Badge variant="secondary" key={value + index}>{value}<Button variant="ghost" size="icon-xs" aria-label={`移除标签 ${value}`} onClick={() => onChange({ ...metadata, tags: tags.filter((_tag: string, key: number) => key !== index) })}><X /></Button></Badge>)}</div>
    {addingTag ? <div className="wiki-tag-input"><TextField label="新标签" value={tag} onChange={setTag} /><Button size="sm" onClick={addTag}>添加</Button></div> : <Button variant="ghost" size="sm" onClick={() => setAddingTag(true)}><Plus data-icon="inline-start" />添加标签</Button>}
  </section><Separator /><section className="wiki-outline"><h3>内容大纲</h3>{outline.length ? outline.map((item, index) => <Button variant="ghost" className="wiki-outline-row" key={item.position + ':' + index} onClick={() => onNavigate(item.position)}><FileText data-icon="inline-start" /><span className="truncate">{item.text || '未命名章节'}</span></Button>) : <p>使用标题组织词条内容</p>}</section>
    <Button variant="ghost" className="wiki-advanced-button" onClick={() => setAdvanced(true)}><SlidersHorizontal data-icon="inline-start" />全部属性</Button><p className="wiki-storage-format">Markdown + Frontmatter</p>
    <MetadataDialog open={advanced} metadata={metadata} locked={locked} onChange={onChange} onClose={() => setAdvanced(false)} />
  </aside>;
}
function MetadataDialog({ open, metadata, locked, onChange, onClose }: { open: boolean; metadata: WikiMetadata; locked: boolean; onChange: (value: WikiMetadata) => void; onClose: () => void }) {
  const [value, setValue] = useState(''); const [error, setError] = useState('');
  useEffect(() => { if (open) { setValue(stringify(metadata, { lineWidth: 0 })); setError(''); } }, [open]);
  const apply = () => {
    try {
      const parsed = parseDocument(value); if (parsed.errors.length) throw new Error(parsed.errors[0].message);
      const next = parsed.toJS({ maxAliasCount: 100 });
      if (!next || Array.isArray(next) || typeof next !== 'object' || !['zh', 'ja', 'en'].includes(next.locale)) throw new Error('请提供包含有效语言的属性对象。');
      if (locked && (next.id !== metadata.id || next.entityType !== metadata.entityType || next.locale !== metadata.locale)) throw new Error('已有词条的永久 ID、类型和语言需要保持不变。');
      onChange(next); onClose();
    } catch (error: any) { setError(error.message); }
  };
  return <Dialog open={open} onOpenChange={value => { if (!value) onClose(); }}><DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>全部词条属性</DialogTitle><DialogDescription>编辑嵌套属性、关系、来源与展示配置。未修改的属性会继续保留。</DialogDescription></DialogHeader>
    <SourceEditor value={value} onChange={setValue} language="yaml" height="420px" label="词条 YAML 属性" />{error ? <Alert variant="destructive"><AlertCircle /><AlertDescription>{error}</AlertDescription></Alert> : null}
    <DialogFooter><Button variant="outline" onClick={onClose}>取消</Button><Button onClick={apply}>应用属性</Button></DialogFooter>
  </DialogContent></Dialog>;
}
