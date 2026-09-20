# 二级页面显示规范与复用指南

状态：2026-09-20 实施。规范来源是现有首页的编目风格与阅读器的舒适阅读尺度。适用于简中、繁中、日文和英文；文字内容继续通过 i18n 提供。

## 页面类型

| 类型 | 调用 | 使用场景 | 保留的专用结构 |
| --- | --- | --- | --- |
| 普通功能页 | `WorkspaceLayout width="standard"` | 账号、支持、图库管理、新增一般功能页 | 表单、审核队列、账目等业务组件 |
| 宽幅工具页 | `width="wide"` | LABs、数据库、文章目录、时间轴、图库、活动日历、贡献中心 | 分类树、轨道、图网、结果网格 |
| 说明页 | `width="reading"` | 版权、政策、使用说明 | Reader / wiki-prose 正文排版 |
| 词条与文章阅读页 | 现有 EntityArticle / Reader | 实体档案、长文 | 阅读器背景、目录、属性栏、来源与关联卡片 |
| 编辑与沉浸工具 | 现有编辑器或游戏布局 | 编辑器、记忆回廊 | 工具栏、编辑区、画布；不嵌入普通页首 |
| 首页 | 原有首页布局 | 站点门户 | 保留编号、动效与原有结构，不套二级页面布局 |
| 错误与找不到页面 | 通用错误使用 WorkspaceEmptyState；现有 404 保留专用恢复页 | 错误码、返回路径、重试或搜索入口 | 现有 404 互动不强行放入资料页 |
| 旧地址 | 原有 redirect 组件 | beta、旧贡献指南、旧实体路由 | 跳转到权威页面，不再设计第二套界面 |

“统一”是共享语义、尺度与交互，不是把阅读器、时间轴、编辑器都做成相同卡片。新建一般页面优先使用完整 `WorkspaceLayout`；已有页面需要保留外层数据或元信息时，使用 `WorkspaceShell` + `WorkspaceHeader`。

## 已确认的审美方向

用户选择“精致紧凑”：减少无意义留白，以柔和层次区分操作区、分类组和内容，信息可以快速扫读。保留原站衬线标题、等宽索引、主题强调色、轻玻璃质感和细腻悬停；不再用满页长横线和过大的单列留白承载所有功能。

分类组默认桌面三列、平板两列、手机单列。外层面板用 12px 圆角、轻渐变底色和低强度阴影，组内仍以无盒子的链接行排列，避免一层层卡片套卡片。页首只保留一条分隔线，按钮使用小型柔和表面而非统一做成下划线文字。

## 尺度与视觉

以下数值由 `src/styles/workspaceSystem.css` 统一拥有，页面不得再覆盖。

| 项目 | 桌面 | 窄屏 ≤ 760px |
| --- | --- | --- |
| 普通 / 宽幅 / 说明页外框上限 | 1280 / 1440 / 1120px（含留白） | 100% |
| 左右留白 | 48px；≤1100px 为 32px | 22px |
| 页首距顶部 | 104px | 96px |
| 页标题 | 26–32px，衬线，400，行高 1.5 | 26px |
| 英文栏目眉题 | 10px，等宽，字距 .18em | 同桌面 |
| 页首说明 | 13px，行高 1.9，最多 66ch | 同桌面，允许自然换行 |
| 页首分隔与下方间距 | 24px / 28px | 24px / 24px |
| 章节标题 | 23px，衬线，400 | 21px |
| 可操作控件高度 | 至少 40px | 至少 44px |
| 链接、边框反馈 | 220ms | 同桌面；减少动态效果时关闭 |

颜色只读取 `--theme-bg`、`--theme-fg`、`--theme-accent-color` 及其 RGB 变量，保证浅色、深色和阅读主题一致。弱文字仍须可读；不能靠大面积透明、发光或低对比装饰表现层级。

页首由栏目眉题、一个 H1、简短说明、任务操作组成。右侧操作在窄屏自然换行到标题下方；禁止横向挤压标题。首次渲染就保留正确空间，不使用 JavaScript 延迟设置页首高度，不给整个页面加进场遮罩。

## 导航按目的选择

