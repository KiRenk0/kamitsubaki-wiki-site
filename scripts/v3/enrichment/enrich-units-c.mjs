import { appendSections } from '../entry-append.mjs';

const sinseiki = {
  zh: [
    {
      heading: '## 1st Album《改変 -心-》全曲档案',
      body: `心世紀的首张完整专辑《**改変 -心-**》于 **2025 年 10 月 29 日**发行，全长收录 11 曲，是"心"侧世界观的集大成之作：

| # | 曲目 | 制作 |
| :--- | :--- | :--- |
| 1 | フェイクナイト・シンデレラ | feat. 矢野達也 |
| 2 | Ephemeral | feat. 100回嘔吐 |
| 3 | ロストオービット | feat. shikisai |
| 4 | パーフェクション | feat. HIDEYA KOJIMA |
| 5 | ココロト | feat. とあ |
| 6 | いずれ僕は溶けて | feat. Purukichi |
| 7 | コントラスト | feat. 矢野達也 |
| 8 | うそ鳴き | feat. HIDEYA KOJIMA |
| 9 | FantastiQ | feat. HIDEYA KOJIMA |
| 10 | ミリオン・コンプレクシティ | feat. 矢野達也 |
| 11 | 改変 | feat. たなか / LLLL |

> **专辑结构**：标题《改変 -心-》与罪十罰的《改変 -罪-》构成一对镜像专辑；两者都收录了同名曲《改変》，但分别以"心"与"罪"两个侧面切入同一主题。矢野達也参与了其中四曲，是《心》侧最重要的作曲家之一。`
    },
    {
      heading: '## 制作阵与音乐风格',
      body: `心世紀的曲目由一批横跨 VOCALOID 与商业流行领域的创作者共同供给：

- **矢野達也**：参与《フェイクナイト・シンデレラ》《コントラスト》《ミリオン・コンプレクシティ》《雑几帖》等多曲，是组合最核心的作曲家；
- **HIDEYA KOJIMA**：负责《パーフェクション》《うそ鳴き》《FantastiQ》等曲的作编曲；
- **水野あつ**、**100回嘔吐**、**とあ**、**Purukichi**、**shikisai**、**たなか** 等创作者则各自贡献了风格差异明显的单曲。

> **风格定位**：官方将心世紀描述为"以现实与虚拟交织的感性音效为特色，属于心世代的新世代音乐"。与罪十罰的硬核激进路线相比，《心》侧更偏向都市感、青春感与跨次元的轻盈电子。`
    },
    {
      heading: '## 演出、联动与衍生动画档案',
      body: `**主要演出**

| 演出 | 出演成员 |
| :--- | :--- |
| KAMITSUBAKI FES '24 THE DAY THE EARTH STOOD STILL | 全员 |
| KAMITSUBAKI WARS 2025 神椿川崎戦線「少女革命計画 1st LIVE/第一幕『改変』」 | 佳鏡院、御莉姫、硝子宮、美古途、夕凪機、氷夏至 |
| 少女革命計画 Virtual mini Live「Petalstride -鼓動-」 | 佳鏡院、御莉姫、硝子宮 |
| Sanrio Virtual Festival 2026 | 佳鏡院、御莉姫、硝子宮 |
| KAMITSUBAKI WARS 2026 神椿渋谷戦線「少女革命計画 2nd LIVE『Revolutio』」 | 全员 |

**联动活动**

- **IMAGINARY BASE AKIHABARA × 少女革命計画**：第 1 弹「心世紀」（2025-03-01 ～ 03-31）、第 2 弹「罪十罰」（2025-04-01 ～ 04-29）；
- **『少女革命計画』× カラオケの鉄人**（2025-07-23 ～ 08-31）；
- **少女革命計画 × 岡田美術館 —絢爛革命 心・罪—**（2026-01-31 ～ 03-31）。

**衍生短篇动画**

- **《少女革命計画 -ヲモヒノカタチ、キミノカタチ-》**：2024 年 10 月至 2025 年 6 月期间每周三在 YouTube 播出的短篇动画，讲述"彼侧世界"的少女们为找回真正的自己，在被称作"都市传说"的不可思议现象中不断收集"思念之形"的故事；
- **Blu-ray**：2025 年 10 月 26 日发售，收录全 27 集正片以及出演成员的音频评论。

> **企划定位**：作为 KAMITSUBAKI STUDIO 的全新尝试，少女革命計画不仅是音乐企划，还包含使用 Live2D 模型进行游戏实况等接近一般虚拟 YouTuber 的直播活动，心世紀正是这一"XTuber"路线的载体。`
    }
  ],
  ja: [
    {
      heading: '## 1st アルバム《改変 -心-》全曲アーカイブ',
      body: `心世紀の初のフルアルバム《**改変 -心-**》は **2025 年 10 月 29 日**にリリースされ、全 11 曲を収録する「心」側世界観の集大成である。

| # | 曲 | 制作 |
| :--- | :--- | :--- |
| 1 | フェイクナイト・シンデレラ | feat. 矢野達也 |
| 2 | Ephemeral | feat. 100回嘔吐 |
| 3 | ロストオービット | feat. shikisai |
| 4 | パーフェクション | feat. HIDEYA KOJIMA |
| 5 | ココロト | feat. とあ |
| 6 | いずれ僕は溶けて | feat. Purukichi |
| 7 | コントラスト | feat. 矢野達也 |
| 8 | うそ鳴き | feat. HIDEYA KOJIMA |
| 9 | FantastiQ | feat. HIDEYA KOJIMA |
| 10 | ミリオン・コンプレクシティ | feat. 矢野達也 |
| 11 | 改変 | feat. たなか / LLLL |

> **アルバムの構造**：表題の《改変 -心-》は、罪十罰の《改変 -罪-》と対をなすミラーアルバムである。双方が同名曲《改変》を収録しつつ、「心」と「罪」という二つの側面から同じ主題へ切り込む。矢野達也はうち四曲に参加しており、《心》側で最も重要な作曲家の一人である。`
    },
    {
      heading: '## 制作陣と音楽性',
      body: `心世紀の楽曲は、VOCALOID と商業ポップスの両領域にまたがるクリエイターたちが供給している。

- **矢野達也**：《フェイクナイト・シンデレラ》《コントラスト》《ミリオン・コンプレクシティ》《雑几帖》など多数に参加し、組の中核をなす作曲家；
- **HIDEYA KOJIMA**：《パーフェクション》《うそ鳴き》《FantastiQ》などの作編曲を担当；
- **水野あつ**、**100回嘔吐**、**とあ**、**Purukichi**、**shikisai**、**たなか** らが、それぞれに個性の異なるシングルを提供している。

> **スタイルの位置づけ**：公式は心世紀を「現実と仮想が交錯する感性的なサウンドを特徴とし、心世代に属する新世代の音楽」と説明する。罪十罰の硬質で過激な路線に対し、《心》側は都市感・青春感・越境的な軽やかさを持つ電子音へ寄っている。`
    },
    {
      heading: '## 公演・コラボ・派生アニメのアーカイブ',
      body: `**主な公演**

| 公演 | 出演メンバー |
| :--- | :--- |
| KAMITSUBAKI FES '24 THE DAY THE EARTH STOOD STILL | 全員 |
| KAMITSUBAKI WARS 2025 神椿川崎戦線「少女革命計画 1st LIVE/第一幕『改変』」 | 佳鏡院、御莉姫、硝子宮、美古途、夕凪機、氷夏至 |
| 少女革命計画 Virtual mini Live「Petalstride -鼓動-」 | 佳鏡院、御莉姫、硝子宮 |
| Sanrio Virtual Festival 2026 | 佳鏡院、御莉姫、硝子宮 |
| KAMITSUBAKI WARS 2026 神椿渋谷戦線「少女革命計画 2nd LIVE『Revolutio』」 | 全員 |

**コラボ企画**

- **IMAGINARY BASE AKIHABARA × 少女革命計画**：第 1 弾「心世紀」（2025-03-01 〜 03-31）、第 2 弾「罪十罰」（2025-04-01 〜 04-29）；
- **『少女革命計画』× カラオケの鉄人**（2025-07-23 〜 08-31）；
- **少女革命計画 × 岡田美術館 —絢爛革命 心・罪—**（2026-01-31 〜 03-31）。

**派生ショートアニメ**

- **《少女革命計画 -ヲモヒノカタチ、キミノカタチ-》**：2024 年 10 月から 2025 年 6 月まで毎週水曜に YouTube で配信された短編アニメ。「彼側世界」の少女たちが本当の自分を取り戻すため、「都市伝説」と呼ばれる不可思議な現象に巻き込まれながら「ヲモヒノカタチ（思念の形）」を集めていく物語；
- **Blu-ray**：2025 年 10 月 26 日発売。全 27 話の本編と出演メンバーの音声コメンタリーを収録。

> **企画の位置づけ**：KAMITSUBAKI STUDIO の新しい試みとして、少女革命計画は音楽企画にとどまらず、Live2D モデルを用いたゲーム実況など一般のバーチャル YouTuber に近い配信活動も行う。心世紀はこの「XTuber」路線の担い手である。`
    }
  ],
  en: [
    {
      heading: '## 1st Album "Kaihen -Shin-" Track Archive',
      body: `SINSEIKI's first full album *Kaihen -Shin-* was released on **29 October 2025**. Its eleven tracks are the culmination of the "heart" side of the world-view.

| # | Track | Production |
| :--- | :--- | :--- |
| 1 | Fake Night Cinderella | feat. Yano Tatsuya |
| 2 | Ephemeral | feat. 100kai Outo |
| 3 | Lost Orbit | feat. shikisai |
| 4 | Perfection | feat. HIDEYA KOJIMA |
| 5 | Kokoroto | feat. Toa |
| 6 | Izure Boku wa Tokete | feat. Purukichi |
| 7 | Contrast | feat. Yano Tatsuya |
| 8 | Usonaki | feat. HIDEYA KOJIMA |
| 9 | FantastiQ | feat. HIDEYA KOJIMA |
| 10 | Million Complexity | feat. Yano Tatsuya |
| 11 | Kaihen | feat. Tanaka / LLLL |

> **Album structure**: *Kaihen -Shin-* is a mirror album to TSUMITOBATSU's *Kaihen -Tsumi-*. Both include a song titled "Kaihen" and approach the same theme from the "heart" and "sin" sides respectively. Yano Tatsuya contributes four tracks, making him one of the most important composers on the *Shin* side.`
    },
    {
      heading: '## Production Line-up and Musical Style',
      body: `SINSEIKI's songs are supplied by creators spanning both the Vocaloid and commercial pop worlds.

- **Yano Tatsuya**: on "Fake Night Cinderella", "Contrast", "Million Complexity" and "Zatsukichou", the group's central composer.
- **HIDEYA KOJIMA**: writing and arranging "Perfection", "Usonaki" and "FantastiQ".
- **Atsu Mizuno**, **100kai Outo**, **Toa**, **Purukichi**, **shikisai** and **Tanaka** each contribute singles with distinctly different characters.

> **Stylistic position**: the studio describes SINSEIKI as "new-generation music belonging to the heart generation, characterised by sensuous sound where reality and the virtual interlace". Against TSUMITOBATSU's hard, aggressive line, the *Shin* side leans toward urbanity, youth and light cross-dimensional electronics.`
    },
    {
      heading: '## Live, Collaboration and Spin-off Anime Archive',
      body: `**Major performances**

| Performance | Members |
| :--- | :--- |
| KAMITSUBAKI FES '24 THE DAY THE EARTH STOOD STILL | All |
| KAMITSUBAKI WARS 2025 Kawasaki Front, "Girls Revolution Project 1st LIVE / Act One 'Kaihen'" | Kakyoin, Orihime, Garasumiya, Mikoto, Yunagi, Hinageshi |
| Girls Revolution Project Virtual mini Live "Petalstride -Kodou-" | Kakyoin, Orihime, Garasumiya |
| Sanrio Virtual Festival 2026 | Kakyoin, Orihime, Garasumiya |
| KAMITSUBAKI WARS 2026 Shibuya Front, "Girls Revolution Project 2nd LIVE 'Revolutio'" | All |

**Collaboration campaigns**

- **IMAGINARY BASE AKIHABARA × Girls Revolution Project**: round 1 "SINSEIKI" (1–31 March 2025), round 2 "TSUMITOBATSU" (1–29 April 2025).
- **Girls Revolution Project × Karaoke no Tetsujin** (23 July – 31 August 2025).
- **Girls Revolution Project × Okada Museum of Art — Gorgeous Revolution: Heart and Sin —** (31 January – 31 March 2026).

**Spin-off short anime**

- ***Girls Revolution Project -Omohi no Katachi, Kimi no Katachi-***: a short anime streamed every Wednesday on YouTube from October 2024 to June 2026, telling of girls from the "other side" who, to recover their true selves, keep collecting "shapes of yearning" while caught up in phenomena called urban legends.
- **Blu-ray**: released 26 October 2025, containing all 27 episodes plus audio commentary from the cast.

> **Position within the project**: as a new experiment by KAMITSUBAKI STUDIO, the Girls Revolution Project goes beyond music into Live2D game-streaming and other activities close to an ordinary virtual YouTuber. SINSEIKI is the vehicle for that "XTuber" line.`
    }
  ]
};

