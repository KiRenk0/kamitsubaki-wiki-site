import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, Cloud, Loader2, RefreshCw, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { FieldGroup } from './ui/field';
import { TextField } from './form-fields';
import { LocalReviewService, type ReviewSnapshot, type ReviewState, type ReviewSubmission } from '@/lib/review-service';
import { diffLines, submissionLabels } from '../../../../src/lib/editorPrDemo.mjs';
import { importMarkdown } from '../../../../src/lib/visualEditor.mjs';
import { ReviewConflictPanel } from './review-conflict';
import type { ReviewResolution } from '@/lib/review-service';
import { PreviewPane } from './reader-preview';
import { CatalogContext } from './entity-picker';
import { metadataChanges } from '@/lib/metadata-changes';

function ChangePreview({ before, after }: { before: string; after: string }) {
  const { entries, locale } = useContext(CatalogContext);
  const changes = useMemo(() => {
    try {
      const a = before ? importMarkdown(before, 'projects') as any : { meta: {}, originalBody: '' };
      const b = importMarkdown(after, 'projects') as any;
      const fields = metadataChanges(a.meta, b.meta, id => (entries.find(entry => entry.id === id && entry.locale === locale) || entries.find(entry => entry.id === id))?.title);
      return { a, b, fields, lines: diffLines(a.originalBody, b.originalBody) };
    } catch { return null; }
  }, [before, after, entries, locale]);
  const [expanded, setExpanded] = useState(false);
  const [effectOpen, setEffectOpen] = useState(false);
  if (!changes) return <p>无法自动整理差异，请返回正文检查内容。</p>;
  if (!changes.fields.length && !changes.lines.length) return <p className="wiki-review-empty">与比较版本的内容相同，尚无新的修改。</p>;
  return <div className="wiki-review-changes">
    {changes.fields.length ? <section><h3>词条属性 · {changes.fields.length} 项调整</h3><dl>{changes.fields.map(field => <div key={field.key}><dt>{field.label}</dt><dd><del>{field.before}</del><span aria-hidden="true"> → </span><ins>{field.after}</ins></dd></div>)}</dl></section> : null}
    {changes.lines.length ? <section><h3>正文 · {changes.lines.filter(line => line.type === 'added').length} 行新增，{changes.lines.filter(line => line.type === 'removed').length} 行移除</h3><details className="wiki-review-effect" onToggle={event => setEffectOpen(event.currentTarget.open)}><summary>查看修改后的阅读效果</summary>{effectOpen ? <PreviewPane source={after} title="修改后的正文" compact /> : null}</details><details className="wiki-review-raw"><summary>查看 Markdown 差异（可选）</summary><p className="wiki-review-help">红色为移除，绿色为新增。保留的原文不会重复列出。</p><ol className="wiki-review-lines">{(expanded ? changes.lines : changes.lines.slice(0, 12)).map((line, index) => <li key={index} data-change={line.type}><span className="wiki-review-line-mark" aria-label={line.type === 'added' ? '新增' : '移除'}>{line.type === 'added' ? '+' : '−'}</span><span>{line.text || '（空行）'}</span></li>)}</ol>{changes.lines.length > 12 ? <Button variant="ghost" onClick={() => setExpanded(!expanded)}>{expanded ? '收起正文差异' : `查看全部 ${changes.lines.length} 行差异`}</Button> : null}</details></section> : null}
  </div>;
}

