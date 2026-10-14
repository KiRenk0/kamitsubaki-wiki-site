import test from 'node:test';
import assert from 'node:assert/strict';
import { planReviewMerge, resolveReviewMerge } from '../src/lib/review-merge';
const base = '---\nschemaVersion: 2\nid: merge-test\nlocale: zh\nentityType: project\ntitle: 原标题 # 保留说明\nstatus: active\nunknownFlag: null\n---\n\n第一段。\n\n第二段。\n\n最后一段。\n';
test('nonoverlapping metadata and prose merge without discarding either author or YAML comments', () => {
  const mine = base.replace('原标题', '我的标题').replace('第一段。', '我补充第一段。');
  const current = base.replace('status: active', 'status: completed').replace('最后一段。', '别人补充最后一段。');
  const plan = planReviewMerge(base, mine, current);
  assert.equal([...plan.metadata, ...plan.body].filter(part => !part.ok).length, 0);
  const result = resolveReviewMerge(plan, {});
  assert.ok(result.includes('我的标题 # 保留说明')); assert.ok(result.includes('status: completed'));
  assert.ok(result.includes('我补充第一段。')); assert.ok(result.includes('别人补充最后一段。')); assert.ok(result.includes('unknownFlag: null'));
});
test('overlapping changes require a choice and keep independent changes on both sides', () => {
  const mine = base.replace('原标题', '我的标题').replace('第二段。', '我的第二段。');
  const current = base.replace('原标题', '最新标题').replace('第二段。', '最新第二段。').replace('最后一段。', '最新最后一段。');
  const plan = planReviewMerge(base, mine, current), conflicts = [...plan.metadata, ...plan.body].filter(part => !part.ok);
  assert.equal(conflicts.length, 2); assert.throws(() => resolveReviewMerge(plan, {}), /每处重叠修改/);
  const choices = Object.fromEntries(conflicts.map(part => [part.id, part.key ? 'current' : 'mine'])) as any;
  const result = resolveReviewMerge(plan, choices);
  assert.ok(result.includes('最新标题')); assert.ok(result.includes('我的第二段。')); assert.ok(result.includes('最新最后一段。'));
  assert.ok(!result.includes('<<<<<<<')); assert.ok(!result.includes('我的标题'));
});
test('unchanged BOM/CRLF documents round trip exactly and identity changes cannot merge', () => {
  const source = '\uFEFF' + base.replaceAll('\n', '\r\n');
  assert.equal(resolveReviewMerge(planReviewMerge(source, source, source), {}), source);
  assert.throws(() => planReviewMerge(base, base.replace('merge-test', 'other-id'), base), /身份信息/);
});
test('removing an optional property is distinct from keeping an unknown null', () => {
  const mine = base.replace('status: active\n', '');
  const result = resolveReviewMerge(planReviewMerge(base, mine, base), {});
  assert.ok(!result.includes('status:')); assert.ok(result.includes('unknownFlag: null'));
});
test('review branch changes and main changes can be reconciled in two guarded comparisons', () => {
  const submitted = base.replace('第一段。', '已提交的第一段。');
  const local = submitted.replace('第二段。', '继续编辑的第二段。');
  const branch = submitted.replace('最后一段。', '维护者补充的最后一段。');
  const branchMerge = resolveReviewMerge(planReviewMerge(submitted, local, branch), {});
  const current = base.replace('status: active', 'status: completed');
  const result = resolveReviewMerge(planReviewMerge(base, branchMerge, current), {});
  for (const expected of ['已提交的第一段。','继续编辑的第二段。','维护者补充的最后一段。','status: completed']) assert.ok(result.includes(expected));
});
