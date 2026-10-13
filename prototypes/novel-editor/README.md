# Novel 编辑器本地原型

独立 React 工作台，用 Novel 1.0.2 / Tiptap 2.27.3、Tailwind 4、shadcn/ui 重建编辑界面。这里没有载入旧 `visualEditor.js`、`editorRichText.mjs` 或旧编辑器 CSS；文本选区、输入、撤销、表格、拖拽、斜杠菜单和气泡菜单由成熟编辑器处理。Wiki 业务内容使用 Tiptap 扩展适配。

## 启动

需要 Node.js 24 和 pnpm 11。从这个分支的仓库根目录运行：

```sh
pnpm install --frozen-lockfile
pnpm --dir prototypes/novel-editor install --frozen-lockfile
pnpm dev:novel
```

打开 <http://127.0.0.1:4371/>。独立依赖目录保持 Novel 的 Tiptap 2 与主站现有 Tiptap 3 探针分离。原型有自己的 TypeScript 检查，不加入 Astro 主站编译。

## 可操作范围

- 搜索并读取仓库中的中文、日文、英文词条，创建新词条，导入或导出 Markdown。
- Novel 斜杠命令、选区气泡菜单、段落样式、列表、任务、链接、表格、图片、块拖拽及原生撤销。
- Wiki 注音与罗马字、剧透、缩写、按键、日期、中文变体、数学公式、折叠说明、平台媒体及媒体切换。
- 歌词支持逐字原文、振假名、罗马字、译文和递增时间戳；已有歌词 HTML 保留原格式。
- 结构化元数据表单、可搜索的词条关系、当前文档大纲、素材定位、正文查找、可选源码视图、持久主题，以及窄屏抽屉导航。
- 自动保存到本地浏览器；刷新恢复最近词条及未应用的源码修改。草稿使用独立 `kamitsubaki-novel-local-prototype:v1:` 命名空间。

已有词条的 ID、语言和类型锁定。源码先通过解析和身份检查再应用；未应用源码时，预览和导出会等待用户应用修改。新增 Wiki 块插入在所选块之后，避免覆盖已有特殊内容。

## Markdown 契约

`src/lib/wiki-document.ts` 复用主站 `visualEditor.mjs` 中的内容解析和块序列化函数，不使用它的界面或编辑交互。每组导入内容保存原文和语义快照：未修改组保留原文，修改组由 Tiptap 序列化。无修改保存保持原文件字节，包括 YAML 注释、未知字段、BOM 和 CRLF。修改元数据保留未知键和值，但 YAML 排版可能规范化。

普通文本、列表、链接和 Markdown 表格是原生 Tiptap 节点。Wiki 短码是行内语义节点；媒体、折叠内容、歌词和公式是可编辑的领域节点。复杂 HTML 和未知片段保留原文，并通过阅读器安全渲染器展示。已有 HTML 表格会导入原生表格；完整源码视图仍作为可选维护工具。合并单元格等超出 Markdown 表格能力的结构保存为公开 HTML，移除编辑器内部节点载荷。

`/__novel/catalog` 和 `source` 只读本分支的 `src/content`。预览复用主站的 Markdown 渲染、HTML 安全策略及阅读器媒体切换逻辑。预览用于检查保存内容；完整的阅读器歌词播放同步尚未接入。编辑状态的媒体切换使用 shadcn Tabs。

上传仅写入本地 `public/images/novel-prototype/<SHA256>.<ext>`，限制 PNG/JPEG/WebP/GIF 和 10 MB，检查文件签名。保存的是持久站内路径。此目录被 Git 忽略，迁移上传图片时需要另行保留这些文件；导出的 Markdown 不会把本地图片发布到线上。

## 验证

```sh
pnpm --dir prototypes/novel-editor test
pnpm --dir prototypes/novel-editor build
pnpm --dir prototypes/novel-editor check:corpus --json /tmp/novel-corpus-check.json
```

针对性测试覆盖现有兼容性样本、特殊节点编辑、表格对齐和合并单元格、YAML、换行格式、原生撤销，以及真实花譜词条的三种语言。全集检查逐一导入仓库词条并比较无修改保存的完整字节；它不替代浏览器交互验证。Node 测试只对 Novel 可选组件导入的 CSS 使用空模块钩子，浏览器仍正常加载真实样式。

本地操作检查使用 Codex 内置浏览器，覆盖斜杠插入、选区加粗、注音编辑、歌词时间保存、表格增行/撤销、媒体切换、上传、源码应用、身份保护、导出及刷新恢复；桌面与手机布局分别检查。

## 原型边界

当前是进行中的本地原型，完整交互验收与网站入口迁移尚未完成。正式编辑入口、认证、远程图片上传、审核和提交 API 尚未迁移；仓库词条不会被此原型直接覆盖，线上版本也未发布。Vite 本地接口仅在开发服务器中运行，`dist` 是构建检查产物，不能独立提供词条读取或预览服务。

主入口 JS 目前约 2.39 MB（gzip 747 KB），源码编辑器已按需分包，字体按字符范围加载。接入正式入口前仍需针对编辑路由做加载和体积优化。Novel 不提供完整应用样式；通用控件来自 shadcn，少量工作台布局及 Wiki 内容样式集中在 `src/index.css`。

## 设计与来源

`design/workbench-concept.png` 是实现前生成的工作台概念参考，不作为网站内容素材。设计方向：黑灰背景、轻紫色操作强调、左侧当前写作导航、中间宽幅写作区、右侧文档与选择属性，中文衬线标题，正文依靠留白与分隔建立层级。

- [Novel](https://github.com/steven-tey/novel)：Apache-2.0；使用 npm 包及公开组合 API，不复制或维护内核分叉。
- [Tiptap](https://github.com/ueberdosis/tiptap)：MIT。
- [shadcn/ui](https://github.com/shadcn-ui/ui)：MIT；通用组件由 CLI 生成，按钮补齐 React 18 的 ref 转发，关闭控件本地化。
- [tiptap-markdown](https://github.com/aguingand/tiptap-markdown)：MIT。
- [CodeMirror](https://github.com/codemirror/dev)：MIT，用于 Markdown/YAML 源码编辑。

当前重构与验证状态见 [第一轮验证记录](../../qa/2026-10-13-novel-editor/README.md)。记录明确区分自动检查、浏览器实测和待验收项目。
