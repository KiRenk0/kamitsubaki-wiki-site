# 文章数据库化：本地验收与上线顺序

## 数据与入口

正文唯一活动来源是文章数据库。`docs/archive/articles/` 保留原始 Markdown，只用于审计及导入，不进入 Astro 内容集合；`src/data/article-legacy.json` 仅保留旧链接识别信息，不作为公开文章列表。

文章来源为 `site-original` / `user-submission`。来源仅维护者可调整，普通用户只能修改自己拥有的投稿。作者署名与账号所有权分离。词条关联随修订审核，正文普通链接不自动关联。

## 生成与本地验证

从主站仓库运行：

```sh
node scripts/v3/sync-article-entities.mjs --check
node scripts/v3/export-article-import.mjs
node scripts/v3/export-article-import.mjs /tmp/wiki-article-import.sql
node --test tests/article-associations.test.mjs tests/article-submission.test.mjs tests/content-layout.test.mjs
```

不带参数的导入工具只输出预览。SQL 包含每篇冲突保护，不得使用忽略错误继续执行的导入模式。相同源文重复导入不覆盖之后的数据库修改；同 ID、同语言但不同正文且没有对应导入哈希时停止。

后端新增词条 ID 清单随主站词条变更更新：主站运行 `node scripts/v3/sync-article-entities.mjs`，将后端 `src/articles/entity-ids.json` 与词条变更配套发布。

本地预览（两个终端）：

```sh
# 后端仓库：内存 SQLite + 实际 Worker 请求处理器
node scripts/preview-articles.mjs /tmp/wiki-article-import.sql
# 主站仓库
PUBLIC_ARTICLE_API_URL=http://127.0.0.1:8797 PUBLIC_AI_OBSERVER_API_BASE=http://127.0.0.1:8797 pnpm exec astro dev --host 127.0.0.1 --port 4367
```

本地测试账号入口 `http://127.0.0.1:8797/local-login?user=bob`（投稿人）、`?user=alice`（维护者）、`?user=guest`（退出）。仅绑定 127.0.0.1，脚本不纳入 Worker 发布，数据随进程退出消失。审核页面 `/admin/articles`。这不是生产 OAuth/D1 验收。

## 已完成演练

- 6 篇文章的 18 份中日英源文，两次导入后仍为 18 条文档。
- 逐篇正文 SHA-256、原署名、原发布日期核对通过；繁体原文件保存在归档。
- 测试覆盖重复导入、后续编辑保留、冲突拒绝、普通账号越权、伪造来源、无效词条、发布后关联变更。
- 内置浏览器完成：花譜预选 → 添加理芽 → 保存 → 投稿 → 维护者批准 → 文章中心显示用户投稿 → 正文显示两个词条链接。

## 补充验收（2026-09-23）

- 390 × 844 手机宽度下，词条预选、搜索、键盘移除和添加均可操作；刷新后保留已修改关联，未被 URL 的预选覆盖。
- 繁体标题、摘要、正文与站内链接正常；英文原文正常；访客阅读不显示编辑入口。
- 修复审核列表翻页被重置的问题，以及已有文章加载失败后误建新稿的问题；后者增加回归测试。
- 后端全套 254 项通过；前端上一轮全套 422 项通过、4 项既有失败。补充后的文章、迁移及内容布局专项 12 项通过。
- Astro 类型检查 0 错误、0 警告；完整构建生成 9,509 页。检查与构建日志保存在本机 `/tmp/article-check-last.log`、`/tmp/article-build-final.log`。
- 导入预览见 `reports/article-import-preview.json`，包含逐篇源文及正文哈希、署名、发布日期、公开状态和关联词条；导出时复核关联存在性。

## 生产切换（本次未执行）

1. 备份现有文章文档、修订及导入来源表，保留当前前后端发布版本。
2. 应用后端 `0023_article_ownership.sql`；已有投稿依据最早修订恢复所有者，历史导入为站点原创，无可靠身份的记录仍由维护者维护。
3. 发布新后端及词条 ID 清单，执行审核过的 SQL 导入包。若有冲突，停止并核对目标记录，不覆盖数据库新内容。
4. 根据 JSON 核对报告检查每篇正文、署名、日期、来源与公开状态，确认后发布前端；不要先删线上旧入口再导入。
5. 用真实普通账号和维护者账号分别确认权限、投稿、批准、隐藏/恢复、旧链接及词条反向展示。

回退优先恢复前端发布版本，数据库新增字段保留兼容旧读取。不要删除切换后产生的投稿或修订。涉及后端回退时先暂停文章写入，避免旧版本开放任意文章修改权限；保留数据备份并修复前滚。归档可恢复旧源文件，但不得覆盖数据库中更新的正文。

## 已知基线

实施前前端全套测试已有 4 个失败：artist-enhancements、docs-i18n、edit-guide、music-contribution-standards。首页背景改动及文档基线不属于本次文章改动。内容校验的 1,036 条活动翻译提醒亦为既有项。
