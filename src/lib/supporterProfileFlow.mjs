export class ProfileRequestError extends Error {
	constructor(message, code = "request_failed", status = 0) {
		super(message);
		this.name = "ProfileRequestError";
		this.code = code;
		this.status = status;
	}
}

export function failureMessage(error, fallback = "操作没有完成，输入已保留，请重试。") {
	if (error instanceof ProfileRequestError) return error.message;
	if (error && typeof error === "object") {
		if (error.name === "TimeoutError" || error.name === "AbortError")
			return "请求超时，输入已保留。请检查网络后重试。";
		if (error instanceof TypeError)
			return "网络连接失败，输入已保留。请检查网络后重试。";
	}
	return fallback;
}

export const isStaleVersion = (error) =>
	error instanceof ProfileRequestError && error.code === "version_conflict";

export const isExpiredLink = (error) =>
	error instanceof ProfileRequestError &&
	["invitation_expired", "invitation_required"].includes(error.code);

// The server enforces the same verified-email requirement as the page.
export function verificationNotice(outcome, email) {
  if(outcome.verified)return {done:true,text:'邮箱已验证。请选择现在绑定 Wiki 账号，或以后用同一已验证邮箱自动绑定，再提交审核。'};
  if(outcome.previewCode)return {done:false,text:`仅本地预览：验证码 ${outcome.previewCode}，10 分钟内有效。`};
  if(outcome.sent)return {done:false,text:`验证码已进入发送队列，收件邮箱为 ${email}。收到邮件后在本页输入 6 位验证码；10 分钟内有效。`};
  return {done:false,text:`验证码暂未发出（${outcome.reason||'稍后可重试'}）。输入已保留，请重试发送；验证完成后才能提交审核。`};
}
