import { editorApiBase, localEditor } from "../lib/editorConfig.mjs";
import { sourceRequest } from "../lib/editorSource.mjs";
import { diffLines, submissionLabels, isOpen } from "../lib/editorPrDemo.mjs";
// Explicit development mode. Production builds cannot activate the local service.
const apiBase = editorApiBase;
export function initializeEditorPrDemo(root, editor) {
  const $ = (s) => root.querySelector(s),
    dialog = $("[data-pr-dialog]");
  let account = null,
    entries = [],
    snapshot = null,
    base = null,
    selected = null,
    busy = false,
    draftVersion = 0,
    operation = null,
    editingVersion,
    refreshSequence = 0,
    connectionFailed = false,
    conflict = null,
    recovery = null,
    nextBefore = null,
    nextId = null,
    olderEntries = [];
  const dictionary = JSON.parse(dialog.dataset.prCopy || "{}"),
    t = (text) => dictionary[text] || text,
    f = (text, ...values) =>
      t(text).replace(/\{(\d+)\}/g, (_, i) => String(values[i]));
  const message = (text) => ($("[data-pr-feedback]").textContent = t(text));
  const el = (tag, text, cls = "") => {
    const e = document.createElement(tag);
    e.textContent = text;
    e.className = cls;
    return e;
  };
  async function api(path, method = "GET", body) {
    let response;
    try {
      response = await fetch(apiBase + path, {
        method,
        credentials: "include",
        signal: AbortSignal.timeout(15000),
        headers: body ? { "Content-Type": "application/json" } : {},
        body: body
          ? JSON.stringify(
              Object.fromEntries(
                Object.entries(body).filter(
                  ([key]) =>
                    key !== "baseContent" || path === "/api/editor/draft",
                ),
              ),
            )
          : undefined,
      });
    } catch {
      connectionFailed = true;
      throw Error(
        t("无法连接投稿服务。编辑内容仍保留在本机；恢复连接后可以重试。"),
      );
    }
    let data;
    try {
      data = await response.json();
    } catch {
      connectionFailed = true;
      throw Error(
        t("投稿服务暂时不可用。编辑内容仍保留在本机，请恢复连接后重试。"),
      );
    }
    if (!response.ok) {
      $("[data-pr-login]").hidden = response.status !== 401 || localEditor;
      throw Object.assign(
        Error(
          response.status === 401
            ? t("请先登录站内账号，再提交或查看投稿。")
            : data.error || t("请求失败"),
        ),
        { status: response.status },
      );
    }
    $("[data-pr-login]").hidden = true;
    return data;
  }
  async function refresh() {
    const sequence = ++refreshSequence,
      previous = JSON.stringify({ account, entries }),
      previousSync = selected?.sync;
    const session = await api("/api/editor/session");
    const data = await api(
      "/api/editor/submissions?accountId=" +
        encodeURIComponent(session.account.id),
    );
    let updatedSelected = null;
    if (selected && (!account || account.id === session.account.id)) {
      const meta = data.submissions.find((e) => e.id === selected.id);
      updatedSelected =
        meta && selected.updated === meta.updated
          ? selected
          : await api(
              "/api/editor/submissions/" +
                selected.id +
                "?accountId=" +
                encodeURIComponent(session.account.id),
            );
    }
    if (sequence !== refreshSequence) return;
    if (account && account.id !== session.account.id) {
      selected = null;
      snapshot = null;
      base = null;
      draftVersion = 0;
      operation = null;
      editingVersion = undefined;
      olderEntries = [];
      message(t("登录账号已变化，请关闭面板后重新核对内容。"));
    }
    account = session.account;
    $("[data-pr-account-name]").textContent = account.name;
    entries = [
      ...data.submissions,
      ...olderEntries.filter(
        (e) => !data.submissions.some((n) => n.id === e.id),
      ),
    ];
    if (!olderEntries.length) {
      nextBefore = data.nextBefore;
      nextId = data.nextId;
    }
    if (selected) selected = updatedSelected;
    if (previous !== JSON.stringify({ account, entries })) render();
    if (connectionFailed) {
      connectionFailed = false;
      message(t("已重新连接投稿服务，投稿记录已恢复。当前编辑内容保持不变。"));
    }
    if (previousSync === "pending" && selected?.sync === "synced")
      message(f("PR #{0} 已同步，等待审核。", selected.number));
  }
  function tab(name) {
    root
      .querySelectorAll("[data-pr-panel]")
      .forEach((e) => (e.hidden = e.dataset.prPanel !== name));
    root
      .querySelectorAll("[data-pr-tab]")
      .forEach((e) =>
        e.setAttribute("aria-pressed", String(e.dataset.prTab === name)),
      );
  }
  function render() {
    const entry = selected,
      lines =
        snapshot && base
          ? diffLines(entry?.content || base.content, snapshot.content)
          : [];
    $("[data-pr-entry]").textContent =
      entry?.title || snapshot?.title || t("请选择投稿");
    $("[data-pr-state]").textContent = entry
      ? `PR #${entry.number || t("待创建")} · ${f("第 {0} 次提交", entry.revision)} · ${entry.sync === "conflict" ? t("原文或分支冲突") : entry.sync === "pending" ? f("正在提交（已重试 {0} 次）", entry.attempts) : t(submissionLabels[entry.status])}`
      : t("尚未提交");
    $("[data-pr-path]").textContent = snapshot?.path || entry?.path || "";
    $("[data-pr-more-comments]").hidden = selected?.nextPage == null;
    $("[data-pr-more-submissions]").hidden = nextBefore == null;
    $("[data-pr-withdraw]").hidden = !entry || !isOpen(entry);
    $("[data-pr-withdraw]").disabled = busy || entry?.sync === "pending";
    $("[data-pr-resolve]").hidden = !(
      (entry && isOpen(entry) && entry.sync !== "pending") ||
      (snapshot && (base || conflict))
    );
    $("[data-pr-resolve]").disabled = busy;
    const error = $("[data-pr-sync-error]");
    error.textContent = t(entry?.syncError || "");
    error.hidden = !entry?.syncError;
    $("[data-pr-retry]").hidden = !(
      (entry?.sync === "pending" && entry.attempts > 0) ||
      entry?.sync === "paused"
    );
    $("[data-pr-retry]").disabled = busy;
    const diff = $("[data-pr-diff]");
    diff.replaceChildren();
    for (const line of lines.slice(0, 300))
      diff.append(
        el(
          "div",
          `${line.type === "added" ? "+" : "−"} ${line.line}  ${line.text}`,
          `ve-pr-${line.type}`,
        ),
      );
    if (!lines.length) diff.append(el("p", t("没有新的修改。")));
    if (lines.length > 300)
      diff.append(el("p", f("还有 {0} 行差异未展开。", lines.length - 300)));
    $("[data-pr-diff-count]").textContent =
      `+${lines.filter((l) => l.type === "added").length} / −${lines.filter((l) => l.type === "removed").length}`;
    $("[data-pr-submit]").disabled =
      busy ||
      !snapshot ||
      !base ||
      !lines.length ||
      (!!entry && (!isOpen(entry) || entry.sync !== "synced"));
    $("[data-pr-submit]").textContent = entry ? t("更新此 PR") : t("提交审核");
    $("[data-pr-save-draft]").disabled = busy || !snapshot || !base || !account;
    $("[data-pr-load-draft]").disabled = busy || !snapshot || !base || !account;
    $("[data-pr-checks]").textContent = entry
      ? `${t("检查")}：${{ pending: t("等待"), passed: t("通过"), failed: t("失败") }[entry.checks]}; ${t("审核")}：${entry.approved ? t("已批准") : t("等待批准")}。`
      : t("提交后在这里查看审核结果。");
    const comments = $("[data-pr-comments]");
    comments.replaceChildren();
    for (const c of entry?.comments || []) {
      const item = el("article", "", "ve-pr-comment");
      item.append(
        el("strong", c.author || t("审核者")),
        el(
          "small",
          `${new Date(c.at).toLocaleString()}${c.revision ? ` · ${f("第 {0} 次提交", c.revision)}` : ""}${c.commit && c.commit !== entry.headSha ? t(" · 较早版本") : ""}`,
        ),
      );
      if (c.kind === "inline")
        item.append(
          el("blockquote", `${c.path || entry.path}:${c.line}\n${c.quote}`),
        );
      item.append(el("p", c.body));
      comments.append(item);
    }
    if (!entry?.comments?.length) comments.append(el("p", t("暂无审核评论。")));
    const list = $("[data-pr-list]");
    list.replaceChildren();
    for (const item of entries) {
      const card = el("article", "", "ve-pr-list-item");
      card.append(
        el("strong", item.title),
        el(
          "p",
          `PR #${item.number || t("待创建")} · ${t(submissionLabels[item.status])} · ${f("{0} 条评论", item.commentCount || 0)}`,
        ),
      );
      const view = el("button", t("查看投稿"));
      view.onclick = () =>
        action(async () => {
          selected = await api("/api/editor/submissions/" + item.id);
          snapshot = null;
          base = null;
          tab("discussion");
        });
      const edit = el("button", t("继续修改"));
      edit.disabled = !isOpen(item);
      edit.onclick = () =>
        action(async () => {
          const full = await api("/api/editor/submissions/" + item.id);
          if (editor.restore(full)) dialog.close();
        });
      card.append(view, edit);
      list.append(card);
    }
    if (!entries.length) list.append(el("p", t("当前账号还没有投稿。")));
    for (const button of root.querySelectorAll("[data-pr-event]")) {
      const action = button.dataset.prEvent;
      button.disabled =
        busy ||
        entry?.sync !== "synced" ||
        (action === "merge"
          ? !(isOpen(entry) && entry.approved && entry.checks === "passed")
          : ["publish", "deploy-fail"].includes(action)
            ? !["merged", "failed"].includes(entry?.status)
            : !isOpen(entry));
    }
    $("[data-pr-count]").textContent = String(entries.length);
  }
  async function open(name = "submit") {
    busy = true;
    conflict = null;
    olderEntries = [];
    message(t("正在连接投稿服务…"));
    dialog.showModal();
    tab(name);
    try {
      await refresh();
      if (name === "history") {
        snapshot = null;
        base = null;
        selected = null;
        message(t("已加载当前账号的投稿记录。"));
        return;
      }
      snapshot = editor.snapshot();
      base = await api(
        "/api/editor/source?path=" + encodeURIComponent(snapshot.path),
      );
      selected =
        entries.find((e) => e.path === snapshot.path && isOpen(e)) || null;
      if (selected)
        selected = await api("/api/editor/submissions/" + selected.id);
      editingVersion = selected?.version;
      if (snapshot.baseSha && snapshot.baseSha !== base.sha) {
        conflict = {
          original: snapshot.baseContent || null,
          yours: snapshot.content,
          current: base.content,
          currentSha: base.sha,
          headSha: null,
          path: snapshot.path,
        };
        throw Error(
          t("原文已更新。请保留草稿并重新加载原文核对，不能直接覆盖新版本。"),
        );
      }
      if (!snapshot.baseSha && !selected) {
        const response = await fetch(sourceRequest(snapshot.path));
        if (!response.ok) throw Error(t("无法核对旧草稿原文"));
        const files = (await response.json()).files;
        const original =
          files[
            Object.keys(files).find(
              (p) => p.normalize("NFC") === snapshot.path.normalize("NFC"),
            )
          ];
        if (original !== base.content) {
          conflict = {
            original,
            yours: snapshot.content,
            current: base.content,
            currentSha: base.sha,
            headSha: null,
            path: snapshot.path,
          };
          throw Error(t("原文已变化，请点“核对原文冲突”继续处理。"));
        }
      }
      const saved = await api(
        "/api/editor/draft?path=" + encodeURIComponent(snapshot.path),
      );
      draftVersion = saved?.version || 0;
      operation = null;
      message(
        localEditor
          ? t("已连接本地服务，本次操作不会写入线上仓库。")
          : t("已连接投稿服务。提交前请核对差异。"),
      );
    } catch (error) {
      base = null;
      message(error.message);
    } finally {
      busy = false;
      render();
    }
  }
  $("[data-pr-open]").hidden = false;
  $("[data-pr-banner]").hidden = false;
  $("[data-pr-open]").textContent = t("提交审核");
  $("[data-pr-open]").onclick = () => open();
  $("[data-pr-history]").onclick = () => open("history");
  $("[data-pr-close]").onclick = () => dialog.close();
  root
    .querySelectorAll("[data-pr-return]")
    .forEach((b) => (b.onclick = () => dialog.close()));
  root
    .querySelectorAll("[data-pr-tab]")
    .forEach((b) => (b.onclick = () => tab(b.dataset.prTab)));
  async function action(fn) {
    if (busy) return;
    busy = true;
    render();
    try {
      await fn();
    } catch (error) {
      message(error.message);
    } finally {
      busy = false;
      render();
    }
  }
  $("[data-pr-submit]").onclick = () =>
    action(async () => {
      const fresh = editor.snapshot();
      if (fresh.path !== snapshot.path)
        throw Error(t("词条已变化，请重新打开面板。"));
      operation ||= crypto.randomUUID();
      const result = await api("/api/editor/submissions", "POST", {
        ...fresh,
        id: selected?.id,
        version: editingVersion,
        baseSha: snapshot.baseSha || selected?.baseSha || base.sha,
        accountId: account.id,
        operation,
        summary: $("[data-pr-summary]").value,
        source: $("[data-pr-source]").value,
      });
      selected = result;
      editingVersion = result.version;
      snapshot = fresh;
      operation = null;
      await refresh();
      tab("discussion");
      message(t("投稿已保存，后台正在创建或更新 PR。"));
    });
  $("[data-pr-withdraw]").onclick = () =>
    action(async () => {
      if (
        !window.confirm(
          t("撤回这份投稿并关闭对应 PR？正文会保留在投稿记录中。"),
        )
      )
        return;
      selected = await api(
        "/api/editor/submissions/" + selected.id + "/withdraw",
        "POST",
        { accountId: account.id, version: selected.version },
      );
      await refresh();
      message(t("已请求撤回。"));
    });
  $("[data-pr-more-comments]").onclick = () =>
    action(async () => {
      const data = await api(
        "/api/editor/submissions/" +
          selected.id +
          "/comments?page=" +
          selected.nextPage,
      );
      selected.comments.push(...data.comments);
      selected.nextPage = data.nextPage;
    });
  $("[data-pr-more-submissions]").onclick = () =>
    action(async () => {
      const data = await api(
        "/api/editor/submissions?before=" +
          nextBefore +
          "&beforeId=" +
          encodeURIComponent(nextId),
      );
      entries.push(...data.submissions);
      olderEntries.push(...data.submissions);
      nextBefore = data.nextBefore;
      nextId = data.nextId;
    });
  $("[data-pr-retry]").onclick = () =>
    action(async () => {
      await api("/api/editor/submissions/" + selected.id + "/retry", "POST", {
        accountId: account.id,
      });
      message(t("已请求重试，投稿内容保持不变。"));
      await refresh();
    });
  $("[data-pr-save-draft]").onclick = () =>
    action(async () => {
      const fresh = editor.snapshot();
      const result = await api("/api/editor/draft", "PUT", {
        ...fresh,
        accountId: account.id,
        version: draftVersion,
        baseSha: fresh.baseSha || base.sha,
      });
      draftVersion = result.version;
      message(f("服务端草稿已保存，第 {0} 版。", draftVersion));
    });
  $("[data-pr-load-draft]").onclick = () =>
    action(async () => {
      const draft = await api(
        "/api/editor/draft?path=" + encodeURIComponent(snapshot.path),
      );
      if (!draft) throw Error(t("没有服务端草稿"));
      if (editor.restore({ ...snapshot, ...draft })) {
        draftVersion = draft.version;
        dialog.close();
      }
    });
  $("[data-pr-switch-account]").onclick = () =>
    action(async () => {
      await api("/__local/session", "POST", {
        account: account?.id === "alice" ? "bob" : "alice",
      });
      await refresh();
      message(t("已切换本地账号。当前编辑内容仍保留，请核对后再提交。"));
    });
  root.querySelectorAll("[data-pr-event]").forEach(
    (button) =>
      (button.onclick = () =>
        action(async () => {
          await api("/__local/event", "POST", {
            number: selected.number,
            action: button.dataset.prEvent,
            body: $("[data-pr-comment]").value,
            kind: $("[data-pr-comment-kind]").value,
            line: Number($("[data-pr-line]").value),
          });
          await refresh();
          message(t("本地 GitHub 事件已通过签名 Webhook 同步。"));
        })),
  );
  $("[data-pr-reset]").hidden = true;
  $("[data-pr-switch-account]").hidden = !localEditor;
  root.querySelector('[data-pr-tab="simulate"]').hidden = !localEditor;
  async function showConflict() {
    if (selected) {
      conflict = await api(
        "/api/editor/submissions/" +
          selected.id +
          "/conflict?accountId=" +
          encodeURIComponent(account.id),
      );
    } else if (!conflict) {
      const fresh = editor.snapshot(),
        current = await api(
          "/api/editor/source?path=" + encodeURIComponent(fresh.path),
        );
      conflict = {
        path: fresh.path,
        original: fresh.baseContent || null,
        yours: fresh.content,
        current: current.content,
        currentSha: current.sha,
        headSha: null,
      };
    }
    if (snapshot && snapshot.path === conflict.path) {
      const fresh = editor.snapshot();
      conflict.yours = fresh.content;
    }
    $("[data-pr-original]").value =
      conflict.original ?? t("没有保存旧版原文，请核对最新原文与修改内容。");
    $("[data-pr-current]").value = conflict.current;
    $("[data-pr-yours]").value = conflict.yours;
    $("[data-pr-branch]").value =
      conflict.branchContent ?? t("尚未创建远程分支");
    $("[data-pr-resolution]").value = conflict.yours;
    $("[data-pr-resolution-confirm]").checked = false;
    tab("resolve");
  }
  $("[data-pr-resolve]").onclick = () => action(showConflict);
  $("[data-pr-resolve-submit]").onclick = () =>
    action(async () => {
      if (!conflict || !$("[data-pr-resolution-confirm]").checked)
        throw Error(t("请先核对最新原文和分支内容并勾选确认。"));
      const result = await api("/api/editor/submissions", "POST", {
        id: conflict.id,
        version: conflict.version,
        path: conflict.path,
        content: $("[data-pr-resolution]").value,
        summary: $("[data-pr-resolution-summary]").value,
        source: "",
        accountId: account.id,
        baseSha: conflict.currentSha,
        expectedHead: conflict.headSha,
        resolve: true,
        operation: (operation ||= crypto.randomUUID()),
      });
      selected = result;
      editingVersion = result.version;
      operation = null;
      conflict = null;
      snapshot = null;
      await refresh();
      tab("discussion");
      message(
        t("核对后的内容已保存，等待更新 PR。请从“我的投稿”继续编辑这一版。"),
      );
    });
  async function checkRecovery() {
    try {
      const session = await api("/api/editor/session");
      const fresh = editor.snapshot();
      const saved = await api(
        "/api/editor/draft?path=" +
          encodeURIComponent(fresh.path) +
          "&accountId=" +
          encodeURIComponent(session.account.id),
      );
      recovery = saved
        ? { ...fresh, ...saved, accountId: session.account.id }
        : null;
      const notice = $("[data-pr-draft-notice]");
      notice.hidden = !saved || saved.content === fresh.content;
      if (!notice.hidden)
        $("[data-pr-draft-description]").textContent = f(
          "发现服务端第 {0} 版草稿，可以查看或恢复。",
          saved.version,
        );
    } catch {
      /* Offline/anonymous editing remains available; submission surfaces the error. */
    }
  }
  $("[data-pr-recover]").onclick = async () => {
    try {
      const session = await api("/api/editor/session");
      if (session.account.id !== recovery?.accountId)
        throw Error(t("账号已变化，请重新加载草稿。"));
      const saved = await api(
        "/api/editor/draft?path=" +
          encodeURIComponent(recovery.path) +
          "&accountId=" +
          encodeURIComponent(session.account.id),
      );
      if (!saved) throw Error(t("没有服务端草稿"));
      const current = editor.snapshot();
      recovery = { ...recovery, ...saved };
      $("[data-pr-recovery-current]").value = current.content;
      $("[data-pr-recovery-saved]").value = saved.content;
      const changes = diffLines(current.content, saved.content);
      $("[data-pr-recovery-diff]").textContent =
        `+${changes.filter((l) => l.type === "added").length} / −${changes.filter((l) => l.type === "removed").length}`;
      if (!dialog.open) dialog.showModal();
      tab("recover");
    } catch (error) {
      await open("history");
      message(error.message);
    }
  };
  $("[data-pr-recovery-apply]").onclick = async () => {
    try {
      const session = await api("/api/editor/session");
      if (session.account.id !== recovery?.accountId)
        throw Error(t("账号已变化，请重新加载草稿。"));
      if (editor.restore(recovery)) {
        $("[data-pr-draft-notice]").hidden = true;
        dialog.close();
      }
    } catch (error) {
      message(error.message);
    }
  };
  root.addEventListener("editor-source-loaded", checkRecovery);
  setTimeout(() => {
    if (new URLSearchParams(location.search).get("view") === "submissions")
      open("history");
    else checkRecovery();
  }, 300);
  const observer = new ResizeObserver(() =>
    root.style.setProperty(
      "--ve-pr-header-height",
      `${$(".ve-topbar").offsetHeight + $("[data-pr-banner]").offsetHeight + $("[data-pr-draft-notice]").offsetHeight}px`,
    ),
  );
  observer.observe($(".ve-topbar"));
  observer.observe($("[data-pr-banner]"));
  observer.observe($("[data-pr-draft-notice]"));
  let polling = false;
  setInterval(
    async () => {
      if (!dialog.open || busy || polling) return;
      polling = true;
      try {
        await refresh();
      } catch (error) {
        message(error.message);
      } finally {
        polling = false;
      }
    },
    localEditor ? 2500 : 15000,
  );
  render();
}
