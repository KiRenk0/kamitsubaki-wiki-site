# Astro 实时小组件开发 Prompt（deepseek-v4-flash / deepseek harness 适用）

> 用途：将本文整段作为任务 prompt 投喂给在 deepseek harness 中运行的 deepseek-v4-flash，驱动其在 `F:\kamitsubaki-wiki-site` 仓库内完成一个"实时小组件"的开发。
> 使用前：将文中 `【WIDGET_SPEC】` 占位替换为具体的小组件需求（功能、数据来源、刷新频率、展示位置）。
> 说明：原始参考文档（WorkBuddy 空间文档）需登录访问，本 prompt 依据该文档主题与本仓库已核实的工程事实编写。

---

## 1. 角色

你是一名资深 Astro 前端工程师，在一个已上线的静态 wiki 仓库中工作。你的任务是新增一个**实时小组件（real-time widget）**，并保证仓库现有校验全部通过。你只能修改本 prompt 允许范围内的文件，禁止做任何需求外的重构。

## 2. 任务

在站点主页右下角参考现有的 `AiChatWidget` / `SocialContactWidget`，新增一个【WIDGET_SPEC】小组件。组件显示的内容为“当前实时动态，数据来源为外部 API，刷新频率为每 30 秒一次”。组件必须支持多语言（zh、zh-tw、zh-hk、ja、en），写完后顺便给我一个完整的外部api配置指南，可以先不进行api配置。数据来源是外部api抓取并分析的相关艺人直播、活动时间表动态，提供本日活动内容；再建一个页面可以像该组件一样实时从外部api获取信息，该页面有一个日历，可以查询过去的活动历史时间和已有预告的未来活动时间。

## 3. 仓库事实（已核实，必须遵守）

### 3.1 技术栈与形态
- Astro（`output: 'static'`）+ TypeScript（strict）+ Tailwind CSS v4（经 `@tailwindcss/vite`）。
- **纯静态站点，无服务器运行时**。"实时"只能通过以下两种方式实现：
  1. 客户端 `fetch` 轮询 / `EventSource` 订阅**外部 API**（基地址只能来自 `PUBLIC_` 前缀环境变量，经 `import.meta.env` 读取）；
  2. 客户端轮询**构建期生成的 JSON 端点**（先例：`src/pages/[locale]/home-catalog.json.ts`、`src/pages/[locale]/search-index.json.ts`），数据随重新构建更新。
- 包管理器为 pnpm@11.1.1，禁止引入 React/Vue/Svelte 等框架依赖；客户端交互一律使用原生 JavaScript。

### 3.2 小组件的标准结构（四件套，参照现有实现）
现有范例组件：`src/components/AiChatWidget.astro`（含外部 API 流式交互）、`src/components/SocialContactWidget.astro`（纯展示 + 开合交互）。新组件必须沿用同一模式：

1. **组件** `src/components/<Name>Widget.astro`
   - frontmatter 中用 TypeScript `type` 声明 `copy` 文案对象的类型；
   - 接收 props：`{ lang?: string; copy: <Name>Copy }`；
   - 通过 `import { getLanguageTag } from '../lib/i18n.mjs'` 生成 `lang` 属性；
   - 所有需要客户端脚本操作的元素必须带 `data-<name>-*` 钩子属性，禁止用 `id` 或 class 做 JS 选择器；
   - 所有用户可见文案一律从 `copy` prop 读取，禁止在组件内硬编码任何自然语言文本；
   - 文件末尾以 `<script> import '../scripts/<name>.js'; </script>` 引入客户端脚本（Astro 会自动打包并去重）。
2. **客户端脚本** `src/scripts/<name>.js`
   - 原生 JS，以 `document.querySelectorAll('[data-<name>]')` 挂载，须支持页面存在多个实例；
   - 轮询类逻辑必须：页面隐藏（`document.visibilityState === 'hidden'`）时暂停计时器、恢复可见时重启；组件卸载/禁用时不留悬挂定时器；
   - 网络请求必须处理失败回退（展示 `copy` 中的 fallback 文案），禁止未捕获的 Promise rejection。
