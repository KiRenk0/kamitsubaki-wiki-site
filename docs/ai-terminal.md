# 统一 AI 小组件

[English](ai-terminal.en.md) / [中文](ai-terminal.md) / [日本語](ai-terminal.ja.md)

## 产品定位

Wiki 小组件是统一 AI 服务的轻量入口，不是第二套助手。默认 Agent 为 `observer`，用于当前 Wiki 阅读场景中的知识问答；完整的 Observer、五名角色、会话与记忆管理位于 `https://chat.kamitsubaki.wiki/<locale>/`。

## 代码位置

- `src/components/AiChatWidget.astro`：三语静态结构与无 JavaScript 基础状态；
- `src/scripts/aiChatWidget.js`：bootstrap、登录状态、SSE、Observer 历史与回调状态；
- `src/components/ExperiencePortals.astro`：首页游戏/AI 体验入口；
- `src/lib/i18n.mjs` 与 site content：站点级三语标题和导航文案。

## API

构建变量：

```dotenv
PUBLIC_AI_OBSERVER_API_BASE=https://api.kamitsubaki.wiki
```

小组件使用：

- `GET /api/ai/v2/bootstrap`
- `POST /api/ai/v2/chat`
- `GET /api/ai/v2/conversations?agentId=observer`
- `GET|PATCH|DELETE /api/ai/v2/conversations/:id`

所有请求必须携带 credentials。不要存储 Cookie/token，不要加入模型选择、Persona prompt、Gateway 地址或 AstrBot config ID。

## 行为

- 匿名用户可试用 Observer 五次，必要时完成 Turnstile；
- 角色聊天必须进入完整终端并登录；
- 登录用户可在小组件继续 Observer 会话；
- 事实问题采用自动检索，来源只从结构化 `source` SSE 渲染；
- 标题/Logo 留在 Wiki，明确的“打开终端”入口进入对应语言终端；
- OAuth 返回后刷新 bootstrap，并清理一次性查询参数。

## 联调

```bash
PUBLIC_AI_OBSERVER_API_BASE=http://127.0.0.1:8787 pnpm dev --host 127.0.0.1
```

至少验证三语、深浅色、桌面/移动端、匿名额度、GitHub/Google 回调、流式中断、来源链接、历史打开/重命名/删除，以及终端链接保留当前语言。

错误文案必须是面向用户的三语产品文案，不得出现 VPS、AstrBot key、数据库、内部 URL、堆栈或上游原始错误。

