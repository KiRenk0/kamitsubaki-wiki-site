# KAMITSUBAKI Wiki Site

[English](README.en.md) · [日本語](README.ja.md) · [完整文档](docs/README.md) · [架构说明](docs/architecture.md) · [站内贡献中心](https://kamitsubaki.wiki/zh/contribute/)

非官方 KAMITSUBAKI STUDIO 多语言粉丝百科。主站由 Astro 静态生成；百科词条在本仓库维护，文章与设定图库通过站点服务投稿。所有公开修改均经过审核。服务端闭源，其代码、架构与运维资料不向外部开发者提供。

## 贡献入口

- 百科词条：从阅读器“编辑词条”进入，或在贡献中心新建，提交 GitHub 变更提案。
- 研究文章：使用 `/{locale}/articles/submit/` 保存云端草稿并提交审核。
- 设定图库：使用 `/{locale}/gallery/manage/` 私有暂存图片，再提交整套设定审核。
- 图片、来源与授权：[图片和附件](docs/manuals/contribute/entry/zh.md) · [许可与署名](docs/manuals/contribute/rights/zh.md)。

详细步骤见 [V3 贡献指南](docs/manuals/contribute/start/zh.md)。不要沿用旧版 `artists/`、`albums/` 路径或旧 frontmatter 示例。

## 当前内容结构

```text
src/content/
  people/          人物、创作者、工作人员和组合成员
  units/           团体总览
  isotopes/        音乐同位体
  songs/           按 performers 整理的歌曲
  releases/        专辑、EP、单曲、原声与现场录音
  projects/        神椿市、少女革命、同位体等企划
  lives/           演出、社区活动与展览
  organizations/   公司、厂牌、工作室与创作网络
  lore/            世界、角色和术语
  articles/        旧文章源文件与导入存档
  site/            多语言站点文案
```

每个实体在同一目录维护 `zh.md`、`ja.md`、`en.md`，共享稳定 `id`。繁体版本自动生成。分类与文件位置由元数据、`classification-map.json` 和 `contentLayout.mjs` 决定，页面 URL 由实体注册表生成。完整规则见 [内容目录](src/content/README.md) 与 [元数据 Schema v2](docs/category-optimization/metadata-schema-v2.md)。

## 本地开发

需要 Node.js 与 pnpm：

```sh
pnpm install --frozen-lockfile
pnpm dev
```

常用检查：

```sh
pnpm validate:content
pnpm exec astro check
pnpm build
node scripts/v3/check-built-links.mjs
node scripts/audit-pages-assets.mjs dist
node scripts/check-docs.mjs
node scripts/sync-docs.mjs --check
```

按修改范围运行不依赖私有服务的前台测试；跨服务测试由维护者在私有环境执行。构建成功不代表真实登录、GitHub 投稿、文章审核、图库上传或生产发布已经验收。

## 文档与发布状态

- [文档中心](docs/README.md)：按贡献、维护、设计、架构、运维和归档导航。
- [页面设计规范](docs/design/page-system.md)：二级页面与共享组件。
- [V3 开发文档](docs/v3/README.md)：当前维护说明。
- [V3 验收状态](docs/v3/acceptance/README.md)：已验证范围和上线阻断。

当前开发分支为 `V3.0.0`。服务端运行与发布由维护者按私有流程管理；本仓库只记录前台发布与用户可见的验收结果。
