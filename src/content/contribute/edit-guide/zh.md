---
locale: zh
translationKey: edit-guide
eyebrow: CONTRIBUTOR GUIDE
title: 第一次贡献，也可以很简单。
intro: |
  你不需要会写代码，也不需要先学会 Git。这里会根据你的经验，带你从**注册 GitHub 账号**、修改百科内容，一直走到**成功提交 Pull Request**。

  做错了也不用担心：Pull Request 是“请求合并”，不会直接改坏网站。维护者会先检查并帮助你。
primaryAction: 选择适合我的路线
journeyLabel: 一次贡献只有三个阶段
journeySteps:
  - 准备账号
  - 编辑内容
  - 提交 PR
back: 返回首页
targetLabel: 本次目标文件
targetIntro: |
  从条目页进入时，这里会显示真正要修改的文件。路径不对就先回到条目页重新点击“编辑源文件”。
invalidTarget: 暂无指定文件；你仍然可以先学习，实际编辑时请从具体条目进入。
switchLabel: 你现在处在哪个起点？
switchHint: 不需要判断自己“懂不懂技术”，只选最符合现状的一项。路线可以随时切换，阅读进度会保存在当前浏览器里。
durationLabel: 预计用时
outcomeLabel: 完成后
progressLabel: 已完成
resetLabel: 重置本路线进度
resetConfirm: 确定清空这条路线在当前浏览器中的学习进度吗？
completeLabel: 标记这一步已完成
completedLabel: 这一步已完成
checkpointLabel: 完成标准：
aiHelpTitle: 让 AI 帮我处理这一步
aiHelpBody: 先补充你当前看到的页面、报错或不确定之处。系统会把它和本步骤目标、当前文件及项目约束组合成一段完整问题。
aiPrivacyNote: 只描述界面和公开错误文字，不要填写密码、验证码、Cookie、令牌、邮箱或其他私人信息。
aiContextLabel: 补充你现在遇到的情况（可选）
aiContextPlaceholder: 例如：我已经打开 GitHub，但找不到 Propose changes；页面上只看到 Commit changes…
aiPromptPreviewLabel: 将复制以下完整提示词
aiNoContext: 我还没有补充具体情况，请先告诉我这一步通常应该看到什么，再一次只给我一个操作。
aiGuardrails: 不要索要或处理密码、验证码、Cookie、令牌或私人信息；不要编造资料、来源、测试结果或未展示的页面内容；一次只给当前步骤所需的最小操作。
aiCopyLabel: 复制完整提示词
aiCopiedLabel: 已复制，可以去问 AI 了
glossaryTitle: 先认识 4 个词
glossary:
  - term: Repository / 仓库
    definition: 存放网站文件和修改历史的项目空间，可以把它理解成一个公开的项目文件夹。
  - term: Fork / 复刻
    definition: GitHub 自动复制到你账号下的安全副本。你在副本中修改，不会直接影响原网站。
  - term: Commit / 提交记录
    definition: 为一次修改按下“保存”，并留下一句说明。它不是最终交给网站的 PR。
  - term: Pull Request / PR
    definition: 把副本中的修改交给维护者检查，并请求合并到原网站。
