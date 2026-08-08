# KAMITSUBAKI Wiki Site — 项目概览

> 分析对象：`F:\kamitsubaki-wiki-site`（仓库名 `kamitsubaki-wiki-site`，版本 `1.3.3`）
> 分析方式：基于实际配置文件、源码与文档的静态阅读，非运行态推断。标注「*推断*」之处为未直接验证的部分。

---

## 1. 项目定位

| 维度 | 说明 |
| --- | --- |
| 用途 | 非官方的 **KAMITSUBAKI STUDIO（神椿工作室）粉丝百科**，以**静态站点**形式发布，覆盖艺人、企划、日志、歌曲、专辑等条目的多语种结构化资料。 |
| 解决的问题 | 为分散的粉丝向资料提供统一、可检索、可协作编辑的wiki；通过 GitHub PR 工作流实现"编辑内容 → 本地校验 → CI 验证 → 合并部署"的协作闭环。 |
| 目标用户 | 粉丝贡献者（编辑 `src/content/` 下的 Markdown/JSON）、终端读者（多语种浏览）、维护者（运行 CI 与脚本）。 |
| 使用场景 | 浏览器直接访问静态 HTML；AI 聊天作为"静态前端 + 独立私有后端"的增强功能（前端仅调用 `GET /api/ai/bootstrap` 与 `POST /api/ai/chat`）。 |
| 站点形态 | `/` 重定向到 `/zh/`；`/zh/`、`/ja/`、`/en/` 为正式语种，`/zh-tw/`、`/zh-hk/` 为运行时由简体中文经 OpenCC 转换派生的繁体变体。运行时无后端依赖。 |

---

## 2. 技术栈

| 类别 | 选型 | 说明 / 依据 |
| --- | --- | --- |
| 框架 | **Astro**（`output: 'static'`） | `astro.config.mjs`、`package.json` 依赖 `astro: latest`；Content Collections + `glob` loader（Astro 5 内容层）。 |
| 语言 | **TypeScript**（strict）、JavaScript (`.mjs` 工具模块) | `tsconfig.json` extends `astro/tsconfigs/strict`。 |
| 样式 | **Tailwind CSS v4**（经 `@tailwindcss/vite`） | `astro.config.mjs` 注入 vite 插件；`src/styles/global.css` 为入口。 |
| 内容建模 | **Astro Content Collections + Zod** | `src/content.config.ts` 用 `defineCollection` + `z` 定义 10 个集合的 schema。 |
| Markdown 渲染 | `micromark` / `@astrojs/markdown-remark` + 自定义 remark/rehype 链 | `src/lib/markdown.mjs`：`remark-math`、`rehype-katex`、`@shikijs/rehype`（github-dark）、`rehype-sanitize`（自定 `wikiHtmlSchema`）、`rehype-raw`、`rehype-external-links`，以及自研的 `wikiShortcodes`、`mediaEmbed`。 |
| 公式 | **KaTeX** | `remark-math` + `rehype-katex` + `katex` 依赖。 |
| 中文繁简转换 | **opencc-js**（运行时） | `src/lib/traditionalChinese.mjs` 用 `opencc-js` 的 `cn→twp`/`cn→hkp` 转换器；词条保护表 `public/TraditionalChineseConvert.json`、UI 覆盖表 `src/i18n/traditional-ui-overrides.json`。 |
| 日文处理 | `kuroshiro` + `kuroshiro-analyzer-kuromoji` + `wanakana` | *推断* 用于歌词/读音脚本（`scripts/test-kuroshiro.mjs`、`translate-lyrics.mjs` 等），非构建主流程必需。 |
| 翻译辅助 | `@vitalets/google-translate-api` | *推断* 仅用于 `scripts/` 下的歌词翻译脚本。 |
| 图标 | `simple-icons` | 品牌平台图标（`src/lib/externalPlatforms.mjs`）。 |
| 配置/序列化 | `yaml` | 测试与脚本解析/序列化 frontmatter。 |
| 包管理 | **pnpm**（`pnpm@11.1.1`，workspace 锁文件 `pnpm-lock.yaml`） | `package.json` `packageManager` 字段；`pnpm-workspace.yaml` 仅声明 `allowBuilds`（esbuild、sharp）。 |
| 测试 | Node 内置 `node --test` | `pnpm test` → `node --test tests/*.test.mjs`；共 39 个 `.test.mjs` + `helpers/` + `fixtures/`。 |
| 校验 | `@astrojs/check` + `astro check` | `pnpm check` 校验类型与 Content Collection schema。 |

