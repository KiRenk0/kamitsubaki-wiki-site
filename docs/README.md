# 维护文档入口

本目录为主站维护文档的权威来源。工作区根目录 `docs/` 是镜像，请在主站编辑后运行 `node scripts/sync-docs.mjs`，不要两处独立修改。

## 贡献与日常维护

- [贡献指南](contributing.md) · [English](contributing.en.md) · [日本語](contributing.ja.md)
- [图片与附件](files-and-images.md)
- [许可与署名](licensing.md)
- [V3 目录与元数据](v3/content-layout.md)
- [时间轴、关联与功能维护](v3/feature-maintenance.md)
- [图库上传、资料修改与审核](v3/gallery-r2.md)
- [文章投稿与审核](v3/article-publishing.md)

## 规范与开发记录

- [V3 开发与验收](v3/README.md)：当前范围与验收记录。
- [详细分类地图](category-optimization/classification-detailed-map.md)：按指定层级编目。
- [元数据协议](category-optimization/metadata-schema-v2.md)：当前协议为 2，网站版本为 3。
- [功能数据设计](category-optimization/feature-data-architecture.md)：初始设计；图库上传以现行图库维护说明为准。
- `v3/reports/`：保留迁移、字段归一化及验证证据，不手工美化或删除审计记录。
- `superpowers/` 与日期化方案：历史设计和实施计划，不能作为当前功能已完成的证明。

## 更新规则

修改功能时同时更新相应维护指南，保留旧决策的时间和替代说明。站内贡献中心直接读取贡献及附件文档；语法和格式教程源位于 `src/content/contribute/`。简中、日文、英文维护源文件，繁体由生成流程更新。

前后端字段与路径规则通过 `scripts/v3/sync-editor-schema.mjs` 同步；图库角色目录和管理界面通过 `scripts/v3/sync-gallery-contract.mjs` 同步。两者均支持 `--check`。文档镜像使用 `scripts/sync-docs.mjs --check`，只核对清单内文件，不删除工作区特有资料。

验收记录必须区分本地模拟、真实预览和正式发布。没有实际执行的检查标为待验收，禁止把实现或构建成功写成已上线。