| 目的 | 组件 | 行为 |
| --- | --- | --- |
| 返回父级 | `WorkspaceHeader` 的 `backHref` / `backLabel` | 固定在标题上方左侧；使用确定的父级 URL，不用 history.back() |
| 同一功能的独立子页 | `WorkspaceLinkNavigation`（仅确有需要时） | 普通链接，不复制 LABs 全局功能导航 |
| 同一页面切换面板 | `WorkspaceNavigation` | 原有共享滑块，保留键盘操作、历史和选中状态；账号、支持、贡献中心使用 |
| 选择实体分类 | `ClassificationDirectory` 等现有分类组件 | 按地图层级展开，有单次显示数量限制；不能改为无层级长列表 |
| 阅读正文 | `Reader` / `TableOfContents` | 按真实标题生成目录，保留锚点与阅读位置 |

LABs 总入口只做功能分类导航，不添加装饰性滑块。横向导航只允许导航本身滚动，整页不能产生横向滚动条。不能为了统一而删除支持页、账号页或贡献中心已有的有效滑块。

## 内容组件

- `WorkspaceGroup` + `workspace-group-grid`：并列功能分组，编号、H3、简短描述与内部链接行。桌面/平板/手机为 3/2/1 列，间距 20/18/16px。
- `WorkspaceButton`：`primary`、`secondary`、`quiet` 三个层级，primary 每个操作区最多一个。支持 `href` 或原生 button、disabled、type 和 data 属性；默认 type=button，提交按钮须显式 type=submit。
- `WorkspaceFilters`：筛选表单外框，搜索字段更宽，其余字段自动换行；默认、聚焦、禁用状态共用样式。数据库、图库和纪元时间轴已接入。
- `WorkspaceSection`：统一 H2、描述与右侧操作，保留 section 的 id、data 属性和 hidden 状态。
- `WorkspaceLinkCard`：前往功能页的轻量链接行，标题、说明、可选编号、方向箭头。LABs 已使用。图片结果继续使用专用图库/实体卡片，不能强套导航卡片。
- `WorkspaceEmptyState`：无数据或无匹配结果。说明当前状态，可通过默认 slot 提供下一步操作；不能编造图片或计数。
- `workspace-surface`：确实需要边界的表单/说明面板，24px 内边距（手机 20px），细边框与轻底色。禁止每层嵌套一个背景盒子。
- 表单：标签始终可见；必填与选填明确区分；错误提示靠近字段或表单状态区，提交中禁用重复操作，失败保留已填内容。
- 加载、空、失败、成功必须分开。加载失败不能显示“暂无资料”。状态容器使用 `role="status"`；危险操作沿用真实权限和审核流程。

悬停只改变强调色、细线与小范围方向反馈，不改变卡片尺寸或网格位置。不删除原有阅读器卡片动画；专用组件的动效由其自身维护。移动端不依赖 hover 才显示关键按钮。所有交互均提供 focus-visible，尊重 prefers-reduced-motion。

## 新页面：直接调用

```astro
---
import WorkspaceLayout from '../../layouts/WorkspaceLayout.astro';
import WorkspaceSection from '../../components/WorkspaceSection.astro';
import WorkspaceLinkNavigation from '../../components/WorkspaceLinkNavigation.astro';
import {supportedLocales,resolveLocaleCopy} from '../../lib/i18n.mjs';
export function getStaticPaths(){return supportedLocales.map(locale=>({params:{locale}}));}
const locale=Astro.params.locale!;
const copy=resolveLocaleCopy({
  zh:{title:'示例功能',intro:'用一句话说明本页能完成的任务。',section:'功能内容'},
  ja:{title:'機能の例',intro:'このページでできることを説明します。',section:'内容'},
  en:{title:'Example feature',intro:'Describe the task this page supports.',section:'Content'}
},locale);
---
<WorkspaceLayout locale={locale} path="/example/" title={copy.title}
  intro={copy.intro} eyebrow="OBSERVATORY / EXAMPLE" width="standard"
  backHref={`/${locale}/labs/explore/`} backLabel="LABs">
  <WorkspaceSection title={copy.section} id="content">
    <!-- 在这里放业务组件，不重写 main 的边距与页首 CSS。 -->
  </WorkspaceSection>
</WorkspaceLayout>
```

`WorkspaceLayout` 自动提供 BaseLayout、站点导航、页首、内容框、页脚、canonical 和语言切换。`path` 必须是带首尾 `/` 的页面路径，不含语言前缀。只为实际存在各语言路由的页面使用自动 alternates。

插槽：`actions` 为页首操作，`status` 为页首状态，`navigation` 为任务导航，默认 slot 为内容。`mainAttributes` 传入页面 class、id 或 data 属性；使用组件属性传递，禁止客户端重新包装 main。`noindex` 用于管理和工具页面。

