# 资料复核线索

本页保存资料核对结果与后续线索。EMA、Misumi、大沼パセリ、Guiano、梓川及神椿市项目关系的第二批修订见 `16ab58fb4` 与[续作验收](continuation-acceptance.md)。第三批资料提交为 `441bc692b`，当前覆盖和未解决字段以 `archive-audit.json` 为准；下列各项分别说明已应用范围与剩余问题。

- NINA：已依据 [2024-03-08 官方公告](https://kamitsubaki.jp/news/2024/03/08/3215/)修正活动状态与成员关系终点。公告明确当天从 VALIS 毕业并结束艺人活动，亦说明预录音源／配音仍可能使用，不把后来预录作品误判为继续活动。
- CHINO／NEFFY／RARA／VITTE 与 MYU：已从 [2026-02-06 PANORA 报道](https://panora.tokyo/archives/131418)追溯至[导演操桃的原始公告](https://twitter.com/SOUGHT_VALIS/status/2019697641416987076)，通过 X 官方嵌入帖直接浏览运营公告附图。已记录四位当天开始个人活动、MYU 于 2 月 13 日从项目毕业；个人活动起点没有覆盖为她们最初的职业起点。MYU 后续个人音乐活动状态仍为 unknown，并单独保留未核实证据。
- [PIEDPIPER 的 2026-09-05 原文](https://note.com/futashika/n/n4fdca2f7b788)已经用于区分 VALIS 团体的神椿所属与四位成员个人的自由职业／THINKR 代理合作形式，未推定合同起始日。该文另说明 SINSEKAI RECORD 和 ANARCHIC RECORD 在重组中废止、ALLT 早在 2024 年设立；这些厂牌历史和相关人物的具体所属时间仍需逐条核对。
- RIME：已依据官方歌唱／朗读商品页与发售公告记录 CeVIO AI、VOICEPEAK 及对应日期，撤回旧稿未经确认的 Synthesizer V、多语言及授权结论。[PALOW. 于 2022-10-25 发布的原始帖子](https://x.com/PALOW_/status/1584881922420842496)已通过 X 官方 oEmbed 读取，并在 X 官方嵌入帖直接浏览三张设定图；其[PHASE 官方资料](https://phasestudio.jp/member/palow/)链接同一账号。设计关系保留为推断且未核实，设定图发布日仅作为视觉记录日期，不增加设计署名。直接设计 credit 仍待补充。VOICEPEAK 官方公告标题／日期与正文中的月份不一致，字段备注保留这一差异，并列零售目录佐证。
- `ichinose-ruri`：已恢复待核实占位，导入标签不等于已证实姓名。检索中的“市瀬るぽ／Ichinose LUPO”和“市ノ瀬瑠莉”不能按近似名字合并为此 ID，仍需明确的本人身份及作品来源。
- 大沼パセリ：官方简介只确认 2017 年开始活动。旧稿 `2017-06-29` 与首作曲名仍缺原始投稿依据；ANARCHIC 的具体个人所属历史也不能仅从通用厂牌废止公告推断。

- 三个活动类别 `official-fan-salons`、`radio-recordings`、`release-presentations` 在 `03478a818` 原为分类占位，后续未经来源便写入固定日期、参加者与活动权益。本批恢复 stub／noindex，保留稳定 ID，不把类别当作某一具体场次。后续须先有可确认该活动身份的主办公告。
- 花譜 2025 ACEN 与 AFA Indonesia 两场演出已按 THINKR 自己的报告写入 22 首与 6 首完整曲目，完整仅限对应花譜场次；两首 English ver. 独立建档，不复用日语录音 ID。武道馆记录补到官方 BD 本篇 30 个音乐章节，继续标 partial，不把剪辑版目录视为当日完整现场。
- 下一批演出资料：现有 `witch-assembly` 日期 `2021-03-13` 与[官方 JOINT LIVE 记录](https://kamitsubaki.jp/event/2022/04/15/1104/)的 `2022-04-15` 不同，需确认该 ID 原意是具体首场还是系列后再修正；不能把 V.W.P 结成日当作演出日。`fukakai-two` 为横跨 PANDORA 与豊洲 PIT 的系列，不应由一个 `isVirtual: false` 描述全部场次；SINKA LIVE 也需按官方历史区分系列与 episode.0。此处仍是待处理线索，未混入本批已验收快照。
- Genome：目前仍为 0 条 BPM／有来源标签。搜索到的同名翻唱、改编伴奏和自动测拍结果不能套到原曲。已找到花譜官方 piapro 及作曲者原始 YouTube 投稿入口，后续需进一步读到实际原版速度或作者描述，再写入对应字段。
- BPM 的具体线索：柊サブネタイト的[作者变体视频](https://www.youtube.com/watch?v=dMPIF2cfBQM)说明列出 BPM190 并说明伴奏与原曲相同；这是《マーシャル・マキシマイカ》变体，不能把其歌手身份复制给原版。原作投稿为[柊マグネタイト的可不版本](https://www.youtube.com/watch?v=jMKPYg0uhCI)，ニコニコ ID 为 `sm39217773`。本轮直接打开原作 YouTube 遇到 429，尚未把原曲描述作为直读成功；下一步核对原作说明／作者伴奏目录及作者账号关联，再补原版 BPM 和制作署名。

以上仅为内容核对线索；正常账号、服务环境、真实相机、串流和 S01 真实账目仍按主验收清单分别追踪。
