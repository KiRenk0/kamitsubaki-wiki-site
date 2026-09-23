# V3 验收与发布状态

本目录是日期化验收证据，不替代现行维护指南。截止 2026-09-20，V3 仍处于发布准备阶段，尚未获得完整上线结论。

## 当前结论

| 范围 | 状态 | 证据或待办 |
| --- | --- | --- |
| 页面结构、阅读器、分类 UI | 本地已检查 | [体验与联动](experience-and-integration-acceptance.md) · [分类 UI](classification-ui-acceptance.md) |
| 时间轴与图库界面 | 本地已检查 | [时间轴与图库](chronicle-gallery-acceptance.md) |
| 文章投稿与审核 | 本地模拟通过 | [文章系统](article-system-acceptance-2026-09-20.md)；真实 D1/OAuth 待验收 |
| 静态产物额度 | 已解除阻断 | 15,068 文件，见 [产物优化](../static-output-optimization.md) |
| 内容目录与元数据 | 仍有阻断 | 歌曲目录与 `performers` 规则不一致，完整测试保留失败 |
| 图库真实上传审核 | 待验收 | 需要匹配版本 Worker、D1、R2 和真实登录 |
| 文章真实发布 | 待验收 | 需要迁移、实际账号审核、公开读取与回滚检查 |
| 日英内容与全站清洗 | 独立工作流 | 不由本地 UI/构建验收代替人工内容审核 |

## 记录

- [创作工作台与分组上传联调](creation-workbench-2026-09-23.md)：区分本地、模拟和真实服务结果；记录尚未完成的上传审核验收。

- [发布前检查](release-check-2026-09-20.md)：当日发布条件与未完成项。
- [全站 QA](full-site-qa-2026-09-20.md)：前后端测试、浏览器检查及限制。
- [硬编码审计](hardcoding-audit.md)：分类、路由和组件数据来源。
- [首页刷新修复](home-refresh-fix.md)：悬浮组件布局跳动问题。
- [体验与接口联动](experience-and-integration-acceptance.md)
- [分类目录实施](classification-ui-acceptance.md)
- [时间轴与图库交互](chronicle-gallery-acceptance.md)
- [文章系统本地验收](article-system-acceptance-2026-09-20.md)

## 上线判定

发布候选必须固定前后端提交，完成内容验证、类型检查、完整构建、全量链接和产物审计。随后在真实预览环境使用正常账户分别走完百科投稿/附件、文章投稿/审核、图库上传/修改/审核，并核对 D1 迁移、R2 私有与公开桶、OAuth、CORS、回滚和生产域名。任何一项只在内存模拟器通过时，状态仍是“待真实验收”。