3. **文案** `src/content/site/zh.json`、`ja.json`、`en.json`
   - 在三个文件中新增同一 key（如 `<name>` 对象），结构完全一致；
   - **禁止手动新建或修改 `zh-tw.json` / `zh-hk.json`**：繁体文件由 `pnpm i18n:generate`（OpenCC）自动生成，且 `predev`/`prebuild`/`precheck`/`pretest` 钩子会自动执行。
4. **样式** `src/styles/global.css`
   - 使用 BEM 命名（如 `.<name>` / `.<name>__panel` / `.<name>--open`），追加在文件中现有 widget 样式区块附近；
   - 视觉风格参照 `.ai-chat__*` / `.social-contact__*`（等宽字体 HUD 风、暗色面板、边框辉光），并适配亮/暗双主题与移动端断点。

### 3.3 挂载方式
- 唯一布局为 `src/layouts/BaseLayout.astro`。现有挂载先例：
  ```astro
  const siteEntries = await getCollection('site');
  const siteContent = getLocalizedSite(siteEntries, lang);
  const aiChatCopy = siteContent?.aiChat;
  ...
  {aiChatCopy && <AiChatWidget lang={lang} copy={aiChatCopy} />}
  ```
- 新组件按同一方式在 `BaseLayout.astro` 中条件渲染（copy 存在才渲染），保证未配置文案时不输出任何 DOM。

### 3.4 环境与密钥
- 只允许使用 `PUBLIC_` 前缀环境变量（现有：`PUBLIC_SITE_URL`、`PUBLIC_AI_OBSERVER_API_BASE`）。如确需新变量，在代码中以 `import.meta.env.PUBLIC_XXX || '<生产默认值>'` 形式读取，并在变更说明中列出，禁止写入任何真实密钥。

## 4. 实施步骤（严格按序执行）

1. 阅读范例：`src/components/SocialContactWidget.astro`、`src/components/AiChatWidget.astro`、`src/scripts/socialContact.js`、`src/layouts/BaseLayout.astro`、`src/content/site/zh.json`。
2. 在 `src/content/site/zh.json`、`ja.json`、`en.json` 中新增 `<name>` 文案对象（三份结构一致）。
3. 新建 `src/components/<Name>Widget.astro`（遵循 §3.2-1）。
4. 新建 `src/scripts/<name>.js`（遵循 §3.2-2）。
5. 在 `src/styles/global.css` 追加样式（遵循 §3.2-4）。
6. 修改 `src/layouts/BaseLayout.astro`，按 §3.3 模式挂载。
7. 如需构建期 JSON 数据端点，参照 `src/pages/[locale]/home-catalog.json.ts` 新建 `src/pages/[locale]/<name>.json.ts`（必须实现 `getStaticPaths()` 覆盖全部 5 个 locale：`zh`、`zh-tw`、`zh-hk`、`ja`、`en`）。
8. 依次运行并通过：`pnpm check` → `pnpm test` → `pnpm build`。任何一步失败，先修复再继续，禁止跳过。

## 5. 验收标准

- `pnpm check`、`pnpm test`、`pnpm build` 全部退出码为 0。
- 构建产物中 `/zh/`、`/zh-tw/`、`/zh-hk/`、`/ja/`、`/en/` 五个语种首页均包含小组件 DOM（或按需求指定的页面）。
- 关闭网络或 API 返回错误时，组件展示 fallback 文案且不产生未捕获异常。
- 未新增任何依赖；未修改 `dist/`、`src/content/site/zh-tw.json`、`src/content/site/zh-hk.json` 及任何与需求无关的文件。

## 6. 禁止事项

- 禁止引入前端框架或新 npm 依赖。
- 禁止在组件/脚本中硬编码用户可见文案、API 地址（除规定的默认值）或密钥。
- 禁止手动编辑自动生成的繁体文件与 `dist/` 产物。
- 禁止改动与本任务无关的现有文件、测试与 CI 配置。
- 禁止跳过验证命令直接宣称完成。

## 7. 输出格式

完成后，仅输出以下三部分：
1. **变更文件清单**：每个文件一行，格式 `路径 — 变更说明`；
2. **验证结果**：三条命令的实际退出结果摘要；
3. **遗留事项**：未能满足的需求或需要人工决策的点（没有则写"无"）。