> ⚠️ 注意：`astro`、`@astrojs/check`、`typescript` 在 `package.json` 中均写为 `latest`（未锁主版本）。结合下方"潜在问题"中 `metadataOnlyGlob.mjs` 对 Astro 内部 API 的依赖，升级存在破坏性风险。

---

## 3. 目录结构与关键文件

```
kamitsubaki-wiki-site/
├─ src/
│  ├─ content.config.ts        ★ Content Collections 的 Zod schema（10 个集合）
│  ├─ content/                 ★ 可编辑百科内容（不写代码，只写数据）
│  │  ├─ site/                 locale JSON：导航/页脚/Hero/区块/AI 聊天文案
│  │  ├─ artists/  projects/  logs/  songs/  albums/  announcements/
│  │  └─ contribute/          编辑教程、语法/格式指南（多语种 .md）
│  ├─ lib/                     ★ 数据整理、i18n、元数据、Markdown 管线（.mjs）
│  │  ├─ homeData.mjs          ★ 内容本地化/分组/排序聚合
│  │  ├─ i18n.mjs              ★ 5 语种档案、站名、语言切换链接
│  │  ├─ traditionalChinese.mjs★ OpenCC 繁简转换核心
│  │  ├─ markdown.mjs          ★ Markdown→HTML 渲染管线
│  │  ├─ staticPaths.mjs       ★ 本地化静态路由生成（含 zh 回退合成）
│  │  ├─ metadataOnlyGlob.mjs  ★ 自定义 Content Loader：仅加载 frontmatter，剥离正文以缩小 Vite 入口
│  │  ├─ metadata.mjs          页面 SEO/OG/Twitter 元数据生成
│  │  ├─ contentSource.mjs     renderContentEntry：按需渲染正文（与 metadataOnlyGlob 配套）
│  │  ├─ externalPlatforms.mjs 外部链接品牌注册表
│  │  ├─ musicCatalog.mjs / homeMusicCatalog.mjs  专辑/音乐目录
│  │  ├─ lyricsTimeline.mjs / cjkSearch.mjs / searchIndex.mjs / siteSearch.mjs …
│  │  └─ aiChatControls.mjs / aiStream.mjs   AI 聊天前端控制（调用外部 API）
│  ├─ components/              ★ 26 个 .astro 展示组件
│  │  ├─ SiteNav.astro / HomeSiteNav.astro / SiteFooter.astro / BaseLayout 引用层
│  │  ├─ WikiInfoBox.astro / WikiArticleHeader.astro / TableOfContents.astro
│  │  ├─ ArtistDatabase.astro / AlbumsSection.astro / SongsSection.astro / ProjectsSection.astro / LogSection.astro
│  │  ├─ ExternalLinkCard.astro / PlatformIcon.astro / AnnouncementModal.astro
│  │  ├─ ContributorRoster.astro / ManualContributors.astro / ContentLicenseNotice.astro
│  │  └─ AiChatWidget.astro / SocialContactWidget.astro / SiteSearch.astro …
│  ├─ layouts/
│  │  └─ BaseLayout.astro       ★ 唯一布局：输出 description/canonical/OG/Twitter/robots
│  ├─ pages/                   ★ 静态路由
│  │  ├─ index.astro           根重定向到 /zh/
│  │  └─ [locale]/
│  │     ├─ index.astro        ★ 首页（DATABASE / 企划 / 日志 / 音乐 聚合）
│  │     ├─ artists/[...id].astro / projects/ / logs/ / songs/ / albums/  ★ 条目详情页
│  │     ├─ albums/artists/[artist].astro / songs/artists/[artist].astro  分类页
│  │     ├─ contribute/{edit,syntax,format}.astro / license.astro
│  │     ├─ home-catalog.json.ts / search-index.json.ts   JSON 端点
│  │     └─ (顶层) ai-index.json.ts                        AI 引导端点
│  ├─ scripts/                 10 个浏览器交互 .js（themeToggle、siteSearch、aiChatWidget、mediaSwitcher、contributorRoster 等）
│  └─ styles/                 global.css（Tailwind 入口 + 视觉系统）、mediaSwitcher.css
├─ public/                    静态资源（brand SVG、图片、字体、TraditionalChineseConvert.json）
├─ scripts/                   ★ Node 维护脚本（非站点运行时）
│  ├─ generate-traditional-chinese.mjs  ★ predev/prebuild/precheck/pretest 钩子：生成 zh-tw/zh-hk 派生文件
│  ├─ fetch/apply/audit/repair-lyrics-*.mjs  歌词时间戳与内容维护
│  ├─ sync-contributors.mjs / contributor-*.mjs  贡献者同步
│  └─ migrate.mjs / translate-lyrics.mjs / test-kuroshiro.mjs …
├─ tests/                     39 个 .test.mjs + helpers/ + fixtures/（内容断言型测试）
├─ docs/                      架构/贡献/许可/外部链接/内容安全（各含 en/ja/zh），以及 docs/superpowers/{specs,plans}
├─ .github/workflows/         ci.yml（verify 作业）、sync-contributors.yml
├─ astro.config.mjs / package.json / tsconfig.json / pnpm-workspace.yaml
├─ README.md / README.en.md / README.ja.md
└─ dist/                      构建产物（生成物，勿手改）
```

