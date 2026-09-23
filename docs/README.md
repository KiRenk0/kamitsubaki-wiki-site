# 网站文档维护索引

站内文档中心读取本仓库 `docs/manuals/` 中的 Markdown；这里是唯一正文来源。工作区根目录 `../docs/` 是脚本生成的镜像，不在镜像中编辑。旧版文档完整快照位于仓库外的 `../_untracked-archive/docs-center-2026-09-24/`，仅供核对历史，不直接当作现行规则。

| 分册 | 读者 | 正文目录 |
| --- | --- | --- |
| 网站说明书 | 普通读者 | [`manuals/site/`](manuals/site/) |
| 贡献说明书 | 投稿者 | [`manuals/contribute/`](manuals/contribute/) |
| 开发说明书 | 维护者与开发者 | [`manuals/develop/`](manuals/develop/) |

贡献分册完整保留原有的[内容与格式指南](manuals/contribute/format/zh.md)和[语法与属性指南](manuals/contribute/syntax/zh.md)，不是摘要；旧的 `/contribute/format/` 与 `/contribute/syntax/` 地址转向新阅读页。迁移前的十份原文已另存于仓库外归档，后续只修改 `docs/manuals/` 中的正文。

本次从旧资料中按用途筛选并整理，而非将历史文件原样塞回站内：

| 历史资料 | 进入现行章节的内容 | 处理原则 |
| --- | --- | --- |
| 原“内容与格式”“语法与属性” | 完整写作规则、字段、扩展语法与示例 | 保留主体与示例，修正已迁移的入口和失效锚点。 |
| 旧贡献、图片与附件指南 | 字段影响、分类、词条原图同 PR 流程、地址换算、投稿状态 | 按词条／文章／图库分别归入贡献分册，删除重复或过时的操作说明。 |
| 旧许可说明 | 文字许可、媒体权利边界、`license` 字段和审核清单 | 用通用署名替换个人示例；示例网址明确为占位，不作为事实来源。 |
| 阅读器、分类、文章、图库、组件和发布维护稿 | 使用流程、数据边界、组件用法、检查与回滚要点 | 按当前代码与接口核对后归入网站和开发分册；历史验收数字不写成现行承诺。 |

公开说明书只放操作所需的规则和示例，不放密钥、令牌、私人联系信息、本机绝对路径、生产环境配置值或内部调试地址。曾使用个人署名的许可示例已换成通用作者名。历史原稿仍在仓库外归档，供有权限的维护者追溯；站内文档只以本目录的当前版本为准。

每章在 `<分册>/<章节>/` 下维护 `zh.md`、`ja.md`、`en.md`；`zh-tw.md` 与 `zh-hk.md` 由简中自动生成，不直接修改。章节 frontmatter 的 `book`、`chapter`、`locale`、`order`、`title`、`summary` 决定站内目录、排序、搜索与阅读页。新增章节后核对三个源语言，运行 `pnpm i18n:generate`，并从文档中心实际打开页面。

功能、字段、限制或审核流程变化时，同一修改更新相应章节。贡献说明先核对当前前后端，再写界面步骤；区分本机保存、云端保存、图片暂存、待审核、已通过与公开。站内正文只维护一份，不把页面帮助写成另一套完整说明。历史验收记录只能说明对应日期与环境，不能代替现行规则。

其余 `docs/` 文件属于分类依据、内部规范、迁移报告或历史记录，不自动进入公开文档中心。常用技术来源：[详细分类地图](category-optimization/classification-detailed-map.md) · [元数据规范](category-optimization/metadata-schema-v2.md) · [页面系统](design/page-system.md) · [发布记录](operations/release-runbook.md)。若这些文件被替代，先更新代码与相关引用，再从仓库移除；仓库外快照保留原文。

维护后运行：

```sh
pnpm i18n:generate
node scripts/check-docs.mjs
node scripts/sync-docs.mjs
node scripts/sync-docs.mjs --check
pnpm check
```

涉及站内路由时再运行 `pnpm build`，并在桌面与窄屏查看目录、正文链接及相邻章节。
