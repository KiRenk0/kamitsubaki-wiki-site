---
book: develop
chapter: operations
locale: zh
order: 4
title: 本地开发、检查与发布
summary: 按前后端契约、迁移和真实流程分层验证，保留回滚依据。
---

## 本地准备

分别确认主站与后端仓库的分支、未提交文件、环境变量名称及当前服务地址。前端使用 pnpm；文档只在主站 `docs/` 编辑，运行 `node scripts/sync-docs.mjs` 更新工作区镜像。环境文件与密钥不得写入 Markdown、提交或浏览器日志。

## 针对性检查

文档修改至少执行 `node scripts/check-docs.mjs`、`node scripts/sync-docs.mjs --check` 和 `pnpm check`；前台路由变更再运行 `pnpm build`。内容结构变更先运行 `pnpm validate:content`，接口契约变更检查 `node scripts/v3/sync-editor-schema.mjs --check` 与 `node scripts/v3/sync-gallery-contract.mjs --check`。根据实际改动补充针对性后端测试，不用无关的大量重复测试掩盖流程问题。

## 发布与回滚

上线前记录前后端提交号、D1 迁移、Worker 配置、R2 绑定和前端目标版本。需要数据库迁移时先备份、在预览环境演练，确认 Worker 与前端接口兼容，再依发布手册操作。词条要检查 GitHub PR 审核、合并和静态站更新；文章要检查真实登录、数据库草稿、审批及公开读取；图库要检查私有暂存、批次提交、逐图审核和公开地址。构建成功或本地模拟不等于真实云端流程通过。

出现故障时先停住进一步发布，保存请求编号、记录状态与日志，核对是否有已经成功的写入，再按已记录的版本回滚前端或 Worker。D1 迁移与公开数据不能靠简单回退代码来“撤销”；应有备份和单独的数据修复方案。验收记录分别标注本地、模拟服务和真实服务，不宣称未走通的流程已上线可用。

## 按变更范围运行检查

| 变更 | 至少检查 |
| --- | --- |
| 说明书与链接 | `node scripts/check-docs.mjs`、`node scripts/sync-docs.mjs --check`、`pnpm check`。 |
| 分类与词条元数据 | `pnpm validate:content`、`node scripts/v3/sync-editor-schema.mjs --check`。 |
| 图库契约 | `node scripts/v3/sync-gallery-contract.mjs --check`，再验证后端迁移和权限。 |
| 前台路由或组件 | `pnpm check`、`pnpm build`、受影响流程的浏览器检查。 |
| 发布候选 | 构建链接、静态资源审计、后端测试、真实账号投稿与审核。 |

不要把一次旧版本的测试数字写成当前发布保证。构建前确认环境变量名称，但不把值写入文档、命令输出或截图。文档镜像检查失败时，只在主站 `docs/` 修正文稿，然后重新同步镜像。

## 发布顺序和证据

先固定前后端提交和本次 D1 迁移，再备份数据库、在预览环境演练；有跨层改动时先保持后端向后兼容。按依赖发布数据库迁移、Worker 和前端，然后分别验收词条 PR、文章 D1、图库私有暂存／公开 R2。记录真实服务的请求与记录编号、公开页面和回滚版本。模拟 D1/R2、静态构建和浏览器本地预览各自只能证明对应层。

故障时先核对是否已经产生写入；回滚代码不等于撤销数据库迁移，也不能删除已经公开的对象。需要数据修复时保留审计记录并制定单独方案。正式流程以仓库内发布手册为维护来源，站内本章提供安全的总览。