**核心模块与入口**
- 入口页：`src/pages/index.astro`（语言重定向）、`src/pages/[locale]/index.astro`（首页）。
- 内容中枢：`src/lib/homeData.mjs`（本地化/分组/排序）、`src/lib/staticPaths.mjs`（路由生成）。
- 渲染中枢：`src/lib/markdown.mjs` + `src/lib/contentSource.mjs`。
- 国际化中枢：`src/lib/i18n.mjs` + `src/lib/traditionalChinese.mjs`。
- 校验中枢：`src/content.config.ts`。

---

## 4. 架构与运行流程

**分层（内容与实现严格分离）**
```
src/content/**（.md/.json）
   │  defineCollection schema 校验（src/content.config.ts）
   ▼
Astro Content Collections
   │  自定义 loader: metadataOnlyGlob（仅存 frontmatter，剥离正文）
   ▼
src/lib/homeData.mjs（本地化/分组/排序）
   │  + traditionalChinese.mjs（繁体派生）
   ▼
src/lib/metadata.mjs（生成 SEO/OG/Twitter 元数据）
   ▼
src/pages/[locale]/**.astro（路由 + 组合）
   ▼
src/components/*.astro（UI 渲染，仅接收 props，不硬编码内容）
   ▼
静态 HTML/CSS/JS（dist/）
```

**启动到核心功能的执行顺序**
1. **预处理（钩子）**：`predev` / `prebuild` / `precheck` / `pretest` 均先执行 `pnpm i18n:generate` → `scripts/generate-traditional-chinese.mjs`：扫描所有 `zh.md`/`zh.json`，用 OpenCC 生成 `zh-tw.*` / `zh-hk.*` 派生文件（带 `generated: true` 标记；若已存在手写繁体文件则跳过并告警）。
2. **构建/开发**：`astro dev|build` 读取 `astro.config.mjs`，用 `src/lib/markdown.mjs` 的 unified 管线渲染 Markdown；`metadataOnlyGlob` 让集合只保留 frontmatter，正文由 `renderContentEntry()` 按需渲染（压低 Vite 入口体积，应对近 8800 个 `.md` 的内容规模）。
3. **路由生成**：各 `[...id].astro` 在 `getStaticPaths()` 中调用 `buildLocalizedStaticPaths()`，为每种 locale 生成路由；当某 locale 缺失文件时，自动以 `zh` 为源合成，避免 404。
4. **页面渲染**：`BaseLayout.astro` 输出元信息与结构化布局；详情页装配 `WikiInfoBox` / `TableOfContents` / `ContributorRoster` / `ContentLicenseNotice` 等组件。
5. **客户端增强**：`src/scripts/*.js`（主题切换、站内搜索、AI 聊天流式显示、贡献者名册、媒体切换等）以原生 JS 注入交互。
6. **AI 聊天（可选）**：前端经 `import.meta.env.PUBLIC_AI_OBSERVER_API_BASE` 调用私有后端；后端源码不在本仓库。

