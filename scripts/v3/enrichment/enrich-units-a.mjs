import { appendSections } from '../entry-append.mjs';

const vwp = {
  zh: [
    {
      heading: '## 系谱曲与扩声曲全档案',
      body: `V.W.P 演唱的五人合唱曲按创作谱系分为「**系谱曲**」与「**扩声曲**」两类，序号连续编排；另有成员之间的双人合唱归入「**派生曲**」。

### 系谱曲

| 序号 | 公开时间 | 曲目 | 作词 | 作曲 | 编曲 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 2021-03-21 | 《魔女(真)》 | IORI KANZAKI & Takayan | IORI KANZAKI | rionos |
| 1 | 2021-06-20 | 《電脳》 | IORI KANZAKI | IORI KANZAKI | IORI KANZAKI |
| 2 | 2021-11-03 | 《輪廻》 | IORI KANZAKI | IORI KANZAKI | IORI KANZAKI |
| 3 | 2021-11-18 | 《変身 (The Metamorphosis)》 | IORI KANZAKI | IORI KANZAKI | HIDEKI ATAKA |
| 4 | 2022-01-21 | 《言霊》 | IORI KANZAKI | IORI KANZAKI | IORI KANZAKI |
| 5 | 2022-07-27 | 《共鳴》 | IORI KANZAKI | IORI KANZAKI | IORI KANZAKI |
| 7 | 2022-12-21 | 《再会》 | IORI KANZAKI | IORI KANZAKI | Sosuke Oikawa |
| 8 | 2023-05-25 | 《魔女(真)》（Original MV） | IORI KANZAKI & Takayan | IORI KANZAKI | rionos |
| 9 | 2023-06-17 | 《定命》 | IORI KANZAKI | IORI KANZAKI | Takumi Masanori |
| 10 | 2023-07-12 | 《玩具》 | IORI KANZAKI | IORI KANZAKI | IORI KANZAKI |
| 12 | 2023-08-23 | 《祭壇》 | IORI KANZAKI | IORI KANZAKI | IORI KANZAKI |
| 13 | 2023-11-08 | 《秘密》 | IORI KANZAKI | IORI KANZAKI | Masanori Takumi |

> **创作阵特征**：系谱曲几乎全部由 [カンザキイオリ](/database/creators/kanzaki-iori) 主导词曲，編曲则由其本人与 rionos、HIDEKI ATAKA、Takumi Masanori 等交替担任。这一"核心作者 + 外部编曲"的结构，使 V.W.P 的合唱曲在叙事上高度统一，同时在声音质感上保持变化。

### 扩声曲

| 序号 | 公开时间 | 曲目 | 作词 | 作曲 | 编曲 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 11 | 2023-08-02 | 《飛翔》 | 笹川真生 | 笹川真生 | 笹川真生 |
| 14 | 2024-01-06 | 《感情》 | AMAMOGU | 松田純一, MILKEY | 朝比奈健人 |
| 15 | 2024-01-16 | 《切札》 | 廉 | 廉, MILKEY | 朝比奈健人 |
| 16 | 2024-03-06 | 《同盟》 | Kanata Okajima, Hayato Yamamoto | Kanata Okajima, Hayato Yamamoto, MEG (MEGMETAL) | MEG (MEGMETAL) |

> **扩声曲的意义**：与系谱曲相比，扩声曲引入了**神椿体系外的创作者**（笹川真生、朝比奈健人、Kanata Okajima、MEG 等），是 V.W.P 从"世界观内部的叙事物语"走向"更广阔流行声场"的接口。`
    },
    {
      heading: '## 派生曲（成员间合唱）档案',
      body: `除五人全员的合唱曲外，V.W.P 成员之间还产出了多首**双人合唱曲**，这些作品构成了组合内部关系网的声音证据：

| 公开时间 | 组合 | 曲目 | 作词 / 作曲 / 编曲 |
| :--- | :--- | :--- | :--- |
| 2020-11-24 | 花譜 feat. 理芽 | 《まほう》（「不可解弐Q1」Live Ver.） | カンザキイオリ |
| 2021-06-18 | ヰ世界情绪 × 花譜 | 《深淵》 | 香椎モイミ |
| 2021-10-23 | 春猿火 × ヰ世界情绪 | 《牢狱》 | 大沼パセリ |
| 2021-10-23 | ヰ世界情绪 × 幸祜 | 《刻印》 | 柊マグネタイト |
| 2021-10-23 | 理芽 × ヰ世界情绪 | 《泡沫》 | 廉 |
| 2022-10-16 | 春猿火 × 幸祜 | 《古傷》 | 大沼パセリ（编曲：安宅秀紀） |

> **观察**：2021 年 10 月 23 日集中公开的三首双人曲（《牢狱》《刻印》《泡沫》）均出自不同创作者之手，且都在同一天上线，可视作神椿对"魔女两两组合"可能性的一次系统性实验。`
    },
    {
      heading: '## V.G.P. 愚人节企划与粉丝文化',
      body: `V.W.P 在官方企划中留下了一段广为流传的"骗局"历史：

- **2021 年 4 月 1 日**：官方宣布将 V.W.P. 改名为 **V.G.P.**，当晚成员们进行了游戏《斯普拉遁》（Splatoon）的联合直播；直播结束后即宣布 V.G.P. 解散，恢复为 V.W.P.；
- **2022 年 5 月 2 日**：V.G.P. "复仇而来"，成员们一同游玩《PICO PARK》，直播后 V.G.P. 再次解散。

> **文化意义**：这一系列企划把"魔女集会"的庄严叙事与轻喜剧式的成员互动并置，成为神椿粉丝文化中最受欢迎的固定梗之一；同时也让组合形象在"神圣合唱体"之外，多了一层日常性的人味。`
    },
    {
      heading: '## 商业 Tie-up 与动画主题曲',
      body: `V.W.P 以五人合唱形式承接了多部动画的主题曲，是其进入主流影像作品的重要通道：

| 时间 | 作品 | 曲目 | 类型 |
| :--- | :--- | :--- | :--- |
| 2021-08-25 宣布 / 2021-11-03 发行 | 《Muv-Luv Alternative》 | 《輪廻》 | 原创 OP |
| 2021-09-25 宣布 / 2021-11-17 发行 | 《機動戦姫》 | 《変身》 | 原创曲 |
| 2022-09-29 宣布 / 2022-12-21 发行 | 《Muv-Luv Alternative》第二季 | 《再会》 | 原创 ED |

> 值得注意的是，这三首 Tie-up 曲目全部由 [カンザキイオリ](/database/creators/kanzaki-iori) 负责词曲，并被直接纳入"系谱曲"序列（序号 2/3/7），说明官方有意将商业合作曲目编入世界观正史，而非作为独立的商业单曲处理。`
    }
  ],
  ja: [
    {
      heading: '## 系譜曲・拡声曲の全アーカイブ',
      body: `V.W.P が歌う五人合唱曲は、創作系譜に沿って「**系譜曲**」と「**拡声曲**」に分類され、番号は連続して振られている。メンバー間のデュエットは「**派生曲**」として別立てになる。

### 系譜曲

| 番号 | 公開日 | 曲 | 作詞 | 作曲 | 編曲 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 2021-03-21 | 《魔女(真)》 | IORI KANZAKI & Takayan | IORI KANZAKI | rionos |
| 1 | 2021-06-20 | 《電脳》 | IORI KANZAKI | IORI KANZAKI | IORI KANZAKI |
| 2 | 2021-11-03 | 《輪廻》 | IORI KANZAKI | IORI KANZAKI | IORI KANZAKI |
| 3 | 2021-11-18 | 《変身 (The Metamorphosis)》 | IORI KANZAKI | IORI KANZAKI | HIDEKI ATAKA |
| 4 | 2022-01-21 | 《言霊》 | IORI KANZAKI | IORI KANZAKI | IORI KANZAKI |
| 5 | 2022-07-27 | 《共鳴》 | IORI KANZAKI | IORI KANZAKI | IORI KANZAKI |
| 7 | 2022-12-21 | 《再会》 | IORI KANZAKI | IORI KANZAKI | Sosuke Oikawa |
| 8 | 2023-05-25 | 《魔女(真)》（Original MV） | IORI KANZAKI & Takayan | IORI KANZAKI | rionos |
| 9 | 2023-06-17 | 《定命》 | IORI KANZAKI | IORI KANZAKI | Takumi Masanori |
| 10 | 2023-07-12 | 《玩具》 | IORI KANZAKI | IORI KANZAKI | IORI KANZAKI |
| 12 | 2023-08-23 | 《祭壇》 | IORI KANZAKI | IORI KANZAKI | IORI KANZAKI |
| 13 | 2023-11-08 | 《秘密》 | IORI KANZAKI | IORI KANZAKI | Masanori Takumi |

> **制作体制の特徴**：系譜曲はほぼすべて [カンザキイオリ](/database/creators/kanzaki-iori) が詞曲を主導し、編曲は本人と rionos、HIDEKI ATAKA、Takumi Masanori らが交替で担当する。「中心作家＋外部編曲」というこの構造により、合唱曲は叙事の一貫性を保ちながら、音響的な質感には変化が生まれる。

### 拡声曲

| 番号 | 公開日 | 曲 | 作詞 | 作曲 | 編曲 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 11 | 2023-08-02 | 《飛翔》 | 笹川真生 | 笹川真生 | 笹川真生 |
| 14 | 2024-01-06 | 《感情》 | AMAMOGU | 松田純一, MILKEY | 朝比奈健人 |
| 15 | 2024-01-16 | 《切札》 | 廉 | 廉, MILKEY | 朝比奈健人 |
| 16 | 2024-03-06 | 《同盟》 | Kanata Okajima, Hayato Yamamoto | Kanata Okajima, Hayato Yamamoto, MEG (MEGMETAL) | MEG (MEGMETAL) |

> **拡声曲の意味**：系譜曲に対し、拡声曲は**神椿の体系外のクリエイター**（笹川真生、朝比奈健人、Kanata Okajima、MEG など）を招いている。V.W.P が「世界観内部の叙事物語」から「より広いポップスの声場」へ開いていくための接続点である。`
    },
    {
      heading: '## 派生曲（メンバー間デュエット）アーカイブ',
      body: `五人全員の合唱曲のほか、メンバー同士の**デュエット曲**も複数生まれている。これらは組合内部の関係網を音で裏付ける資料である。

| 公開日 | 組み合わせ | 曲 | 作詞 / 作曲 / 編曲 |
| :--- | :--- | :--- | :--- |
| 2020-11-24 | 花譜 feat. 理芽 | 《まほう》（「不可解弐Q1」Live Ver.） | カンザキイオリ |
| 2021-06-18 | ヰ世界情緒 × 花譜 | 《深淵》 | 香椎モイミ |
| 2021-10-23 | 春猿火 × ヰ世界情緒 | 《牢狱》 | 大沼パセリ |
| 2021-10-23 | ヰ世界情緒 × 幸祜 | 《刻印》 | 柊マグネタイト |
| 2021-10-23 | 理芽 × ヰ世界情緒 | 《泡沫》 | 廉 |
| 2022-10-16 | 春猿火 × 幸祜 | 《古傷》 | 大沼パセリ（編曲：安宅秀紀） |

> **観察**：2021 年 10 月 23 日に集中公開された三曲（《牢狱》《刻印》《泡沫》）はそれぞれ別のクリエイターによるもので、しかも同日に公開されている。神椿が「魔女の二者組み合わせ」の可能性を体系的に試した実験として読める。`
    },
    {
      heading: '## V.G.P. エイプリルフール企画とファン文化',
      body: `V.W.P の公式企画には、広く語り継がれる「騙し」の歴史がある。

- **2021 年 4 月 1 日**：公式が V.W.P. を **V.G.P.** に改名すると発表し、その夜メンバーが『スプラトゥーン』の合同配信を実施。配信後に V.G.P. の解散が告げられ、V.W.P. に戻った；
- **2022 年 5 月 2 日**：V.G.P. が「復讐」に現れ、メンバーが『PICO PARK』を一緒に遊び、配信後に再び解散した。

> **文化的意味**：この一連の企画は、「魔女集会」の厳かな叙事と、軽妙なメンバー同士のやり取りを並置するもので、神椿のファン文化でもっとも好まれる定番のネタの一つとなった。組合の像に「聖なる合唱体」以外の、日常的な人間味の層を加えている。`
    },
    {
      heading: '## 商業タイアップとアニメ主題歌',
      body: `V.W.P は五人合唱の形で複数のアニメ主題歌を担い、主流の映像作品へ入る重要な回路としてきた。

| 時期 | 作品 | 曲 | 種別 |
| :--- | :--- | :--- | :--- |
| 2021-08-25 告知 / 2021-11-03 配信 | 《マブラヴ オルタネイティヴ》 | 《輪廻》 | オリジナル OP |
| 2021-09-25 告知 / 2021-11-17 配信 | 《機動戦姫》 | 《変身》 | オリジナル曲 |
| 2022-09-29 告知 / 2022-12-21 配信 | 《マブラヴ オルタネイティヴ》第二期 | 《再会》 | オリジナル ED |

> 注目すべきは、この三曲すべてが [カンザキイオリ](/database/creators/kanzaki-iori) の詞曲であり、そのまま「系譜曲」の連番（2・3・7）に組み込まれている点である。商業タイアップ曲を独立したシングルとして扱わず、世界観の正史に編入する姿勢が読み取れる。`
    }
  ],
  en: [
    {
      heading: '## Genealogy and Expansion Song Archive',
      body: `V.W.P's five-member songs are divided by creative lineage into **genealogy songs** and **expansion songs**, with continuous numbering; member duets are filed separately as **derivative songs**.

### Genealogy songs

| No. | Release | Track | Lyrics | Music | Arrangement |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | 2021-03-21 | "Majo (Shin)" | IORI KANZAKI & Takayan | IORI KANZAKI | rionos |
| 1 | 2021-06-20 | "Den'nō" | IORI KANZAKI | IORI KANZAKI | IORI KANZAKI |
| 2 | 2021-11-03 | "Rinne" | IORI KANZAKI | IORI KANZAKI | IORI KANZAKI |
| 3 | 2021-11-18 | "Henshin (The Metamorphosis)" | IORI KANZAKI | IORI KANZAKI | HIDEKI ATAKA |
| 4 | 2022-01-21 | "Kotodama" | IORI KANZAKI | IORI KANZAKI | IORI KANZAKI |
| 5 | 2022-07-27 | "Kyōmei" | IORI KANZAKI | IORI KANZAKI | IORI KANZAKI |
| 7 | 2022-12-21 | "Saikai" | IORI KANZAKI | IORI KANZAKI | Sosuke Oikawa |
| 8 | 2023-05-25 | "Majo (Shin)" (Original MV) | IORI KANZAKI & Takayan | IORI KANZAKI | rionos |
| 9 | 2023-06-17 | "Jōmyō" | IORI KANZAKI | IORI KANZAKI | Takumi Masanori |
| 10 | 2023-07-12 | "Gangu" | IORI KANZAKI | IORI KANZAKI | IORI KANZAKI |
| 12 | 2023-08-23 | "Saidan" | IORI KANZAKI | IORI KANZAKI | IORI KANZAKI |
| 13 | 2023-11-08 | "Himitsu" | IORI KANZAKI | IORI KANZAKI | Masanori Takumi |

> **Production structure**: almost every genealogy song is written and composed under the lead of [Kanzaki Iori](/database/creators/kanzaki-iori), with arrangements alternating between him and rionos, HIDEKI ATAKA and Takumi Masanori. This "central author plus external arrangers" model keeps the narrative unified while varying the sonic texture.

### Expansion songs

| No. | Release | Track | Lyrics | Music | Arrangement |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 11 | 2023-08-02 | "Hishō" | Sasagawa Mao | Sasagawa Mao | Sasagawa Mao |
| 14 | 2024-01-06 | "Kanjō" | AMAMOGU | Matsuda Junichi, MILKEY | Asahina Kento |
| 15 | 2024-01-16 | "Kirifuda" | Ren | Ren, MILKEY | Asahina Kento |
| 16 | 2024-03-06 | "Dōmei" | Kanata Okajima, Hayato Yamamoto | Kanata Okajima, Hayato Yamamoto, MEG (MEGMETAL) | MEG (MEGMETAL) |

> **What the expansion songs mean**: unlike the genealogy songs, they invite **creators from outside the KAMITSUBAKI system** (Sasagawa Mao, Asahina Kento, Kanata Okajima, MEG). They are the interface through which V.W.P opens out from an internal narrative mythos into a broader pop soundscape.`
    },
    {
      heading: '## Derivative Songs (Member Duets)',
      body: `Beyond the five-member songs, the members of V.W.P have produced several **duets**, which stand as sonic evidence of the internal web of relationships.

| Release | Pairing | Track | Lyrics / Music / Arrangement |
| :--- | :--- | :--- | :--- |
| 2020-11-24 | KAF feat. RIM | "Mahou" ("Fukakai Two Q1" Live Ver.) | Kanzaki Iori |
| 2021-06-18 | ISEKAIJOUCHO × KAF | "Shin'en" | Kashii Moimi |
| 2021-10-23 | HARUSARUHI × ISEKAIJOUCHO | "Rougoku" | Onuma Parsley |
| 2021-10-23 | ISEKAIJOUCHO × KOKO | "Kokuin" | Hiiragi Magnetite |
| 2021-10-23 | RIM × ISEKAIJOUCHO | "Utakata" | Ren |
| 2022-10-16 | HARUSARUHI × KOKO | "Furukizu" | Onuma Parsley (arr. Ataka Hideki) |

> **Observation**: the three duets released together on 23 October 2021 ("Rougoku", "Kokuin", "Utakata") each came from a different creator yet arrived on the same day — readable as a systematic experiment by KAMITSUBAKI in pairing witches two at a time.`
    },
    {
      heading: '## The V.G.P. April Fools Project and Fan Culture',
      body: `V.W.P's official history includes a widely retold "hoax" episode.

- **1 April 2021**: the studio announced that V.W.P. would be renamed **V.G.P.**, and that evening the members streamed *Splatoon* together; after the stream V.G.P. was disbanded and the name reverted to V.W.P.
- **2 May 2022**: V.G.P. returned "for revenge", the members played *PICO PARK* together, and V.G.P. was disbanded again afterwards.

> **Cultural meaning**: this sequence sets the solemn narrative of the "witch assembly" beside light-hearted member interaction, becoming one of the most beloved running jokes in the fandom and adding an everyday, human layer to the group's image beyond that of a sacred chorus.`
    },
    {
      heading: '## Commercial Tie-ups and Anime Themes',
      body: `V.W.P has taken on several anime themes as a five-member chorus, an important channel into mainstream filmed works.

| Timing | Work | Track | Type |
| :--- | :--- | :--- | :--- |
| announced 2021-08-25 / released 2021-11-03 | *Muv-Luv Alternative* | "Rinne" | Original OP |
| announced 2021-09-25 / released 2021-11-17 | *Kikou Senki* | "Henshin" | Original song |
| announced 2022-09-29 / released 2022-12-21 | *Muv-Luv Alternative* Season 2 | "Saikai" | Original ED |

> Notably all three were written and composed by [Kanzaki Iori](/database/creators/kanzaki-iori) and were slotted directly into the genealogy-song numbering (2/3/7), showing a deliberate stance: commercial tie-up songs are folded into the canonical lore rather than treated as standalone singles.`
    }
  ]
};

