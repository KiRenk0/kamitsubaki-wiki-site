# 账户与身份维护

账户沿用后端 Worker 的 GitHub / Google OAuth、站点会话和稳定用户 ID。主站只负责界面和调用 API，不保存 OAuth 令牌或复制身份数据库。

## 用户能力

- 查看和编辑公开昵称、语言、头像等资料。
- 管理已连接的登录方式与设备会话；不能移除最后一种可用登录方式。
- 将游客本地收藏明确合并到账号，并处理版本冲突；不会静默覆盖云端或本机副本。
- 查看本人百科提案、文章草稿/修订和图库修订。三类内容各有自己的审核状态。
- 导出账户资料，提交或取消账户注销申请。AI 对话数据属于 Gateway/PostgreSQL，按独立流程导出和删除。

## 安全与数据边界

- 浏览器只持有安全会话 Cookie；OAuth code、provider token 和服务端密钥不得写入 localStorage 或文档。
- 头像由服务端限制格式和大小，公开 URL 不包含用户 ID。不得允许 SVG/HTML 作为头像内容。
- 绑定新身份需要在现有登录会话内重新验证，不能按相同邮箱自动合并两个站点账户。
- 收藏、草稿、提案和审核接口必须按用户隔离；管理员权限由后端判定，前端隐藏按钮不构成授权。
- 注销涉及 Worker D1 和 Gateway PostgreSQL，失败状态必须可重试并保留审计，不能只删除前端资料。

## 维护与验收

前端环境使用正式 `PUBLIC_ACCOUNT_API_BASE`（未设置时为生产 API）；本地预览只连接隔离的测试数据。账户变更需验证两种 OAuth 回跳、身份绑定/解绑、设备撤销、头像、收藏冲突、账号切换、导出与注销，以及五语言、窄屏和明暗主题。

真实第三方 OAuth、Cloudflare Cookie/CORS 与生产数据库只能在匹配版本预览环境验收。历史设计和 V2.2.0 检查记录位于 `archive/features/account-v1.md`、`archive/features/account-v2.md` 与 `qa/`；其中的提交、测试数量和上线状态不是 V3 当前结论。后端规则见 [安全](../../kamitsubaki-wiki-site-backend/docs/security.md)、[数据归属](../../kamitsubaki-wiki-site-backend/docs/data.md) 与 [部署](../../kamitsubaki-wiki-site-backend/DEPLOYMENT.md)。