**模块依赖要点**
- `homeData.mjs` 依赖 `i18n.mjs`、`traditionalChinese.mjs`；`staticPaths.mjs` 依赖 `traditionalChinese.mjs`。
- `markdown.mjs` 依赖 `mediaEmbed.mjs`、`htmlPolicy.mjs`、`wikiShortcodes.mjs`。
- `content.config.ts` 依赖 `lib/metadataOnlyGlob.mjs`。
- 组件 → 仅依赖 `lib/*` 经 props 传入的数据，不反向依赖页面。
- *推断* 环境变量 `PUBLIC_SITE_URL`、`PUBLIC_AI_OBSERVER_API_BASE` 通过 Astro 的 `import.meta.env` 在 `BaseLayout`/AI 组件消费（README 已说明，未在本次分析中逐一打开对应消费点）。

---

## 5. 配置与环境

**常用命令（来自 `package.json` 脚本）**
| 命令 | 作用 |
| --- | --- |
| `pnpm install` | 安装依赖（需 `pnpm@11.1.1`）。 |
| `pnpm dev` | 本地开发（`predev` 先生成繁体文件）；默认 `http://127.0.0.1:4321/`。 |
| `pnpm build` | 生成静态站点到 `dist/`（`prebuild` 先生成繁体文件）。 |
| `pnpm preview` | 预览构建产物。 |
| `pnpm check` | `astro check` + 类型/Content Collection schema 校验。 |
| `pnpm test` | 运行 `node --test tests/*.test.mjs`。 |
| `pnpm i18n:generate` | 生成 zh-tw/zh-hk 派生内容（被多个钩子复用）。 |
| 歌词：`lyrics:timestamps:{fetch,apply,audit}`、`lyrics:content:repair` | 歌词时间戳与内容维护。 |
| `contributors:sync` | 同步贡献者数据。 |

**环境变量（仅 `PUBLIC_` 前缀，暴露给浏览器）**
- `PUBLIC_SITE_URL`：生成绝对 canonical URL 与站内图片地址（如 `https://kamitsubaki.wiki`）。
- `PUBLIC_AI_OBSERVER_API_BASE`：AI 聊天后端基地址（本地 `http://127.0.0.1:8787`，生产 `https://api.kamitsubaki.wiki`）。
- *推断* 仓库中未见 `.env.example` 模板，配置仅以 README 文档形式说明。

**CI/CD**
- `.github/workflows/ci.yml`：在 `pull_request` 与 `main` push 时执行 `pnpm install --frozen-lockfile` → `test` → `check` → `lyrics:timestamps:audit -- --strict` → `build`。
- `.github/workflows/sync-contributors.yml`：独立的贡献者同步工作流（*推断* 按计划/事件触发）。

**构建约束**
- `pnpm.onlyBuiltDependencies: [esbuild, sharp]`、`pnpm-workspace.yaml` 允许 esbuild/sharp 构建（图片处理与打包必需）。
- `tsconfig` 排除 `dist`、`.astro`、`node_modules`、`promo-app`、`promo-page`。

---

## 6. 代码现状评估

