import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { LocalReviewService, reviewSnapshot, type ReviewSnapshot, type ReviewSubmission } from '../src/lib/review-service';

class MemoryStorage {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}
const snapshot: ReviewSnapshot = { path: 'src/content/people/solo/kaf/zh.md', title: '花譜', kind: 'people', content: '新内容', baseContent: '原内容', create: false };
function fakeServer() {
  const server = { account: 'alice', mode: 'local', base: '原内容', sha: 'sha-a', draftVersion: 0, draft: null as any, entry: null as ReviewSubmission | null, submissions: [] as ReviewSubmission[], lostResponse: false, reject: 0, writes: [] as { path: string; body: any }[] };
  const request: typeof fetch = async (url, options) => {
    const path = String(url).split('?')[0];
    const body = options?.body ? JSON.parse(String(options.body)) : undefined;
    if (path === '/api/editor/session') return Response.json({ account: { id: server.account, name: server.account }, mode: server.mode });
    if (options?.method === 'GET') {
      if (path === '/api/editor/source') return Response.json({ path: snapshot.path, content: server.base, sha: server.sha });
      if (path === '/api/editor/draft') return Response.json(server.draft);
      if (path === '/api/editor/submissions') return Response.json({ submissions: server.submissions.length ? server.submissions : server.entry ? [server.entry] : [], nextBefore: null, nextId: null });
      if (path.startsWith('/api/editor/submissions/')) return Response.json(server.entry);
    }
    server.writes.push({ path, body });
    if (server.reject) return Response.json({ error: '原文已更新' }, { status: server.reject });
    if (path === '/api/editor/draft') {
      if (body.version !== server.draftVersion) return Response.json({ error: '草稿已在其他页面更新，请重新读取' }, { status: 409 });
      server.draft = { ...body, version: ++server.draftVersion }; return Response.json({ version: server.draftVersion });
    }
    if (path === '/api/editor/submissions') {
      if (!server.entry) server.entry = { ...body, id: body.operation, status: 'open', sync: 'pending', version: 1, revision: 1 };
      if (server.lostResponse) { server.lostResponse = false; throw new TypeError('Failed to fetch'); }
      return Response.json(server.entry);
    }
    throw Error('Unexpected request: ' + path);
  };
  return { server, request };
}