已有复杂页面可使用：

```astro
<WorkspaceShell width="wide" class="feature-workspace" data-my-tool>
  <WorkspaceHeader title={title} intro={intro} eyebrow="LABs"
    backHref={`/${locale}/labs/explore/`} backLabel="LABs"/>
  <!-- 现有工具界面 -->
</WorkspaceShell>
```

此方式由原页面继续负责 BaseLayout、SiteNav、SiteFooter 和 SEO。每页只能有一个 main 和 H1，不得把 WorkspaceLayout 再套入 BaseLayout。

## 已接入范围

公共外框已用于 LABs、数据库与文章目录（通过 EntityCatalog）、时间轴、图库、图库管理、贡献中心、账号、支持、活动日历、版权说明。主页、实体阅读器与编辑器保留专用布局。图库管理使用完整 WorkspaceLayout，是最小生产示例。

## 维护规则与验收

1. 新页面先选上表的页面类型，再选组件；不要复制某个旧页面的整段样式。
2. 通用视觉变更只改 workspaceSystem.css / 对应公共组件；业务 CSS 仅负责图表、数据表、作品卡片等专用内容。
3. 禁止页面覆盖 `.workspace-header`、`.workspace-heading h1`、main 顶部留白和宽度；确有新的布局需求，先增加具名变体并更新本文。
4. 变更后运行类型检查，实际查看 LABs、账号/支持、数据库和图库中的代表页面。桌面与 390px 手机都检查页首、导航、换行、焦点、滚动条和内容密度。
5. 确认主页与阅读器外观未被公共样式污染，既有控件和脚本的 data 属性仍保留。截图不等于投稿、支付或上传业务流程验收。
6. 更新本文件后运行 `node scripts/sync-docs.mjs` 同步镜像，用 `--check` 检查一致性。

## 组件状态表

| 组件 | 默认 | 悬停 / 聚焦 | 按下 / 禁用 |
| --- | --- | --- | --- |
| primary 按钮 | 10% 强调色混合底、强调色文字 | 更清楚的边框与轻阴影，焦点轮廓独立显示 | 下移 1px；禁用 .45 不透明度，禁止交互 |
| secondary 按钮 | 细边框、轻渐变、内侧高光 | 强调色边框与 5% 混合底 | 同上 |
| quiet 按钮 | 无背景、次级文字 | 明确焦点和文字反馈 | 同上 |
| 功能链接行 | 衬线标题、次级说明、方向箭头 | 局部渐变浮现，箭头移动 3px，边框强调 | 不改变布局尺寸 |
| 筛选字段 | 可见标签、42px 原生输入 | 强调边框与 3px 轻色光圈 | 手机 44px；禁用保留内容并降低对比 |
| 轻量跨页导航 | 文字链接、底部分隔 | 下划线从左展开 | 当前页 2px 强调线，aria-current |
| 页内滑块 | 继续使用原有共享滑块 | 保留移动与缩合动效 | 不将跨页链接伪装成面板切换 |

### 常用组合

```astro
<WorkspaceSection title="功能导航">
  <WorkspaceButton slot="actions" tone="primary" data-search-open>全文搜索</WorkspaceButton>
  <div class="workspace-group-grid">
    <WorkspaceGroup index="01" title="查阅资料" description="从资料开始。">
      <WorkspaceLinkCard href="/zh/chronicle/" title="纪元时间轴" description="沿纪元查阅历史事件。"/>
    </WorkspaceGroup>
  </div>
</WorkspaceSection>
```

以上示例省略 import，组件均位于 `src/components/Workspace*.astro`。正式页面文案必须接入 i18n；示例中的中文不应复制为多语言页面的固定显示文字。

## 组件 API 速查

| 组件 | 必填属性 | 可选属性 / 插槽 |
| --- | --- | --- |
| WorkspaceLayout | locale, title, intro, path | width, eyebrow, backHref, backLabel, noindex, mainAttributes；actions / status / navigation / 默认内容 |
| WorkspaceShell | 无 | width；全部 main 原生属性与 data 属性；默认内容 |
| WorkspaceHeader | title, intro | eyebrow, backHref, backLabel；默认操作 / status |
| WorkspaceSection | title | description；section 原生属性；actions / 默认内容 |
| WorkspaceGroup | title | description, index；默认内容 |
| WorkspaceLinkCard | href, title | description, index, class |
| WorkspaceLinkNavigation | label, items | items 为 `{label, href, current?}` 数组 |
| WorkspaceButton | 默认插槽中的可访问名称 | href, tone, type, disabled；button 原生属性与 data 属性 |
| WorkspaceFilters | 默认插槽中的带标签控件 | form 原生属性、role、class、data 属性 |
| WorkspaceEmptyState | title | description；默认插槽用于下一步操作 |

