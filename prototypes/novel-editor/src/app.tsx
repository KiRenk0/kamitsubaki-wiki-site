import { useCallback, useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/core';
import { Check, Eye, Download, Moon, Sun, SlidersHorizontal, Menu, Code2, FileText, AlertCircle, Pencil, Loader2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LibrarySidebar, collectionLabels } from '@/components/library-sidebar';
import { PropertiesPanel, type OutlineItem } from '@/components/properties-panel';
import { SourceEditor } from '@/components/source-editor';
import { NovelSurface } from '@/editor/novel-surface';
import { EditorToolbar } from '@/editor/toolbar';
import { NodeDialog, type NodeEditTarget } from '@/editor/node-dialog';
import { exportWikiDocument, loadWikiDocument, newDocumentSource, validateDocumentSource, type LoadedWikiDocument, type WikiDocumentContext, type WikiMetadata } from '@/lib/wiki-document';
import { readLocalDraft, readLastLocalDraft, saveLocalDraft, listLocalDrafts, type LocalDraft } from '@/lib/local-drafts';
import type { CatalogEntry } from '../server/local-api';
import demoSource from '../fixtures/wiki-demo.md?raw';
import { cn } from '@/lib/utils';

type DocumentRecord = { key: string; path: string; source: string; pendingSource?: string };
type View = 'edit' | 'source' | 'preview';
async function jsonRequest(url: string, options?: RequestInit) {
  const response = await fetch(url, options); const body = await response.json();
  if (!response.ok) throw new Error(body.error || '本地请求失败'); return body;
}
function initialDocument(): DocumentRecord {
  const draft = readLastLocalDraft();
  return draft ? { key: draft.key, path: draft.path, source: draft.source, pendingSource: draft.pendingSource } : { key: 'demo', path: '', source: demoSource };
}
function downloadMarkdown(source: string, title: string, locale: string) {
  const url = URL.createObjectURL(new Blob([source], { type: 'text/markdown;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = `${(title || 'wiki-draft').replace(/[\\/:*?"<>|]/g, '-')}.${locale || 'zh'}.md`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function App() {
  const [record, setRecord] = useState<DocumentRecord>(initialDocument);
  const recordRef = useRef(record); recordRef.current = record;
  const [revision, setRevision] = useState(0);
  const [editor, setEditor] = useState<Editor | null>(null);
  const editorRef = useRef<Editor | null>(null);
  const contextRef = useRef<WikiDocumentContext | null>(null);
  const [metadata, setMetadata] = useState<WikiMetadata>({});
  const metadataRef = useRef(metadata); metadataRef.current = metadata;
  const [sourceValue, setSourceValue] = useState(record.pendingSource || record.source);
  const pendingRef = useRef<string | undefined>(record.pendingSource);
  const [pending, setPending] = useState(Boolean(record.pendingSource));
  const [view, setView] = useState<View>(record.pendingSource ? 'source' : 'edit');
  const [catalog, setCatalog] = useState<CatalogEntry[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catalogLocale, setCatalogLocale] = useState('zh');
  const [status, setStatus] = useState('正在打开词条…');
  const [storageError, setStorageError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [opening, setOpening] = useState(false);
  const [showProperties, setShowProperties] = useState(true);
  const [mobileLibrary, setMobileLibrary] = useState(false);
  const [mobileProperties, setMobileProperties] = useState(false);
  const [compactLayout, setCompactLayout] = useState(() => window.matchMedia('(max-width: 1180px)').matches);
  const [dark, setDark] = useState(true);
  const [target, setTarget] = useState<NodeEditTarget | null>(null);
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [, updateToolbar] = useState(0);
  const [draftsOpen, setDraftsOpen] = useState(false);
  const [drafts, setDrafts] = useState<LocalDraft[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const loadSequence = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);

  const liveSource = useCallback(() => editorRef.current && contextRef.current ? exportWikiDocument(editorRef.current, contextRef.current, metadataRef.current) : recordRef.current.source, []);
  const persist = useCallback(() => {
    clearTimeout(timer.current);
    if (!contextRef.current || !editorRef.current) return false;
    try {
      const meta = metadataRef.current;
      saveLocalDraft({ key: recordRef.current.key, path: recordRef.current.path, source: liveSource(), title: meta.name || meta.title || '未命名词条', locale: meta.locale || 'zh', savedAt: Date.now(), pendingSource: pendingRef.current });
      setStorageError(''); setStatus(pendingRef.current ? '源码已暂存，尚未应用' : '已保存到本地');
      return true;
    } catch { setStatus('尚未保存'); setStorageError('本地草稿无法保存。请导出 Markdown 备份当前内容。'); return false; }
  }, [liveSource]);
  const changed = useCallback(() => {
    try { if (!pendingRef.current) setSourceValue(liveSource()); setStatus('正在保存…'); clearTimeout(timer.current); timer.current = setTimeout(persist, 300); }
    catch (error: any) { setStorageError(error.message); }
  }, [liveSource, persist]);
  const refreshOutline = useCallback((instance: Editor) => {
    const next: OutlineItem[] = [];
    instance.state.doc.descendants((node, position) => { if (node.type.name === 'heading') next.push({ text: node.textContent, level: node.attrs.level, position }); });
    setOutline(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
    updateToolbar(value => value + 1);
  }, []);
  const ready = useCallback((instance: Editor, loaded: LoadedWikiDocument) => {
    editorRef.current = instance; contextRef.current = loaded.context; metadataRef.current = loaded.metadata;
    setEditor(instance); setMetadata(loaded.metadata); refreshOutline(instance); setLoadError('');
    if (!pendingRef.current) setSourceValue(loaded.context.source);
    persist();
  }, [persist, refreshOutline]);
  const replaceDocument = useCallback((next: DocumentRecord) => {
    persist(); clearTimeout(timer.current); contextRef.current = null; editorRef.current = null;
    pendingRef.current = next.pendingSource; setPending(Boolean(next.pendingSource)); setSourceValue(next.pendingSource || next.source);
    setEditor(null); setTarget(null); setOutline([]); setMetadata({}); setRecord(next); recordRef.current = next;
    setRevision(value => value + 1); setView(next.pendingSource ? 'source' : 'edit'); setMobileLibrary(false); setStatus('正在打开词条…'); setLoadError('');
  }, [persist]);
  const openEntry = useCallback(async (entry: CatalogEntry) => {
    const sequence = ++loadSequence.current; setOpening(true);
    try {
      const draft = readLocalDraft(entry.path);
      const source = draft?.source || (await jsonRequest('/__novel/source?path=' + encodeURIComponent(entry.path))).source;
      if (sequence !== loadSequence.current) return;
      replaceDocument({ key: entry.path, path: entry.path, source, pendingSource: draft?.pendingSource });
    } catch (error: any) { toast.error(error.message); }
    finally { if (sequence === loadSequence.current) setOpening(false); }
  }, [replaceDocument]);
  useEffect(() => {
    const controller = new AbortController();
    jsonRequest('/__novel/catalog', { signal: controller.signal }).then(body => setCatalog(body.entries)).catch(error => { if (error.name !== 'AbortError') toast.error('词条库读取失败：' + error.message); }).finally(() => { if (!controller.signal.aborted) setCatalogLoading(false); });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 1180px)');
    const changed = () => setCompactLayout(query.matches);
    query.addEventListener('change', changed);
    return () => query.removeEventListener('change', changed);
  }, []);
  useEffect(() => {
    const save = () => persist(); window.addEventListener('beforeunload', save);
    return () => { window.removeEventListener('beforeunload', save); clearTimeout(timer.current); };
  }, [persist]);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') { event.preventDefault(); if (persist()) toast.success('草稿已保存到本地'); else toast.error('草稿未保存，请导出 Markdown 备份。'); }
    };
    window.addEventListener('keydown', keydown); return () => window.removeEventListener('keydown', keydown);
  }, [persist]);
  const changeMetadata = (next: WikiMetadata) => { metadataRef.current = next; setMetadata(next); changed(); };
  const changeView = (next: View) => { if (next === 'source' && !pendingRef.current) setSourceValue(liveSource()); setView(next); };
  const sourceChanged = (source: string) => { setSourceValue(source); const scratch = source === liveSource() ? undefined : source; pendingRef.current = scratch; setPending(Boolean(scratch)); changed(); };
  const applySource = () => {
    if (!editorRef.current) return;
    try {
      const nextMetadata = validateDocumentSource(sourceValue);
      if (record.path && (nextMetadata.id !== metadataRef.current.id || nextMetadata.entityType !== metadataRef.current.entityType || nextMetadata.locale !== metadataRef.current.locale)) throw new Error('已有词条的永久 ID、类型和语言需要保持不变。');
      const loaded = loadWikiDocument(editorRef.current, sourceValue, record.path);
      contextRef.current = loaded.context; metadataRef.current = loaded.metadata; setMetadata(loaded.metadata); pendingRef.current = undefined; setPending(false); refreshOutline(editorRef.current); persist(); toast.success('Markdown 已应用到正文');
    } catch (error: any) { toast.error(error.message); }
  };
  const onNavigate = (position: number) => { setView('edit'); requestAnimationFrame(() => editorRef.current?.chain().focus().setTextSelection(position + 1).scrollIntoView().run()); setMobileProperties(false); };
  const openDemo = useCallback(() => { ++loadSequence.current; const draft = readLocalDraft('demo'); replaceDocument(draft ? { key: 'demo', path: '', source: draft.source, pendingSource: draft.pendingSource } : { key: 'demo', path: '', source: demoSource }); }, [replaceDocument]);
  const newDocument = useCallback(() => { ++loadSequence.current; replaceDocument({ key: crypto.randomUUID(), path: '', source: newDocumentSource() }); }, [replaceDocument]);
  const openDrafts = () => { persist(); try { setDrafts(listLocalDrafts()); setDraftsOpen(true); } catch { toast.error('浏览器禁止访问本地草稿'); } };
  const sidebar = <LibrarySidebar catalog={catalog} loading={catalogLoading} search={search} onSearch={setSearch} selectedPath={record.path} selectedKey={record.key} onSelect={openEntry} onDemo={openDemo} onNew={newDocument} onImport={() => fileInput.current?.click()} onDrafts={openDrafts} locale={catalogLocale} onLocale={setCatalogLocale} />;
  const properties = <PropertiesPanel metadata={metadata} onChange={changeMetadata} outline={outline} onNavigate={onNavigate} locked={Boolean(record.path)} />;
  const title = metadata.name ?? metadata.title ?? '';
  const exportDocument = () => { try { persist(); downloadMarkdown(liveSource(), title, metadata.locale); toast.success('Markdown 已导出'); } catch (error: any) { toast.error(error.message); } };
  return <TooltipProvider delayDuration={350}><div className="wiki-workbench" data-properties={showProperties}>
    <div className="wiki-desktop-library">{sidebar}</div>
    <div className="wiki-workbench-main"><header className="wiki-workbench-header">
      <Button variant="ghost" size="icon" className="wiki-mobile-menu" aria-label="打开词条库" onClick={() => setMobileLibrary(true)}><Menu /></Button>
      <div className="wiki-breadcrumb"><span>{record.key === 'demo' ? '本地示例' : record.path ? collectionLabels[record.path.split('/')[2]] || '词条' : '本地草稿'}</span><span aria-hidden="true">/</span><strong>{title || '词条'}</strong>{opening ? <Loader2 className="animate-spin" aria-label="正在读取词条" /> : null}</div>
      <div className="wiki-header-actions"><span className="wiki-save-status" role="status"><Check aria-hidden="true" />{status}</span>
        <Button variant="outline" aria-label={view === 'preview' ? '继续编辑' : '预览'} aria-pressed={view === 'preview'} disabled={pending} onClick={() => changeView(view === 'preview' ? 'edit' : 'preview')}>{view === 'preview' ? <Pencil data-icon="inline-start" /> : <Eye data-icon="inline-start" />}<span>{view === 'preview' ? '继续编辑' : '预览'}</span></Button>
        <Button aria-label="导出 Markdown" disabled={!editor || pending} onClick={exportDocument}><Download data-icon="inline-start" /><span>导出 Markdown</span></Button>
        <Button variant="ghost" size="icon" aria-label={view === 'source' ? '返回正文' : 'Markdown 源码'} aria-pressed={view === 'source'} onClick={() => changeView(view === 'source' ? 'edit' : 'source')}><Code2 /></Button>
        <Button variant="ghost" size="icon" aria-label={dark ? '切换浅色主题' : '切换深色主题'} onClick={() => { document.documentElement.classList.toggle('dark', !dark); setDark(!dark); }}>{dark ? <Moon /> : <Sun />}</Button>
        <Button variant="ghost" size="icon" aria-label="词条属性" aria-expanded={compactLayout ? mobileProperties : showProperties} aria-haspopup={compactLayout ? 'dialog' : undefined} onClick={() => compactLayout ? setMobileProperties(true) : setShowProperties(!showProperties)}><SlidersHorizontal /></Button>
      </div>
    </header><div className="wiki-content-grid">
      <main className="wiki-writing-panel"><div className={cn(view !== 'edit' && 'hidden')}><EditorToolbar editor={editor} open={setTarget} /></div>
        {storageError || loadError ? <Alert variant="destructive"><AlertCircle /><AlertDescription>{storageError || loadError}</AlertDescription></Alert> : null}
        <div className={cn('wiki-writing-scroll', view !== 'edit' && 'hidden')}><div className="wiki-article-canvas">
          <input className="wiki-article-title" aria-label="词条标题" placeholder="未命名词条" value={title} onChange={event => changeMetadata({ ...metadata, [metadata.name !== undefined ? 'name' : 'title']: event.target.value })} />
          {metadata.romanizedName || metadata.romanizedTitle ? <p className="wiki-article-romanized">{metadata.romanizedName || metadata.romanizedTitle}</p> : null}
          <NovelSurface key={record.key + ':' + revision} source={record.source} path={record.path} onReady={ready} onUpdate={changed} onTransaction={refreshOutline} open={setTarget} />
          <Button variant="ghost" className="wiki-continue-writing" onClick={() => { if (editor) editor.chain().focus().insertContentAt(editor.state.doc.content.size, { type: 'paragraph' }).run(); }}>输入 / 插入内容</Button>
        </div></div>
        {view === 'source' ? <section className="wiki-source-pane"><div className="wiki-pane-heading"><div><h2>Markdown 源码</h2><p>{pending ? '修改已暂存，应用后可预览或导出。' : '正文和词条属性的完整保存内容。'}</p></div><Button disabled={!pending || !editor} onClick={applySource}>应用源码</Button></div><SourceEditor value={sourceValue} onChange={sourceChanged} height="calc(100vh - 190px)" /></section> : null}
        {view === 'preview' ? <PreviewPane source={liveSource()} title={title} /> : null}
      </main><div className="wiki-desktop-properties">{properties}</div>
    </div></div>
    <Sheet open={mobileLibrary} onOpenChange={setMobileLibrary}><SheetContent side="left" className="wiki-library-sheet"><SheetHeader className="sr-only"><SheetTitle>词条库</SheetTitle></SheetHeader>{sidebar}</SheetContent></Sheet>
    <Sheet open={mobileProperties} onOpenChange={setMobileProperties}><SheetContent side="right" className="wiki-properties-sheet"><SheetHeader className="sr-only"><SheetTitle>词条属性</SheetTitle></SheetHeader>{properties}</SheetContent></Sheet>
    <NodeDialog target={target} locale={metadata.locale || 'zh'} onClose={() => setTarget(null)} />
    <Dialog open={draftsOpen} onOpenChange={setDraftsOpen}><DialogContent><DialogHeader><DialogTitle>本地草稿</DialogTitle><DialogDescription>这些草稿保存在当前浏览器中，可继续编辑或导出。</DialogDescription></DialogHeader><div className="wiki-draft-list">{drafts.length ? drafts.map(draft => <Button variant="ghost" className="wiki-draft-row" key={draft.key} onClick={() => { replaceDocument({ key: draft.key, path: draft.path, source: draft.source, pendingSource: draft.pendingSource }); setDraftsOpen(false); }}><FileText data-icon="inline-start" /><span><strong>{draft.title}</strong><small>{new Date(draft.savedAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</small></span></Button>) : <p>还没有本地草稿。</p>}</div></DialogContent></Dialog>
    <input ref={fileInput} type="file" accept=".md,.markdown,text/markdown" className="hidden" aria-label="导入 Markdown 文件" onChange={async event => { const input = event.currentTarget; const file = input.files?.[0]; if (!file) return; try { if (file.size > 1_000_000) throw new Error('Markdown 文件不能超过 1 MB'); const source = await file.text(); validateDocumentSource(source); replaceDocument({ key: 'import:' + crypto.randomUUID(), path: '', source }); } catch (error: any) { toast.error(error.message); } input.value = ''; }} />
    <Toaster richColors theme={dark ? 'dark' : 'light'} />
  </div></TooltipProvider>;
}
function PreviewPane({ source, title }: { source: string; title: string }) {
  const [html, setHtml] = useState(''); const [error, setError] = useState('');
  const previewRoot = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let active = true;
    if (html) import('../../../src/scripts/mediaSwitcher.js').then(module => { if (active && previewRoot.current) (module.initializeMediaSwitchers as (root: ParentNode) => void)(previewRoot.current); });
    return () => { active = false; };
  }, [html]);
  useEffect(() => { const controller = new AbortController(); setError(''); jsonRequest('/__novel/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source }), signal: controller.signal }).then(result => setHtml(result.html)).catch(error => { if (error.name !== 'AbortError') setError(error.message); }); return () => controller.abort(); }, [source]);
  return <section className="wiki-preview-pane"><h1>{title}</h1>{error ? <Alert variant="destructive"><AlertCircle /><AlertDescription>{error}</AlertDescription></Alert> : <div ref={previewRoot} className="wiki-prose wiki-preview-prose" dangerouslySetInnerHTML={{ __html: html }} />}</section>;
}
