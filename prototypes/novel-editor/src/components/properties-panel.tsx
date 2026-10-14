import {workbenchText as t} from '@/lib/workbench-copy';
import { useId, useRef, useState } from 'react';

import { MetadataFields } from './metadata-fields';
import { Plus, X, SlidersHorizontal, Check, PanelRightClose } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FieldGroup, FieldSet, FieldLegend, FieldDescription } from '@/components/ui/field';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TextField, ChoiceField } from './form-fields';

import type { WikiMetadata } from '@/lib/wiki-document';
import { newDraft } from '../../../../src/lib/visualEditor.mjs';
import { collectionByType } from '../../../../src/lib/contentLayout.mjs';
import { metadataSections, metadataGuide } from '@/lib/metadata-guide';
import { Input } from '@/components/ui/input';

export const entityTypeLabels: Record<string, string> = { 'virtual-avatar': '虚拟艺人', person: '人物', unit: '组合', 'software-voice': '音乐同位体', 'work-track': '歌曲', 'work-release': '唱片', project: '企划', organization: '组织', 'live-event': '演出', 'lore-concept': '设定', 'editorial-article': '文章' };
export type OutlineItem = { text: string; level: number; position: number };
export function PropertiesPanel({ metadata, onChange, locked, pending = false, onClose }: { onClose?: () => void; metadata: WikiMetadata; onChange: (value: WikiMetadata) => void; locked: boolean; pending?: boolean }) {
  const [tag, setTag] = useState('');
  const prefix = useId(); const root = useRef<HTMLElement>(null);
  const articleMode = metadata.entityType === 'editorial-article';
  const originalSections = metadataSections(metadata);
  const sections = articleMode ? { basic: [], domain: ['articleCategory'], relations: ['relatedEntities'], display: [], other: Object.keys(metadata).filter(key => !['schemaVersion','id','locale','entityType','title','summary','articleCategory','relatedEntities','articleMediaRefs'].includes(key)) } : originalSections;
  const section = (key: string, title: string, description: string, fields: string[]) => <section id={prefix + key} className="wiki-property-section" key={key}><FieldSet><FieldLegend>{title}</FieldLegend><FieldDescription>{description}</FieldDescription><MetadataFields value={metadata} onChange={onChange} locked={locked} include={fields} /></FieldSet></section>;
  const navigate = (key: string) => {
    const section = root.current?.querySelector<HTMLElement>(`[id="${prefix + key}"]`);
    if (!section) return;
    let scroll = root.current?.parentElement;
    while (scroll && !/auto|scroll/.test(getComputedStyle(scroll).overflowY)) scroll = scroll.parentElement;
    if (!scroll) return;
    const headerHeight = root.current?.querySelector('.wiki-property-header')?.getBoundingClientRect().height || 0;
    scroll.scrollTo({ top: scroll.scrollTop + section.getBoundingClientRect().top - scroll.getBoundingClientRect().top - headerHeight - 16, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };
  const nameKey = metadata.name !== undefined ? 'name' : 'title';
  const changeType = (entityType: string) => {
    const template = newDraft((collectionByType as Record<string, string>)[entityType], metadata.locale || 'zh').meta as WikiMetadata;
    const next: WikiMetadata = { ...template, ...metadata, entityType };
    const previousTemplate = newDraft((collectionByType as Record<string, string>)[metadata.entityType] || 'articles', metadata.locale || 'zh').meta as WikiMetadata;
    for (const key of Object.keys(previousTemplate)) if (!(key in template) && JSON.stringify(metadata[key]) === JSON.stringify(previousTemplate[key])) delete next[key];
    const title = metadata.name || metadata.title || '';
    const romanized = metadata.romanizedName || metadata.romanizedTitle || '';
    if (template.name !== undefined) { next.name = title; delete next.title; if (romanized) next.romanizedName = romanized; delete next.romanizedTitle; }
    else { next.title = title; delete next.name; if (romanized) next.romanizedTitle = romanized; delete next.romanizedName; }
    onChange(next);
  };
  const tags = Array.isArray(metadata.tags) ? metadata.tags : [];
  const addTag = () => { const value = tag.trim(); if (value && !tags.includes(value)) onChange({ ...metadata, tags: [...tags, value] }); setTag(''); };
  if (pending) return <aside className="wiki-properties-content"><header className="wiki-property-header"><h2>{t("词条属性")}</h2>{onClose ? <Button variant="ghost" onClick={onClose}>{t("收起词条属性")}</Button> : null}</header><Alert><AlertDescription>{t("请先应用或放弃源码修改，再调整文档属性。")}</AlertDescription></Alert></aside>;
  return <aside ref={root} className="wiki-properties-content" aria-label={t("词条属性表单")}>
    <header className="wiki-property-header"><div className="flex items-center justify-between gap-2"><h2>{articleMode?t("文章属性"):t("词条属性")}</h2>{onClose ? <Button variant="ghost" size="icon-sm" aria-label={t("收起词条属性")} onClick={onClose}><PanelRightClose /></Button> : null}</div><p>{articleMode?t("标题和简介用于文章列表；分类与相关词条帮助读者查找。图片来源可在添加图片时填写，投稿前会再次检查。"):t("补全阅读页的资料。未确认的信息可先留空，草稿会自动保存在本地。")}</p><nav aria-label={t("属性分区")}>{(articleMode?[['basic','基本'],['domain','分类'],['relations','相关词条']]:[['basic', '基本'], ['domain', '专属'], ['relations', '关系与来源'], ['display', '展示']]).map(([key, label]) => <Button key={key} variant="ghost" size="sm" onClick={() => navigate(key)}>{label}</Button>)}</nav></header>
    <div className="wiki-property-body">
    <section id={prefix + 'basic'} className="wiki-property-section"><FieldSet><FieldLegend>{t("基本资料")}</FieldLegend><FieldDescription>{t("读者首先看到的名称和简介，也是站内查找词条的依据。")}</FieldDescription><FieldGroup>
      <TextField label={nameKey === 'name' ? t("名称 · 必填") : t("标题 · 必填")} value={metadata[nameKey] || ''} required placeholder={nameKey === 'name' ? t("例如 花譜") : t("填写作品或文章的正式标题")} description={t("显示在阅读页顶部，也作为词条列表和链接的名称。")} onChange={value => onChange({ ...metadata, [nameKey]: value })} />
      <FieldGroup className="wiki-property-pair"><ChoiceField label={t("词条语言")} value={metadata.locale || 'zh'} disabled={locked} description={locked ? t("已有词条的语言与文件对应。繁体页面由简体原文自动生成。") : t("选择简体中文、日文或英文。繁体页面由简体原文自动生成。")} onChange={locale => onChange({ ...metadata, locale })} options={Array.from(new Map([['zh', '简体中文'], ['ja', '日本語'], ['en', 'English'], ...(metadata.locale && !['zh', 'ja', 'en'].includes(metadata.locale) ? [[metadata.locale, metadata.locale]] : [])] as [string, string][]))} />
      <ChoiceField label={t("词条类型")} value={metadata.entityType || 'editorial-article'} disabled={locked} description={locked ? t("已有词条的类型与目录对应。") : t("决定下方需要填写的专属资料。")} onChange={changeType} options={Object.entries(entityTypeLabels)} /></FieldGroup>
      <TextField label={t("一句话简介")} value={metadata.summary || ''} multiline placeholder={t("用一两句话说明这是谁、是什么作品或记录了什么。")} description={t("显示在词条列表和链接预览中，帮助读者快速了解内容。")} onChange={summary => onChange({ ...metadata, summary })} />
      <MetadataFields value={metadata} onChange={onChange} locked={locked} include={sections.basic} />
      {!articleMode ? <FieldSet className="wiki-property-tags"><FieldLegend variant="label">{t("标签")}</FieldLegend><FieldDescription>{t("补充主题关键词，每个标签只填一个词，便于资料整理。")}</FieldDescription><div className="flex flex-wrap gap-2">{tags.map((value: string, index: number) => <Badge variant="secondary" key={value + index}>{value}<Button variant="ghost" size="icon-xs" aria-label={`移除标签 ${value}`} onClick={() => onChange({ ...metadata, tags: tags.filter((_tag: string, key: number) => key !== index) })}><X /></Button></Badge>)}</div><div className="flex gap-2"><Input aria-label={t("新标签")} placeholder={t("输入标签，按 Enter 添加")} value={tag} onChange={event => setTag(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.nativeEvent.isComposing) { event.preventDefault(); addTag(); } }} /><Button variant="outline" size="icon" aria-label={t("添加标签")} disabled={!tag.trim()} onClick={addTag}><Plus /></Button></div></FieldSet> : null}
    </FieldGroup></FieldSet></section>
    {section('domain', (entityTypeLabels[metadata.entityType] || '词条') + '资料', articleMode ? t("文章使用登录账号的署名，审核通过后记录发布日期。这里只需选择文章分类。") : t("只填写有依据的信息。这些资料会用于阅读页信息栏和对应类型的列表。"), sections.domain)}
    {section('relations', articleMode?t("相关词条"):t("关系与来源"), articleMode?t("选择文章涉及的人物、作品或企划，读者可从文章继续浏览这些资料。"):t("关联其他词条，并提供原始资料，方便读者继续查阅与核对。"), sections.relations)}
    {!articleMode?section('display', '展示与收录', '调整封面、导航归属与搜索信息。通常可以先沿用默认设置。', sections.display):null}
    <details className="wiki-property-advanced"><summary><SlidersHorizontal aria-hidden="true" />{t("高级与兼容属性")}</summary><FieldGroup><TextField label={t("永久 ID")} value={metadata.id || ''} disabled={locked} description={metadataGuide('id').description} placeholder={metadataGuide('id').placeholder} onChange={id => onChange({ ...metadata, id })} />{sections.other.length ? <><FieldDescription>{articleMode ? t("以下属性保留在本地 Markdown 中。文章投稿仅保存标题、简介、正文、分类、相关词条与图片说明；原作者和原始日期仍保留在导出文件。") : t("以下为导入文件的其他属性。编辑器会保留这些内容；不确定用途时可保持原值。")}</FieldDescription><MetadataFields value={metadata} onChange={onChange} locked={locked} include={sections.other} /></> : null}</FieldGroup></details>
    <p className="wiki-property-save-note"><Check aria-hidden="true" />{t("修改自动保存在当前浏览器，可用撤销恢复。")}</p>
    </div>
  </aside>;
}
