import { appendSections } from '../entry-append.mjs';

const valis = {
  zh: [
    {
      heading: '## 原创曲全谱系与制作阵',
      body: `VALIS 的原创曲以极高的"一线创作者供曲密度"著称——几乎每一首作品都由当时日本网络音乐界的代表性 P 主或作曲家执笔：

| 序号 | 公开时间 | 曲目 | 作词 / 作曲 / 编曲 |
| :--- | :--- | :--- | :--- |
| #001 | 2020-05-15 | 《残響ヴァンデラー》 | かいりきベア |
| #002 | 2020-06-29 | 《真夜中コンツェルト》 | syudou |
| #003 | 2020-07-31 | 《道化師ブランケット》 | 煮ル果実 |
| #004 | 2020-09-09 | 《開幕ゼノパレード》 | Ayase |
| #005 | 2020-09-30 | 《激情インプロビゼーション》 | ポリスピカデリー |
| #006 | 2020-11-13 | 《超常現象ダンスダンス》 | かいりきベア |
| #007 | 2020-11-27 | 《錯綜リフレクション》 | R Sound Design |
| #008 | 2020-12-25 | 《革命バーチャルリアリティ》 | カンザキイオリ |
| #009 | 2021-01-29 | 《鈍色リグレット》 | [Misumi](/database/artists/groups/dustcell) |
| #010 | 2021-02-26 | 《再構成ウィーバー》 | DECO*27（编曲：Rockwell） |
| #011 | 2021-04-16 | 《相反ヴァラエティ》 | TOOBOE |
| #012 | 2021-06-21 | 《新世界ピグマリオン》 | 柊キライ |
| #013 | 2021-07-09 | 《天命系メルト》 | ぽん / 安宅秀紀 |
| #014 | 2021-10-24 | 《物換星移カタルシス》 | TeddyLoid & Giga |
| #015 | 2021-11-18 | 《境界線マクガフィン》 | 牛肉（作词）/ 雄之助 |
| #016 | 2022-02-25 | 《革命バーチャルリアリティ（覚醒 ver.）》 | カンザキイオリ（Remix：安宅秀紀） |
| #017 | 2022-03-19 | 《天命系メルト（覚醒 ver.）》 | ぽん / 安宅秀紀 |
| #018 | 2022-05-01 | 《一陽レガシー》 | TOOBOE |
| #019 | 2022-07-31 | 《偶像ナイトメア》 | みきとP |
| #020 | 2022-08-21 | 《偶像ナイトメア》【『転生デパーチャー』LIVE ver.】 | みきとP |
| #021 | 2022-09-30 | 《物換星移カタルシス》【『転生デパーチャー』LIVE ver.】 | TeddyLoid & Giga |
| #022 | 2022-11-26 | 《再見ロマネスク》 | 柊マグネタイト |

> **制作阵观察**：かいりきベア、syudou、煮ル果実、Ayase、DECO*27、柊キライ、みきとP、TeddyLoid & Giga 等一线创作者的密集参与，使 VALIS 在出道两年内即建立起极高的曲目质量基准。其中 #016～#021 为「覚醒 ver.」与 LIVE ver.，记录了同一作品在不同演出形态下的再编曲。`
    },
    {
      heading: '## 动画剧集《私の涙は流れない》档案',
      body: `VALIS 拥有神椿体系中罕见的**专属动画剧集**《私の涙は流れない》，以组合的世界观为基础展开分集叙事：

| 集数 | 公开时间 | 标题 | 脚本 | 制作 |
| :--- | :--- | :--- | :--- | :--- |
| 第 1 话 | 2022-02-10 | 《パンと見世物（サーカス）》 | 結城紫雄 | Garage,inc., STUDIO KAIBA |
| 第 2 话 | 2022-02-11 | 《ララ&ヴィッテの場合》 | 結城紫雄 | STUDIO KAIBA 大坪大起 |
| 第 3 话 | 2022-02-12 | 《幕間１》 | 結城紫雄 | STUDIO KAIBA, Cyclone Entertainment, Studio51 inc. |
| 第 4 话 | 2022-02-13 | 《ミュー&チノの場合》 | 結城紫雄 | STUDIO KAIBA 大坪大起 |
| 第 5 话 | 2022-02-14 | 《幕間２》 | 結城紫雄 | Garage,inc., STUDIO KAIBA |
| 第 6 话 | 2022-02-15 | 《ネフィ&ニナの場合》 | 結城紫雄 | STUDIO KAIBA 大坪大起 |
| 第 7 话 | 2022-06-06 | 《衝突》 | 結城紫雄 | STUDIO KAIBA |
| 第 8 话 | 2022-06-07 | 《亀裂》 | 結城紫雄 | STUDIO KAIBA |
| 第 9 话 | 2022-06-08 | 《円環》 | 結城紫雄 | STUDIO KAIBA |
| 第 10 话 | 2022-06-09 | 《Panto at Circus ひたすらに踊れ》 | 結城紫雄 | STUDIO KAIBA, Sabao3179 |

> **结构特征**：剧集前半（第 1～6 话）以"成对成员"为单元逐一展开（拉&维、缪&奇、内&妮），并穿插《幕間》短篇；后半（第 7～10 话）转入《衝突》《亀裂》《円環》三话连续的主线，最终以第 10 话的群舞收束。这条"分角色 → 汇主线"的编排，是理解六名成员关系设定的重要入口。`
    },
    {
      heading: '## 线上演出、会员频道与跨媒体企划',
      body: `VALIS 在实体专场之外，建立了一套完整的线上与会员内容体系：

- **STREAMING COVER LIVE「旋律コレクション」**：以翻唱为核心的线上演唱会系列；
- **STREAMING MINI LIVE「感情プレステージ」**：采用"三部制"结构，第一部由 MYU、NEFFY、VITTE 出演，第二部由 CHINO、NINA、RARA 出演，曲目横跨《革命バーチャルリアリティ》《キュートなカノジョ》（syudou）、《花となれ》（雄之助）、《さよなら》（存流）、《新世界ピグマリオン》《PHONY》（ツミキ）、《メスト》（かいりきベア）、《私論理》（花譜）等，是"成员两两组合 + 高密度翻唱"的典型舞台；
- **1st ONE-MAN LIVE「拡張メタモルフォーゼ」（2021-11-23）**：采用 Act.1 / Act.2 双幕结构，包含《残響ヴァンデラー》《開幕ゼノパレード》《真夜中コンツェルト》《道化師ブランケット》《錯綜リフレクション feat.存流》《超常現象ダンスダンス》《再構成ウィーバー》《鈍色リグレット》《新世界ピグマリオン》《天命系メルト》《物換星移カタルシス》《革命バーチャルリアリティ (Physical ver.)》等曲目；
- **2nd ONE-MAN LIVE「転生デパーチャー」（2022-07-30）**：演出后公开了部分影像与《偶像ナイトメア》《物換星移カタルシス》的演出录像；
- **会员制频道「無限少女ヴァリス」（2022-10-21 开设）**：提供直播录播、限定壁纸、限定日记与成员音声等会员专属内容，月费 990 日元；
- **推特漫画连载「瓦里斯饭店的日常」（2022-11-18 起）**：为纪念加入深脊界一周年而在官方推特不定期连载；{{spoiler::在游戏《神椿市建设中。》中她们真的开了一家饭店，不失为一种彩蛋。}}
- **介绍向视频「What's VALIS？〜バーチャルに転生した女の子たちの物語〜」（2022-11-19）**：面向新老观众的组合作品导览。

> **跨媒体特征**：VALIS 是神椿中活动形态最"杂食"的组合——同时运营虚拟演唱会、实体专场、会员频道、漫画连载与专属动画剧集，其内容密度在神椿全系中居于前列。`
    },
    {
      heading: '## 外部出演、音乐活动与组合终章',
      body: `**外部出演与联合企划**

| 时间 | 内容 |
| :--- | :--- |
| 2022-04-30 | 参加 Niconico 动画举办的「Vtuber Fes Japan 2022」，于活动第二天出演 |
| 2022-07-03 | 参加「XR ARTISTS SUPER FES 2022」线上 XR 演唱会，于第二天演出 |
| 2022-10-11 | 投稿《【歌って踊ってみた】いーあるふぁんくらぶ Covered by NEFFY & RARA【二重唱】》，参加活动「踊コレ2022秋」。{{spoiler::这大概是整个神椿与深脊界唯一能参加这类"唱跳"活动的团体。}} |
| 2022-11-10 | 成员 MYU 与 NINA 参加音乐平台 AWA 举办的「AWAラウンジ」，分享各自歌单 |
| 2025-09 | 参加「KAMITSUBAKI FES」等大型联合演出 |

**组合终章**

- **2025 年 6 月 11 日**：神椿官方宣布，VALIS 全体成员将在 **2025 年 12 月的最后一场演出后解散组合**。

> **历史定位**：VALIS 是神椿体系中唯一以"高难度编舞 + 六人阵型 + 猫娘道化师世界观"为核心竞争力的组合，其"虚拟形象与真实舞台双轨并行"的演出方法论，也为后续神椿的虚实融合探索提供了直接经验。`
    }
  ],
  ja: [
    {
      heading: '## オリジナル曲の全系譜と制作陣',
      body: `VALIS のオリジナル曲は「一線クリエイターの供曲密度」の高さで際立っている。ほぼすべての作品が、当時の日本のネット音楽シーンを代表する P や作曲家の筆による。

| 番号 | 公開日 | 曲 | 作詞 / 作曲 / 編曲 |
| :--- | :--- | :--- | :--- |
| #001 | 2020-05-15 | 《残響ヴァンデラー》 | かいりきベア |
| #002 | 2020-06-29 | 《真夜中コンツェルト》 | syudou |
| #003 | 2020-07-31 | 《道化師ブランケット》 | 煮ル果実 |
| #004 | 2020-09-09 | 《開幕ゼノパレード》 | Ayase |
| #005 | 2020-09-30 | 《激情インプロビゼーション》 | ポリスピカデリー |
| #006 | 2020-11-13 | 《超常現象ダンスダンス》 | かいりきベア |
| #007 | 2020-11-27 | 《錯綜リフレクション》 | R Sound Design |
| #008 | 2020-12-25 | 《革命バーチャルリアリティ》 | カンザキイオリ |
| #009 | 2021-01-29 | 《鈍色リグレット》 | [Misumi](/database/artists/groups/dustcell) |
| #010 | 2021-02-26 | 《再構成ウィーバー》 | DECO*27（編曲：Rockwell） |
| #011 | 2021-04-16 | 《相反ヴァラエティ》 | TOOBOE |
| #012 | 2021-06-21 | 《新世界ピグマリオン》 | 柊キライ |
| #013 | 2021-07-09 | 《天命系メルト》 | ぽん / 安宅秀紀 |
| #014 | 2021-10-24 | 《物換星移カタルシス》 | TeddyLoid & Giga |
| #015 | 2021-11-18 | 《境界線マクガフィン》 | 牛肉（作詞）/ 雄之助 |
| #016 | 2022-02-25 | 《革命バーチャルリアリティ（覚醒 ver.）》 | カンザキイオリ（Remix：安宅秀紀） |
| #017 | 2022-03-19 | 《天命系メルト（覚醒 ver.）》 | ぽん / 安宅秀紀 |
| #018 | 2022-05-01 | 《一陽レガシー》 | TOOBOE |
| #019 | 2022-07-31 | 《偶像ナイトメア》 | みきとP |
| #020 | 2022-08-21 | 《偶像ナイトメア》【『転生デパーチャー』LIVE ver.】 | みきとP |
| #021 | 2022-09-30 | 《物換星移カタルシス》【『転生デパーチャー』LIVE ver.】 | TeddyLoid & Giga |
| #022 | 2022-11-26 | 《再見ロマネスク》 | 柊マグネタイト |

> **制作陣の観察**：かいりきベア、syudou、煮ル果実、Ayase、DECO*27、柊キライ、みきとP、TeddyLoid & Giga ら一線クリエイターの密集した参加により、VALIS はデビュー二年で極めて高い楽曲品質の基準を確立した。#016〜#021 は「覚醒 ver.」と LIVE ver. で、同一作品が異なる演出形態で再編曲された記録である。`
    },
    {
      heading: '## アニメシリーズ《私の涙は流れない》アーカイブ',
      body: `VALIS は神椿の中でも珍しい**専用アニメシリーズ**《私の涙は流れない》を持ち、組の世界観を前提にエピソード単位の物語を展開した。

| 話 | 公開日 | タイトル | 脚本 | 制作 |
| :--- | :--- | :--- | :--- | :--- |
| 第1話 | 2022-02-10 | 《パンと見世物（サーカス）》 | 結城紫雄 | Garage,inc., STUDIO KAIBA |
| 第2話 | 2022-02-11 | 《ララ&ヴィッテの場合》 | 結城紫雄 | STUDIO KAIBA 大坪大起 |
| 第3話 | 2022-02-12 | 《幕間１》 | 結城紫雄 | STUDIO KAIBA, Cyclone Entertainment, Studio51 inc. |
| 第4話 | 2022-02-13 | 《ミュー&チノの場合》 | 結城紫雄 | STUDIO KAIBA 大坪大起 |
| 第5話 | 2022-02-14 | 《幕間２》 | 結城紫雄 | Garage,inc., STUDIO KAIBA |
| 第6話 | 2022-02-15 | 《ネフィ&ニナの場合》 | 結城紫雄 | STUDIO KAIBA 大坪大起 |
| 第7話 | 2022-06-06 | 《衝突》 | 結城紫雄 | STUDIO KAIBA |
| 第8話 | 2022-06-07 | 《亀裂》 | 結城紫雄 | STUDIO KAIBA |
| 第9話 | 2022-06-08 | 《円環》 | 結城紫雄 | STUDIO KAIBA |
| 第10話 | 2022-06-09 | 《Panto at Circus ひたすらに踊れ》 | 結城紫雄 | STUDIO KAIBA, Sabao3179 |

> **構成の特徴**：前半（第1〜6話）は「ペアになったメンバー」を単位に順に描き（ララ&ヴィッテ、ミュー&チノ、ネフィ&ニナ）、間に《幕間》の短編を挟む。後半（第7〜10話）は《衝突》《亀裂》《円環》の三話連続の本線へ移り、第10話の群舞で収束する。この「個別 → 本線」の構成は、六人の関係設定を読み解く重要な入口である。`
    },
    {
      heading: '## オンライン公演・会員チャンネルと越境企画',
      body: `VALIS は実体の公演之外に、オンラインと会員向けの内容体系を整えている。

- **STREAMING COVER LIVE「旋律コレクション」**：カバーを中心としたオンラインライブシリーズ；
- **STREAMING MINI LIVE「感情プレステージ」**：「三部制」の構造をとり、第一部は MYU・NEFFY・VITTE、第二部は CHINO・NINA・RARA が出演。《革命バーチャルリアリティ》《キュートなカノジョ》（syudou）《花となれ》（雄之助）《さよなら》（存流）《新世界ピグマリオン》《PHONY》（ツミキ）《メスト》（かいりきベア）《私論理》（花譜）などを横断する、「ペア編成＋高密度カバー」の典型舞台；
- **1st ONE-MAN LIVE「拡張メタモルフォーゼ」（2021-11-23）**：Act.1 / Act.2 の二幕構成。《残響ヴァンデラー》《開幕ゼノパレード》《真夜中コンツェルト》《道化師ブランケット》《錯綜リフレクション feat.存流》《超常現象ダンスダンス》《再構成ウィーバー》《鈍色リグレット》《新世界ピグマリオン》《天命系メルト》《物換星移カタルシス》《革命バーチャルリアリティ (Physical ver.)》などを披露；
- **2nd ONE-MAN LIVE「転生デパーチャー」（2022-07-30）**：公演後に一部映像と《偶像ナイトメア》《物換星移カタルシス》の映像が公開された；
- **会員チャンネル「無限少女ヴァリス」（2022-10-21 開設）**：配信アーカイブ、限定壁紙、限定日記、メンバーの音声など会員限定の内容を提供。月額 990 円；
- **Twitter 漫画連載「瓦里斯飯店の日常」（2022-11-18 〜）**：深脊界加入一周年を記念して不定期連載；{{spoiler::ゲーム《神椿市建設中。》では実際に食堂を開いており、ちょっとしたイースターエッグになっている。}}
- **紹介動画「What's VALIS？〜バーチャルに転生した女の子たちの物語〜」（2022-11-19）**：新旧の視聴者に向けた作品案内。

> **越境性**：VALIS は神椿の中で最も活動形態が「雑食的」な組であり、バーチャルライブ、実体公演、会員チャンネル、漫画連載、専用アニメを同時に運営する。その内容密度は神椿全体系でも上位にある。`
    },
    {
      heading: '## 外部出演・音楽活動と組の終章',
      body: `**外部出演と共同企画**

| 日付 | 内容 |
| :--- | :--- |
| 2022-04-30 | ニコニコ動画主催「Vtuber Fes Japan 2022」に二日目出演 |
| 2022-07-03 | 「XR ARTISTS SUPER FES 2022」オンライン XR ライブに二日目出演 |
| 2022-10-11 | 《【歌って踊ってみた】いーあるふぁんくらぶ Covered by NEFFY & RARA【二重唱】》を投稿し、「踊コレ2022秋」に参加。{{spoiler::神椿・深脊界を通じて、こうした「歌って踊ってみた」系の企画に参加できるのは恐らくこの組だけである。}} |
| 2022-11-10 | MYU と NINA が音楽プラットフォーム AWA の「AWAラウンジ」に参加し、プレイリストを紹介 |
| 2025-09 | 「KAMITSUBAKI FES」など大型合同公演に出演 |

**組の終章**

- **2025 年 6 月 11 日**：神椿公式が、VALIS の全メンバーが **2025 年 12 月の最後の公演をもって組を解散する**と発表した。

> **歴史的位置**：VALIS は神椿の中で唯一「高度な振付＋六人編成＋猫娘道化師の世界観」を中核の競争力とする組であり、その「バーチャルな姿と実体のステージを二重に走らせる」演出方法論は、その後の神椿の虚実融合の試みに直接的な経験を提供した。`
    }
  ],
  en: [
    {
      heading: '## Original Song Lineage and Production Line-up',
      body: `VALIS is remarkable for the density of first-tier songwriters behind its originals: almost every track was written by a representative producer or composer of the Japanese online music scene at the time.

| No. | Release | Track | Lyrics / Music / Arrangement |
| :--- | :--- | :--- | :--- |
| #001 | 2020-05-15 | "Zankyō Vandeler" | Kairiki Bear |
| #002 | 2020-06-29 | "Mayonaka Concerto" | syudou |
| #003 | 2020-07-31 | "Dōkeshi Blanket" | Nilfruits |
| #004 | 2020-09-09 | "Kaimaku Xeno Parade" | Ayase |
| #005 | 2020-09-30 | "Gekijō Improvisation" | Police Piccadilly |
| #006 | 2020-11-13 | "Chōjō Genshō Dance Dance" | Kairiki Bear |
| #007 | 2020-11-27 | "Sakusō Reflection" | R Sound Design |
| #008 | 2020-12-25 | "Kakumei Virtual Reality" | Kanzaki Iori |
| #009 | 2021-01-29 | "Nibiiro Regret" | [Misumi](/database/artists/groups/dustcell) |
| #010 | 2021-02-26 | "Saikōsei Weaver" | DECO*27 (arr. Rockwell) |
| #011 | 2021-04-16 | "Aihan Variety" | TOOBOE |
| #012 | 2021-06-21 | "Shinsekai Pygmalion" | Hiiragi Kirai |
| #013 | 2021-07-09 | "Tenmei-kei Melt" | Pon / Ataka Hideki |
| #014 | 2021-10-24 | "Bukkanshōi Catharsis" | TeddyLoid & Giga |
| #015 | 2021-11-18 | "Kyōkaisen McGuffin" | Gyūniku (lyrics) / Yunosuke |
| #016 | 2022-02-25 | "Kakumei Virtual Reality (Awakening ver.)" | Kanzaki Iori (remix: Ataka Hideki) |
| #017 | 2022-03-19 | "Tenmei-kei Melt (Awakening ver.)" | Pon / Ataka Hideki |
| #018 | 2022-05-01 | "Ichiyō Legacy" | TOOBOE |
| #019 | 2022-07-31 | "Gūzō Nightmare" | Mikito-P |
| #020 | 2022-08-21 | "Gūzō Nightmare" ("Tensei Departure" Live ver.) | Mikito-P |
| #021 | 2022-09-30 | "Bukkanshōi Catharsis" ("Tensei Departure" Live ver.) | TeddyLoid & Giga |
| #022 | 2022-11-26 | "Saiken Romanesque" | Hiiragi Magnetite |

> **On the line-up**: the dense participation of Kairiki Bear, syudou, Nilfruits, Ayase, DECO*27, Hiiragi Kirai, Mikito-P and TeddyLoid & Giga established an exceptionally high bar for song quality within two years of debut. Tracks #016–#021 are "awakening" and live versions, documenting the same works rearranged for different performance formats.`
    },
    {
      heading: '## The Anime Series "Watashi no Namida wa Nagarenai"',
      body: `VALIS holds a **dedicated anime series** rare within KAMITSUBAKI, expanding the group's world-view into episodic storytelling.

| Ep. | Release | Title | Script | Production |
| :--- | :--- | :--- | :--- | :--- |
| 1 | 2022-02-10 | "Pan to Misemono (Circus)" | Yūki Shio | Garage,inc., STUDIO KAIBA |
| 2 | 2022-02-11 | "In RARA & VITTE's Case" | Yūki Shio | STUDIO KAIBA (Otsubo Daiki) |
| 3 | 2022-02-12 | "Interlude 1" | Yūki Shio | STUDIO KAIBA, Cyclone Entertainment, Studio51 inc. |
| 4 | 2022-02-13 | "In MYU & CHINO's Case" | Yūki Shio | STUDIO KAIBA (Otsubo Daiki) |
| 5 | 2022-02-14 | "Interlude 2" | Yūki Shio | Garage,inc., STUDIO KAIBA |
| 6 | 2022-02-15 | "In NEFFY & NINA's Case" | Yūki Shio | STUDIO KAIBA (Otsubo Daiki) |
| 7 | 2022-06-06 | "Collision" | Yūki Shio | STUDIO KAIBA |
| 8 | 2022-06-07 | "Fracture" | Yūki Shio | STUDIO KAIBA |
| 9 | 2022-06-08 | "Circle" | Yūki Shio | STUDIO KAIBA |
| 10 | 2022-06-09 | "Panto at Circus: Just Keep Dancing" | Yūki Shio | STUDIO KAIBA, Sabao3179 |

> **Structural note**: the first half (eps. 1–6) takes paired members one at a time (RARA & VITTE, MYU & CHINO, NEFFY & NINA) with interlude shorts between; the second half (eps. 7–10) moves into a three-episode main line — Collision, Fracture, Circle — closing with a group dance in episode 10. This "individual → main line" arrangement is a key entry point for reading the six members' relationships.`
    },
    {
      heading: '## Online Shows, Membership Channel and Cross-media Projects',
      body: `Beyond physical one-man lives, VALIS maintains a full system of online and members-only content.

- **STREAMING COVER LIVE "Senritsu Collection"**: an online cover-live series.
- **STREAMING MINI LIVE "Kanjō Prestige"**: built in three parts — part one featuring MYU, NEFFY and VITTE; part two featuring CHINO, NINA and RARA — spanning "Kakumei Virtual Reality", "Cute na Kanojo" (syudou), "Hana to Nare" (Yunosuke), "Sayonara" (ARU), "Shinsekai Pygmalion", "Phony" (Tsumiki), "Mest" (Kairiki Bear) and "Shironri" (KAF). A model of "paired formations plus dense covers".
- **1st ONE-MAN LIVE "Kakuchō Metamorphose"** (23 November 2021): a two-act structure including "Zankyō Vandeler", "Kaimaku Xeno Parade", "Mayonaka Concerto", "Dōkeshi Blanket", "Sakusō Reflection feat. ARU", "Chōjō Genshō Dance Dance", "Saikōsei Weaver", "Nibiiro Regret", "Shinsekai Pygmalion", "Tenmei-kei Melt", "Bukkanshōi Catharsis" and "Kakumei Virtual Reality (Physical ver.)".
- **2nd ONE-MAN LIVE "Tensei Departure"** (30 July 2022): partial footage and live recordings of "Gūzō Nightmare" and "Bukkanshōi Catharsis" were released afterwards.
- **Membership channel "Mugen Shōjo VALIS"** (opened 21 October 2022): stream archives, limited wallpapers, limited diaries and member voice content for ¥990 per month.
- **Twitter manga serial "The Daily Life of Valis Hotel"** (from 18 November 2022): serialised irregularly to mark the first anniversary of joining SINSEKAI; {{spoiler::in the game *KAMITSUBAKI CITY* they really do run a restaurant, a neat easter egg.}}
- **Introductory video "What's VALIS? ~The Story of Girls Reborn as Virtual Beings~"** (19 November 2022): a guide to the group for newcomers and long-time viewers.

> **Cross-media character**: VALIS is the most omnivorous act in KAMITSUBAKI, running virtual concerts, physical one-man lives, a membership channel, a manga serial and a dedicated anime at the same time — a content density near the top of the entire studio.`
    },
    {
      heading: '## External Appearances, Musical Activity and the Group\'s Final Chapter',
      body: `**External appearances and joint projects**

| Date | Content |
| :--- | :--- |
| 2022-04-30 | Appeared on day two of "Vtuber Fes Japan 2022", hosted by Niconico |
| 2022-07-03 | Performed on day two of the online XR concert "XR ARTISTS SUPER FES 2022" |
| 2022-10-11 | Posted "【Sang and Danced】I-Aru Fanclub Covered by NEFFY & RARA【Duet】" for the event "Odokore 2022 Autumn". {{spoiler::They are probably the only act across KAMITSUBAKI and SINSEKAI able to take part in this kind of sing-and-dance project.}} |
| 2022-11-10 | MYU and NINA joined the music platform AWA's "AWA Lounge" to share their playlists |
| 2025-09 | Appeared at large joint events including KAMITSUBAKI FES |

**The group's final chapter**

- **11 June 2025**: KAMITSUBAKI officially announced that all VALIS members would **disband the group after its final performance in December 2025**.

> **Historical position**: VALIS is the only KAMITSUBAKI act whose core competitiveness rests on demanding choreography, a six-member formation and a cat-jester world-view. Its method of running virtual avatars and physical stages in parallel supplied direct experience for the studio's later explorations of reality–virtual fusion.`
    }
  ]
};