### 亮点（一致性 / 工程化）
- **内容-实现严格分离**：架构文档（`docs/architecture.md`）与代码一致，组件只接收 props，正文/数据全部来自 `src/content`，利于非技术贡献者参与。
- **强类型内容契约**：`content.config.ts` 用 Zod 对 10 个集合做细粒度校验（含 `superRefine` 业务规则，如 `artistIds` 必须包含主 `artistId`、CC 3.0-CN 必填字段），`astro check` 在 CI 强制。
- **性能意识**：`metadataOnlyGlob` 自定义 loader 主动剥离正文，配合 `renderContentEntry` 按需渲染，应对近 8800 个 `.md` 的规模，降低 Vite 入口体积。
- **国际化工程扎实**：5 语种 + 繁体运行时派生（OpenCC）+ 词条保护 + `{{zh-variant}}` shortcode + 链接重写，处理细致（见 `traditionalChinese.mjs`）。
- **文档完善**：README（中/英/日）、`docs/` 四类文档 + `superpowers/` 规格与计划，代码关键处（loader、转换、路由）有注释说明设计意图。

### 测试覆盖
- **数量充足**：39 个测试文件，覆盖 i18n、内容分离、许可、外部平台、元数据、音乐目录、歌词时间线、贡献者名册、主题切换、站内搜索、AI 控件、传统中文等。
- **类型偏"内容断言/集成"**：多数测试直接读取真实 `.md`/`.json` 断言 frontmatter 与文件存在性（如 `i18n.test.mjs`），相当于内容 lint；**纯逻辑单测较少**。优点是随内容演进自然校验，缺点是测试与内容结构耦合较强，内容调整易引发测试失败。
- 运行器为 Node 原生 `node --test`，无额外测试框架依赖，CI 中以 `--frozen-lockfile` 保证可复现。

### 潜在问题 / 改进点
1. **依赖未锁主版本（中高风险）**：`astro`、`@astrojs/check`、`typescript` 均写 `latest`。`metadataOnlyGlob.mjs` 直接访问 Astro 内部 API（`context.entryTypes`、`markdownEntryType.getRenderFunction` 并置空），对 Astro 主版本升级极为敏感，升级可能导致构建中断。建议锁定主版本或封装兼容层 + 升级测试。
2. **`homeData.mjs` import 位置异常（低）**：第 314 行 `import { resolveLocaleCopy } from './i18n.mjs';` 位于文件末尾。虽因 ESM 提升可正常工作，但不符合常规顶部 import 风格，属代码异味，建议上移。
3. **根目录零散 HTML（低/整洁度）**：`hitokui.html`、`majo.html`、`kamitsubaki_fan_wiki.html`、`markdown_test.html`、`markdown_test2.html`、`test_output.html`、`test2~test4.html` 等约 7 个 HTML 位于仓库根目录，并非 Astro 构建产物（构建输出在 `dist/`），疑似手工/测试遗留文件，建议清理或移入 `tests/`/`promo/` 并加 `.gitignore`。
4. **测试内硬编码外部标识（低）**：`tests/i18n.test.mjs` 中出现具体 GitHub 用户名（`github.com/LinkTh1rsty`），属实现细节外泄，建议改为配置或占位。
5. **缺少 `.env.example`（低）**：环境变量仅在 README 文本说明，未见样例模板， newcomers 易遗漏；建议补充。
6. **脚本侧输出较随意（极低）**：`scripts/generate-traditional-chinese.mjs` 使用 `console.log`/`console.warn` 作为生成反馈，属辅助脚本正常行为，但可统一为结构化日志。
7. **`scripts/lyrics-cache.json` 为生成缓存**：属运行产物，建议确认已纳入 `.gitignore` 或定期刷新，避免陈旧数据入库。

### 总体判断
这是一个**工程化程度较高、文档完备、协作流程清晰**的静态 wiki 项目，国际化与内容建模是其主要技术复杂度所在。主要技术债集中在：(a) 对 Astro 内部 API 的强依赖 + 未锁主版本带来的升级脆弱性；(b) 少量仓库整洁度问题（根目录遗留 HTML、测试硬编码）。整体可维护性与可扩展性良好，适合以 PR 工作流持续演进。

---

*本概览基于 2026-08-07 对项目文件的静态阅读生成；带「*推断*」处为未能逐一打开消费点验证的说明，仅供参考。*
