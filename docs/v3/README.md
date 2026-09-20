# V3.0.0 开发与验收

> 2026-09-19：用户已撤回本轮词条内容补充，原词条正文恢复，新增词条移除。旧研究导入报告仅供审计，不代表现站内容；旧翻译任务已取消，等待新提示词与资料。详见 [当前内容与翻译状态](translation-handoff.md)。

## 开发目标

以已冻结的 Metadata Schema v2 和 Feature Data v1 为准，实现百科实体、研究专栏、全景时间轴三大支柱；原有视觉语言、正文、歌词与贡献流程必须保留。旧百科网址已按用户后续决定移除兼容，参见静态产物优化记录。

1. 稳定 ID、受控字典、领域字段与双向关系索引。
2. 可审计、可重复执行的数据迁移；正文 SHA-256 校验；未确认字段保留。
3. 统一百科前台、制作人/流派视角、形态切换、永久观测归档、WikiLink 预览。
4. 年份时间轴、实体足迹、设定图库筛选与大图观察器。
5. 整理资料增补、研究专栏、搜索/AI 索引、编辑器及后端接口适配。
6. 集成验收与文档归档；部署是独立步骤。

## 规范入口

- [全域架构](../architecture-overview.md)
- [分类主案](../category-optimization/classification-master-plan.md)
- [详细地图](../category-optimization/classification-detailed-map.md)
- [元数据规范](../category-optimization/metadata-schema-v2.md)
- [功能数据规范](../category-optimization/feature-data-architecture.md)

脑暴文档是概念历史，字段、枚举与所有权以冻结规范为准。示例中的日期、链接和图片路径不能直接当成已核实的资料。

## 当前工作记录

开发进行中。原始版本基线：主站 `7c63fb0a`、后端 `6b36fb4`。
旧正文不得覆盖；新资料作为可追溯增补。保留旧语言正文；新增未译内容明确展示回退语言。

## 体验与接口联动验收

详见 [本轮修复与验收记录](experience-and-integration-acceptance.md)。先完成体验、结构与元数据联动，再继续资料库正文完善。日英新增内容的翻译按用户决定另行交接。

- [文章区与投稿审核](article-publishing.md)

## 当前维护入口

- [静态产物优化与旧网址移除](static-output-optimization.md)
- [目录与元数据修正](content-layout.md)
- [图库投稿与审核](gallery-r2.md)
- [功能数据维护](feature-maintenance.md)
- [2026-09-20 发布前检查与未完成项](release-check-2026-09-20.md)
- [统一文档目录](../README.md)
