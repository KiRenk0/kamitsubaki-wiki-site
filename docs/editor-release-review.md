# 站内编辑 → GitHub PR：本地候选版本审核

日期：2026-09-10。前后端均在隔离工作树的 `codex/wiki-editor-pr` 分支。当前改动保留在本地，未推送、合并、部署或启用生产入口。

## 本次可审核的结果

现有词条编辑器直接提交修改，站内账号识别作者，后端保存草稿和投稿任务，GitHub App 负责创建分支和 PR。后续修订更新同一 PR。维护者仍在 GitHub 审核和评论，站内显示讨论、检查、修改要求及发布进度。

作者不需要注册新的机器人账号；维护者以后创建并安装一个专用 GitHub App。App 私钥只放在 Worker secret 中，浏览器不接触 GitHub 写入凭据。

- 原编辑器和 Markdown 导出保留；普通编辑 URL 无需 `prDemo` 参数。
- 服务端草稿带版本锁，恢复前展示当前内容与保存内容；浏览器保留断网草稿。
- 我的投稿、继续修改、分页评论、旧版行内上下文、撤回和同步失败重试。
- 每个作者每篇文章最多一个进行中的投稿；请求幂等、后台租约和重启恢复。
- 原文变化时在站内核对原稿、最新原文、个人修改和 PR 分支；再次检查 SHA 后更新 PR，不强推，不写主分支。
- 检查和审核按 PR 当前提交计算；合并、部署失败、发布成功分别显示，发布必须匹配合并 SHA。
- 归属校验、来源校验、路径白名单、YAML 和体积校验、写入频率限制。
- 草稿保留 90 天；处理完的 Webhook 记录保留 30 天；删除站内账号同步清理私有编辑记录。已公开的 GitHub PR 保留。
- zh / ja / en 文案及繁体转换；生产构建不能通过 URL 或本地开关启用模拟账号。

第一版支持修改既有 artists、songs、albums、projects、logs 的 zh/ja/en Markdown。新建词条、图片上传、实时协作及站内回复 GitHub 评论不在此候选版本范围。

## 本地验证

| 验证 | 结果 |
|---|---|
| 前端测试 | 331 项通过 |
| 后端测试 | 227 项通过 |
| Astro check | 0 errors / 0 warnings；16 条现有提示 |
| 生产配置静态构建 | 通过，9,314 个页面，启用正式编辑功能且关闭本地模式 |
| Pages 资源体积审计 | 通过，14,758 个文件，最大 22.38 MiB |
| 歌词时间戳严格审计 | 通过 |
| Worker bundle dry-run | 通过，未部署 |
| 本地 D1 迁移 0019 | 使用临时配置和虚构 ID 在本地模拟器执行通过 |
| 差异格式检查 | 前后端通过 |
| 既有词条无修改导出 | 前轮 5,271 篇逐字一致 |
| 基础浏览器操作 | 正常入口、草稿对照、冲突核对后生成模拟 PR、撤回及旧评论恢复通过；前轮覆盖评论、第二版、账号隔离、断网恢复、审核和部署状态 |

撤回 API 的归属、版本和关闭行为有测试覆盖。原生确认框曾让 CUA 超时，随后从 Chrome 和恢复后的内置浏览器确认 PR #3 已关闭；后端重启后状态仍保留。旧 PR #1 的评论数量与较早版本评论也已重新验证。未使用 Playwright。构建期间暂停开发预览，避免繁体内容生成与文件监听互相干扰；测试/check/build 的预处理也必须顺序执行。

日志在 `/tmp/wiki-editor-final-{front-test,back-test,check,build,assets,worker}.log` 和 `/tmp/wiki-editor-d1-migration.log`。完整检查命令见两侧 package.json。

## 上线前仍需真实环境验收

预检 `pnpm editor:preflight` 当前失败：本地没有配置专用 GitHub App 和 Pages 查询凭据。这不是可忽略的提示。本地测试与 fetch mock 不能证明真实 App 权限、OAuth、Webhook、分支保护和部署接线正确。

审核后按以下顺序执行，先在测试仓库/测试环境跑通，再启用生产：

1. 确认目标仓库、主分支、测试环境和 GitHub App；只安装到目标仓库，授权 Contents/Pull requests 写入及 Checks/Commit statuses 等必要读取权限。App 不拥有绕过审核的权限。
2. 在目标 D1 备份并应用 0019；保留已有表和迁移，先部署功能关闭的 Worker。密钥按后端 `.dev.vars.editor.example` 通过 secret store 提供。
3. 配置签名 Webhook、每分钟 Cron 与 Pages 只读查询凭据。真实 staging 测试登录、创建一次 PR、更新同一 PR、外部提交冲突、评论、漏掉 Webhook 后恢复、失败重试和撤回。
4. 主分支要求维护者审核、撤销过期批准、`Verify wiki` 检查通过；确认 App 创建的 PR 实际触发现有 `pull_request` CI。发布测试覆盖失败和成功，并核对合并 SHA。
5. 用正式 API 地址构建前端，确认 CORS、会话、登录返回原编辑地址和账号切换。先验收完整路径，再启用生产 `EDITOR_ENABLED` 和 `PUBLIC_EDITOR_ENABLED`。

需要审核者确认的内容是上述功能行为和上线范围；凭据配置和外部权限的具体操作留在审核后执行。

## 回退

关闭 Worker `EDITOR_ENABLED` 并使用关闭 `PUBLIC_EDITOR_ENABLED` 的前端构建，即可停止站内投稿入口与后台发送。保留 D1 记录以便恢复，不删除迁移表。已存在的 GitHub PR 仍可由维护者在 GitHub 审核；关闭功能不代表撤销已合并的内容。发布内容若需回退，应单独通过审核的 revert PR 处理。

## 审核入口

启动两个工作树的 `pnpm dev:editor` 后，访问：

- `http://127.0.0.1:4358/zh/contribute/editor/?view=submissions`
- `http://127.0.0.1:4358/zh/contribute/editor/?target=src%2Fcontent%2Fprojects%2Fnovels%2Fkamitsubaki-city-novelized%2Fzh.md`

本地 Alice/Bob 和模拟 PR 与生产账号、GitHub 仓库无关。后端 SQLite 保存模拟状态；不会改写真实词条文件。

## 2026-09-13 API 补齐

后端已补充 Token 失效恢复、限流退避、PR 标题/说明修订、关闭前校验、分页评论和提交 SHA 一致性验证、Webhook 仓库匹配与检查事件同步。全套后端测试 241 项通过。GitHub 接线可使用 `pnpm editor:preflight --github`，详细接口清单见后端 `docs/editor-github-api.md`；此命令读取真实配置，当前缺少 App 凭据，尚未执行真实仓库联调。9 月 10 日的前端构建结果仍是历史验收记录，本轮未改动前端程序。
