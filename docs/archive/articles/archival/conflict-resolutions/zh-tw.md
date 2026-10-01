---
schemaVersion: 2
id: "conflict-resolutions"
entityType: "editorial-article"
title: "全域實體命名與歷史衝突消解表"
articleCategory: "archival"
author: "KAMITSUBAKI 資料整理委員會"
publishDate: "2024-09-01"
relatedEntities:
  - "kaf"
  - "rim"
  - "harusaruhi"
  - "isekaijoucho"
  - "koko"
  - "vwp"
  - "kaika"
contentStatus: "published"
locale: "zh-tw"
summary: "系統梳理並消解在整合萌娘百科、日文維基百科、官方 Fanwiki 及各期官方開示過程中發現的實體命名分歧、事實矛盾與組織演進歷史爭議。"
generatedFromHash: "72c1a1492f5695040ad3"
generated: true
generatedFrom: "zh"
---

<!-- AUTO-GENERATED FROM zh; DO NOT EDIT DIRECTLY. -->

## 概述與消解原則

在系統性構建 KAMITSUBAKI Wiki 全景資料庫的過程中，面對中文萌娘百科、日文維基百科（Wikipedia JP）、英文與日文官方 Fanwiki 以及歷年官方動態中存在的海量異構資料，不可避免地遇到了諸如藝名翻譯歧義、歷史演出性質爭議、組織重組歸屬混亂等事實衝突。

為了維護本百科資料庫的客觀性、嚴肅性與最高學術權威，資料整理委員會制定了統一的衝突消解原則：
1. **官方商標與企劃原始檔為最高基準**：一切以 KAMITSUBAKI STUDIO 與 THINKR 正式釋出的日文商業註冊名、官方藝人主頁與原作者署名為第一準則；
2. **多語言精準對映，杜絕漢字氾濫替換**：尊重日文專名原貌，嚴禁在無官方依據的情況下對生僻漢字、片假名進行無端簡化或不當改寫；
3. **嚴謹記錄歷史演進過程**：對於因企業併購、重組整合而產生的組織歸屬變化，按照時間軸如實記錄全貌，而非簡單粗暴地判定某一方為“錯誤”。

---

## 核心實體多語言權威定名規範

| 實體代號 (Slug) | 官方日文標準 (Canonical JP) | 官方英文標準 (Canonical EN) | 中文標準推薦名 (Canonical ZH) | 常見網路/同人分歧 (Aliases) | 權威裁定與事實依據 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **kaf** | 花譜 | KAF | **花譜** / **花譜** | 土JK、花譜太郎、かふ | 詞條標題與正式文案統一為“花譜”。正文尊重日文原制漢字“譜”，以彰顯其世界觀藝術特異性。 |
| **rim** | 理芽 | RIM | **理芽** | チョコ、りめ | 三語命名完全對齊一致。 |
| **harusaruhi** | 春猿火 | HARUSARUHI | **春猿火** | 春ちゃん、はるさるひ | 三語命名完全對齊一致。 |
| **isekaijoucho** | ヰ世界情緒 | ISEKAIJOUCHO | **ヰ世界情绪** | 異世界情緒、情緒、じょちょ | **權威裁定**：萌娘百科普遍使用簡體漢字“異世界情緒”，但神椿全系官方企劃、商標註冊及官方推特嚴格使用片假名“{{ruby::ヰ::wi}}”。交付與收錄標準統一定名為 `ヰ世界情绪（ヰ世界情緒）`，嚴禁矮化為普通“異”字。 |
| **koko** | 幸祜 | KOKO | **幸祜** | ここ、さっちゃん | “祜”為生僻漢字（音 gù / koko），代表福祉與神佑之意。 |
| **v-w-p** | V.W.P | V.W.P | **V.W.P** | 虛擬魔女現象、Virtual Witch Phenomenon | 全稱為 Virtual Witch Phenomenon，通用官方簡寫為 V.W.P。 |
| **kaika** | 廻花 | KAIKA | **廻花** | 回花 | 花譜真實系創作名義，嚴格採用官方漢字“廻”。 |
| **rime** | 音楽的同位體 裡命 | Musical Isotope RIME | **裡命** | 裡命 | **權威裁定**：中文社群曾有使用普通簡體字“裡命”，但官方日文嚴格採用“裡命”（取自表裡相對之“裡”）。中文全站統一確立為“裡命”。 |
| **kanzakiiori** | カンザキイオリ | Kanzaki Iori | **カンザキイオリ** | 神崎一織、神崎一織 | **權威裁定**：國內常音譯為“神崎一織”，但創作者本人未公開對應漢字本名，官方所有作品署名均為全片假名。標準條目以 `カンザキイオリ（神崎一织）` 呈現。 |
| **albemuth** | Albemuth | Albemuth | **Albemuth** | 存流 & 明透 | 存流（ARU）與明透（ASU）的雙人組合；存流畢業退役後企劃轉入永久紀念歸檔。 |
| **valis** | VALIS | VALIS | **VALIS（瓦利斯）** | ヴァリス | 深脊界所屬 6 人虛擬舞臺與高難度編舞組合。 |