通用组件不负责网络请求、登录、业务权限或数据加载。调用页面继续维护状态和事件；组件只提供正确语义与视觉。`WorkspaceButton` 的 href 用于站内跳转；外部链接需要 target/rel 的场景可用原生 a 与 workspace-button class，显式补充 rel，避免把业务行为藏进通用组件。

## 本轮验收范围

- Chrome 检查九类二级页面的公共外框与标题，公共尺寸一致，未发现横向溢出。
- 支持页点击“费用用途”，选中指示器正常、对应面板显示。
- LABs 浅色与深色主题均检查，随后恢复原先跟随系统的设置。
- 在真实 390px iframe 视口检查 LABs、图库、支持页：单列分类面板、两列筛选和页内滑块正常，页面无横向溢出。该临时验收页面已删除，不进入发布产物。
- 类型检查 0 errors / 0 warnings。此处是显示与交互规范验收，不等于图库云端上传、GitHub 投稿或付费流程验收。

## 操作位置契约

所有一般二级页面都遵守以下顺序，不能逐页自行调整按钮位置：

1. **返回父级**：页首第一行左侧，标题上方，通过 `backHref` 和 `backLabel` 生成。LABs 功能页返回 LABs；图库管理返回图库；顶级二级页返回首页。不得放入 actions 或正文底部。LABs 内部无刷新切换同步更新父级地址与 H1。
2. **页面任务**：标题右侧的 actions 区；手机端固定排在标题说明下方，左对齐。只放投稿、上传、登录等页面级动作；每个区最多一个 primary。不得再出现“功能导航 / 文章 / 纪元时间轴 / 设定图库 / 关联网络”整排链接，这些只在 LABs 功能目录提供。
3. **内容操作**：搜索、筛选、排序在结果区顶部；分区动作在 WorkspaceSection 标题右侧。时间轴缩放与全景按钮留在画布上沿，纪元按钮直接选择时间范围。
4. **详情操作**：弹窗关闭位于右上角；图像缩放位于图像下方；保存/提交位于表单末尾，同一表单保持一致。危险动作与主要提交保持间隔，不混入返回区。
5. **状态**：页面级状态在页首 status 区，筛选计数紧邻结果，表单错误紧邻字段。不要用状态文字把按钮推到无关区域。

实现位置由 WorkspaceHeader / WorkspaceLayout 和 workspaceSystem.css 集中维护，不通过脚本搬移按钮。桌面返回控件至少 32px 高，手机至少 44px；手机动作自动换行，不能横向溢出。

本轮检查包含 localhost:4321 的时间轴纪元选择、LABs 标题与返回目标切换，以及各功能页导航移除。图库真实上传/审核验收仍单独记录，不以视觉检查代替。

## 阅读器关联条目

关联档案、参与作品、文章、编年史足迹和收录曲目使用 `ReaderRecordList`，传入稳定的区块 id、locale 和 records（title / href / detail）。首批 12 项，每次追加 12 项，其余条目保存在 template，点击才进入文档；收起回到首批。与主页分类共用 `recordExpansion.mjs` 和 artist 展开分隔线、渐进高度动画，不再全量铺开关联列表。

列表桌面两列、手机单列；序号、衬线标题、次级关系/日期与方向箭头保持固定层次，整行可点击，悬停不改变尺寸。没有链接的收录曲目保留纯文本行。外层 ReaderDisclosure 保持原生 details 语义和双向开合动画，新增批次只动画本次新增条目，遵守减少动态效果设置。此样式仅作用于 entity-related，正文、阅读背景和目录不受影响。

## 观测形态选择器

图片＋名字的形态切换统一使用 MorphingSwitcher，内部调用 SelectionGroup 的 data-selection-preview 模式。指示块响应鼠标与键盘目标，离开后回到 aria-current 所在档案，不以悬停改写真正的选中页。数据字段、分组和维护流程见 [条目分类维护](../maintenance/entity-classification.md)。
