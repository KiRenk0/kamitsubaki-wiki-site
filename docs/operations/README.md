# 运维与集成索引

- [V3 发布检查与当前阻断](../v3/acceptance/README.md)
- [V3 发布手册](release-runbook.md)
- [静态产物与 Pages 限额](../v3/static-output-optimization.md)
- [实时活动 API](../live-events-api-configuration.md)
- [图片缩略图](../image-thumbnails.md)
- [Medle 游戏集成](../medle-game-integration.md)
- [后端部署与运行](../../../kamitsubaki-wiki-site-backend/DEPLOYMENT.md)

发布记录必须写明候选提交、环境、数据库迁移、存储绑定、检查结果和回滚依据。不要把本地模拟账号、内存 D1/R2 或开发端口当成云端验收。涉及前后端契约时发布匹配版本，并先部署向后兼容的后端变更。
