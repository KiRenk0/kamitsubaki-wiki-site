---
locale: zh
translationKey: edit-guide
eyebrow: CONTRIBUTOR ONBOARDING
title: 编辑前完整学习指南
intro: |
  这是一份按当前仓库工作流整理的完整入门页。

  你可以在下面自由切换两种版本：

  - **完全新手版**：按最细的步骤带你走完一次内容编辑
  - **有编码经验版**：直接讲仓库结构、约束和 GitHub PR 流程

  无论你选哪一种，最后都会把你带到当前条目的 GitHub 编辑页。
back: 返回首页
targetLabel: 即将编辑
targetIntro: |
  先确认下面显示的是不是你这次真正要修改的源文件。

  如果这里不对，不要继续。先回到对应 Wiki 条目页，再点击一次“编辑源文件”进入，避免从一开始就改错文件。
invalidTarget: 未找到有效的编辑目标，请从具体 Wiki 条目的“编辑源文件”按钮进入。
switchLabel: 选择你的教程版本
variants:
  - key: beginner
    label: 完全新手版
    description: |
      适合第一次参与这个仓库、第一次通过 GitHub 网页编辑文件，或者还不太熟悉 Markdown / PR / CI 的人。会把每一步讲得更细。
    sections:
      - title: 第一步，先确认你现在要改的是哪一个文件
        body: |
          当前页面上方显示的路径，就是你这次即将编辑的真实仓库文件。

          先不要急着点 GitHub，先看懂它属于哪一类内容：

          - `src/content/artists/...`：艺人、创作者、组合、音乐同位体等条目
          - `src/content/projects/...`：企划、项目、派生计划页面
          - `src/content/logs/...`：观测记录、新闻、时间线更新
          - `src/content/site/...`：首页标题、导航、页脚、分区文案
          - `src/content/contribute/...`：站内教程页本身

          如果你只是补资料、修文案、改图、调整条目顺序，大多数情况都属于**内容编辑**，应该在 `src/content/` 内完成。
      - title: 第二步，记住这个仓库是“内容和实现分离”的
        body: |
          对新手来说，最重要的一条是：

          > **大多数百科贡献，只改内容文件，不改页面代码。**

          也就是说，先想“内容应该放在哪个文件里”，不要先想“哪个组件要改”。

          当前最常用的内容结构是：

          ```text
          src/content/artists/<分类>/<条目>/<语言>.md
          src/content/projects/<分类>/<项目>/<语言>.md
          src/content/logs/<年份>/<记录>/<语言>.md
          ```

          首页里的 `01. DATABASE`、`02. PROTOCOLS`、`03. LOG` 都已经尽量改成按内容结构自动渲染，所以你以后新增条目时，核心工作通常是：

          1. 选对分类文件夹
          2. 建好条目目录
          3. 填好内容文件
          4. 让系统自动把它显示出来
      - title: 第三步，学会读 Markdown 文件最上面的元数据
        body: |
          每个条目文件都由两部分组成：**frontmatter** 和 **正文**。

          frontmatter 写在文件最上面那段 `---` 和 `---` 之间，用于存结构化信息；正文写在第二个 `---` 之后，用于真正的百科内容。

          ```yaml
          ---
          locale: "zh"
          translationKey: "kaf"
          name: "花谱"
          romanizedName: "KAF"
          statusLabel: "STATUS"
          status: "ACTIVE"
          image: "https://example.com/image.jpg"
          ---
          ```

          先记住最关键的字段：

          - `locale`：当前文件语言，只能是 `zh`、`ja`、`en`
          - `translationKey`：同一条目的三语共用唯一键
          - `name`：页面主标题
          - `romanizedName`：罗马字或英文显示名
          - `statusLabel` 与 `status`：状态显示
          - `image`：主图，也会参与分享卡片生成

          > `translationKey` 在三语文件里必须一致。只要它不一致，系统就不会把这些文件视为同一个条目。

          艺人条目还可以写 `theme`，用于控制条目页的主题色和资料卡里的配色面板。

          ```yaml
          theme:
            name: "KAF Bloom"
            accentColor: "#F29AC2"
            mutedColor: "#E63145"
            surfaceColor: "#111321"
            highlightColor: "#FFF6FA"
            palette:
              - label: "花譜粉"
                value: "#F29AC2"
              - label: "红花"
                value: "#E63145"
          ```

          主题色不要凭感觉乱填。优先看官方艺人页、官方主视觉、官方专辑封面或角色设定图；把最能代表角色的颜色放进 `accentColor`，把背景阅读用的深色放进 `surfaceColor`。
      - title: 第四步，新增条目时先遵守三语规则
        body: |
          这个站点默认支持中、日、英三语路由：

          ```text
          /zh/  中文，默认语言
          /ja/  日文
          /en/  英文
          ```

          所以只要你在新增一个可翻译条目，推荐从一开始就同时创建：

          - `zh.md`
          - `ja.md`
          - `en.md`

          如果正文暂时写不完，也至少先把三语文件和基础 frontmatter 建好。正文可以后补，但结构最好一开始就完整。
      - title: 第五步，正文怎么写才适合这个 Wiki
        body: |
          正文部分就是普通 Markdown。你可以安全使用：

          - 段落
          - 列表
          - 粗体
          - 引用块
          - 行内代码与代码块
          - 表格
          - 链接

          比起一次写很长，推荐优先补最稳定、最容易核对的信息：

          1. 基本身份信息
          2. 出道时间或项目归属
          3. 官方链接或来源说明
          4. 再逐步完善完整介绍

          同时注意这些边界：

          - 不要编辑 `dist/`、`.astro/`、`node_modules/`
          - 不要把大段百科文案写进组件文件
          - 不确定字段含义时，优先看 `README.md` 和 `docs/contributing.md`
          - 不要写占位正文，宁可先留空
      - title: 第六步，点进 GitHub 后按顺序做什么
        body: |
          当你点击页面底部的 GitHub 编辑入口后，通常会进入该文件的在线编辑页。

          到了 GitHub 里，按这个顺序来：

          1. 先确认页面上显示的文件路径和这里一致
          2. 修改 frontmatter 或正文
          3. 向下滚动到提交区域
          4. 写一条简短、明确的提交说明

          如果 GitHub 让你选择提交方式，通常按这个思路：

          - 已经在你自己的分支上：直接提交到当前分支
          - 不在你的分支上：选择 **Create a new branch for this commit and start a pull request**
      - title: 第七步，提交之后就是 PR 和 CI 流程
        body: |
          这个仓库以 GitHub Pull Request 工作流为主。

          一次正常的流程通常是：

          1. 在 GitHub 完成文件修改
          2. 提交到你的分支
          3. 打开 Pull Request
          4. 等待 CI 自动检查
          5. 按 review 或 CI 结果继续修正

          当前本地和 CI 使用的是同一组核心验证命令：

          ```bash
          pnpm test
          pnpm check
          pnpm build
          ```

          如果 CI 失败，不需要新开一个 PR。**继续在同一个分支修复，再推送即可。**
      - title: 第八步，提交前后最容易踩的坑
        body: |
          下面这些是最常见的失误：

          - 改错文件路径
          - 少建了一种语言文件
          - 三语文件的 `translationKey` 不一致
          - 把内容写进实现代码
          - 提交了生成目录
          - 用占位正文代替真实内容

          你可以用这四个问题做最后自检：

          1. 我现在编辑的是不是 `src/content/...`
          2. 这个条目的三语文件有没有一起考虑
          3. 我改的是内容本身，还是站点实现
          4. 这次提交能不能让别人一眼看懂我改了什么
    finalTitle: 开始编辑当前源文件
    finalBody: |
      如果你已经完成上面的学习，就可以继续了。

      下面两个入口分别适合不同阶段：

      - **还想再确认仓库规则**：先看完整贡献指南
      - **已经明确要改当前这个文件**：直接打开 GitHub 源文件编辑页

      进入 GitHub 后，继续沿着这条流程走：

      1. 修改当前文件
      2. 提交到你的分支
      3. 创建 Pull Request
      4. 等待 CI
      5. 在同一个分支继续修正 review 或 CI 问题
    finalLinkLabel: 前往 GitHub 编辑源文件
  - key: experienced
    label: 有编码经验版
    description: |
      适合已经熟悉 Git / GitHub / PR / CI，只需要快速建立这个仓库心智模型的人。会少讲通用概念，多讲当前项目约束。
    sections:
      - title: 先看当前目标文件，不要抽象思考
        body: |
          这个页面最重要的信息就是上面的目标路径。

          你现在要改的是某个 `src/content/...` 文件，而不是抽象意义上的“一个页面”。对这个仓库来说，内容就是主数据源。

          快速分类：

          - `src/content/artists/...`：DATABASE 条目
          - `src/content/projects/...`：PROTOCOLS 卡片和项目页
          - `src/content/logs/...`：LOG 新闻式记录
          - `src/content/site/...`：首页和站点 chrome 文案
      - title: 当前仓库的关键约束
        body: |
          这个项目当前的核心约束是：

          1. 内容与实现分离
          2. 三语并行
          3. 首页尽量按目录结构自动渲染
          4. metadata 自动扫描，但允许 `seo.*` 覆盖

          这意味着你在内容编辑时，优先考虑：

          - 文件夹结构是否正确
          - `translationKey` 是否稳定
          - frontmatter 是否满足 schema
          - 这次改动会不会影响自动分类/自动生成
      - title: 目录模型和常用路径
        body: |
          当前主要内容模型：

          ```text
          src/content/artists/<category>/<entry>/<locale>.md
          src/content/projects/<category>/<project>/<locale>.md
          src/content/logs/<year>/<record>/<locale>.md
          ```

          典型动作：

          - 新增分类：加第一层文件夹
          - 新增条目：加第二层文件夹和三语 md
          - 改排序：用 `categoryOrder` / `itemOrder`
          - 改展示名：用 `categoryTitle` / `categorySubtitle`
          - 精准 SEO：写 `seo.title` / `seo.description` / `seo.image`
      - title: frontmatter 里最值得关注的字段
        body: |
          你不需要每次都写满字段，但这些要特别注意：

          - `locale`
          - `translationKey`
          - `name`
          - `romanizedName`
          - `image`
          - `statusLabel` / `status`
          - `categoryTitle` / `categorySubtitle`
          - `categoryOrder` / `itemOrder`
          - `theme.*`
          - `seo.*`

          如果是三语条目：

          - `translationKey` 必须一致
          - 推荐三语文件同时存在
          - 正文可以不对等完整，但结构最好对齐
          - `theme` 应该三语同步，色值一致，`palette.label` 用各语言本地化
      - title: GitHub 网页编辑时的最短工作流
        body: |
          最短路径就是：

          1. 打开当前文件的 GitHub 编辑页
          2. 改 frontmatter / Markdown 正文
          3. 提交到你的分支
          4. 开 PR
          5. 让 CI 跑

          如果 GitHub 让你选分支策略：

          - 已在自己的分支：直接提交
          - 不在自己的分支：新建分支并启动 PR

          提交信息只要清楚，不需要修辞。
      - title: CI 心智模型和风险点
        body: |
          当前最该记住的是这三条检查：

          ```bash
          pnpm test
          pnpm check
          pnpm build
          ```

          它们大致覆盖：

          - 内容结构 / i18n 假设
          - Astro / collection schema
          - 静态构建完整性

          最常见失败源：

          - YAML/frontmatter 缩进错误
          - `translationKey` 或 locale 不一致
          - 新增内容后目录层级不符合预期
          - 把内容写进实现层
    finalTitle: 直接进入当前文件编辑
    finalBody: |
      如果你已经理解这个仓库的内容模型和 PR 路径，现在可以直接进 GitHub。

      推荐动作非常简单：

      1. 编辑当前文件
      2. 提交到你的分支
      3. 开 Pull Request
      4. 看 CI
      5. 在同一分支继续修复

      如果你要回头查细节，再打开完整贡献指南。
    finalLinkLabel: 直接打开当前文件的 GitHub 编辑页
docs: 查看完整贡献指南
docsPath: docs/contributing.md
---

<!-- guide content is configured through frontmatter; keep a non-empty body so Astro always indexes this file -->
