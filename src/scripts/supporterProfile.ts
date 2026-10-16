// A different invitation fragment must never reuse the preceding person's in-memory session.
import {
	failureMessage,
	isExpiredLink,
	isStaleVersion,
	ProfileRequestError,
	verificationNotice,
} from "../lib/supporterProfileFlow.mjs";

window.addEventListener("hashchange", () => window.location.reload());
const root = document.querySelector<HTMLElement>("[data-supporter-profile]");
if (root) {
	const page = root;
	const base = new URL(page.dataset.apiBase!),
		fragment = location.hash.slice(1),
		verifying = fragment.startsWith("verify="),
		token = verifying ? fragment.slice(7) : fragment,
		form = page.querySelector<HTMLFormElement>("[data-profile-form]")!,
		status = page.querySelector<HTMLElement>("[data-profile-status]")!,
		submit = page.querySelector<HTMLButtonElement>("[data-profile-submit]")!,
		file = page.querySelector<HTMLInputElement>("[data-avatar-input]")!,
		name = page.querySelector<HTMLInputElement>("[name=name]")!,
		email = page.querySelector<HTMLInputElement>("[name=email]")!,
		avatar = page.querySelector<HTMLImageElement>("[data-avatar-preview]")!,
		placeholder = page.querySelector<HTMLElement>("[data-avatar-placeholder]")!;
	let version = 0,
		avatarId = "",
		busy = false,
		dirty = false,
		objectURL = "",
		submitLabel = "提交审核",
		wikiUserId = "";
	const bind = page.querySelector<HTMLInputElement>(
			"[data-wiki-account-bind]",
		)!,
		wikiStatus = page.querySelector<HTMLElement>("[data-wiki-account-status]")!;
	async function loadWiki() {
		try {
			const account = await request("/profile/wiki-account");
			wikiUserId = account?.id || "";
			page.querySelector<HTMLElement>("[data-wiki-account-choice]")!.hidden =
				!account;
			page.querySelector<HTMLElement>("[data-wiki-login]")!.hidden = !!account;
			page.querySelector<HTMLElement>("[data-wiki-account-name]")!.textContent =
				account?.displayName || account?.id || "";
			wikiStatus.textContent = account
				? "已登录 Wiki。同邮箱验证后自动认领；也可勾选此账号随资料提交审核。"
				: "尚未登录。可先提交展示资料，或在新标签页登录后回到这里刷新。";
		} catch {
			wikiStatus.textContent =
				"暂时无法读取账号，可稍后重试；不影响提交展示资料。";
		}
	}
	page
		.querySelector("[data-wiki-refresh]")!
		.addEventListener("click", () => void loadWiki());
	const report = (text: string, error = false, scroll = error) => {
		status.textContent = text;
		status.dataset.error = String(error);
		if (scroll) {
			status.scrollIntoView({ block: "center", behavior: "smooth" });
			status.focus({ preventScroll: true });
		}
	};
	async function request(path: string, body?: unknown, raw = false) {
		if (
			["localhost", "127.0.0.1"].includes(location.hostname) &&
			!["localhost", "127.0.0.1"].includes(base.hostname)
		)
			throw new ProfileRequestError(
				"本地资料预览需要连接本地 API，请配置 PUBLIC_SUPPORT_API_BASE。",
				"local_api_missing",
			);
		const response = await fetch(new URL("/api/supporters" + path, base), {
			method: body === undefined ? "GET" : "POST",
			credentials: "include",
			cache: "no-store",
			headers: {
				Authorization: "Bearer " + token,
				...(body === undefined
					? {}
					: {
							"Content-Type": raw
								? "application/octet-stream"
								: "application/json",
						}),
			},
			body:
				body === undefined
					? undefined
					: raw
						? (body as Blob)
						: JSON.stringify(body),
			signal: AbortSignal.timeout(20000),
		});
		if (!response.headers.get("content-type")?.includes("application/json"))
			throw new ProfileRequestError(
				"服务暂不可用，输入已保留，请稍后重试。",
				"service_unavailable",
				response.status,
			);
		const value = await response.json();
		if (!response.ok)
			throw new ProfileRequestError(
				value.error?.message || "请求未完成，请重试。",
				value.error?.code,
				response.status,
			);
		return value.data;
	}
	function lock(value: boolean) {
		busy = value;
		for (const button of page.querySelectorAll<HTMLButtonElement>("button"))
			button.disabled = value;
		file.disabled = value;
		submit.textContent = value ? "正在处理…" : submitLabel;
	}
	async function previewAvatar(id: string) {
		const r = await fetch(
			new URL("/api/supporters/profile/avatar/" + id, base),
			{
				headers: { Authorization: "Bearer " + token },
				credentials: "omit",
				cache: "no-store",
			},
		);
		if (!r.ok) return;
		if (objectURL) URL.revokeObjectURL(objectURL);
		objectURL = URL.createObjectURL(await r.blob());
		avatar.src = objectURL;
		avatar.hidden = false;
		placeholder.hidden = true;
	}
	async function load() {
		if (busy) return;
		lock(true);
		try {
			if (!/^[\w-]{40,100}$/.test(token))
				throw new ProfileRequestError(
					"请使用爱发电私信或邮件中的完整专属链接。",
					"invitation_required",
				);
			const data = await request("/profile");
			const p = data.profile;
			name.value = p?.name || data.person.name || data.person.afdianName || "";
			email.value = p?.email || data.person.email || "";
			version = p?.version || 0;
			avatarId = p?.avatarId || data.person.avatarId || "";
			form.hidden = false;
			dirty = false;
			await loadWiki();
			bind.checked =
				!!wikiUserId &&
				(p?.wikiUserId === wikiUserId || data.person.wikiUserId === wikiUserId);
			if (avatarId) await previewAvatar(avatarId);
			report(
				p?.status === "pending"
					? "资料已提交，等待管理员审核。你也可以修改后重新提交。"
					: p?.status === "rejected"
						? `请修改后重新提交：${p.reason}`
						: "专属链接已验证。填写后提交，审核通过后会自动更新感谢名单。",
			);
		} catch (e) {
			report(failureMessage(e, "读取失败，请稍后重新读取。"), true);
			page.querySelector<HTMLElement>("[data-profile-outside-retry]")!.hidden =
				isExpiredLink(e);
		} finally {
			lock(false);
		}
	}
	form.addEventListener("input", () => {
		dirty = true;
	});
	file.addEventListener("change", async () => {
		const selected = file.files?.[0];
		if (!selected || busy) return;
		lock(true);
		try {
			if (
				!["image/png", "image/jpeg", "image/webp"].includes(selected.type) ||
				selected.size > 2 * 1024 * 1024
			)
				throw new ProfileRequestError(
					"请使用最大 2 MiB 的 PNG、JPEG 或 WebP 图片。",
					"invalid_avatar",
				);
			const data = await request("/profile/avatar", selected, true);
			avatarId = data.id;
			await previewAvatar(avatarId);
			dirty = true;
			report("头像已暂存，提交资料后进入审核。");
		} catch (e) {
			report(failureMessage(e, "头像上传失败，请重试。"), true);
		} finally {
			file.value = "";
			lock(false);
		}
	});
	const done = page.querySelector<HTMLElement>("[data-profile-done]")!,
		doneName = done.querySelector<HTMLElement>("[data-done-name]")!,
		doneEmail = done.querySelector<HTMLElement>("[data-done-email]")!,
		doneVerify = done.querySelector<HTMLElement>("[data-done-verify]")!,
		resend = done.querySelector<HTMLButtonElement>("[data-verify-resend]")!,
		edit = done.querySelector<HTMLButtonElement>("[data-profile-edit]")!,
		preview = page.querySelector<HTMLAnchorElement>("[data-email-preview]")!;
	// Email verification only gates automatic Wiki account matching; it must never block the submission itself.
	async function sendVerification(address: string) {
		resend.hidden = true;
		doneVerify.textContent = "正在发送验证邮件…";
		try {
			const outcome = await request("/profile/email", { email: address });
			const notice = verificationNotice(
				{
					verified: !!outcome.verified,
					previewUrl: outcome.previewUrl,
					sent: !outcome.verified && !outcome.previewUrl,
				},
				address,
			);
			doneVerify.textContent = notice.text;
			preview.hidden = !outcome.previewUrl;
			if (outcome.previewUrl) preview.href = outcome.previewUrl;
			resend.hidden = notice.done;
			resend.textContent = "重新发送验证邮件";
		} catch (e) {
			doneVerify.textContent = verificationNotice(
				{ verified: false, reason: failureMessage(e) },
				address,
			).text;
			resend.hidden = false;
		}
	}
	function showDone(finalName: string, address: string) {
		doneName.textContent = finalName;
		doneEmail.textContent = address;
		form.hidden = true;
		done.hidden = false;
		report(
			"已提交，正在等待管理员审核。通过后会自动更新感谢名单，无需重复登记。",
			false,
			false,
		);
		done.scrollIntoView({ block: "start", behavior: "smooth" });
	}
	form.addEventListener("submit", async (event) => {
		event.preventDefault();
		if (busy) return;
		if (!form.reportValidity()) {
			report("请先补全必填项：展示昵称和权益接收邮箱。", true);
			return;
		}
		submitLabel = "提交审核";
		lock(true);
		report("正在提交资料…", false, false);
		const address = email.value.trim(),
			finalName = name.value.trim();
		try {
			const data = await request("/profile", {
				name: finalName,
				email: address,
				avatarId,
				version,
				...(bind.checked && wikiUserId ? { wikiUserId } : {}),
			});
			version = data.version;
			dirty = false;
			showDone(finalName, address);
			lock(false);
			if (data.emailVerified)
				doneVerify.textContent = verificationNotice(
					{ verified: true },
					address,
				).text;
			else await sendVerification(address);
		} catch (e) {
			if (isStaleVersion(e)) {
				try {
					const latest = await request("/profile");
					version = latest.profile?.version || 0;
					report(
						"这份资料在别处已有更新，已自动同步最新版本。请核对填写内容后再点一次“提交审核”。",
						true,
					);
				} catch (reload) {
					report(failureMessage(reload), true);
				}
			} else report(failureMessage(e, "提交未完成，输入已保留，请重试。"), true);
		} finally {
			lock(false);
		}
	});
	resend.addEventListener("click", () => {
		if (!busy) void sendVerification(doneEmail.textContent || "");
	});
	edit.addEventListener("click", () => {
		done.hidden = true;
		form.hidden = false;
		submitLabel = "重新提交审核";
		submit.textContent = submitLabel;
		report("可以修改后重新提交，新的提交会替换待审核的资料。");
	});
	for (const button of page.querySelectorAll<HTMLButtonElement>(
		"[data-profile-retry]",
	))
		button.addEventListener("click", () => {
			if (!dirty || confirm("重新读取会覆盖尚未提交的修改，继续吗？"))
				void load();
		});
	window.addEventListener("beforeunload", (event) => {
		if (dirty) event.preventDefault();
	});
	if (verifying) {
		const confirmButton = page.querySelector<HTMLButtonElement>(
			"[data-email-confirm]",
		)!;
		confirmButton.hidden = false;
		report(
			"点击确认，验证权益接收邮箱。邮箱匹配的 Wiki 账号将自动认领贡献；展示资料仍需审核。",
		);
		confirmButton.addEventListener("click", async () => {
			if (busy) return;
			lock(true);
			try {
				await request("/email/verify", {});
				confirmButton.hidden = true;
				report(
					"邮箱已验证，可以关闭此页面。已提交的展示资料会继续审核；邮箱匹配的 Wiki 账号会自动关联。",
					false,
					true,
				);
			} catch (e) {
				report(failureMessage(e, "验证未完成，请重新点击邮件中的链接。"), true);
			} finally {
				lock(false);
			}
		});
	} else void load();
}
