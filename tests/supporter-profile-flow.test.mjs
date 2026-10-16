import assert from 'node:assert/strict';
import test from 'node:test';
import {
  failureMessage,
  isExpiredLink,
  isStaleVersion,
  ProfileRequestError,
  verificationNotice,
} from '../src/lib/supporterProfileFlow.mjs';

test('every failure mode produces a visible Chinese explanation that says input was kept', () => {
  assert.equal(failureMessage(new ProfileRequestError('请填写展示昵称', 'validation_error', 400)), '请填写展示昵称');
  assert.match(failureMessage(new TypeError('Failed to fetch')), /网络连接失败.*输入已保留/);
  assert.match(failureMessage(new DOMException('timeout', 'TimeoutError')), /请求超时.*输入已保留/);
  assert.match(failureMessage(new Error('boom')), /输入已保留/);
  assert.equal(failureMessage(undefined, '自定义'), '自定义');
});

test('stale versions and expired links are recognised from server error codes only', () => {
  assert.equal(isStaleVersion(new ProfileRequestError('x', 'version_conflict', 409)), true);
  assert.equal(isStaleVersion(new ProfileRequestError('x', 'invitation_expired', 401)), false);
  assert.equal(isStaleVersion(new Error('version_conflict')), false);
  assert.equal(isExpiredLink(new ProfileRequestError('x', 'invitation_expired', 401)), true);
  assert.equal(isExpiredLink(new ProfileRequestError('x', 'invitation_required', 401)), true);
  assert.equal(isExpiredLink(new ProfileRequestError('x', 'version_conflict', 409)), false);
});

test('email verification guidance never claims the submission is blocked', () => {
  assert.equal(verificationNotice({ verified: true }, 'a@b.c').done, true);
  const sent = verificationNotice({ verified: false, sent: true }, 'a@b.c');
  assert.equal(sent.done, false);
  assert.match(sent.text, /a@b\.c/);
  assert.match(sent.text, /不验证也不影响审核/);
  assert.match(verificationNotice({ verified: false, previewUrl: 'http://127.0.0.1/x' }, 'a@b.c').text, /本地预览/);
  const failed = verificationNotice({ verified: false, reason: '邮箱验证邮件尚未启用。' }, 'a@b.c');
  assert.match(failed.text, /不影响审核/);
  assert.match(failed.text, /邮箱验证邮件尚未启用/);
});
