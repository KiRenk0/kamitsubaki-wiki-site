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

// Verification never blocks review: its outcome only changes the guidance shown after submitting.
export function verificationNotice(outcome, email) {
	if (outcome.verified)
		return { done: true, text: "邮箱已验证，审核通过后会自动关联同邮箱的 Wiki 账号。" };
	if (outcome.previewUrl)
		return {
			done: false,
			text: "本地预览：已生成验证链接，可在下方打开。",
		};
	if (outcome.sent)
		return {
			done: false,
			text: `验证邮件已发送到 ${email}。点击邮件中的链接完成验证（可选，用于自动关联 Wiki 账号）；不验证也不影响审核。`,
		};
	return {
		done: false,
		text: `验证邮件暂时没有发出（${outcome.reason || "稍后可重试"}）。这不影响审核，稍后可点击“发送验证邮件”重试。`,
	};
}
