# V3 硬编码检查（2026-09-20）

检查范围：首页区块、实体分类与路由、实体阅读器、维护入口和本地内容路径。不是对全部业务模块的无遗漏保证。

## 本轮修正

- 首页删除重复 ProjectsSection 及三种源语言的 projects 配置，保留分类目录中的企划内容。
- 致观测者改为 04. PREFACE，首页顺序为 01 DATABASE / 02 RHYTHM / 03 ALBUMS / 04 PREFACE。
- entityNavigation 的 featured 名单由 classification-map.json 推导，删除代码内五份重复 ID 列表。分类顺序与成员 URL 保持一致。
- 数据库分类路由从 navigationCategories 推导，不再独立维护路径数组。
- EntityArticle 向 ContributorRoster 传递真实 sourcePath，修复维护入口按旧扁平目录拼接的问题。
- 分类测试改为递归读取新文件夹层级，不再假设 collection/id/zh.md。

## 仍须明确的配置边界

- classification-map.json 是审核过的编目配置，人物与部分企划的 ID 收录需要人工维护；不是根据正文自动推断分类。
- navigationCategories 的类型、角色、路径属于业务规则配置；新增顶层类别仍需调整配置和相应数据规则。
- 17 个唱片的分类字段已与中文主记录一致，逐条 ID 例外已移除；审计见 reports/metadata-normalization.json。
- 时间轴纪元和事件是独立结构化数据；图库资料来自 Worker 的已审核 D1 记录，通过实体 ID 关联。
- 歌曲目录已统一使用 performers，主唱角色优先、多艺人合作独立归档；前后端共享规则。空 performers 才进入 unassigned。

## 验证

- 分类地图、12 位个人歌手名单、少女革命计划成员路径、占位字段检查：4 项通过。
- 发布前仍需正常内容校验与构建；本报告不表示已经部署。
