# 图库：上传、维护与审核

当前约定（2026-09-20）：登录用户可上传、修改任何已公开图片的资料；管理员审核后公开。角色必填，其余资料选填。图片和图库元数据均不经过 GitHub。

## 使用入口

- 公开浏览：`/{locale}/gallery/`。
- 登录后上传和修改：`/{locale}/gallery/manage/`。选择角色和图片即可提交；标题、形态、日期、标签、来源及说明可后补。
- 公开图片的大图面板提供资料修改入口。提交修改期间仍显示已审核版本。
- 管理员：后端 `/admin/gallery`，沿用站点登录与管理员权限。审核时可以查看暂存图片和元数据，批准或填写理由退回。
- 每次提交记录作者与基础版本；审核遇到版本冲突须重新基于最新公开资料提交，不能覆盖其他人的更新。

## 存储与接口

- 公开 R2：`kamitsubaki-wiki-gallery`，域名 `https://images.kamitsubaki.wiki`。
- 私有 R2：`kamitsubaki-wiki-gallery-staging`，2026-09-20 已创建；不绑定公开域名。
- Worker bindings：`GALLERY_IMAGES`、`GALLERY_STAGING`；数据库沿用 `AI_OBSERVER_DB`。
- D1 迁移：后端 `migrations/0020_gallery.sql` 和 `0022_gallery_publication_revision.sql`。后一迁移增加公开修订标识、可见性和审核操作记录。`gallery_items` 保存公开版本，`gallery_revisions` 保存待审及审核记录。
- 新图片先进入私有桶。只有审核通过才写入公开桶；公开对象键按条目和修订 ID 生成，避免覆盖缓存。
- 公共读取：`GET /api/gallery`、`GET /api/gallery/characters`、`GET /api/gallery/facets`、`GET /api/gallery/items/:id`。列表每页 24 项，返回 `total`、`nextOffset`；筛选字段为 `character`、`form`、`publisher`、`year`、`tag`，由服务端对全部公开记录筛选。详情仅返回已公开且未隐藏的图片，未审核记录返回 404。
- 登录提交：`POST /api/gallery/items`、`POST /api/gallery/items/:id`，multipart 字段 `metadata` 和可选 `image`，新增时图片必填。
- 个人修订：`GET /api/gallery/revisions`，每页 20 项，通过 `offset`、`nextOffset` 翻页。暂存预览仅作者或管理员可读。
- 管理审核：`GET /api/admin/gallery/revisions`；`POST /api/admin/gallery/revisions/:id/approve` 或 `/reject`。
- 文件限制：20 MiB，PNG/JPEG/WebP/GIF；不接受 SVG。登录、来源检查、每日提交限额和版本校验都由 Worker 执行。

角色列表从正式实体元数据生成，不手工维护人物 ID。执行 `node scripts/v3/sync-gallery-contract.mjs` 同步角色列表和前后台共用管理界面；`--check` 检查漂移。

## 部署与验收

部署顺序：应用 D1 迁移 → 配置两个 R2 binding → 发布 Worker → 发布前端。前端通过 `PUBLIC_GALLERY_API_URL` 指向对应 Worker，默认正式 API 域名。预览验收必须使用独立数据库和存储，避免测试图片混入正式图库。

验收需覆盖：未登录拦截、角色必填、真实图片上传、待审不可公开、他人不可查看私有暂存图、管理员批准/退回、公开读取、另一登录用户修改、审核前保持旧版本、版本冲突以及浏览器大图和筛选操作。记录环境、时间和结果；本地模拟通过不能代替真实云端验收。

旧 `src/data/galleries/*.yml` 属于先前静态方案，不再是在线上传入口。历史设计文档中要求修改 YAML 或必填来源的段落，由本说明和用户最新约定替代。

## 已收录图片管理

管理员可切换待审核提案和已收录图片。`GET /api/admin/gallery/documents` 每页 20 项；`POST /api/admin/gallery/items/:id/hide` 与 `/restore` 可逆地隐藏或恢复记录，并增加版本、写入 `gallery_audit`。隐藏后不出现在公开列表、筛选词表和详情接口。已经取得的公开 R2 图片网址仍然有效，隐藏操作不是彻底删除图片或撤销外链。

批准提案通过 `published_revision_id` 比较当前公开修订，避免内容相同的两个提案都被批准；旧版本冲突返回 409。