---

## 廠牌組織架構演進與歸屬衝突裁定

在歷史材料中，關於“深脊界究竟是獨立工作室還是神椿內部子廠牌”存在普遍混淆。本表裁定其真實的演進階段：

```text
【阶段一：双核平行期 (2019.10 - 2023.06)】
THINKR 旗下分别设立 KAMITSUBAKI STUDIO 与 SINSEKAI STUDIO（深脊界）。
两者共享部分底层技术与视觉资源，但品牌与艺人签约各自独立运作（深脊界由 THINKR、万代南梦宫与 pulse 共同出资）。

【阶段二：厂牌一体化与子厂牌矩阵确立 (2023.07 - 2024.05)】
官方宣布重大组织重组，SINSEKAI STUDIO 全面并入 KAMITSUBAKI 体系，正式确立四大子厂牌（Label-in-Label）：
- PHENOMENON RECORD: 虚拟歌手旗舰 (V.W.P、CIEL、te'resa、廻花)
- SINSEKAI RECORD: 深脊界整合艺人 (VALIS、Albemuth、跳亚、雨宿り、Sooda)
- ANARCHIC RECORD: 独立现实音乐人与 P 主 (香椎モイミ、廉、平田义久、Empty old City)
- KAMITSUBAKI CREATION: 创作者经纪公会 (PALOW.、川サキ、月岛总记、Kazuhide Oka)

【阶段三：全域独立与新星 IP 扩展 (2024.06 - 至今)】
完成 50 亿日元 MBO 后，确立 PNDR 音乐分发平台与独立厂牌 PNDR RECORD，并联合深化（SHINKA inc.）设立跨次元企划 GIRLS REVOLUTION PROJECT（少女革命计划：心世纪、罪十罚）。
```

---

## 重大歷史演出與事實爭議裁定

| 歷史事件 | 爭議與出入點 | 最終裁定事實依據 |
| :--- | :--- | :--- |
| **不可解 (再)** | 舉辦形式爭議（是否為線下演） | 原定於 2020 年 3 月 23 日在 Zepp DiverCity 舉行，受新型冠狀病毒疫情影響緊急調整為**無觀眾線上付費直播**，演出當日 `#花譜不可解再` 斬獲日本 Twitter 趨勢第一。 |
| **不可解參(狂)** | 規模與歷史地位判定 | 2022 年 8 月 24 日於**日本武道館**舉辦，官方裁定為**虛擬歌手史上首位登上武道館舉辦單人專場的里程碑突破**。 |
| **怪歌 (KAIKA)** | 廻花登场具体节点与形式 | 2024 年 1 月 14 日代代木第一體育館花譜 4th ONE-MAN LIVE「怪歌」中途，花譜以真實肉身質感抱木吉他登臺，首次官宣並演唱首支單曲《かいか》。 |
| **代代木決戰二日劃分** | 兩日演出性質混淆 | 2024 年 1 月 13 日為 V.W.P 2nd ONE-MAN LIVE「現象II-魔女復活-」；1 月 14 日為花譜 4th ONE-MAN LIVE「怪歌」。兩日為獨立票務與完全不同主題的旗艦級演出。 |
| **幕張魔女擴成狐子代演** | 演出人員變更原因 | 2024 年 11 月 2 日幕張「現象II（再）」，成員幸祜因頸椎身體健康遵醫囑休養缺席，官方首次啟用同位體設定代演：音樂同位體「狐子（COKO）」登臺共鳴合體。 |
