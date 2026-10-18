# 旧编辑器投稿修复审查

本批次仅处理三个旧内容投稿。原始提交以 merge commit 保留，格式修复另行提交；没有合并 main，也没有生产发布批准。基线为 `e1ebc17a7696570535684e6263a097f42462d694`。

| 原 PR | 固定 head | 处理 |
| --- | --- | --- |
| [#63](https://github.com/LinkTh1rsty/kamitsubaki-wiki-site/pull/63) | `a3dceb341a4eb706812cdde8810f8e3bdfec9aca` | 清理被转义的强调标记，恢复六张专辑的原站内链接；保留作者明确提出的普通/迷你专辑分类与删除单曲列表的编辑意图。尚未发生的 2026 年 11 月演出写为计划。 |
| [#65](https://github.com/LinkTh1rsty/kamitsubaki-wiki-site/pull/65) | `06763a16c6fde76ad0ae9372f084bc6fde08405d` | 删除整表 HTML 转换和 URL 编码噪声；对基线最终仅修改一行，把《不可欠》的日期写为投稿提出的 `2022-09-11`。 |
| [#71](https://github.com/LinkTh1rsty/kamitsubaki-wiki-site/pull/71) | `d9b465a0c5bc52ce92de158087f6f2b3acdad5cb` | 保留时间线和三个游戏的增补，恢复原有研究补充边界；按官方说明澄清 EMERGENCE 的疫情调整与限时活动。 |

## 故障与校验

#65、#71 原 head 的 GitHub `Verify wiki` 日志均在构建前报 `Original body changed`。它们不是 TypeScript 检查失败：原日志的 Astro 检查均为 0 errors、0 warnings，失败发生在正文保护哈希校验。

正文校验最初服务于 V3 迁移的原文保留。经审查的内容修订需要同步对应基线，否则正常内容投稿也会被拦住。本次只变更上述三篇中文正文的 `bodyHash`，不改变历史 `before` 数据、不运行全量重设脚本、不放宽或删除验证逻辑。其余 5,256 项记录保持原样。

当前主线已经包含旧版编辑器的 Markdown 表格保真修复，其测试直接覆盖 #65 的日期修订。此次没有再修改编辑器运行代码。新版 Novel 文档适配器也验证了三个修复后的实际文件保存、重新加载、再保存均逐字相同；该证据属于 Node/jsdom，不冒充真实浏览器或线上投稿验收。

## 内容来源与范围

- #63 的活动与作品沿革以投稿所附的 [ALLT 官方艺人资料](https://alltstudio.jp/artist/dustcell/)和[官方作品目录](https://alltstudio.jp/discography_category/dustcell/)核对。将 2021-04-10 明确表述为歌曲发行日期，避免误称为广告开始日期。
- #65 的更正来自投稿给出的[作品视频](https://www.youtube.com/watch?v=ipXJ1zhSubo)；[作品发行页](https://linkco.re/RgA5Yca5?lang=ja)核对了作品与作者，[歌词服务](https://utaten.com/lyric/mi22091214/)显示 2022-09-11。此 PR 只更正可不人物页目录；歌曲实体及其他语言仍有历史日期问题，属于后续事实整理，不能据此声称全站日期已经统一。
- #71 采用 [EMERGENCE 官方回顾](https://uc.kamitsubaki.jp/)、[官方众筹说明](https://camp-fire.jp/projects/368592/view)、[NARRATIVE 官方站](https://uc-narrative.kamitsubaki.jp/)和[游戏 Steam 页面](https://store.steampowered.com/app/3639970/)。保留投稿中的民间翻译与讨论链接，不将其写作官方来源。

## 本地验证

运行环境为本任务独立工作树，Node.js 24.11.1；依赖从已安装的同基线工作树复制为独立目录，没有复用其数据库、服务或私密配置。CI 使用仓库规定的 Node.js 22，结果应以最终候选 head 为准。

- 原版编辑器表格、行内格式、文档导入导出测试：29/29 通过。
- 新版编辑器 `tests/wiki-document.test.ts`：27/27 通过。
- 三篇实际修复文件经新版编辑器保存、重开、再保存：3/3 逐字一致。
- 完成本地预生成后 `node scripts/run-tests.mjs`：818/818 通过。未检出相邻后端，五个跨仓库测试文件不运行；没有将其计为通过。
- Astro 检查 758 个文件：0 errors、0 warnings，121 hints。
- 内容验证：1,836 个实体、518 条事件、5,259 个受保护正文，0 errors、1,036 条已有 warnings。
- 贡献入口、文档本地链接、工作流入口、歌词时间戳和 diff 空白检查通过。共享样式检查确认前端 token 来源存在；未进行跨仓库同步验收。

最初使用日常主目录的不完整依赖时，测试缺少 Dexie；跳过预生成时缺少繁体 JSON。直接运行 Astro 构建时缺少编辑器 manifest。上述失败均记录为本机准备问题，随后补齐本任务自己的依赖与正常构建步骤；不归因为内容修复本身，不删测试掩盖失败。

## 其他开放 PR

- [#25](https://github.com/LinkTh1rsty/kamitsubaki-wiki-site/pull/25)，head `6d692be7cb2a875cd5ea172ca4233408a6310a06`：复现 YAML 关键词行混入脚注定义；旧文件路径在主线已删除，merge-tree 为 modify/delete 冲突。既有 `CHANGES_REQUESTED` 仍适用，不进入本批次。
- [#72](https://github.com/LinkTh1rsty/kamitsubaki-wiki-site/pull/72)，head `0ec4feb8453c51fd55592c238fea0c905945bf76`：自身 `Verify wiki` 通过，但基于旧 main，落后当前主线 7 个提交；本地 merge-tree 发现 10 个文件冲突。新增档案数据库、中央身份绑定和共享服务尚有独立配置及真实业务验收项。本轮仅完成合并阻塞与服务边界检查，没有宣称逐行审完其 43,371 行新增代码。

此次查询 workspace、backend、companion、gateway 仓库均无开放 PR。博客不属于用户指定范围。