const albemuth = {
  zh: [
    {
      heading: '## 作品投稿编年全档案',
      body: `Albemuth 自 2022 年起以"双人合唱投稿"的形式持续产出，以下为正式发布作品（不含翻唱）的完整编年：

| 时间 | 曲目 |
| :--- | :--- |
| 2022-07-02 | 《新世界へ / To the new world》 |
| 2022-07-02 | 《赤い洗礼》 |
| 2022-11-21 | 《[告知メッセージ] LIVE&ユニット「Albemuth」始動！ -明透.ver-》 |
| 2022-11-23 | 《幽ノ楽園 / 幽幽乐园》 |
| 2023-02-15 | 《感光》 |
| 2023-04-26 | 《guilty》 |
| 2023-06-21 | 《Black Glow》 |
| 2023-08-16 | 《星月夜の調べ / 星月夜的探寻》 |
| 2023-08-16 | 《Underdrain》 |
| 2023-08-30 | 《tuberose》 |
| 2023-11-19 | 1st Album《ADAM》收录曲 XFD |
| 2023-11-22 | 《箱庭》 |
| 2023-11-22 | 《cage》 |
| 2023-12-25 | 《饗舌な星》 |
| 2024-01-08 | 《Happy Merry Xmas》 Trailer |
| 2024-03-31 | 《Do You Wanna Die?》 |
| 2024-04-09 | 《舟》 |
| 2024-04-22 | 《Replica》(Live ver.)【from Albemuth 1st ONE-MAN LIVE】 |

> **观察**：2022 年 7 月 2 日同日公开的《新世界へ》与《赤い洗礼》是组合成立前的先行双曲；2023 年 11 月 22 日同日公开《箱庭》与《cage》则对应 1st 专辑《ADAM》的发售节点。这条编年清晰呈现出"先行曲 → 专辑 → 终曲"的三段结构。`
    },
    {
      heading: '## 直播节目「あるあす通信」',
      body: `Albemuth 运营着名为**「あるあす通信」**的双人直播节目，名称取自两位成员名（ARU + ASU），是组合在作品之外与听众直接交流的主要渠道：

| 期数 | 时间 |
| :--- | :--- |
| vol.1 | 2022-09-03 |
| vol.2 | 2022-10-22 |
| vol.3 | 2023-11-20 |
| vol.4（前半部分） | 2022-12-26 |

> **节目定位**：以轻松的双人对谈为核心，涵盖近况汇报、作品幕后与粉丝互动，是理解两位成员性格差异（存流的沉静与明透的天真烂漫）最直接的语音资料。`
    },
    {
      heading: '## 组合终章与永久归档',
      body: `- **2024 年 2 月 5 日**：官方发布公告，宣布**存流（ARU）将于 4 月 9 日的专场演唱会后结束活动**，「Albemuth」随之解散；
- **2024 年 4 月 9 日**：Albemuth 1st ONE-MAN LIVE「**罪と楽園**」举办，存流正式毕业，Albemuth 组合解散；组合**最后一首原创曲《舟》于同日公开**；
- **2024 年 4 月 22 日**：《Replica》(Live ver.)【from Albemuth 1st ONE-MAN LIVE】公开，作为现场记录的收尾。

> **归档意义**：神椿对存流的退场给予了极高规格的体面处理——不仅完整保留其全部历史单曲，更将与明透的双人专辑实体化发售，作为永久记忆归档。这被视为虚拟艺人"有尊严地退场"的行业标杆案例：
> - 组合不因成员毕业而抹除历史，作品集作为**archive（归档）**持续存在于厂牌目录中；
> - 明透（ASU）此后继续以个人名义活动，并于 2025 年与新人 [琶舞（BEMA）](/database/artists/solo/bema) 组成以"爱"为主题的新组合，形成"旧组合归档 → 新组合开启"的代际传承结构。`
    }
  ],
  ja: [
    {
      heading: '## 投稿作品の編年アーカイブ',
      body: `Albemuth は 2022 年以降、「二人合唱の投稿」という形式で継続的に作品を生み出してきた。以下は正式公開作（カバーを除く）の完全な編年である。

| 日付 | 曲 |
| :--- | :--- |
| 2022-07-02 | 《新世界へ / To the new world》 |
| 2022-07-02 | 《赤い洗礼》 |
| 2022-11-21 | 《[告知メッセージ] LIVE&ユニット「Albemuth」始動！ -明透.ver-》 |
| 2022-11-23 | 《幽ノ楽園》 |
| 2023-02-15 | 《感光》 |
| 2023-04-26 | 《guilty》 |
| 2023-06-21 | 《Black Glow》 |
| 2023-08-16 | 《星月夜の調べ》 |
| 2023-08-16 | 《Underdrain》 |
| 2023-08-30 | 《tuberose》 |
| 2023-11-19 | 1st アルバム《ADAM》収録曲 XFD |
| 2023-11-22 | 《箱庭》 |
| 2023-11-22 | 《cage》 |
| 2023-12-25 | 《饗舌な星》 |
| 2024-01-08 | 《Happy Merry Xmas》 Trailer |
| 2024-03-31 | 《Do You Wanna Die?》 |
| 2024-04-09 | 《舟》 |
| 2024-04-22 | 《Replica》(Live ver.)【from Albemuth 1st ONE-MAN LIVE】 |

> **観察**：2022 年 7 月 2 日に同日公開された《新世界へ》と《赤い洗礼》は結成前の先行二曲であり、2023 年 11 月 22 日に同日公開された《箱庭》と《cage》は 1st アルバム《ADAM》のリリース時期に対応する。この編年は「先行曲 → アルバム → 終曲」という三段構造を明確に示している。`
    },
    {
      heading: '## 配信番組「あるあす通信」',
      body: `Albemuth は**「あるあす通信」**と題した二人配信番組を運営してきた。名称は二人のメンバー名（ARU + ASU）に由来し、作品以外で聴き手と直接交流する主要な回路である。

| 回 | 日付 |
| :--- | :--- |
| vol.1 | 2022-09-03 |
| vol.2 | 2022-10-22 |
| vol.3 | 2023-11-20 |
| vol.4（前半） | 2022-12-26 |

> **番組の性格**：軽妙な二人の対話を中心に、近況報告、作品の舞台裏、ファンとの交流を扱う。存流の静けさと明透の天真爛漫さという性格の差を最も直接的に伝える音声資料である。`
    },
    {
      heading: '## 組の終章と永久アーカイブ',
      body: `- **2024 年 2 月 5 日**：公式が、**存流（ARU）が 4 月 9 日のワンマンライブをもって活動を終了する**と告知し、「Albemuth」の解散が示された；
- **2024 年 4 月 9 日**：Albemuth 1st ONE-MAN LIVE「**罪と楽園**」を開催。存流が正式に卒業し、Albemuth は解散。組の**最後のオリジナル曲《舟》が同日公開**された；
- **2024 年 4 月 22 日**：《Replica》(Live ver.)【from Albemuth 1st ONE-MAN LIVE】が公開され、現場記録の締めくくりとなった。

> **アーカイブの意味**：神椿は存流の退場に対して極めて高い敬意を払った。過去の全シングルを完全に保持しただけでなく、明透との二人名義アルバムを実体化して発売し、永久の記憶として保存した。これはバーチャルアーティストが「尊厳をもって退場する」ための業界の基準事例とされる：
> - メンバーの卒業によって歴史が消されることはなく、作品集は **archive（アーカイブ）** としてレーベル目録に残り続ける；
> - 明透（ASU）はその後も個人名義で活動を続け、2025 年には新人の [琶舞（BEMA）](/database/artists/solo/bema) と「愛」を主題とする新たな組を結成し、「旧組のアーカイブ → 新組の始動」という世代継承の構造を形づくっている。`
    }
  ],
  en: [
    {
      heading: '## Complete Upload Chronology',
      body: `Since 2022 Albemuth has produced work continuously in the form of two-person uploads. Below is the full chronology of official releases (excluding covers).

| Date | Track |
| :--- | :--- |
| 2022-07-02 | "Shinsekai e / To the new world" |
| 2022-07-02 | "Akai Senrei" |
| 2022-11-21 | "[Announcement] LIVE & Unit 'Albemuth' Launches! -ASU ver.-" |
| 2022-11-23 | "Yū no Rakuen" |
| 2023-02-15 | "Kankō" |
| 2023-04-26 | "guilty" |
| 2023-06-21 | "Black Glow" |
| 2023-08-16 | "Hoshizukiyo no Shirabe" |
| 2023-08-16 | "Underdrain" |
| 2023-08-30 | "tuberose" |
| 2023-11-19 | 1st album *ADAM* track XFD |
| 2023-11-22 | "Hakoniwa" |
| 2023-11-22 | "cage" |
| 2023-12-25 | "Kyōzetsu na Hoshi" |
| 2024-01-08 | "Happy Merry Xmas" trailer |
| 2024-03-31 | "Do You Wanna Die?" |
| 2024-04-09 | "Fune" |
| 2024-04-22 | "Replica" (Live ver.) [from Albemuth 1st ONE-MAN LIVE] |

> **Observation**: "Shinsekai e" and "Akai Senrei", both released on 2 July 2022, were precursor tracks before the unit's formation, while "Hakoniwa" and "cage", both released on 22 November 2023, line up with the release of the 1st album *ADAM*. The chronology shows a clear three-stage shape: precursor songs → album → final song.`
    },
    {
      heading: '## The Streaming Programme "Aras Communication"',
      body: `Albemuth ran a two-person streaming programme titled **"Aras Communication"**, its name taken from the two members (ARU + ASU). It was the duo's main channel for direct contact with listeners outside the music itself.

| Episode | Date |
| :--- | :--- |
| vol.1 | 2022-09-03 |
| vol.2 | 2022-10-22 |
| vol.3 | 2023-11-20 |
| vol.4 (first half) | 2022-12-26 |

> **What the programme is**: light two-person conversation covering recent news, behind-the-scenes detail and fan interaction. It is the most direct audio record of the contrast between the two members' temperaments — ARU's quietness and ASU's ingenuousness.`
    },
    {
      heading: '## The Final Chapter and Permanent Archive',
      body: `- **5 February 2024**: the studio announced that **ARU would end her activities after her solo concert on 9 April**, with Albemuth to disband afterwards.
- **9 April 2024**: Albemuth 1st ONE-MAN LIVE "Tsumi to Rakuen" was held; ARU formally graduated and Albemuth disbanded. The duo's **final original song "Fune" was released the same day**.
- **22 April 2024**: "Replica" (Live ver.) [from Albemuth 1st ONE-MAN LIVE] was released, closing the live record.

> **What the archive means**: KAMITSUBAKI handled ARU's departure with exceptional dignity — not only preserving every past single but pressing the duo album with ASU as a physical release, kept as a permanent record. It is regarded as an industry benchmark for a virtual artist's dignified exit:
> - a group's history is not erased when a member graduates; the catalogue persists in the label's listings as an **archive**;
> - ASU continued to work under her own name and in 2025 formed a new "love"-themed duo with newcomer [BEMA](/database/artists/solo/bema), producing a generational structure of "old duo archived → new duo launched".`
    }
  ]
};

for (const [id, byLang] of Object.entries({ valis, albemuth })) {
  for (const lang of ['zh', 'ja', 'en']) {
    const n = appendSections(`units/${id}`, id, lang, byLang[lang]);
    console.log(`${id}/${lang}: appended ${n} sections`);
  }
}
