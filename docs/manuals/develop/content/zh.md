---
book: develop
chapter: content
locale: zh
order: 2
title: 分类、元数据与内容维护
summary: 使用分类地图、schema 和结构化关联维护百科及探索资料。
---

## 内容身份

百科源文件位于 `src/content/`，以稳定 ID、实体类型和语言确定身份。元数据协议 `schemaVersion: 2` 与网站版本 V3 不同。修改字段时先查看 `src/lib/entitySchema.mjs`、`src/lib/metadata.mjs` 和 `src/lib/contentLayout.mjs`，再检查前台编辑器字段；不能只改页面标签。简中、日文、英文源稿共享同一实体身份，繁体由简中生成。

## 分类与目录

人物、团体、项目等分类依据 `src/data/classification-map.json` 与详细分类地图；不能从“艺人”标签推断首页层级。新增实体的源文件路径由内容布局规则生成，但首页目录的审核分类节点仍需显式维护。歌曲按 `performers`、发行作品按 `releaseType` 等结构字段归档；不要把网页 URL 当源文件路径。

## 关联与功能数据

`relations`、`performers`、`credits` 和形态谱系驱动关联档案、作品署名与切换器。文章关联词条必须显式保存目标 ID，不从正文 WikiLink 推断。时间轴事件在 `src/data/chronicle/`，纪元区间由 `src/data/taxonomy/eras.yml` 定义；普通正文日期不会自动变成事件。图库角色目录与实体元数据保持一致；图片和审核状态由站点服务提供，不作为百科 Markdown 维护。

## 改动流程

修改分类、字段或目录规则后，检查现有词条迁移与多语言对应，运行内容校验，并检查前台编辑器及图库角色列表。保留旧正文和来源，必要时通过迁移报告验证原文件哈希；不要为使校验通过而批量重写事实。

## 一个实体、多个入口

`classification.primary` 决定主归档，`classification.additional` 增加发现入口；同一实体的不同分类不复制 Markdown。团体成员要有真实的 `member-of` 关系和团体目标；形态谱系由 `presentation.morphing.group` 聚合，独立形态仍各有 ID、正文、图片和分类。关系不能因为外观相近就自动推断。

| 资料变更 | 维护位置 | 不能代替它的做法 |
| --- | --- | --- |
| 人物／团体层级 | `src/data/classification-map.json`、实体分类字段 | 在首页组件里写死 ID。 |
| 歌曲／专辑归档 | `performers`、`releaseType` 等元数据 | 根据 URL 字符串猜测类型。 |
| 时间轴事件 | `src/data/chronicle/` 和纪元配置 | 仅在正文写日期。 |
| 形态与关联 | `presentation.morphing`、`relations` | 从正文提及自动推断身份。 |
| 相关文章 | 文章修订中的显式词条 ID | 扫描文章 WikiLink。 |

## 新增词条的维护顺序

先查稳定 ID 和所有语言、选择准确实体类型，再按分类地图决定主归档与额外入口。建立 `zh.md`、`ja.md`、`en.md` 时应核对内容语言，不能把中文复制成日英“译文”。繁体由生成器产生。填入有来源的属性和正文后，运行 `pnpm validate:content`；如果改动了 schema 或编辑器字段，再检查前台输入与预览。移动既有主路径需保留旧 URL 重定向，使用迁移报告核对正文未意外改变。

## 分类和形态的最小示例

下例是**结构示例**，`example-unit` 等 ID 仅供说明，不是站内已存在的档案；实际目标 ID 必须先在目录中确认。

```yaml
schemaVersion: 2
id: example-member
locale: zh
entityType: person
name: 示例成员
romanizedName: Example Member
roles: [vocalist]
lifecycle:
  activity: active
classification:
  primary: groups
  group: example-unit
  additional: [creators]
relations:
  - type: member-of
    target: example-unit
presentation:
  morphing:
    group: example-family
    slot: virtual-artist
    order: 1
```

`group` 需要目标团体是 `unit`，并且 `relations` 中有匹配的 `member-of`；不能只填一个文件夹名。多团体成员可以有多条成员关系，但主归档仍只有一个。形态组只决定选择器聚合，不自动断言人物身份；需要真实关系时另填恰当的 `relations` 类型。额外分类是同一档案的目录入口，不是第二份 Markdown。

迁移已存在实体时，先运行只读报告确认旧 URL、语言、ID 和正文哈希，再迁移路径并加重定向。校验跨语言的分类一致性、关联目标存在性及占位状态；有错误时修正字段或来源，不为通过检查而制造正文事实。字段完整定义以仓库的 `src/lib/entitySchema.mjs` 为准。