const tsumitobatsu = {
  zh: [
    {
      heading: '## 1st Album《改変 -罪-》全曲档案',
      body: `罪十罰的首张完整专辑《**改変 -罪-**》于 **2025 年 10 月 29 日**发行，全长 11 曲，是"罪"侧世界观的集大成之作：

| # | 曲目 | 制作 |
| :--- | :--- | :--- |
| 1 | 弔花 | feat. 他人事 |
| 2 | Synapse | feat. Zexnum |
| 3 | RAVEN | — |
| 4 | SHOCK | feat. 梅とら |
| 5 | blindness | feat. ⌘ハイノミ |
| 6 | アウフヘーベン | feat. 椎乃味醂 |
| 7 | Brrrrrreak It | feat. 平田義久 |
| 8 | Envy | feat. tokiwa |
| 9 | DIGGER | feat. biz / ZERA |
| 10 | SURVIVAL | feat. 矢野達也 |
| 11 | 改変 | feat. たなか / LLLL |

> **专辑结构**：与心世紀的《改変 -心-》互为镜像。同名曲《改変》在两专辑中各自收束"心"与"罪"的主题；罪十罰侧的制作阵容（他人事、梅とら、椎乃味醂、平田義久、tokiwa、biz 等）明显偏向激进的摇滚与电子重型取向。`
    },
    {
      heading: '## 制作阵与音乐风格',
      body: `罪十罰的曲目由一批擅长重型编曲与叛逆叙事的创作者供给：

| 作曲家 | 参与曲目 |
| :--- | :--- |
| **他人事** | 《弔花》《大罪》等——组合作词作曲的核心之一 |
| **biz / ZERA** | 《DIGGER》 |
| **Zexnum** | 《Synapse》 |
| **梅とら** | 《SHOCK》 |
| **⌘ハイノミ** | 《blindness》 |
| **椎乃味醂** | 《アウフヘーベン》 |
| **[平田義久](/database/creators/hiratayoshihisa)** | 《Brrrrrreak It》 |
| **[tokiwa](/database/creators/tokiwa)** | 《Envy》（作词作曲，朝比奈健人编曲） |
| **矢野達也** | 《SURVIVAL》 |
| **[梓川](/database/artists/solo/azsagawa)** | 《RAVEN》（作词作曲） |

> **风格定位**：官方将罪十罰描述为"以响彻虚拟世界的歌声，刻下罪恶烙印的激进舞曲"。其声场以重型鼓组、失真音墙与高密度咬字为主，与《心》侧的都市电子形成鲜明对照。`
    },
    {
      heading: '## 公演与联动档案',
      body: `**主要演出**

| 演出 | 出演成员 |
| :--- | :--- |
| KAMITSUBAKI WARS 2024 神椿幕張戦線「現象II（再）」 | 御莉姫、美古途、夕凪機、氷夏至 |
| KAMITSUBAKI WARS 2025 神椿川崎戦線「少女革命計画 1st LIVE/第一幕『改変』」 | 全员 |
| 少女革命計画 Virtual mini Live「Petalstride -青嵐-」 | 美古途、夕凪機、氷夏至 |
| GOLD DISC | 美古途、夕凪機、氷夏至 |
| KAMITSUBAKI WARS 2026 神椿渋谷戦線「少女革命計画 2nd LIVE『Revolutio』」 | 全员 |

> {{spoiler::原定的「RAYSCALE -CYAN-」演出因爆炸预告信被迫中止，美古途、夕凪機、氷至原定出演。}}

**联动活动**

- **IMAGINARY BASE AKIHABARA × 少女革命計画**：第 2 弹「罪十罰」（2025-04-01 ～ 04-29）；
- **少女革命計画 × 岡田美術館 —絢爛革命 心・罪—**（2026-01-31 ～ 03-31）。

> **组合定位**：罪十罰与心世紀共同构成少女革命計画的"心—罪"双轴结构，两者既有各自的完整世界观，也通过《改変》《現世回帰》《鈍色幻灯》《主人行路》《クロマティック》等联合曲目产生交汇，是神椿在多组合同步运营上的一次系统实验。`
    }
  ],
  ja: [
    {
      heading: '## 1st アルバム《改変 -罪-》全曲アーカイブ',
      body: `罪十罰の初のフルアルバム《**改変 -罪-**》は **2025 年 10 月 29 日**にリリースされ、全 11 曲を収録する「罪」側世界観の集大成である。

| # | 曲 | 制作 |
| :--- | :--- | :--- |
| 1 | 弔花 | feat. 他人事 |
| 2 | Synapse | feat. Zexnum |
| 3 | RAVEN | — |
| 4 | SHOCK | feat. 梅とら |
| 5 | blindness | feat. ⌘ハイノミ |
| 6 | アウフヘーベン | feat. 椎乃味醂 |
| 7 | Brrrrrreak It | feat. 平田義久 |
| 8 | Envy | feat. tokiwa |
| 9 | DIGGER | feat. biz / ZERA |
| 10 | SURVIVAL | feat. 矢野達也 |
| 11 | 改変 | feat. たなか / LLLL |

> **アルバムの構造**：心世紀の《改変 -心-》と対をなすミラーアルバムである。同名曲《改変》が両盤で「心」と「罪」の主題をそれぞれ収束させる。罪十罰側の制作陣（他人事、梅とら、椎乃味醂、平田義久、tokiwa、biz など）は、明らかに過激なロック／ヘヴィ・エレクトロニック寄りである。`
    },
    {
      heading: '## 制作陣と音楽性',
      body: `罪十罰の楽曲は、重量級の編曲と反抗的な叙事を得意とするクリエイターたちが供給している。

| 作曲家 | 参加曲 |
| :--- | :--- |
| **他人事** | 《弔花》《大罪》など——組の作詞作曲の中核の一つ |
| **biz / ZERA** | 《DIGGER》 |
| **Zexnum** | 《Synapse》 |
| **梅とら** | 《SHOCK》 |
| **⌘ハイノミ** | 《blindness》 |
| **椎乃味醂** | 《アウフヘーベン》 |
| **[平田義久](/database/creators/hiratayoshihisa)** | 《Brrrrrreak It》 |
| **[tokiwa](/database/creators/tokiwa)** | 《Envy》（作詞作曲、編曲：朝比奈健人） |
| **矢野達也** | 《SURVIVAL》 |
| **[梓川](/database/artists/solo/azsagawa)** | 《RAVEN》（作詞作曲） |

> **スタイルの位置づけ**：公式は罪十罰を「仮想世界に響く歌声で、罪の烙印を刻む過激なダンスミュージック」と説明する。重量級のドラム、歪んだ音の壁、高密度のディクションが中心で、《心》側の都市型エレクトロニカと鮮やかに対比される。`
    },
    {
      heading: '## 公演とコラボのアーカイブ',
      body: `**主な公演**

| 公演 | 出演メンバー |
| :--- | :--- |
| KAMITSUBAKI WARS 2024 神椿幕張戦線「現象II（再）」 | 御莉姫、美古途、夕凪機、氷夏至 |
| KAMITSUBAKI WARS 2025 神椿川崎戦線「少女革命計画 1st LIVE/第一幕『改変』」 | 全員 |
| 少女革命計画 Virtual mini Live「Petalstride -青嵐-」 | 美古途、夕凪機、氷夏至 |
| GOLD DISC | 美古途、夕凪機、氷夏至 |
| KAMITSUBAKI WARS 2026 神椿渋谷戦線「少女革命計画 2nd LIVE『Revolutio』」 | 全員 |

> {{spoiler::予定されていた「RAYSCALE -CYAN-」は爆破予告により中止となった。美古途・夕凪機・氷夏至が出演予定だった。}}

**コラボ企画**

- **IMAGINARY BASE AKIHABARA × 少女革命計画**：第 2 弾「罪十罰」（2025-04-01 〜 04-29）；
- **少女革命計画 × 岡田美術館 —絢爛革命 心・罪—**（2026-01-31 〜 03-31）。

> **組の位置づけ**：罪十罰は心世紀とともに少女革命計画の「心—罪」二軸構造をなす。それぞれに完結した世界観を持ちながら、《改変》《現世回帰》《鈍色幻灯》《主人行路》《クロマティック》などの共同曲で交差する。神椿が複数組の同時運用に挑んだ体系的な実験である。`
    }
  ],
  en: [
    {
      heading: '## 1st Album "Kaihen -Tsumi-" Track Archive',
      body: `TSUMITOBATSU's first full album *Kaihen -Tsumi-* was released on **29 October 2025**. Its eleven tracks are the culmination of the "sin" side of the world-view.

| # | Track | Production |
| :--- | :--- | :--- |
| 1 | Chouka | feat. Hitogoto |
| 2 | Synapse | feat. Zexnum |
| 3 | RAVEN | — |
| 4 | SHOCK | feat. Umetora |
| 5 | blindness | feat. ⌘Hainomi |
| 6 | Aufheben | feat. Shiino Mirin |
| 7 | Brrrrrreak It | feat. Hirata Yoshihisa |
| 8 | Envy | feat. tokiwa |
| 9 | DIGGER | feat. biz / ZERA |
| 10 | SURVIVAL | feat. Yano Tatsuya |
| 11 | Kaihen | feat. Tanaka / LLLL |

> **Album structure**: a mirror to SINSEIKI's *Kaihen -Shin-*. The shared title track "Kaihen" closes the "heart" and "sin" themes on their respective discs. TSUMITOBATSU's production line-up (Hitogoto, Umetora, Shiino Mirin, Hirata Yoshihisa, tokiwa, biz and others) skews decisively toward aggressive rock and heavy electronics.`
    },
    {
      heading: '## Production Line-up and Musical Style',
      body: `TSUMITOBATSU's songs come from creators known for heavyweight arrangement and rebellious storytelling.

| Composer | Tracks |
| :--- | :--- |
| **Hitogoto** | "Chouka", "Taizai" and others — one of the duo's core writers |
| **biz / ZERA** | "DIGGER" |
| **Zexnum** | "Synapse" |
| **Umetora** | "SHOCK" |
| **⌘Hainomi** | "blindness" |
| **Shiino Mirin** | "Aufheben" |
| **[Hirata Yoshihisa](/database/creators/hiratayoshihisa)** | "Brrrrrreak It" |
| **[tokiwa](/database/creators/tokiwa)** | "Envy" (words and music; arrangement by Asahina Kento) |
| **Yano Tatsuya** | "SURVIVAL" |
| **[Azsagawa](/database/artists/solo/azsagawa)** | "RAVEN" (words and music) |

> **Stylistic position**: the studio describes TSUMITOBATSU as "aggressive dance music that brands the mark of sin with a voice ringing through the virtual world". Its sound world centres on heavyweight drums, walls of distortion and dense diction, contrasting sharply with the urban electronics of the *Shin* side.`
    },
    {
      heading: '## Live and Collaboration Archive',
      body: `**Major performances**

| Performance | Members |
| :--- | :--- |
| KAMITSUBAKI WARS 2024 Makuhari Front, "Phenomenon II (Again)" | Orihime, Mikoto, Yunagi, Hinageshi |
| KAMITSUBAKI WARS 2025 Kawasaki Front, "Girls Revolution Project 1st LIVE / Act One 'Kaihen'" | All |
| Girls Revolution Project Virtual mini Live "Petalstride -Seiran-" | Mikoto, Yunagi, Hinageshi |
| GOLD DISC | Mikoto, Yunagi, Hinageshi |
| KAMITSUBAKI WARS 2026 Shibuya Front, "Girls Revolution Project 2nd LIVE 'Revolutio'" | All |

> {{spoiler::The scheduled "RAYSCALE -CYAN-" performance was cancelled after a bomb threat; Mikoto, Yunagi and Hinageshi had been set to appear.}}

**Collaboration campaigns**

- **IMAGINARY BASE AKIHABARA × Girls Revolution Project**: round 2 "TSUMITOBATSU" (1–29 April 2025).
- **Girls Revolution Project × Okada Museum of Art — Gorgeous Revolution: Heart and Sin —** (31 January – 31 March 2026).

> **Position within the project**: together with SINSEIKI, TSUMITOBATSU forms the "heart–sin" two-axis structure of the Girls Revolution Project. Each has a self-contained world-view while intersecting through joint songs such as "Kaihen", "Gense Kaiki", "Nibiiro Gentou", "Shujin Kouro" and "Chromatic" — a systematic experiment by KAMITSUBAKI in running multiple groups in parallel.`
    }
  ]
};

for (const [id, byLang] of Object.entries({ sinseiki, tsumitobatsu })) {
  for (const lang of ['zh', 'ja', 'en']) {
    const n = appendSections(`units/${id}`, id, lang, byLang[lang]);
    console.log(`${id}/${lang}: appended ${n} sections`);
  }
}
