# KAMITSUBAKI Wiki 文档中心

这里是主站维护文档的权威来源。工作区根目录 `docs/` 是自动镜像；只在主站仓库修改文档，然后运行 `node scripts/sync-docs.mjs`。文档按用途分层，避免把历史验收记录当成现行规则。

面向贡献者与维护者的站内入口为 `/{locale}/docs/`。新增现行文档时，同时在 `src/lib/docsCenter.mjs` 登记标题、摘要、分类和稳定路径；不要把归档记录或一次性报告加入站内文档中心。

## 我应该看哪一份

| 任务 | 首要文档 | 补充文档 |
| --- | --- | --- |
| 投稿或修改百科词条 | [贡献指南](contributing.md) | [内容目录](../src/content/README.md) · [元数据规范](category-optimization/metadata-schema-v2.md) |
| 上传词条图片或附件 | [图片与附件](files-and-images.md) | [许可与署名](licensing.md) |
| 投稿独立文章 | [文章投稿与审核](v3/article-publishing.md) | [贡献指南](contributing.md) |
| 上传或维护设定图 | [图库投稿与审核](v3/gallery-r2.md) | [后端图库运维](../../kamitsubaki-wiki-site-backend/docs/gallery.md) |
| 新建实体、调整分类或形态 | [实体分类维护](maintenance/entity-classification.md) | [详细分类地图](category-optimization/classification-detailed-map.md) |
| 维护时间轴、关联和功能数据 | [功能数据维护](v3/feature-maintenance.md) | [功能数据规范](category-optimization/feature-data-architecture.md) |
| 新建或统一二级页面 | [页面系统规范](design/page-system.md) | [设计文档索引](design/README.md) |
| 发布 V3 | [发布手册](operations/release-runbook.md) | [当前验收状态](v3/acceptance/README.md) · [静态产物优化](v3/static-output-optimization.md) |

## 文档分区

- [贡献与站内指南](guides/README.md)：贡献、图片、来源许可，以及站内教程与维护规则。
- [内容与功能维护](maintenance/README.md)：实体、分类、元数据、时间轴、图库、文章和联动。
- [界面与组件设计](design/README.md)：二级页面、阅读器、共享组件和交互规范。
- [系统架构](architecture/README.md)：前端、后端、账户、AI 与安全边界。
- [运维与集成](operations/README.md)：发布前检查、外部服务、缩略图和集成配置。
- [V3 开发与验收](v3/README.md)：V3 当前状态、现行指南、验收证据和迁移报告。
- [历史归档](archive/README.md)：旧版本设计、阶段性评审和已被替代的计划。

## 状态标签

- **现行规范**：新增和修改必须遵守。
- **操作指南**：描述当前可执行流程。
- **验收记录**：只证明记录日期和环境下完成过的检查。
- **历史归档**：保留决策背景，不用于指导当前实现。
- **待验收**：实现或本地模拟存在，但真实预览/生产流程尚未完成。

## 维护规则

1. 功能、字段、路径或审核流程变化时，同一提交更新对应现行指南。
2. 日期化结果放入验收或归档目录；不要把测试数字写进长期规范。
3. 被替代的说明应移动到 `archive/` 并在开头写明替代文档；没有审计价值且会误导的内容直接删除。
4. 站内贡献中心直接读取 `contributing.*.md`、`files-and-images.*.md` 与 `licensing.*.md`，这些稳定路径不能随意移动。
5. 简中、日文、英文是维护源；繁体页面由生成流程产生。
6. `v3/reports/` 是脚本生成的迁移和校验证据，不能手工改成“好看”的结果。
7. 本地模拟、云端预览和正式发布必须分别记录。构建通过不等于投稿、R2、D1、OAuth 或生产部署已经验收。

## 文档检查

```sh
node scripts/check-docs.mjs
node scripts/sync-docs.mjs
node scripts/sync-docs.mjs --check
```

前后端共享契约另外执行 `node scripts/v3/sync-editor-schema.mjs --check` 与 `node scripts/v3/sync-gallery-contract.mjs --check`。
