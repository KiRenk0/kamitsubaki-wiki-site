# 系统架构索引

- [全域系统架构](../architecture-overview.md)：主站、Worker、D1、R2、AI Gateway 与外部服务的边界。
- [前端架构](../architecture.md) · [English](../architecture.en.md) · [日本語](../architecture.ja.md)
- [内容渲染安全](../content-security.md)
- [账户与身份维护](../account.md)
- [AI 小组件](../ai-terminal.md)
- 后端权威文档：[架构](../../../kamitsubaki-wiki-site-backend/docs/architecture.md)、[API](../../../kamitsubaki-wiki-site-backend/docs/api.md)、[数据归属](../../../kamitsubaki-wiki-site-backend/docs/data.md)、[安全](../../../kamitsubaki-wiki-site-backend/docs/security.md)。

主站是静态 Astro 应用；账户、文章、图库、支持和审核由 Worker 提供。文章正文存 D1，图库原图存 R2，百科 Markdown 存 GitHub。任何新功能都应先确定数据所有者、公开/私有边界、审核状态和失败回退，再实现页面。
