# 图片上传、路径与文件分类

原图保留原始字节、分辨率和格式，不要求压缩或转为 WebP。较大图片直接通过 GitHub 上传，文件不会经过 Wiki 的上传接口。站内「图片附件」也保留原文件，但为控制接口负载限制为每张 750 KB、最多 8 张、总计 4 MB；超过限制请使用以下 GitHub 流程。

## 文件放在哪里

| 内容 | 仓库路径 | 规则 |
| --- | --- | --- |
| 艺人、组合、创作者 | `src/content/artists/<分类>/<条目>/zh.md` | 沿用相邻条目的分类，例如 `vwp/kaf` |
| 歌曲 | `src/content/songs/<艺人>/<分类>/<歌曲>/zh.md` | 先检查相邻目录，不另造重复分类 |
| 专辑 | `src/content/albums/<艺人>/<专辑>/zh.md` | 曲目列表放在专辑属性中 |
| 企划 | `src/content/projects/<分类>/<企划>/zh.md` | 使用已有分组 |
| 活动、时间线记录 | `src/content/logs/<记录>/zh.md` | 参考同类记录的日期字段 |
| 公告 | `src/content/announcements/<公告>/zh.md` | 通过 GitHub 修改 |
| 原始图片 | `public/images/<类型>/<条目>/文件名.png` | 类型使用 `artists`、`songs`、`albums`；新增企划/日志图片可用 `projects`、`logs` |
| 站内附件 | `public/images/contributions/<哈希>.png` | 编辑器自动命名，不手工改哈希或搬动已有文件 |
| 站内指南文案 | `src/content/contribute/`、`src/lib/editorGuide.mjs` | 修改对应语言源文件 |
| 本教程与开发文档 | `docs/` | 本教程同时用于生成站内页面 |
| 导航与站点文案 | `src/content/site/` | JSON，走 GitHub 流程 |

这些是新文件的分类约定，不是批量迁移旧文件的要求。已有词条和图片保持原路径；新图片建议小写英文、数字、连字符，例如 `kaf-live-2026-09-14-01.jpg`，不要用 `IMG_0001`、空格或不明确的 `final2`。扩展名必须对应真实格式，修改后缀不等于格式转换。不要为不同语言重复上传同一图片。

`zh.md`、`ja.md`、`en.md` 是三个源语言文件；同一词条使用相同的 `translationKey`。新增时只提交有真实内容的语言版本，其余翻译后续补齐，不放占位文本。`zh-tw`、`zh-hk` 由简体生成，修改简体源文件。不要提交 `dist/`、`.astro/`、`node_modules/`、`public/thumbnails/` 或 `.cache/`。

## GitHub 网页上传原图

1. 打开 [网站仓库](https://github.com/LinkTh1rsty/kamitsubaki-wiki-site)。没有写权限时先 Fork 到自己的账号，在 Fork 中操作。
2. 从最新 `main` 建立本次投稿分支，例如 `content/kaf-images`。如果已有本次 PR，就切换到它的源分支，后续提交会自动更新该 PR。
3. 打开目标目录，例如 `public/images/artists/kaf/`，选择 **Add file → Upload files**，选择原图。目录不存在时，在本机准备 `kaf` 文件夹并把原图放进去，在父目录 `public/images/artists/` 上传整个文件夹。提交前核对完整路径，避免多出一层 `public/images`。
4. 填写提交说明，提交到该投稿分支。确认文件在分支里能打开，并核对名称、大小写、扩展名。不要把图片粘贴到 Issue/PR 评论框代替仓库上传。
5. 在同一分支编辑对应 Markdown，按下一节设置封面或正文地址；补上来源、作者和使用依据。图片与引用它的词条应包含在同一个 PR。
6. 创建 PR：目标是原仓库 `main`，来源是你的投稿分支。到 **Files changed** 确认同时包含图片和 Markdown；等待检查、审核、合并及部署。上传成功或 PR 合并都不单独代表页面已经更新。

GitHub 网页单文件上限为 **25 MiB**；本项目的 Pages 静态资源审计也限制单文件大小。更大的文件先交维护者评估，不通过本教程承诺可发布。常规图片优先 PNG/JPEG/WebP；SVG、动画和其他附件先与维护者核对支持及用途。[GitHub 官方上传说明](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)

## 路径怎么填写

| 场景 | 正确内容 |
| --- | --- |
| GitHub 仓库中的位置 | `public/images/artists/kaf/kaf-live-2026.jpg` |
| 编辑器「词条属性」的封面图片地址 | `/images/artists/kaf/kaf-live-2026.jpg` |
| 图片块的图片地址 | `/images/artists/kaf/kaf-live-2026.jpg` |
| YAML frontmatter | `image: "/images/artists/kaf/kaf-live-2026.jpg"` |
| Markdown 正文 | `![花譜在舞台上的照片](/images/artists/kaf/kaf-live-2026.jpg)` |

规则只有一步：**去掉仓库路径开头的 `public`，保留 `/images/`**。不要填写 `/public/images/...`、电脑路径、`blob:` 临时预览地址，或 GitHub 的 `/blob/分支/...` 文件网页地址。图片地址以 `/` 开头，从网站根目录解析，不能按当前词条 URL 拼接。填入已获许可的外部图片时必须使用可直接返回图片的 HTTPS 地址，并确认长期可用。

在编辑器中，封面入口是「词条属性」中的图片字段；正文用「插入内容 → 图片」后填写图片地址和说明，已有图片块可在「内容块属性」调整。地址不会自动上传文件，必须先让对应文件存在于仓库。

## 尚未合并的图片怎样配合编辑器

- **图片已经合并并部署**：站内直接填 `/images/...`，预览应能加载，再提交词条修改。
- **图片与新词条一起提交**：先在编辑器写作并导出完整 Markdown，再把 Markdown 和原图提交到同一个 GitHub 分支/PR。网站当前部署没有这张新图片时，本地/线上编辑器预览可能显示断图；在分支检查文件，并在合并部署后确认页面。
- **不要拆成两个无关 PR 并假定会自动关联**：站内自动投稿不会自动带入你另一个 GitHub 分支上的图片。先完成图片 PR 并部署，或将导出的正文与图片放在同一 GitHub PR。

## 替换、删除与最后检查

替换图片优先用新文件名并更新引用，避免缓存继续显示旧图。删除或移动旧图前，用仓库搜索检查封面、正文、SEO 以及其他语言的引用，统一修复。不要只改文件名而遗漏正文。

- 原图能打开，图片与正文引用路径完全一致，大小写正确。
- 已填写具体来源、作者及授权/合理使用依据；图片不会因上传而自动获得本站文字许可。
- 图片和正文属于同一 PR，或图片已先部署；不依赖本机预览地址。
- 自动检查通过；合并后等待部署完成，再检查实际词条和图片地址。

站点现有缩略图流水线可能生成独立的展示缩略图，以减少列表加载量；它不会覆盖或替换仓库原图。上传保留原图与页面使用缩略图是两个独立步骤。
