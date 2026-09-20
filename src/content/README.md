# 本地词条目录（V3）

文件夹已按分类地图展开。顶层保留实体集合名称，供编辑器与内容加载器识别；分类层级在集合内展开。每个实体只保留一份，各语言放在同一目录下；人物在多个分类中的关联不复制正文。

```text
people/
  solo/{id}/                         个人歌手与独立艺人
  creators/{id}/                     核心词曲创作者
  staff/{id}/                        策划、设计与监督团队
  groups/{unit}/members/{id}/        组合所属成员
  characters/{id}/                   世界观角色
  unlisted/{id}/                     原有但未列入详细地图的记录
units/{unit}/                       组合总览；成员位置见目录内 README
isotopes/{id}/                      官方音乐同位体
songs/{performer-or-collaborations}/{id}/  曲目总库，按 performers 整理
releases/
  studio-albums/{id}/               正规专辑
  eps/{id}/                        EP
  singles/{id}/                    单曲
  soundtracks/{id}/                原声带
  live-recordings/{id}/            现场录音
  other-releases/{id}/             地图五类以外的既有唱片
projects/
  city-project/
    kamitsubaki-city/               神椿市企划总览
    city-animation/{id}/            动画
    city-games/{id}/                游戏
    city-literature/{id}/           文学
    city-arg/{id}/                  ARG
  girls-revolution/{id}/           少女革命计划
  isotope-project/{id}/            音乐同位体企划
  unknown-projects/{id}/           Unknown Lab 企划
  unlisted/{id}/                   地图未列出的既有企划
lives/{flagship-lives,community-events,exhibitions}/{id}/
organizations/{parent-companies,creative-studios,creative-network,record-network}/{id}/
lore/
  universe/{id}/
  glossary/{existence-forms,relationship-terms,system-terms,geography}/{id}/
articles/{articleCategory}/{id}/
```

实际存在的目录以文件为准。`unlisted` 用于保留未被详细地图明确归类的既有记录，不擅自把它们放入主页分类。`unassigned` 是新歌曲尚未填写 performers时的临时路径；新建草稿补齐元数据后，编辑器自动更新目标目录。

- 人物主归属以 `src/data/classification-map.json` 为准：花谱等已在个人歌手列表的艺人保留在 `people/solo/`；少女革命计划成员严格放在地图指定组合的 `members/` 下。
- 页面网址和实体 ID 不因本地文件夹移动而改变。
- `zh.md`、`ja.md`、`en.md` 为原始语言文件；`zh-tw.md`、`zh-hk.md` 是自动生成版本。
- 配置在 `site/`，贡献指南在 `contribute/`，日志和公告在 `logs/`、`announcements/`。采集资料库与正式词条分开保管。
- 时间轴与图库 YAML 在 `src/data/chronicle/`、`src/data/galleries/`，图片在公开资源或 R2；本次不搬动图片，不改写词条正文。

路径规则：`src/lib/contentLayout.mjs`。预演：`node scripts/v3/organize-content.mjs`；应用：加 `--apply`。后端同步：`node scripts/v3/sync-editor-schema.mjs`。

迁移清单：`docs/v3/reports/content-layout.json`，记录每个文件的原路径、目标路径与完整文件 SHA-256。原始正文审计表保留原样，校验程序通过迁移清单解析现路径。

17 个既有唱片存在各语言 `releaseType` 不一致，目录暂按中文主记录统一，记录在 `src/data/content-folder-overrides.json`；后续核实事实后再统一分类。旧 `artists/`、`albums/` 已无正式词条，也不得再按旧目录模板新建内容。旧模板已经删除，需要追溯时查看 Git 历史。