variants:
  - key: beginner
    label: 我还没有 GitHub 账号
    summary: 从零开始，注册、验证邮箱、网页编辑、提交第一份 PR，全程不安装软件。
    audience: 零基础路线 · 不需要代码经验
    duration: 约 35–55 分钟
    outcome: 独立提交第一个 PR
    description: |
      这是最完整、最慢也最安心的一条路线。你只需要一个能接收邮件的邮箱和现代浏览器。所有操作都在网页里完成，**不需要安装 Git、终端或代码编辑器**。

      建议第一次按顺序完成；以后再贡献时，可以直接切换到“网页编辑”路线。
    sections:
      - title: 准备好账号需要的东西
        summary: 只需要邮箱、浏览器和大约一小时；GitHub 免费，贡献 Wiki 也不会收费。
        body: |
          开始前准备好：

          1. 一个你能正常收信的长期邮箱
          2. Chrome、Edge、Safari 或 Firefox 等现代浏览器
          3. 想修改的资料，以及可以核对它的可靠来源

          **不需要准备：** 银行卡、付费套餐、Git、终端、编程软件或 GitHub App。

          GitHub 是存放和协作维护这个 Wiki 的平台。你的每次修改都会先放在自己的安全副本里，再通过 PR 交给维护者检查，所以不会一按按钮就直接改变正式网站。

          > 安全提醒：密码、邮箱验证码、两步验证代码和恢复代码只能由你本人保管。维护者和 AI 都不需要这些信息。
        checkpoint: 你有一个可正常收信的邮箱，并知道整个流程可以只用浏览器免费完成。
        action:
          label: 查看 GitHub 官方账号说明
          href: https://docs.github.com/zh/get-started/start-your-journey/creating-an-account-on-github
        aiPrompt: |
          我准备第一次为一个粉丝 Wiki 做贡献，并且完全不了解 GitHub。请用非常简单的中文解释 Repository、Fork、Commit、Pull Request 分别是什么，以及为什么通过 PR 修改不会直接弄坏网站。不要假设我会编程，也不要向我索要任何账号密码或验证码。
      - title: 注册免费的 GitHub 个人账号
        summary: 按 GitHub 页面提示创建个人账号；免费账号就足够，不需要选择 Pro。
        body: |
          1. 打开下方的 GitHub 注册页面。
          2. 使用邮箱注册，或选择页面提供的 Google / Apple 登录方式。
          3. 设置用户名。它会公开显示在你的 PR 和贡献记录旁，建议使用你愿意长期公开的名字。
          4. 设置一个**与其他网站不同**的强密码，并自行妥善保存。
          5. 完成 GitHub 页面要求的人机验证。

          如果页面询问用途或套餐，选择免费个人账号即可。贡献公开仓库不需要购买 GitHub Pro。

          注册后打开邮箱，点击 GitHub 发来的验证链接。没有验证邮箱时，GitHub 会限制创建 Fork 和 Pull Request 等关键功能。

          没收到邮件时：先检查垃圾邮件；再到 GitHub 右上角头像 → `Settings` → `Emails` → `Resend verification email`。验证链接通常有时效，过期就重新发送。
        checkpoint: 你可以登录 GitHub，并且 Settings → Emails 中的主要邮箱显示为已验证。
        action:
          label: 打开 GitHub 注册页面
          href: https://github.com/signup
        aiPrompt: |
          我正在注册 GitHub 免费个人账号。请一步一步告诉我当前注册页面通常需要填写什么，并解释“用户名会公开显示”是什么意思。不要替我生成或收集密码，不要让我发送邮箱验证码、两步验证代码或恢复代码。如果我描述某个报错，请只给安全的排查步骤。
      - title: 用 4 个词看懂接下来的流程
        summary: 你不需要学 Git，只要知道“仓库 → Fork → Commit → PR”这条关系。
        body: |
          可以把整个流程想象成给同人志编辑部投稿：

          - **Repository（仓库）**：编辑部保存全部稿件的项目文件夹。
          - **Fork（复刻）**：GitHub 给你复印一份个人工作副本。
          - **Commit（提交记录）**：你在副本里保存一次修改，并写一句修改说明。
          - **Pull Request（PR）**：你把修改后的稿件交回编辑部，请维护者审阅和合并。

          PR 不是“已经改完正式网站”，而是“请审阅我的修改”。维护者可能直接合并，也可能留言请你补充来源或修正文案。收到修改意见并不代表贡献失败，而是公开协作的正常部分。

          GitHub 还会显示 **Checks / CI**：这是机器人自动检查文件格式和网站能否正常构建。绿色表示通过，红色表示有问题需要看详情。
        checkpoint: 你能用自己的话说出 Commit 是保存记录，而 PR 才是交给维护者审阅。
        aiPrompt: |
          请把 GitHub 的 Repository、Fork、Branch、Commit、Pull Request、Checks/CI 用“给编辑部投稿”的比喻解释给完全没有技术背景的人。最后给我一张从编辑文件到维护者合并的纯文字流程图。不要使用命令行术语。
      - title: 确认目标文件和资料来源
        summary: 正式动手前先确认路径、语言和来源；这是避免改错条目的关键一步。
        body: |
          看本页顶部的“本次目标文件”。正常情况下，它应以 `src/content/` 开头，例如：

          ```text
          src/content/artists/vwp/kaf/zh.md
          ```

          最后的 `zh.md` 是中文，`ja.md` 是日文，`en.md` 是英文。只修中文内容时就编辑 `zh.md`；新增完整条目时才需要同时考虑三种语言。

          常见目录：

          - `artists/`：艺人、创作者、组合等百科条目
          - `projects/`：企划与项目
          - `logs/`：新闻、活动和观测记录
          - `site/`：首页、导航、页脚文案

          同时准备可追溯的来源，优先级建议为：官方站点/公告 → 官方账号发布 → 正式采访或可靠媒体。不要把 AI 生成内容、传闻或无法核实的粉丝讨论当成事实来源。
        checkpoint: 顶部路径对应正确条目和语言，并且你知道新事实来自哪里。
        aiPrompt: |
          我准备编辑 KAMITSUBAKI FAN WIKI，目标文件是：{{TARGET_PATH}}

          请只根据这个路径解释它属于哪种内容、是哪种语言，以及我应该修改 frontmatter 还是 Markdown 正文。不要编造任何艺人资料；如果缺少事实来源，请明确提醒我先寻找官方来源。不要建议修改 dist、.astro、node_modules 或无关实现文件。
      - title: 打开 GitHub 网页编辑器
        summary: 点击本路线底部的编辑按钮；GitHub 可能先请你登录，并自动为你创建 Fork。
        body: |
          点击页面底部的“前往 GitHub 编辑当前文件”。如果还没登录，GitHub 会先要求登录，完成后再回到编辑页。

          你没有原仓库写入权限时，GitHub 会显示类似 **Fork this repository** 的提示，或在你提交修改时自动创建 Fork。确认即可——Fork 是你账号下的公开副本，不会改变原仓库。

          进入后，你会看到文件路径和编辑框。请再次确认路径与本页顶部一致。GitHub 的按钮名称可能随界面更新略有变化，但核心顺序始终是：

          ```text
          打开文件 → 编辑 → Preview → Commit changes / Propose changes → Pull Request
          ```

          如果铅笔编辑按钮不可用，先确认已登录且邮箱已验证；也可以重新从 Wiki 条目页的“编辑源文件”进入。
        checkpoint: 你已经看到 GitHub 的文件编辑框，并确认路径与本页顶部完全一致。
        action:
          label: 查看 GitHub 官方网页编辑说明
          href: https://docs.github.com/zh/repositories/working-with-files/managing-files/editing-files
        aiPrompt: |
          我正在 GitHub 网页上编辑另一个人的公开仓库，目标文件是：{{TARGET_PATH}}

          请根据我描述的当前页面，一次只告诉我下一步应该点击什么。GitHub 可能会自动创建 Fork，这是正常的。不要向我索要登录密码、验证码、Cookie、令牌或完整账户信息；如果需要看界面，只让我描述按钮文字或提供遮住隐私的截图。
      - title: 安全地修改 frontmatter 和正文
        summary: 大多数贡献只改文字；保留文件顶部结构，不确定的字段不要随意删除。
        body: |
          Markdown 文件通常分成两部分：

          ```yaml
          ---
          locale: zh
          translationKey: kaf
          name: "花谱"
          image: "https://example.com/image.jpg"
          ---

          ## 概述
          这里开始是普通正文。
          ```

          两条 `---` 之间叫 **frontmatter**，保存标题、语言、图片等结构化信息；第二条 `---` 后面是正文。

          编辑时遵守这些规则：

          - 修错字时只改必要文字，不顺手重写无关段落。
          - 不要删除开头或结尾的 `---`。
          - `locale` 与文件名语言一致；同一条目的三语文件使用相同 `translationKey`。
          - YAML 的缩进使用空格，不使用 Tab；引号和冒号要成对、保持原结构。
          - 新增事实时写清来源；不使用占位、猜测或 AI 编造内容。
          - 绝不填写密码、邮箱、住址、令牌等私人或敏感信息。

          可使用 Markdown 标题、段落、列表、粗体、引用、表格和链接。第一次贡献建议从“修正一个明确错误”或“补一条有官方来源的资料”开始。
        checkpoint: 修改范围清楚、格式仍完整，新增事实有可核对来源，文件中没有私密信息。
        aiPrompt: |
          你是一位谨慎的 Markdown 编辑助手。我正在编辑：{{TARGET_PATH}}

          我接下来会粘贴“准备修改的片段”和“可靠来源”，请帮我：
          1. 只修改与来源直接支持的内容；
          2. 保留 YAML frontmatter 的字段、缩进和两条 ---；
          3. 不编造事实，不添加占位内容；
          4. 不改无关段落；
          5. 输出修改后的完整片段，再用中文列出改了什么。

          如果来源不足，请停止改写并告诉我还缺什么。提醒我删除任何密码、验证码、令牌或私人信息。
      - title: 预览差异并保存为一次 Commit
        summary: 先看 Preview / Changes，确认只有预期内容，再写一条别人看得懂的修改说明。
        body: |
          编辑完成后先点击 **Preview** 或查看 **Changes**：

          - 绿色通常代表新增内容，红色代表删除内容。
          - 检查有没有误删整段、破坏 `---`、改错语言或出现奇怪缩进。
          - 链接、日期、人名和专有名词再核对一次。

          然后点击 **Commit changes...**。提交说明写“做了什么”，例如：

          ```text
          docs: 修正花谱条目中的出道日期
          docs: 补充花谱官方链接
          docs: 修正文案错别字
          ```

          对没有原仓库权限的贡献者，按钮也可能显示 **Propose changes**。GitHub 会把修改保存到你的 Fork/分支，并带你继续创建 PR。

          Commit 是保存这一次修改，不等于 PR 已经提交。看到下一页后还要继续完成 Pull Request。
        checkpoint: 差异中只有你有意修改的内容，并且 Commit message 能清楚说明改动。
        aiPrompt: |
          请帮我检查一份 GitHub 网页编辑器中的 diff。我会粘贴绿色新增行和红色删除行。目标文件是：{{TARGET_PATH}}

          请检查：是否误删内容、YAML frontmatter 是否可能损坏、语言是否一致、是否含未经来源支持的事实或隐私信息。然后给我 3 个简短中文 Commit message 备选。不要假设没贴出来的内容，也不要让我提供账号凭据。
      - title: 创建你的第一个 Pull Request
        summary: 写清标题和说明，确认目标是原仓库的 main，然后点击 Create pull request。
        body: |
          保存 Commit 后，GitHub 通常会出现 **Compare & pull request**、**Open a pull request** 或 **Create pull request**。进入 PR 页面后检查：

          - **base repository** 是 `LinkTh1rsty/kamitsubaki-wiki-site`
          - **base branch** 是 `main`
          - **head fork / compare** 是你账号下刚才保存修改的分支

          PR 标题用一句话概括，例如：

          ```text
          docs: 补充花谱活动经历
          ```

          PR 说明推荐写三项：

          ```markdown
          ## 修改内容
          - 补充 2024 年活动经历

          ## 资料来源
          - 官方活动公告：https://...

          ## 语言与范围
          - 简体中文；只修改花谱条目
          ```

          最后点击 **Create pull request**。普通内容修正直接创建可审阅 PR 即可，不必选择 Draft。若页面出现 **Allow edits from maintainers**，保持允许通常更方便维护者协助小修。
        checkpoint: "你已经看到带编号的 PR 页面，例如 Pull Request #123，而不是仍停留在编辑或比较页面。"
        action:
          label: 查看 GitHub 官方 Fork PR 说明
          href: https://docs.github.com/zh/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork
        aiPrompt: |
          请帮我撰写一个 KAMITSUBAKI FAN WIKI Pull Request。目标文件是：{{TARGET_PATH}}

          我会提供实际修改内容和来源。请输出：
          1. 一个不超过 60 个字符的 PR 标题；
          2. 包含“修改内容 / 资料来源 / 语言与范围”的简洁 Markdown 说明；
          3. 提交前检查清单。

          不要编造我没有提供的修改或来源。不要输出密码、令牌或任何账户私密信息。
      - title: 看懂 Checks、评论和修改要求
        summary: PR 提交后先等待自动检查；红色不等于失败，按详情修正并继续用同一个 PR。
        body: |
          PR 页面会显示 **Checks** 或状态图标：

          - 黄色/灰色：检查正在运行，先等待几分钟。
          - 绿色：自动检查通过，等待维护者 review。
          - 红色：某项检查失败，点 **Details** 看最先出现的具体错误。

          常见问题包括 YAML 缩进错误、缺少必填字段、语言值写错或 Markdown 结构损坏。你可以回到 Fork 中的同一文件继续编辑并再次 Commit；新的提交会**自动加入原来的 PR**，不要重复开新 PR。

          维护者可能在 **Conversation** 留总体意见，也可能在 **Files changed** 对某一行评论。修改后回复一句说明即可，例如“已补充官方来源并修正日期”。不要把讨论标记为已解决，除非问题确实已经处理。

          如果维护者关闭 PR，先看原因。可能是内容重复、来源不足或方向不符合 Wiki；礼貌询问下一步，不要原样反复提交。
        checkpoint: 你知道 PR 的当前状态；若有红色检查或 review 意见，已经找到具体问题和对应修改位置。
        aiPrompt: |
          我提交的 GitHub PR 出现了检查失败或 review 评论。目标文件是：{{TARGET_PATH}}

          我会粘贴公开的错误文字或评论内容。请先用简单中文解释它是什么意思，再给最小修改方案，并告诉我应在同一个 PR/分支继续修改。不要猜测未提供的日志，不要让我分享密码、Cookie、验证码、令牌或仓库机密。
      - title: 完成贡献并保持联系
        summary: 合并前耐心等待，合并后你的署名会留在 GitHub；下一次可以走更短的路线。
        body: |
          PR 提交后，你已经完成了贡献者需要做的核心工作。维护者会根据时间进行检查；公开项目不保证立即回复，请耐心等待 GitHub 通知。

          状态可能是：

          - **Open**：仍在审阅或等待修改。
          - **Merged**：修改已合并，之后会随网站部署上线。
          - **Closed**：未合并并关闭，请查看维护者说明。

          合并后不要删除或改写原 PR 讨论；它是资料变更的公开记录。如果上线后发现新问题，可以在原 PR 留言说明，或为新的独立问题提交新 PR。

          下次只改已有文件时，切换到“我有账号，只想网页编辑”即可。贡献不以修改量衡量：一个可靠来源、一处准确日期、一个错别字都很有价值。
        checkpoint: PR 已提交且你知道在哪里查看状态；无论是否已合并，你都完成了一次完整、可追溯的贡献。
        aiPrompt: |
          请根据我描述的 GitHub PR 页面，解释它现在是 Open、Merged 还是 Closed，以及我下一步应该做什么。请用对新手友好的中文，一次只给必要操作。不要让我分享任何账号凭据或私密信息。
    finalTitle: 把你的贡献送到我们面前
    finalBody: |
      开始前做最后检查：目标文件正确；内容可核实；来源已写清；没有占位、猜测或私人信息。

      点击右侧入口后，沿着你刚学到的流程前进：**编辑 → Preview → Commit / Propose changes → Create pull request**。如果卡住，就展开对应步骤里的 AI 提示词。
    finalLinkLabel: 前往 GitHub 编辑当前文件
  - key: web
    label: 我有账号，只想网页编辑
    summary: 已能登录 GitHub，用浏览器完成现有文件修改、Commit、PR 和后续修正。
    audience: 网页编辑路线 · 无需安装工具
    duration: 约 15–30 分钟
    outcome: 提交一次网页 PR
    description: |
      适合已经拥有并验证 GitHub 账号，但不想安装 Git 或使用命令行的人。这里跳过注册和基础比喻，重点讲当前文件、网页编辑器、Fork、PR 与检查结果。
    sections:
      - title: 确认账号、目标和修改范围
        summary: 确保已登录且邮箱已验证，再核对本页顶部目标路径。
        body: |
          先确认 GitHub 可正常登录，邮箱已验证。本页顶部路径必须以 `src/content/` 开头并对应正确语言。只修一个问题就只动相关段落，避免把格式整理或其他条目修改混进同一 PR。

          新事实应有官方公告、官方页面或可靠采访等可追溯来源。AI 可以帮你润色和检查格式，但不能代替来源。
        checkpoint: 账号可用、文件与语言正确，并能用一句话说明本 PR 只解决什么问题。
        aiPrompt: |
          请帮我为一次 Wiki 小修改划定范围。目标文件：{{TARGET_PATH}}。我会描述问题和来源，请告诉我应只改哪些内容，并列出不应顺手修改的部分。不要编造事实。
      - title: 在网页编辑器中修改并预览
        summary: 打开目标文件，保持 frontmatter 结构，只做有来源支撑的最小修改。
        body: |
          点击本路线底部入口。若 GitHub 提示 Fork，确认即可。修改后用 **Preview / Changes** 检查差异：红色是删除、绿色是新增。

          保留 YAML 的 `---`、缩进和既有字段；`locale` 与文件名一致，三语条目的 `translationKey` 不变。不要提交密码、令牌、个人联系方式或大段无来源内容。
        checkpoint: 差异只包含预期内容，frontmatter 与 Markdown 结构没有被破坏。
        action:
          label: GitHub 官方网页编辑说明
          href: https://docs.github.com/zh/repositories/working-with-files/managing-files/editing-files
        aiPrompt: |
          检查我准备提交的 Markdown diff，文件是：{{TARGET_PATH}}。请检查 YAML、Markdown、意外删除、语言一致性、来源和隐私；只提出最小必要修改，不要扩写或编造百科内容。
      - title: 写 Commit message 并 Propose changes
        summary: Commit 说明只写做了什么；没有写权限时 GitHub 会自动 Fork。
        body: |
          点击 **Commit changes...**，使用短而明确的说明，例如 `docs: 修正花谱条目日期`。如果按钮显示 **Propose changes**，它会把修改保存到你的 Fork/分支，并继续带你创建 PR。

          不要选择或尝试直接写入原仓库 `main`。网页流程自动创建的分支即可，不需要手动设计复杂分支名。
        checkpoint: 修改已保存到你的 Fork/分支，并进入比较或创建 PR 页面。
        aiPrompt: |
          根据我对修改的描述，给出 5 个简短的中文 Git Commit message。目标文件：{{TARGET_PATH}}。格式使用 `docs: ...`，不要夸大修改范围。
      - title: 填写并创建 Pull Request
        summary: base 指向原仓库 main，标题概括改动，说明写范围与来源。
        body: |
          确认 base repository 是原仓库、base branch 是 `main`，compare/head 来自你的 Fork。PR 正文至少包含修改内容、资料来源、语言与范围。

          点击 **Create pull request** 后，看到带编号的 PR 页面才算真正提交成功。普通小修改无需 Draft；可保持允许维护者编辑。
        checkpoint: 已生成 PR 编号，Conversation 页面能看到你的标题、说明和 Commits。
        action:
          label: GitHub 官方 Fork PR 说明
          href: https://docs.github.com/zh/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork
        aiPrompt: |
          帮我写 PR 标题和说明。文件：{{TARGET_PATH}}。我会提供实际改动与来源；请输出标题，以及含“修改内容 / 资料来源 / 语言与范围”的 Markdown。不得编造来源。
      - title: 处理 Checks 和 review
        summary: 等自动检查；失败就点 Details，在同一分支继续修改。
        body: |
          黄色代表运行中，绿色通过，红色失败。红色时先打开 **Details**，找最前面的明确错误。继续编辑同一 Fork/分支并 Commit，更新会自动进入原 PR。

          对 review 意见做最小修正，完成后回复维护者。不要为了修 CI 重开 PR，也不要强行关闭仍有未处理意见的讨论。
        checkpoint: 所有检查已通过，或你已经定位具体错误并在同一 PR 中修正。
        aiPrompt: |
          解释下面这段公开的 GitHub Actions 错误或 review 评论，并给我最小修复步骤。文件：{{TARGET_PATH}}。不要猜测未提供的信息；提醒我继续使用同一 PR。
      - title: 修改已有 PR 或撤回错误
        summary: 后续 Commit 会自动进入原 PR；确实不再提交时再关闭 PR。
        body: |
          需要补充时回到你的 Fork，编辑同一文件和分支，再 Commit。PR 会自动更新。若改错方向，可以在 PR 留言说明并继续修复。

          只有确定不再推进时才点击 **Close pull request**。关闭不会删除历史；如果只是等待维护者，不需要关闭。
        checkpoint: 你知道如何让新修改进入原 PR，也知道 Open、Merged、Closed 的区别。
        aiPrompt: |
          我已经有一个打开的 GitHub PR，需要继续修改。请根据我描述的页面告诉我如何确认正在编辑同一个 Fork 和分支，从而让新 Commit 自动加入原 PR。不要建议创建重复 PR。
    finalTitle: 检查一次，然后提交
    finalBody: |
      确认路径、差异、来源和隐私后，就可以进入 GitHub。网页路线只有一条主线：**Edit → Preview → Propose changes → Create pull request → Checks / review**。
    finalLinkLabel: 打开 GitHub 网页编辑器
  - key: new-entry
    label: 我要新增一个完整条目
    summary: 从确定内容类型开始，创建目录与三语文件，填写结构、来源并提交一个可构建的 PR。
    audience: 新增条目路线 · 网页或本地均可
    duration: 约 35–70 分钟
    outcome: 提交一个三语新条目
    entryMode: repository
    description: |
      适合新增艺人、企划或时间线记录，而不是修改已有文件。新增条目通常会同时产生目录和三种语言文件，因此比单文件修正多几步。

      你可以使用 GitHub 网页的 **Add file → Create new file**，也可以在本地创建文件。第一次建议先找一个同类型现有条目作为结构参考。
    sections:
      - title: 确定条目类型与收录范围
        summary: 先判断它属于艺人、企划还是时间线，并确认内容值得成为独立条目。
        body: |
          当前主要 collection：

          - `src/content/artists/`：艺人、创作者、组合、音乐同位体
          - `src/content/projects/`：企划、世界观项目、展览或厂牌
          - `src/content/logs/`：有明确日期的新闻、活动与观测记录

          新条目需要有明确对象、稳定名称和可追溯的公开来源。只是补一个日期或链接时，优先修改已有条目，不要为了少量信息重复建页。
        checkpoint: 你能明确说出条目属于哪个 collection，以及为什么需要独立条目。
        aiPrompt: |
          【目标】判断我准备新增的 Wiki 内容应该属于 artists、projects 还是 logs，并判断是否值得独立建页。
          【仓库内容根目录】{{REPO_CONTENT_ROOT}}
          【我的情况】{{USER_CONTEXT}}
          【约束】只根据我提供的对象、来源和现有目录信息判断；不要编造收录规则或事实。
          【请输出】推荐 collection、理由、是否应改已有条目、下一步需要准备的资料清单。
      - title: 选择目录名与稳定 translationKey
        summary: 用小写英文 slug 建目录，并让三语文件共享同一个稳定键。
        body: |
          目录名使用简短、可读、稳定的小写英文 slug，单词之间用连字符，例如：

          ```text
          src/content/artists/vwp/new-artist/
          src/content/projects/arg/new-project/
          src/content/logs/2026/2026-07-12-new-event/
          ```

          `translationKey` 用于把三语文件识别为同一条目。它不应包含语言后缀，也不要因为显示名翻译变化而改变。

          先搜索仓库，避免目录名或 `translationKey` 与已有记录重复。
        checkpoint: 目录 slug 与 translationKey 已确定、未重复，并且不会随语言变化。
        aiPrompt: |
          【目标】为一个新 Wiki 条目设计目录 slug 与 translationKey。
          【我的情况】{{USER_CONTEXT}}
          【约束】slug 只用小写英文字母、数字和连字符；translationKey 跨 zh/ja/en 完全一致；不要猜测未提供的官方英文名。
          【请输出】3 个候选方案、推荐方案、需要在仓库中搜索确认的重复项。
      - title: 创建目录与三语文件
        summary: 在同一目录创建 zh.md、ja.md、en.md，先搭好可被系统识别的骨架。
        body: |
          一个可翻译条目推荐从一开始就创建：

          ```text
          <entry>/zh.md
          <entry>/ja.md
          <entry>/en.md
          ```

          GitHub 网页方式：进入正确 collection 和分类目录，点击 **Add file → Create new file**，在文件名输入框中可以用 `/` 一次创建目录和文件，例如 `new-artist/zh.md`。保存第一份后，再在同一目录创建另外两份。

          正文来不及翻译时可以暂时留空，但 frontmatter 必须有效；不要放“待补充”“Lorem ipsum”等占位正文。
        checkpoint: 三个语言文件位于同一条目目录，文件名准确，没有多余嵌套层级。
        action:
          label: 查看 GitHub 官方新建文件说明
          href: https://docs.github.com/zh/repositories/working-with-files/managing-files/creating-new-files
        aiPrompt: |
          【目标】为新条目生成正确的目录与 zh.md、ja.md、en.md 文件骨架。
          【仓库内容根目录】{{REPO_CONTENT_ROOT}}
          【我的情况】{{USER_CONTEXT}}
          【约束】遵守现有 collection 目录层级；三语文件放在同一目录；不生成占位事实或虚构正文。
          【请输出】最终目录树、GitHub 网页逐步操作、三个空白文件各自应包含的最小结构。
      - title: 按 collection 填写必要 frontmatter
        summary: 不同内容类型字段不同；直接参考同目录现有文件和 content.config.ts。
        body: |
          三种常见最小结构：

          ```yaml
          # artists
          locale: zh
          translationKey: new-artist
          name: "显示名"
          romanizedName: "ROMANIZED NAME"
          statusLabel: "STATUS"
          status: "ACTIVE"
          image: "https://可靠公开图片地址"
          ```

          ```yaml
          # projects
          locale: zh
          translationKey: new-project
          kind: "PROJECT"
          title: "显示标题"
          description: "简短说明"
          order: 1
          ```

          ```yaml
          # logs
          locale: zh
          translationKey: new-event
          date: "2026-07-12"
          type: "NEWS"
          title: "记录标题"
          order: 1
          ```

          实际必填字段以 `src/content.config.ts` 和同类型现有文件为准。不要为了“看起来完整”随意填写 `theme`、`seo` 或未知字段。
        checkpoint: 三语 frontmatter 均能对应 schema，locale 各自正确，translationKey 完全一致。
        aiPrompt: |
          【目标】检查并生成新条目的最小有效 frontmatter。
          【我的情况】{{USER_CONTEXT}}
          【约束】严格按我提供的 content.config.ts schema 和现有同类型文件；缺少事实就列为待确认，不得虚构值；保持 zh/ja/en translationKey 一致。
          【请输出】三语 frontmatter、每个字段依据、仍需我确认的项目。
      - title: 编写正文与三语内容
        summary: 先写稳定事实和来源，再做翻译；三语结构一致但不要求逐字对应。
        body: |
          艺人条目推荐从概述、创作定位、活动历程、代表作品、相关企划、参考资料和外部链接开始。企划与日志应使用与现有同类型页面一致的结构。

          写作顺序：

          1. 用资料来源写出事实清单
          2. 完成信息最充分的语言版本
          3. 翻译另外两种语言
          4. 对照检查姓名、日期、作品名和链接

          AI 可以协助翻译和润色，但不能成为资料来源。官方专有名词优先使用官方现有译名；不确定时保留原文并说明。
        checkpoint: 三语文件结构相近，正文没有占位或无来源事实，专有名词与日期已核对。
        aiPrompt: |
          【目标】根据我提供的可靠来源，整理并翻译一个新 Wiki 条目的三语正文。
          【我的情况与资料】{{USER_CONTEXT}}
          【约束】只写来源直接支持的事实；AI 不是来源；不确定的专有名词保留原文并标注；三语结构一致但语言自然。
          【请输出】先列事实与来源映射，再输出 zh/ja/en Markdown；最后列出无法确认的内容。
      - title: 处理来源、链接与图片版权
        summary: 每个关键事实可追溯，图片来自允许公开使用的官方来源，不上传私密或侵权材料。
        body: |
          优先使用官方艺人页、官方新闻、官方活动页、官方发布和正式采访。参考资料写清标题、发布方、日期与链接。

          图片必须是公开可访问且适合引用的来源。不要上传付费内容截图、泄露素材、私人照片、含个人信息的截图或来源不明的二次转载。无法确认使用条件时，先使用可靠官方 URL 或暂不添加图片，并在 PR 中询问维护者。
        checkpoint: 关键事实都有来源，所有链接可访问，图片没有明显版权或隐私风险。
        aiPrompt: |
          【目标】审查新条目的来源、外部链接和图片风险。
          【我的情况】{{USER_CONTEXT}}
          【约束】不把 AI 输出当来源；不认可付费截图、泄露素材、私人照片或不明转载；无法确认时明确标记风险。
          【请输出】事实—来源对照表、失效或弱来源、图片风险、提交前必须处理的问题。
      - title: 跨语言自检与本地验证
        summary: 检查目录、字段和翻译一致性；能本地运行时执行与 CI 相同的命令。
        body: |
          手动检查：

          - 三语文件是否都在正确目录
          - `locale` 分别为 `zh`、`ja`、`en`
          - `translationKey` 是否完全一致
          - 必填字段、日期、排序值和链接是否有效
          - 是否没有占位正文、敏感信息或生成目录

          本地开发者运行：

          ```bash
          pnpm test
          pnpm check
          pnpm build
          ```

          纯网页贡献者可以提交 PR 后查看 CI；若失败，在同一分支继续修正。
        checkpoint: 人工检查完成；本地命令通过，或你知道提交后在哪里查看 CI。
        aiPrompt: |
          【目标】对新条目的目录、三语文件、frontmatter、正文和来源做提交前审查。
          【我的情况】{{USER_CONTEXT}}
          【约束】逐项检查 locale、translationKey、schema、占位、隐私、来源和链接；不要声称运行了我未运行的命令。
          【请输出】按“阻塞提交 / 建议修正 / 已通过”分组的检查结果，以及最小修复顺序。
      - title: 提交一个可审阅的新条目 PR
        summary: 一个 PR 只新增这个条目，说明目录、语言、来源和验证结果。
        body: |
          Commit 和 PR 标题示例：

          ```text
          content: add new artist entry
          content: add 2026 event log
          ```

          PR 说明至少包含：条目类型与路径、三语完成情况、主要资料来源、图片来源、实际运行的验证，以及尚未确定的内容。不要把其他条目重写、无关格式化或生成文件混进同一 PR。

          CI 或 review 要求修正时，继续在同一分支提交，原 PR 会自动更新。
        checkpoint: PR 只包含新条目相关文件，说明与来源完整，并能被维护者直接审阅。
        aiPrompt: |
          【目标】为一个新 Wiki 条目生成可审阅的 Commit message 和 PR 说明。
          【我的情况】{{USER_CONTEXT}}
          【约束】只使用我实际提供的文件、来源和验证结果；不编造测试通过、翻译完成度或图片授权。
          【请输出】Commit message、PR 标题、含 Summary / Files / Locales / Sources / Image / Validation / Open questions 的 Markdown 正文。
    finalTitle: 从内容目录开始创建新条目
    finalBody: |
      先进入 `src/content/`，选择正确 collection 和分类，再创建条目目录与三语文件。提交前确保 schema、来源、图片与验证信息都清楚。
    finalLinkLabel: 打开 GitHub 内容目录
  - key: experienced
    label: 我熟悉 Git / GitHub
    summary: 快速掌握仓库模型、三语约束、验证命令和 Fork PR 策略。
    audience: 开发者路线 · 仓库约束速查
    duration: 约 10–20 分钟
    outcome: 按项目规范提交 PR
    description: |
      适合熟悉 fork / branch / commit / PR / CI 的贡献者。只保留当前 Astro 内容模型、schema、三语与验证要求；可以选择网页编辑、本地 Git 或 GitHub Desktop。
    sections:
      - title: 建立仓库内容模型
        summary: 内容是一次数据源，页面按 Content Collections 和目录结构生成。
        body: |
          主要路径：

          ```text
          src/content/artists/<category>/<entry>/<locale>.md
          src/content/projects/<category>/<project>/<locale>.md
          src/content/logs/<year>/<record>/<locale>.md
          src/content/site/<locale>.json
          ```

          首页尽量按目录自动分类和渲染。内容 PR 不应修改 `dist/`、`.astro/`、`node_modules/`，也不要把百科正文硬编码回组件。
        checkpoint: 已确认本次属于内容修改还是实现修改，且目标路径符合对应 collection。
        aiPrompt: |
          审查这个目标路径是否符合仓库内容模型：{{TARGET_PATH}}。请根据 artists/projects/logs/site 的目录约束说明它会影响什么，避免推测未提供的代码。
      - title: 遵守 schema、i18n 与内容约束
        summary: frontmatter 由 content.config.ts 校验；三语共享 translationKey，结构一致。
        body: |
          `locale` 仅允许 `zh | ja | en`。同一记录的多语言文件共享稳定 `translationKey`。Artists 关注 `name`、`romanizedName`、`statusLabel`、`status`、`image`；Projects 与 Logs 使用各自 schema。

          新增条目优先同时创建 `zh.md`、`ja.md`、`en.md`。正文允许完成度不同，但不要用占位文本。`theme.*` 色值跨语言一致，仅 `palette.label` 本地化；`seo.*` 只在需要显式覆盖自动 metadata 时填写。
        checkpoint: frontmatter 满足 collection schema，locale/translationKey/目录与同条目其他语言一致。
        aiPrompt: |
          你是 Astro Content Collections 审查员。请对照我提供的 content.config.ts schema 检查 {{TARGET_PATH}} 的 frontmatter，列出缺失、类型、枚举、i18n 一致性问题。不要编造默认值或内容事实。
      - title: 选择网页、Desktop 或本地 Git 流程
        summary: 单文件小修可走网页；多文件、新条目和结构调整建议本地分支。
        body: |
          对外部贡献者，标准目标为 upstream `LinkTh1rsty/kamitsubaki-wiki-site:main`，head 来自个人 fork 的 topic branch。

          本地示例：

          ```bash
          git switch main
          git pull --ff-only upstream main
          git switch -c docs/update-kaf
          # edit content
          git add src/content/...
          git commit -m "docs: update KAF entry"
          git push -u origin docs/update-kaf
          ```

          不要把无关格式化、生成物或本地配置混入内容 PR。新增图片时先确认版权、公开来源与仓库现有媒体策略。
        checkpoint: branch 基于最新 upstream/main，staged diff 只包含本次相关文件。
        aiPrompt: |
          根据我的 `git status` 和 `git diff --stat` 输出，帮我检查这个内容 PR 是否混入无关文件。目标内容是 {{TARGET_PATH}}。不要建议 reset --hard 或删除未确认的用户改动。
      - title: 运行与 CI 相同的验证
        summary: 依次运行 test、Astro check 和 build，先修第一个根因错误。
        body: |
          ```bash
          pnpm test
          pnpm check
          pnpm build
          ```

          `pnpm check` 会暴露 Content Collections schema、Astro/TypeScript 问题；`build` 验证静态路由与内容渲染。失败时从第一条明确错误开始处理，避免被后续级联信息干扰。
        checkpoint: 三条命令均通过，或 PR 说明中已明确记录无法本地验证的客观原因。
        aiPrompt: |
          我会粘贴 `pnpm test`、`pnpm check` 或 `pnpm build` 的错误。请识别第一处根因，只给最小修复建议，并区分内容 schema 错误与实现错误。不要虚构未展示的文件内容。
      - title: 写出可审阅的 PR
        summary: 标题、范围、来源、验证与风险一目了然；base 指向 upstream/main。
        body: |
          PR 建议包含：

          - 变更摘要与动机
          - 资料来源及其支持的具体事实
          - 语言与文件范围
          - 已运行的验证命令
          - 截图（仅在视觉实现变化时）

          尽量保持单一主题和可审阅 diff。允许维护者编辑 fork branch 可加速小修，但涉及 workflows 或 secrets 的 fork 需谨慎理解 GitHub 的安全提示。
        checkpoint: base/head 正确，PR 说明足以让 reviewer 不打开所有文件也能理解范围与依据。
        aiPrompt: |
          根据我提供的真实 diff、来源和验证结果，生成一个简洁 PR 标题与 Markdown 描述。目标：{{TARGET_PATH}}。必须包含 Summary、Sources、Locales/Scope、Validation；不得编造未执行的测试或来源。
      - title: 在同一分支完成 review 循环
        summary: CI/review 修复继续推到 head branch，保持历史和讨论连续。
        body: |
          新 Commit 会自动更新 PR。优先小步修复明确问题；不要通过新 PR、force-push 重写他人正在 review 的上下文，除非维护者明确要求。

          合并前同步 upstream/main 时选择团队可审阅的方式；发生内容冲突应重新核对事实和语言文件，而不是只解决 Git 标记。
        checkpoint: CI 通过、review 意见已回应，最终 diff 仍保持单一主题且没有生成物。
        aiPrompt: |
          我会提供 PR review 评论和当前 diff。请把评论分类为必须修复、需澄清、可选建议，并给出保持同一分支的最小修复顺序。不要建议破坏性 Git 命令。
    finalTitle: 按当前仓库规范提交
    finalBody: |
      快速自检：collection 路径和 schema 正确；三语策略明确；来源可追溯；diff 单一；`pnpm test`、`pnpm check`、`pnpm build` 已通过。
    finalLinkLabel: 直接打开当前文件
docs: 查看完整贡献指南
docsPath: docs/contributing.md
---

<!-- guide content is configured through frontmatter; keep a non-empty body so Astro always indexes this file -->
