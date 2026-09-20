# V3 贡献指南

[English](contributing.en.md) · [日本語](contributing.ja.md) · [维护文档目录](README.md)

## 选择要做的事

- 修改百科词条：从阅读器的“编辑词条”进入，系统带入真实文件路径。
- 新建词条或文章：打开贡献中心的编辑器，选择类型与源语言，建立新稿。
- 上传设定图或补充图片资料：进入 [图库投稿与维护](/zh/gallery/manage/)。图片和资料走 Worker、R2、D1，不走 GitHub。
- 提交功能、样式或维护规则修改：在对应仓库的开发分支提交 PR。

词条和文章使用 GitHub 投稿提案；图库使用站内提案。两者均由站长审核后公开。登录用户可以建议修改其他人创建的公开资料；不会直接覆盖公开版本。

## 新建与编辑条目

1. 先搜索是否已经存在对应实体，避免因译名不同重复创建。
2. 选择实体类型，填写稳定 ID、语言、名称及模板中的必填字段。ID 使用小写英文、数字和连字符，跨语言共用；既有 ID 不随显示名称改变。
3. 填写正文和资料来源。保留原文与历史信息，避免将不确定日期、人物关系或推测写成事实。未完成的记录设置 `contentStatus: stub`。
4. 使用关联选择器填写实体 ID。署名用 `credits`，演唱者用 `performers`，所属用 `affiliations`，一般关系用 `relations`。
5. 预览正文、目录、图片与关联，检查变更差异，再提交审核。审核要求修改时继续更新同一提案。
6. 只有审核、合并和部署完成后，词条网页才更新。提交成功不等于已上线。

## 元数据如何影响页面

`schemaVersion: 2` 是当前元数据协议版本。网站版本为 V3，两者编号不同。

| 字段 | 用途 |
| --- | --- |
| `id` / `locale` / `entityType` | 稳定身份、语言和实体类型 |
| `name` 或 `title` | 页面标题 |
| `presentation.image` / `presentation.theme` | 图片、阅读器背景与配色 |
| `presentation.morphing` | 同一谱系中的形态切换 |
| `relations` / `performers` / `credits` | 关联档案、作品署名和反向关联 |
| `sources` / `license` | 来源与许可说明 |
| `lifecycle` | 活动状态与永久归档 |

按所选类型显示必填项；占位状态不会免除稳定 ID、实体类型、名称等基础要求。完整字段约束见 [元数据规范](category-optimization/metadata-schema-v2.md)，实际校验由 `src/lib/entitySchema.mjs` 执行。

## 分类与本地文件

分类地图 `src/data/classification-map.json` 是人物、组合成员和指定企划的编目来源。新增文件不会自动加入所有首页分组；需要维护者把新 ID 放入审核过的分类节点。不要仅凭艺人身份推断其主页层级。

目录由 `src/lib/contentLayout.mjs` 统一推导，前后端同步。人物按分类地图，唱片按 `releaseType`，文章按 `articleCategory`。歌曲使用 `performers`：唯一主要演唱者归其目录，多位主要演唱者归 `collaborations`，没有可用演唱者才归 `unassigned`。

不要手工把网站 URL 当文件路径。网页根据元数据生成路由，编辑器使用真实 sourcePath。详细目录见 [内容目录指南](../src/content/README.md)。

## 翻译

简中、日文、英文分别维护 `zh.md`、`ja.md`、`en.md`，同一实体使用相同 ID 和一致的结构字段。繁体台湾、香港版本自动生成，不直接编辑派生文件。新增译文保留出处，不用中文冒充已完成翻译。当前资料补全与日英翻译任务由站长另行提供资料和安排。

## 时间轴与图库

时间轴事件保存在 `src/data/chronicle/`，通过实体 ID 与条目关联；纪元根据 `src/data/taxonomy/eras.yml` 中的日期区间计算。增加正文日期不会自动创建事件。维护方法见 [事件与联动](v3/feature-maintenance.md)。

图库选择角色并上传图片即可提交，标题、形态、日期、标签、来源与备注可选，日后可以补全。上传和修改均保留提案与审核记录。详情见 [图库使用与维护](v3/gallery-r2.md)。

## GitHub 提交与检查

从仓库当前指定的开发分支建立工作分支，不直接写发布分支。提交前查看差异，说明修改内容和来源。图片附件通过编辑器实际上传或加入正确文件目录；本地磁盘路径不能作为公共图片地址。

维护者按变更范围执行：

```sh
pnpm validate:content
node scripts/v3/sync-editor-schema.mjs --check
node scripts/v3/sync-gallery-contract.mjs --check
node scripts/sync-docs.mjs --check
pnpm build
```

涉及页面操作时，再人工检查相关流程。不要以构建成功代替真实投稿、附件上传或云端发布验收。不会修改代码也可以通过 Issue 说明问题、来源和预期效果。