const dustcell = {
  zh: [
    {
      heading: '## 初期投稿序列与百万播放里程碑',
      body: `DUSTCELL 自 2019 年 10 月起以 YouTube 投稿为核心建立作品序列，早期投稿的达成节奏是理解其传播路径的关键：

| 序号 | 曲目 | 公开时间 | 重要里程碑 |
| :--- | :--- | :--- | :--- |
| 1 | 《CULT》 | 2019-10-11 | 出道曲；2019-12-02 达成 100 万播放，2021-04-27 达成 500 万 |
| 2 | 《STIGMA》 | 2019-11-22 | {{spoiler::被成员视为"很重要的歌"}}；2020-02-07 达成 100 万 |
| 3 | 《LAZY》 | 2020-01-02 | 主题为"怠惰的人"；2020-07-17 达成 100 万 |
| 4 | 《Heaven and Hell》 | 2020-02-01 | "美与疯狂"的代表作，含光敏性癫痫警示 |
| 5 | 《DOMINATION》 | 2020-03-05 | 早期高密度电子作品 |
| 6 | 《LILAC》 | 2020-03-17 | 突然公开的新曲；2021-04-17 达成 100 万 |
| 7 | 《SOPPY》 | 2020-04-04 | 2020-08-18 达成 100 万 |
| 8 | 《アネモネ》 | 2020-05-20 | 与 1st 专辑《SUMMIT》同日公开；2020-06-16 达成 100 万 |
| 9 | 《ONE》 | 2020-06-19 | 2021-02-25 达成 100 万 |
| 10 | 《終点》 | 2020-06-30 | — |
| 11 | 《DERO》 | 2020-08-05 | 2020-09-02 达成 100 万 |
| 12 | 《PAIN》 | 2020-09-16 | 收录为正式单曲 |
| 13 | 《Mad Hatter》 | 2020-12-23 | 于 2nd ONE-MAN LIVE「HOWL」结尾预告后公开 |
| 14 | 《命の行方》 | 2021-04-21 | HAL 专门学校 2021 年度 TV 广告主题曲；2021-06-09 达成 500 万 |
| 15 | 《独白》 | 2021-06-23 | — |

> **传播特征**：DUSTCELL 的早期曲目多数在公开后 4～10 个月内达成百万播放，其中《CULT》与《命の行方》两度突破 500 万，构成其最初的两根播放支柱。`
    },
    {
      heading: '## 频道规模与订阅里程碑',
      body: `| 时间 | 里程碑 |
| :--- | :--- |
| 2020-01-01 | 伴随神椿进入中国，开设微博账号与 bilibili 频道 |
| 2020-01-25 | 与神椿成员一同在 bilibili、微博投稿中文拜年问候短片 |
| 2020-03-13 | YouTube 频道达成银盾（10 万订阅）——{{spoiler::同日恰为主唱 EMA 的生日}} |
| 2020-07-05 | 达成 15 万订阅 |
| 2020-09-02 | 达成 20 万订阅 |

> **意义**：DUSTCELL 是神椿体系中最早完成"中日双平台并行运营"的组合之一，其 2020 年初即开设 bilibili 与微博账号，为后续神椿整体进入华语圈提供了先行经验。`
    },
    {
      heading: '## 商业 Tie-up 与主题曲',
      body: `| 曲目 | Tie-up | 时期 |
| :--- | :--- | :--- |
| 《命の行方》 | 专门学校 HAL（东京・大阪・名古屋）年度 TV 广告主题曲 | 2021 年 |
| 《灯火》 | 电视动画《废渊战鬼》片尾曲 | 2025 年 |

> 由 HAL 广告曲起步，到 2025 年承接电视动画片尾曲，DUSTCELL 的商业合作轨迹呈现出从"机构广告"向"动画影像"的迁移，也对应其听众规模与制作规格的持续升级。`
    },
    {
      heading: '## 成员个人活动与外部档案',
      body: `DUSTCELL 的两位成员在组合之外各自保持着独立的公开活动与账号体系：

- **EMA**：个人 YouTube 频道、Twitter（@eumza1）与 Instagram（@301ye）；其声线亦被用于动画与广告主题曲的独唱部分；
- **Misumi**：个人 YouTube 频道、Twitter（@zeitms）与 Instagram（@zeitms）；作为 VOCALOID 制作人长期独立投稿，并以作曲身份为 VALIS 等神椿系组合供曲（如《鈍色リグレット》）。

> **组合与个人的双轨结构**：两人"个人创作者身份 + 组合成员身份"并行，且互为对方的制作资源，这与神椿其他组合的运作方式有本质差异——DUSTCELL 更像两个独立创作者的交集，而非一个由上而下策划的偶像企划。`
    }
  ],
  ja: [
    {
      heading: '## 初期投稿の系列と百万再生マイルストーン',
      body: `DUSTCELL は 2019 年 10 月以降、YouTube への投稿を軸に作品系列を築いてきた。初期投稿の到達ペースは、その伝播経路を理解する鍵となる。

| 番号 | 曲 | 公開日 | 主なマイルストーン |
| :--- | :--- | :--- | :--- |
| 1 | 《CULT》 | 2019-10-11 | デビュー曲。2019-12-02 に 100 万再生、2021-04-27 に 500 万再生 |
| 2 | 《STIGMA》 | 2019-11-22 | {{spoiler::メンバーが「とても大事な曲」と語った一曲}}。2020-02-07 に 100 万再生 |
| 3 | 《LAZY》 | 2020-01-02 | 「怠惰な人間」が主題。2020-07-17 に 100 万再生 |
| 4 | 《Heaven and Hell》 | 2020-02-01 | 「美と狂気」を代表する作品。光過敏性てんかんの注意表示付き |
| 5 | 《DOMINATION》 | 2020-03-05 | 初期の高密度エレクトロ作品 |
| 6 | 《LILAC》 | 2020-03-17 | 突如公開された新曲。2021-04-17 に 100 万再生 |
| 7 | 《SOPPY》 | 2020-04-04 | 2020-08-18 に 100 万再生 |
| 8 | 《アネモネ》 | 2020-05-20 | 1st アルバム《SUMMIT》と同日公開。2020-06-16 に 100 万再生 |
| 9 | 《ONE》 | 2020-06-19 | 2021-02-25 に 100 万再生 |
| 10 | 《終点》 | 2020-06-30 | — |
| 11 | 《DERO》 | 2020-08-05 | 2020-09-02 に 100 万再生 |
| 12 | 《PAIN》 | 2020-09-16 | 正式なシングルとして収録 |
| 13 | 《Mad Hatter》 | 2020-12-23 | 2nd ONE-MAN LIVE「HOWL」の終わりに予告されて公開 |
| 14 | 《命の行方》 | 2021-04-21 | 専門学校 HAL 2021 年度 TVCM 主題歌。2021-06-09 に 500 万再生 |
| 15 | 《独白》 | 2021-06-23 | — |

> **伝播の特徴**：初期曲の多くが公開後 4〜10 か月で 100 万再生に到達し、うち《CULT》と《命の行方》が 500 万再生を突破している。この二曲が初期の再生支柱となった。`
    },
    {
      heading: '## チャンネル規模と登録者マイルストーン',
      body: `| 日付 | マイルストーン |
| :--- | :--- |
| 2020-01-01 | 神椿の中国展開に伴い、Weibo アカウントと bilibili チャンネルを開設 |
| 2020-01-25 | 神椿のメンバーとともに bilibili・Weibo へ中国語の新年挨拶動画を投稿 |
| 2020-03-13 | YouTube チャンネルが銀盾（登録者 10 万）を達成——{{spoiler::同日はボーカル EMA の誕生日でもあった}} |
| 2020-07-05 | 登録者 15 万を達成 |
| 2020-09-02 | 登録者 20 万を達成 |

> **意味**：DUSTCELL は神椿の中で最も早く「日中二平台の並行運用」を完成させた組の一つであり、2020 年初頭にすでに bilibili と Weibo を開設していたことは、その後の神椿全体の中国語圏展開の先例となった。`
    },
    {
      heading: '## 商業タイアップと主題歌',
      body: `| 曲 | Tie-up | 時期 |
| :--- | :--- | :--- |
| 《命の行方》 | 専門学校 HAL（東京・大阪・名古屋）年度 TVCM 主題歌 | 2021 年 |
| 《灯火》 | テレビアニメ《廃淵戦鬼》エンディング | 2025 年 |

> HAL の CM ソングから 2025 年のテレビアニメ ED へ。DUSTCELL の商業連携の軌跡は「機構の広告」から「アニメ映像」へと移行しており、聴衆規模と制作規模の継続的な拡大に対応している。`
    },
    {
      heading: '## メンバーの個人活動と外部アーカイブ',
      body: `DUSTCELL の二人は、ユニットの外でもそれぞれ独立した公開活動とアカウント体系を保っている。

- **EMA**：個人 YouTube チャンネル、Twitter（@eumza1）、Instagram（@301ye）。その声はアニメや CM 主題歌の単独歌唱部分にも用いられる；
- **Misumi**：個人 YouTube チャンネル、Twitter（@zeitms）、Instagram（@zeitms）。VOCALOID プロデューサーとして長く単独投稿を続け、作曲として VALIS など神椿系の組にも楽曲を提供している（《鈍色リグレット》など）。

> **ユニットと個人の二重構造**：二人は「個人クリエイター」と「ユニットのメンバー」を並行させ、互いが互いの制作リソースとなっている。この運営は神椿の他の組と本質的に異なり、DUSTCELL は上から企画されたアイドル企画というより、二人の独立したクリエイターの交差点に近い。`
    }
  ],
  en: [
    {
      heading: '## Early Upload Sequence and Million-View Milestones',
      body: `Since October 2019 DUSTCELL has built its catalogue around YouTube uploads. The pace at which the early songs reached milestones is key to understanding how they spread.

| No. | Track | Released | Milestones |
| :--- | :--- | :--- | :--- |
| 1 | "CULT" | 2019-10-11 | Debut song; 1M views on 2019-12-02, 5M on 2021-04-27 |
| 2 | "STIGMA" | 2019-11-22 | {{spoiler::a song the members called "very important"}}; 1M views on 2020-02-07 |
| 3 | "LAZY" | 2020-01-02 | Themed on "the lazy person"; 1M views on 2020-07-17 |
| 4 | "Heaven and Hell" | 2020-02-01 | A defining "beauty and madness" work, carrying a photosensitivity warning |
| 5 | "DOMINATION" | 2020-03-05 | An early high-density electronic piece |
| 6 | "LILAC" | 2020-03-17 | A suddenly released new song; 1M views on 2021-04-17 |
| 7 | "SOPPY" | 2020-04-04 | 1M views on 2020-08-18 |
| 8 | "Anemone" | 2020-05-20 | Released the same day as the 1st album *SUMMIT*; 1M views on 2020-06-16 |
| 9 | "ONE" | 2020-06-19 | 1M views on 2021-02-25 |
| 10 | "Shūten" | 2020-06-30 | — |
| 11 | "DERO" | 2020-08-05 | 1M views on 2020-09-02 |
| 12 | "PAIN" | 2020-09-16 | Released as a formal single |
| 13 | "Mad Hatter" | 2020-12-23 | Teased at the end of 2nd ONE-MAN LIVE "HOWL" before release |
| 14 | "Inochi no Yukue" | 2021-04-21 | Theme for HAL vocational school's 2021 TV commercial; 5M views on 2021-06-09 |
| 15 | "Dokuhaku" | 2021-06-23 | — |

> **How they spread**: most early songs crossed one million views within four to ten months of release, with "CULT" and "Inochi no Yukue" both passing five million — the two pillars of their early play counts.`
    },
    {
      heading: '## Channel Scale and Subscriber Milestones',
      body: `| Date | Milestone |
| :--- | :--- |
| 2020-01-01 | Opened a Weibo account and a bilibili channel alongside KAMITSUBAKI's entry into China |
| 2020-01-25 | Posted a Chinese New Year greeting video to bilibili and Weibo with other KAMITSUBAKI members |
| 2020-03-13 | The YouTube channel reached the silver award (100,000 subscribers) — {{spoiler::the same day as vocalist EMA's birthday}} |
| 2020-07-05 | Reached 150,000 subscribers |
| 2020-09-02 | Reached 200,000 subscribers |

> **Significance**: DUSTCELL was among the first KAMITSUBAKI acts to run Chinese and Japanese platforms in parallel, opening bilibili and Weibo accounts as early as January 2020 — a precedent for the studio's later expansion across the Chinese-speaking world.`
    },
    {
      heading: '## Commercial Tie-ups and Theme Songs',
      body: `| Track | Tie-up | Period |
| :--- | :--- | :--- |
| "Inochi no Yukue" | Theme for HAL vocational school's annual TV commercial (Tokyo, Osaka, Nagoya) | 2021 |
| "Tōka" | Ending theme for the TV anime *Gachiakuta* | 2025 |

> From a vocational-school commercial to a TV anime ending in 2025, DUSTCELL's commercial trajectory moves from institutional advertising toward animated film, tracking the continued growth of both audience and production scale.`
    },
    {
      heading: '## Solo Activities and External Archives',
      body: `Both members maintain independent public activity and accounts outside the duo.

- **EMA**: personal YouTube channel, Twitter (@eumza1) and Instagram (@301ye); her voice also carries solo passages in anime and commercial themes.
- **Misumi**: personal YouTube channel, Twitter (@zeitms) and Instagram (@zeitms); a long-standing Vocaloid producer who also supplies songs for KAMITSUBAKI acts such as VALIS (e.g. "Nibiiro Regret").

> **A dual structure of unit and individual**: the two run "independent creator" and "member of a duo" in parallel, and each serves as the other's production resource. This differs fundamentally from other KAMITSUBAKI groups: DUSTCELL is closer to the intersection of two independent creators than to a top-down idol project.`
    }
  ]
};

for (const [id, byLang] of Object.entries({ vwp, dustcell })) {
  for (const lang of ['zh', 'ja', 'en']) {
    const n = appendSections(`units/${id}`, id, lang, byLang[lang]);
    console.log(`${id}/${lang}: appended ${n} sections`);
  }
}