test('local review uses real source metadata and readable schema errors', async () => {
  const source = await readFile(new URL('../../../src/content/people/solo/kaf/zh.md', import.meta.url), 'utf8');
  const ready = reviewSnapshot(snapshot.path, source, source);
  assert.equal(ready.path, snapshot.path); assert.equal(ready.content, source); assert.equal(ready.create, false);
  assert.throws(() => reviewSnapshot('', source.replace(/^id:.*$/m, 'id: ""')), /永久标识/);
  assert.throws(() => reviewSnapshot(snapshot.path, source.replace(/^romanizedName:.*$/m, 'romanizedName: ""')), /罗马字名称/);
  assert.throws(() => reviewSnapshot(snapshot.path, source.replace('/images/artists/kaf.jpg', '/images/novel-prototype/test.jpg')), /本机图片/);
});
test('lost submission response retries the exact operation and content after editor changes', async () => {
  const { server, request } = fakeServer(); const storage = new MemoryStorage(); const client = new LocalReviewService(request, storage);
  const state = await client.load(snapshot); server.lostResponse = true;
  await assert.rejects(client.submit(state, '补充资料', ''), /连接中断/);
  const pending = client.pending('alice', snapshot.path)!;
  assert.ok(pending.operation); assert.equal(pending.content, snapshot.content);
  const recreated = new LocalReviewService(request, storage);
  const result = await recreated.retryPending({ ...state, snapshot: { ...snapshot, content: '之后又修改的文字' } });
  assert.equal(result.id, pending.operation);
  const posts = server.writes.filter(item => item.path === '/api/editor/submissions');
  assert.deepEqual(posts[1].body, posts[0].body, 'retry cannot use a different snapshot or summary');
  assert.equal(recreated.pending('alice', snapshot.path), null);
});
test('reload recognizes a created submission with a lost response instead of creating a duplicate', async () => {
  const { server, request } = fakeServer(); const storage = new MemoryStorage(); const client = new LocalReviewService(request, storage);
  const state = await client.load(snapshot); server.lostResponse = true;
  await assert.rejects(client.submit(state, '补充资料', ''), /连接中断/);
  const recovered = await new LocalReviewService(request, storage).load(snapshot);
  assert.equal(recovered.pending, null); assert.equal(recovered.selected?.content, snapshot.content);
  assert.equal(server.writes.filter(item => item.path === '/api/editor/submissions').length, 1);
});
test('account change and production service mode prevent any write', async () => {
  const { server, request } = fakeServer(); const client = new LocalReviewService(request, new MemoryStorage());
  const state = await client.load(snapshot); server.account = 'bob';
  await assert.rejects(client.saveDraft(state), /登录账号已变化/);
  await assert.rejects(client.submit(state, '补充资料', ''), /登录账号已变化/);
  server.account = 'alice'; server.mode = 'github';
  await assert.rejects(client.saveDraft(state), /只进行本地投稿测试/);
  assert.equal(server.writes.length, 0);
});
test('changed main source blocks submission and draft writes while preserving the snapshot', async () => {
  const { server, request } = fakeServer(); server.base = '他人更新的原文'; server.sha = 'sha-b';
  const client = new LocalReviewService(request, new MemoryStorage()); const state = await client.load(snapshot);
  assert.equal(state.conflict, true); assert.equal(state.snapshot.content, '新内容');
  await assert.rejects(client.submit(state, '补充资料', ''), /原文已更新/);
  await assert.rejects(client.saveDraft(state), /原文已更新/);
  assert.equal(server.writes.length, 0);
});
test('service drafts use compare-and-swap versions and reject stale pages', async () => {
  const { server, request } = fakeServer(); const client = new LocalReviewService(request, new MemoryStorage()); const state = await client.load(snapshot);
  assert.equal((await client.saveDraft(state)).version, 1);
  await assert.rejects(client.saveDraft(state), /草稿已在其他页面更新/);
  assert.equal(server.draftVersion, 1); assert.equal(server.draft.content, snapshot.content);
});
test('definite rejection clears an operation while server failures keep a recoverable request', async () => {
  const { server, request } = fakeServer(); const client = new LocalReviewService(request, new MemoryStorage()); const state = await client.load(snapshot);
  server.reject = 409; await assert.rejects(client.submit(state, '修正资料', ''), /原文已更新/); assert.equal(client.pending('alice', snapshot.path), null);
  server.reject = 503; await assert.rejects(client.submit(state, '修正资料', ''), /原文已更新/); assert.ok(client.pending('alice', snapshot.path));
  await assert.rejects(client.submit(state, '修正新资料', ''), /上一次提交/);
});
test('browser fetch is called without binding it to the service instance', async () => {
  const { request } = fakeServer(); const previous = globalThis.fetch;
  try {
    globalThis.fetch = async function(url, options) { assert.equal(this, undefined, 'WebKit requires the correct native fetch receiver'); return request(url, options); };
    const state = await new LocalReviewService(undefined, new MemoryStorage()).load(snapshot); assert.equal(state.account.id, 'alice');
  } finally { globalThis.fetch = previous; }
});
test('an older open submission is discovered beyond the first history page', async () => {
  const { server, request } = fakeServer();
  const existing: ReviewSubmission = { ...snapshot, id: 'existing-submission', status: 'open', sync: 'synced', version: 4, revision: 2, summary: '上一版修改' };
  server.entry = existing;
  let pages = 0;
  const paginated: typeof fetch = async (url, options) => {
    const address = new URL(String(url), 'http://local');
    if (address.pathname === '/api/editor/submissions' && options?.method === 'GET') {
      pages++;
      return Response.json(address.searchParams.has('before') ? { submissions: [existing], nextBefore: null, nextId: existing.id } : { submissions: [{ ...existing, id: 'other', path: 'src/content/units/other/zh.md', status: 'closed' }], nextBefore: 100, nextId: 'other' });
    }
    return request(url, options);
  };
  const state = await new LocalReviewService(paginated, new MemoryStorage()).load(snapshot);
  assert.equal(pages, 2); assert.equal(state.selected?.id, 'existing-submission'); assert.equal(state.selected?.version, 4);
});
test('unfinished review notes survive reopening and stay isolated by account and document', () => {
  const { request } = fakeServer(); const storage = new MemoryStorage();
  const client = new LocalReviewService(request, storage); client.saveNotes('alice', snapshot.path, { summary: '还未提交的修改说明', source: 'https://example.com/original' });
  assert.deepEqual(new LocalReviewService(request, storage).notes('alice', snapshot.path), { summary: '还未提交的修改说明', source: 'https://example.com/original' });
  assert.deepEqual(client.notes('bob', snapshot.path), { summary: '', source: '' });
  assert.deepEqual(client.notes('alice', 'src/content/units/vwp/zh.md'), { summary: '', source: '' });
});