export default function ReviewPane({ snapshot, onBack, onRestore, onSubmitted, onReconcile }: { snapshot: ReviewSnapshot; onBack: () => void; onRestore: (source: string, base: string | undefined) => void; onSubmitted: (result: ReviewSubmission) => void; onReconcile: (source: string, base: string, resolution: ReviewResolution) => void }) {
  const [service] = useState(() => new LocalReviewService());
  const [state, setState] = useState<ReviewState | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const mounted = useRef(true);
  const [summary, setSummary] = useState('');
  const [source, setSource] = useState('');
  const [imageSources, setImageSources] = useState<Record<string, string>>({});
  const [tab, setTab] = useState('check');
  const [item, setItem] = useState<ReviewSubmission | null>(null);
  const [withdrawConfirm, setWithdrawConfirm] = useState(false);
  const [restoreConfirm, setRestoreConfirm] = useState(false);
  useEffect(() => { if (!state) return; const notes = service.notes(state.account.id, snapshot.path); setSummary(notes.summary); setSource(notes.source); setImageSources(notes.imageSources || {}); }, [state?.account.id, snapshot.path, service]);
  const updateNotes = (nextSummary: string, nextSource: string, nextImages = imageSources) => {
    setSummary(nextSummary); setSource(nextSource);
    if (!state) return;
    try { service.saveNotes(state.account.id, snapshot.path, { summary: nextSummary, source: nextSource, imageSources: nextImages }); } catch (error: any) { setError(error.message); }
  };
  useEffect(() => { mounted.current = true; const controller = new AbortController(); setLoading(true); service.load(snapshot, controller.signal).then(result => { if (controller.signal.aborted) return; setState(result); setError(''); if (result.recovered) { setItem(result.recovered); setTab('records'); setMessage('已恢复上次提交结果，内容已保存到本地审核记录。'); onSubmitted(result.recovered); } }).catch(error => { if (error.name !== 'AbortError') setError(error.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); }); return () => { mounted.current = false; controller.abort(); }; }, [snapshot, service]);
  async function action(fn: () => Promise<void>) {
    if (locked.current) return; locked.current = true; setBusy(true); setError(''); setMessage('');
    try { await fn(); } catch (error: any) { if (mounted.current) { setError(error.message); setState(current => current ? { ...current, pending: service.pending(current.account.id, snapshot.path) } : current); } }
    finally { locked.current = false; if (mounted.current) setBusy(false); }
  }
  const reconnect = () => action(async () => { const next = await service.load(snapshot); if (mounted.current) { setState(next); setItem(next.recovered || null); if (next.recovered) { setTab('records'); onSubmitted(next.recovered); } setMessage(next.recovered ? '已恢复上次提交结果，之后新增的本地修改也会保留。' : '已重新连接，请检查当前版本后继续。'); } });
  const receipt = (result: ReviewSubmission) => { if (!mounted.current) return; setState(current => current ? { ...current, selected: result, pending: null, page: { ...current.page, submissions: [result, ...current.page.submissions.filter(entry => entry.id !== result.id)] } } : current); setItem(result); setTab('records'); setMessage('已提交本地审核，内容已保存。审核通过和网站上线会分别显示结果。'); onSubmitted(result); };
  const updateRecord = (result: ReviewSubmission) => {
    if (!mounted.current) return;
    setItem(result);
    setState(current => current ? { ...current, selected: current.selected?.id === result.id ? ['open', 'changes'].includes(result.status) ? result : null : current.selected, page: { ...current.page, submissions: current.page.submissions.map(entry => entry.id === result.id ? result : entry) } } : current);
  };
  const labels = submissionLabels as Record<string, string>;
  const current = item || state?.selected;
  const hasLocalImages = snapshot.attachments?.some(asset => asset.url.startsWith('/images/novel-prototype/'));
  const canSubmit = state && !state.conflict && !state.pending && (!state.selected || state.selected.sync !== 'pending') && (Boolean(snapshot.resolution?.submissionId) || snapshot.content !== (state.selected?.content || state.base.content));
  return <section className="wiki-review-pane" aria-label="修改检查与投稿">
    <header className="wiki-review-heading"><div><Button variant="ghost" onClick={onBack} disabled={busy}><ArrowLeft />返回正文</Button><h2>修改检查与投稿</h2><p>先检查内容，再填写修改说明。你的正文始终有本地草稿。</p></div><Badge variant="secondary">本地测试</Badge></header>
    <p className="wiki-review-local-note">此原型使用本机测试账号和审核服务，提交不会写入线上仓库。</p>
    {loading ? <p role="status" className="wiki-review-loading"><Loader2 className="animate-spin" />正在连接投稿测试服务…</p> : null}
    {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
    {message ? <p className="wiki-review-message" role="status"><Check />{message}</p> : null}
    {!loading && !state ? <Button variant="outline" disabled={busy} onClick={reconnect}><RefreshCw />重新连接</Button> : null}
    {state ? <><div className="wiki-review-account"><span>{state.account.name}</span><Button variant="ghost" disabled={busy} onClick={reconnect}><RefreshCw />刷新状态</Button></div>
    {state.pending ? <Alert><AlertDescription><p>上次提交的结果还未确认。重试会继续同一次提交，避免产生重复投稿。</p><Button variant="outline" disabled={busy} onClick={() => action(async () => receipt(await service.retryPending(state)))}>重试上次提交</Button></AlertDescription></Alert> : null}
    <Tabs value={tab} onValueChange={setTab}><TabsList className="wiki-review-tabs"><TabsTrigger value="check">检查修改</TabsTrigger><TabsTrigger value="records">草稿与投稿记录</TabsTrigger></TabsList>
      <TabsContent value="check">
        {state.conflict ? <Alert variant="destructive"><AlertDescription><p>原文已更新，请核对其他人的改动。你的修改仍保存在本地，暂时不能直接提交。</p><details><summary>查看原文更新了什么</summary><ChangePreview before={snapshot.baseContent || ''} after={state.base.content} /></details></AlertDescription></Alert> : null}
        {state.conflict ? <ReviewConflictPanel service={service} state={state} disabled={busy || Boolean(state.pending)} onApply={onReconcile} /> : <ChangePreview before={state.selected?.content || snapshot.baseContent || state.base.content} after={snapshot.content} />}
        <form className="wiki-review-submit" onSubmit={event => { event.preventDefault(); action(async () => receipt(await service.submit(state, summary, source, imageSources))); }}><FieldGroup>
          {snapshot.attachments?.length ? <section className="wiki-review-attachments"><h3>这次投稿的图片 · {snapshot.attachments.length} 张</h3><p className="wiki-review-help">填写图片的原始出处或授权说明。已提交的图片会沿用附件；新图片与正文一起提交。较大的新图片会生成 WebP 投稿副本。</p>{snapshot.attachments.map((attachment, index) => <div className="wiki-review-attachment" key={attachment.url}><img src={attachment.originalUrl || attachment.url} alt={attachment.alt || `图片 ${index + 1}`} /><TextField label={`图片 ${index + 1} 的来源 · 必填`} value={imageSources[attachment.url] ?? attachment.source} required disabled={busy} placeholder="原始链接或明确的授权说明" onChange={value => { const next = { ...imageSources, [attachment.url]: value }; setImageSources(next); updateNotes(summary, source, next); }} description={attachment.originalUrl?.endsWith('.gif') || attachment.url.endsWith('.gif') ? 'GIF 目前可本地预览，投稿请返回正文换用 PNG、JPEG 或 WebP。' : attachment.alt || '说明这张图片来自哪里，方便维护者核对。'} /></div>)}</section> : null}
          <TextField label="这次修改了什么 · 必填" value={summary} onChange={value => updateNotes(value, source)} required multiline description="200 字以内，帮助维护者快速理解修改。例如：补充最新所属组织，并更新官方资料链接。" placeholder="说明新增、修正或补充的内容" disabled={busy} />
          <TextField label="核对资料的原始链接（可选）" value={source} onChange={value => updateNotes(summary, value)} description="例如官方公告、作品发布页。正文引用的资料也可在词条属性中填写。" placeholder="https://…" disabled={busy} />
        </FieldGroup>{hasLocalImages ? <p className="wiki-review-help mt-4">含新图片的草稿会继续保存在当前浏览器；提交审核时才暂存图片附件。</p> : null}<div className="wiki-review-actions"><Button type="button" variant="outline" disabled={busy || state.conflict || Boolean(hasLocalImages)} onClick={() => action(async () => { const result = await service.saveDraft(state); if (mounted.current) { setState({ ...state, draft: { ...snapshot, version: result.version, baseSha: state.base.sha, baseContent: state.base.content } }); setMessage(`服务端草稿已保存，第 ${result.version} 版。仍未提交审核。`); } })}><Cloud />保存服务端草稿</Button><Button type="submit" disabled={busy || !canSubmit || !summary.trim()}>{busy ? <Loader2 className="animate-spin" /> : <Send />}{state.selected ? '更新这份投稿' : '提交审核'}</Button></div></form>
      </TabsContent>
      <TabsContent value="records"><section className="wiki-review-draft"><h3>当前词条的服务端草稿</h3>{state.draft ? <><p>{state.draft.title} · 第 {state.draft.version} 版</p>{restoreConfirm ? <div className="wiki-review-confirm"><p>载入后可用正文工具栏的撤销恢复当前版本。本地填写内容已保存。</p><Button disabled={busy} onClick={() => onRestore(state.draft!.content, state.draft!.baseContent)}>确认载入草稿</Button><Button variant="ghost" onClick={() => setRestoreConfirm(false)}>取消</Button></div> : <Button variant="outline" disabled={busy} onClick={() => setRestoreConfirm(true)}>继续编辑服务端草稿</Button>}</> : <p className="wiki-review-help">还没有服务端草稿。可先在“检查修改”中保存。</p>}</section>
        <section><h3>这个账号的投稿记录</h3><div className="wiki-review-records">{state.page.submissions.map(entry => <Button variant={current?.id === entry.id ? 'secondary' : 'ghost'} className="wiki-review-record" key={entry.id} disabled={busy} onClick={() => action(async () => { const detail = await service.detail(state.account, entry.id); if (mounted.current) { setItem(detail); setWithdrawConfirm(false); } })}><strong>{entry.title}</strong><span>{labels[entry.status] || '处理中'} · 第 {entry.revision} 次提交</span></Button>)}</div>{!state.page.submissions.length ? <p className="wiki-review-help">这个账号还没有投稿。保存草稿与提交审核是两个步骤。</p> : null}{state.page.nextBefore !== null ? <Button variant="outline" disabled={busy} onClick={() => action(async () => { const next = await service.page(state.account, state.page.nextBefore!, state.page.nextId); if (mounted.current) setState({ ...state, page: { ...next, submissions: [...state.page.submissions, ...next.submissions.filter(entry => !state.page.submissions.some(prior => prior.id === entry.id))] } }); })}>载入更早记录</Button> : null}</section>
        {current ? <section className="wiki-review-detail"><h3>{current.title}</h3><p>{labels[current.status] || '处理中'} · {current.sync === 'synced' ? '审核记录已同步' : current.sync === 'conflict' ? '原文冲突，需要核对' : current.sync === 'paused' ? '同步暂停，可重试' : '正在同步审核记录'}</p><p>{current.summary}</p>{current.syncError ? <p role="alert">{current.syncError}</p> : null}
          <div className="wiki-review-actions"><Button variant="outline" disabled={busy} onClick={() => action(async () => { const fresh = await service.detail(state.account, current.id); updateRecord(fresh); })}>查看最新结果</Button>{current.sync === 'pending' || current.sync === 'paused' ? <Button variant="outline" disabled={busy} onClick={() => action(async () => { await service.retry(state.account, current); setMessage('已请求重试同步，稍后可查看最新结果。'); })}>重试同步</Button> : null}{['open', 'changes'].includes(current.status) ? <Button variant="ghost" disabled={busy || current.sync === 'pending'} onClick={() => setWithdrawConfirm(true)}>撤回投稿</Button> : null}</div>
          {withdrawConfirm ? <div className="wiki-review-confirm"><p>撤回后会关闭这份投稿，正文和记录会保留。</p><Button variant="destructive" disabled={busy} onClick={() => action(async () => { const result = await service.withdraw(state.account, current); if (mounted.current) { updateRecord(result); setWithdrawConfirm(false); setMessage('已请求撤回，正文和记录仍保留。'); } })}>确认撤回</Button><Button variant="ghost" onClick={() => setWithdrawConfirm(false)}>保留投稿</Button></div> : null}
          {current.comments?.length ? <section><h4>维护者反馈</h4>{current.comments.map((comment, index) => <article className="wiki-review-comment" key={index}><small>{comment.author || '维护者'}</small><p>{comment.body}</p></article>)}</section> : null}
        </section> : null}
      </TabsContent>
    </Tabs><details className="wiki-review-testing"><summary>本地账号测试</summary><p>切换测试作者可检查草稿和投稿隔离，当前正文会保留。</p><Button variant="outline" disabled={busy} onClick={() => action(async () => { await service.switchAccount(state.account); const next = await service.load(snapshot); if (mounted.current) { setState(next); setItem(null); setRestoreConfirm(false); setWithdrawConfirm(false); setMessage('已切换测试账号，请检查该账号的草稿和投稿。'); } })}>切换为{state.account.id === 'alice' ? '作者 Bob' : '作者 Alice'}</Button></details></> : null}
  </section>;
}
