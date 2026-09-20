# V3 本地文件夹分类整理

完成时间：2026-09-20。

## 已执行

- 9,135 个 Markdown 文件按详细分类地图移至分层目录，包含简中、日文、英文及繁体派生文件；完整文件 SHA-256 与迁移前逐一相同。
- 人物区分个人歌手、创作者、策划团队、组合成员和世界观角色。少女革命计划成员依地图放入指定组合；个人歌手兼组合成员只保留主目录，并由组合 README 链接。
- 唱片按五个地图类别分组；歌曲按 performers 分组（明确主唱优先，多艺人合作放 collaborations，无表演者放 unassigned）；企划、活动、组织、术语按详细地图分支展开；文章按 articleCategory 分类。
- 地图未列出的原有记录放在各实体集合的 `unlisted`，保留内容，不擅自加入主页目录。
- 空的旧 artists / albums 目录说明归档在 `legacy-directory-notes/`。
- 编辑器目录索引读取真实文件路径，新建稿随分类元数据更新目标路径，前后端使用同步的路径规则。Astro 集合 ID 保持实体 ID 与语言组合，页面地址不受文件夹移动影响。
- 翻译任务与占位清单更新路径。原始迁移正文审计表未改写，通过 relocation 清单定位现文件。

## 路径与证据

- 目录指南：`src/content/README.md`
- 分类规则：`src/lib/contentLayout.mjs`，分类地图：`src/data/classification-map.json`
- 完整文件移动清单：`docs/v3/reports/content-layout.json`
- 预演命令：`node scripts/v3/organize-content.mjs`；重复运行预演结果为 0 项待移动。
- 前后端同步：`node scripts/v3/sync-editor-schema.mjs --check`
- 5,526 份原始语言词条通过编辑器原样导入/导出与后端校验；5,259 份历史正文哈希审计通过。
- 路径、编辑器、上传相关 18 项测试和后端编辑投稿服务 20 项测试通过。

## 原有数据差异

17 个唱片的英文 releaseType 已与现有中文主记录统一，字段变更及前后哈希保存在 `reports/metadata-normalization.json`。只修改分类字段，不修改正文；这表示跨语言分类一致，不代表重新核实唱片发行事实。逐条 ID 的目录例外文件已经删除，路径完全由共享规则生成。

本次只整理正式站点内容与相关工程路径，资料采集库仍保留原始归档。未部署远端站点或后端。

上一轮类型检查：0 errors / 0 warnings（本轮图库开发须另行验收）。旧企划分类说明与歌曲分类说明亦已归档，现有目录 README 与新结构同步。
