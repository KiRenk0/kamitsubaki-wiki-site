import { appendSections } from '../entry-append.mjs';

const isekai = {
  zh: [
    {
      heading: '## 歌唱形态全谱系（Anemone 与变异体档案）',
      body: `ヰ世界情绪的形象谱系是 V.W.P 中最为细密复杂的一套，其设计以**花卉**为核心母题，并由插画师**orie**主导。

> **形态使用规则**：截至目前，ヰ世界情绪各渠道的账号头像、背景以及对外联动立绘**均为普遍体**，绝大多数曲绘亦使用普遍体；可粗略认为**变异体仅在演唱会中使用**。舞台剧「御伽噺（染）」中的服装暂不纳入讨论。

### 普遍体 · 「Anemone」

- **Anemone I / Anemone II** 均由插画师 **orie** 设计；
- 「Anemone」即**银莲花**，而情绪本人身边的两朵{{spoiler::使魔？}}银莲花按品种来看是"五叶银莲花"，也称"欧洲银莲花"；
- 花{{spoiler::使魔？}}的名字叫 **{{ruby::anemos::アネモス}}**，取希腊语中"**风**"之意。

| 形态名称 | 类别 | 首次公开 / 说明 |
| :--- | :--- | :--- |
| **Anemone I** | 普遍体 | 基础日常形态，亦是最广泛使用的对外立绘 |
| **Anemone II** | 普遍体 | 由 orie 设计的进阶日常形态 |
| **{{ruby::花魁鳥::おいらどり::oiradori}}** | 魔女特殊歌唱用形态 | 2021 年 3 月 13 日于「不可解弐 Q2」与 V.W.P 另外四人一同公开。形态大体与 Anemone I 相似，戴上经典魔女同款汉宁帽，帽上同样有花朵装饰，衣服上多了些锈红色条纹{{spoiler::胡萝卜}}。{{spoiler::戴上帽子后比理芽高了一点。}} |
| **{{ruby::八咫烏::やたがらす::yatagarasu}}** | 魔女特殊歌唱用形态 | 2024 年 1 月 13 日于 2nd ONE-MAN LIVE「現象2」披露 |
| **Heliotrope** | 变异体 | 演唱会限定的异化形态 |
| **Nemophila I / II** | 普遍体 | 以"琉璃繁缕"（Nemophila）为主题的两阶段形态 |
| **Calla lily** | 变异体 | 以"马蹄莲"为主题的异化形态 |
| **Margaret Sol** | 变异体 | 以"玛格丽特（日轮）"为主题的异化形态 |
| **Margaret Luna** | 变异体 | 以"玛格丽特（月轮）"为主题的异化形态 |
| **Sunflower** | 普遍体 | 以"向日葵"为主题的形态 |
| **Edelweiss** | 变异体 | 以"高山火绒草"为主题的异化形态 |
| **{{ruby::Seventh Heaven::セブンスヘブン}}** | **思念体** | 2025 年 3 月 25 日发布的原创曲《みらいのかたち / 未来之形》MV 中首次亮相。**形象由ヰ世界情绪本人设计，该曲亦由其本人作词**——这是她首次亲自操刀自身形态的美术设定 |

> **谱系意义**：从"普遍体（花）→ 变异体（异化之花）→ 思念体（升华形态）"的三层结构，可见ヰ世界情绪的形态体系并不只是服装更换，而是一套完整的**生命形态学寓言**，与其作品中反复出现的"生长、畸变、超越"母题严格对应。`
    },
    {
      heading: '## 伙伴与银莲花「anemos」',
      body: `伴随ヰ世界情绪的两朵银莲花，其名为 **anemos**（{{ruby::アネモス::あねもす}}），取希腊语中"**风**"的意思。

- **命名逻辑**：希腊语 ἄνεμος 即"风"，而银莲花的学名 *Anemone* 本身亦源自同一词根——民间传说银莲花只在风中绽放；
- **设定定位**：与 [花譜](/zh/artists/vwp/kaf) 的「拉普拉斯」、[理芽](/zh/artists/vwp/rim) 的「哈斯塔」同属神椿魔女的"伙伴"体系，但在形态上是一对双花而非单一生物；
- **世界观呼应**：风的意象贯穿ヰ世界情绪的演唱风格——其气声与呼吸控制常被形容为"如同风穿过花丛"。`
    },
    {
      heading: '## 配音作品',
      body: `| 年份 | 作品 | 角色 | 类别 |
| :--- | :--- | :--- | :--- |
| 2025 | 《[神椿市建设中。](/zh/projects/arg/kamitsubaki-city)》 | **夜河世界** | 电视动画 |
| 2025 | 《[神椿市建設中。REGENERATE](/database/projects/kamitsubaki-city-regenerate)》 | **夜河世界** | 游戏 |

> **夜河世界**（{{ruby::夜河世界::よがわせかい::yogawa sekai}}）是ヰ世界情绪在《神椿市建设中。》世界观中的对应角色，是五位魔女中气质最为古典、沉静的一位。`
    },
    {
      heading: '## 作品展与艺术企划',
      body: `- **ヰ世界情緒 作品展**：以插画、曲绘、世界观美术为核心的个人作品展，是神椿体系内少见的"以视觉档案为主体"的线下展陈企划，直观呈现了 orie 设计谱系与情绪本人艺术审美的演进；
- **舞台剧「御伽噺（染）」**：以声剧世界观为基础的舞台化尝试，其中的服装体系因与日常歌唱形态分属不同脉络，被单独排除在形态谱系之外；
- **艺术定位**：ヰ世界情绪是 V.W.P 中与"绘画、文学、古典艺术"关联最深的成员，其企划经常跨越音乐边界，进入展陈与戏剧领域。`
    },
    {
      heading: '## 音乐的同位体「星界」',
      body: `**音乐的同位体 {{ruby::星界::せかい::SEKAI}}** 是以ヰ世界情绪的歌声为原型开发的 AI 歌声合成软件，属于神椿"音乐的同位体"系列的核心成员之一。

| 项目 | 内容 |
| :--- | :--- |
| **声源原型** | ヰ世界情绪 |
| **引擎** | CeVIO AI / Synthesizer V AI（双引擎战略） |
| **声音特征** | 承袭情绪的宽阔音域、歌剧式共鸣与透明高音，擅长宏大叙事与幻想系编曲 |
| **代表合辑** | 《ISE+YOU SEKAI COMPILATION ALBUM メタモルフォーゼ》（2023-05-24） |
| **二创生态** | 向全球创作者近乎免版税开放商用授权，催生大量幻想、和风与交响摇滚向作品 |

> **模板关系**：星界与情绪的关系不同于普通的"声库与配音者"——官方将其定位为同一"歌之声"在数字侧的**同位体**，两者共享世界观中的"歌曲特异点"身份。`
    },
    {
      heading: '## 现场演出档案',
      body: `- **ヰ世界情緒 STREAMING COVER LIVE「キャンディライブ」系列**：以翻唱为核心的线上直播专场，另推出「キャンディライブ 2」，是情绪在个人专场之外最主要的持续演出场域；
- **ヰ世界情緒 1st ONE-MAN LIVE「Anima」**：分为 **Day 1 / Day 2** 两日结构，以"灵魂（Anima）"为题，将情绪的古典世界观与 3D 舞台演出全面整合；
- **ヰ世界情緒 Mini-Live「parallel canvas」**：小型规模的实验性现场，侧重绘画与音乐并行的跨媒介表达；
- **ヰ世界情緒 2nd ONE-MAN LIVE「Anima Ⅱ -神椿市参番街-」**：延续「Anima」系列，并以"神椿市参番街"命名，直接接入《神椿市建设中。》的街区分区体系。`
    },
    {
      heading: '## 轶事与圈内文化',
      body: `- **形态即叙事**：ヰ世界情绪是 V.W.P 中形态体系最庞大、命名最统一（全部以花卉命名）的成员，其"普遍体—变异体—思念体"三层结构与作品主题构成互文；
- **亲自动笔**：2025 年的思念体「Seventh Heaven」是其首次亲自设计自身形态并包办作词，标志创作主体性的进一步扩张；
- **共演互动**：与 [春猿火](/zh/artists/vwp/harusaruhi) 关系密切——{{spoiler::春猿火在成人礼后想去的"水族馆"，后来便是与情绪一起去的。}}
- **声线标签**：情绪的歌喉常被描述为"巴洛克式的华丽包裹着少女的脆弱"，是 V.W.P 中承担最多"非日常／幻想系"编曲的声部。`
    }
  ],
  ja: [
    {
      heading: '## 歌唱形態の全系譜',
      body: `ヰ世界情緒の造形は V.W.P の中で最も細密で複雑な体系を持ち、**花**を中心モチーフとしてイラストレーター**orie**が主導している。

> **形態の運用規則**：現時点で、ヰ世界情緒の各チャンネルのアイコン、背景、対外コラボ用の立ち絵は**すべて普遍体**であり、ほとんどの曲絵も普遍体を用いる。**変異体はライブでのみ使用**されると概ね考えてよい。舞台劇「御伽噺（染）」の衣装は別系統のためここでは扱わない。

### 普遍体・「Anemone」

- **Anemone I / Anemone II** はいずれもイラストレーター **orie** のデザイン；
- 「Anemone」は**アネモネ**（牡丹咲き銀蓮花）を指し、情緒の傍らにある二輪の{{spoiler::使い魔？}}アネモネは品種としては「五葉アネモネ」、別名「ヨーロッパアネモネ」である；
- 花{{spoiler::使い魔？}}の名は **{{ruby::anemos::アネモス}}** で、ギリシア語の「**風**」に由来する。

| 形態名 | 分類 | 初公開・説明 |
| :--- | :--- | :--- |
| **Anemone I** | 普遍体 | 基本の日常形態。対外立ち絵として最も広く使われる |
| **Anemone II** | 普遍体 | orie による発展的な日常形態 |
| **{{ruby::花魁鳥::おいらどり::oiradori}}** | 魔女特殊歌唱用形態 | 2021 年 3 月 13 日「不可解弐 Q2」にて V.W.P の他の四人とともに公開。概形は Anemone I に近く、魔女共通のヘニン帽を戴き、帽子にも花飾り、衣装には錆色のライン{{spoiler::にんじん}}が加わる。{{spoiler::帽子を被ると理芽より少し背が高くなる。}} |
| **{{ruby::八咫烏::やたがらす::yatagarasu}}** | 魔女特殊歌唱用形態 | 2024 年 1 月 13 日、2nd ONE-MAN LIVE「現象2」で披露 |
| **Heliotrope** | 変異体 | ライブ限定の異化形態 |
| **Nemophila I / II** | 普遍体 | 「ネモフィラ」を主題とした二段階の形態 |
| **Calla lily** | 変異体 | 「カラー」を主題とした異化形態 |
| **Margaret Sol** | 変異体 | 「マーガレット（太陽）」を主題とした異化形態 |
| **Margaret Luna** | 変異体 | 「マーガレット（月）」を主題とした異化形態 |
| **Sunflower** | 普遍体 | 「ひまわり」を主題とした形態 |
| **Edelweiss** | 変異体 | 「エーデルワイス」を主題とした異化形態 |
| **{{ruby::Seventh Heaven::セブンスヘブン}}** | **思念体** | 2025 年 3 月 25 日公開のオリジナル曲《みらいのかたち》MV で初登場。**造形はヰ世界情緒本人がデザインし、作詞も本人が担当**——自身の形態の美術設定を自ら手がけた初の事例 |

> **系譜の意味**：「普遍体（花）→ 変異体（異化した花）→ 思念体（昇華形態）」という三層構造は、単なる衣装替えではなく、作品に繰り返し現れる「成長・畸変・超越」という主題と厳密に対応する**生命形態学の寓話**である。`
    },
    {
      heading: '## 相棒・アネモネ「anemos」',
      body: `ヰ世界情緒の傍らにある二輪のアネモネの名は **anemos**（アネモス）で、ギリシア語の「**風**」に由来する。

- **命名の論理**：ギリシア語 ἄνεμος は「風」を意味し、アネモネの学名 *Anemone* も同じ語根に由来する。民間伝承では、アネモネは風によってのみ開く花とされる；
- **設定上の位置**：[花譜](/ja/artists/vwp/kaf) の「ラプラス」、[理芽](/ja/artists/vwp/rim) の「ハスター」と同じく魔女の「相棒」体系に属するが、姿は単体の生物ではなく一対の花である；
- **世界観との呼応**：風のイメージは情緒の歌唱にも通底し、その息遣いと呼吸の制御は「花叢を抜ける風のよう」と評される。`
    },
    {
      heading: '## 出演・声優作品',
      body: `| 年 | 作品 | 役 | 種別 |
| :--- | :--- | :--- | :--- |
| 2025 | 《[神椿市建設中。](/ja/projects/arg/kamitsubaki-city)》 | **夜河世界** | テレビアニメ |
| 2025 | 《[神椿市建設中。REGENERATE](/database/projects/kamitsubaki-city-regenerate)》 | **夜河世界** | ゲーム |

> **夜河世界**は《神椿市建設中。》世界観におけるヰ世界情緒の対応キャラクターで、五人の中でもとりわけ古典的で静謐な気質を持つ。`
    },
    {
      heading: '## 作品展と芸術企画',
      body: `- **ヰ世界情緒 作品展**：イラスト、曲絵、世界観美術を中心とした個展。神椿の中でも珍しい「視覚資料を主体とした」展覧企画であり、orie のデザイン系譜と情緒本人の審美の変遷を直に提示している；
- **舞台劇「御伽噺（染）」**：声劇世界観を舞台化した試み。衣装体系が日常の歌唱形態とは別系統であるため、形態系譜からは切り離して扱われる；
- **芸術的定位**：ヰ世界情緒は V.W.P の中で「絵画・文学・古典芸術」との結びつきが最も深いメンバーであり、企画が音楽の枠を越えて展示や演劇へと展開する。`
    },
    {
      heading: '## 音楽的同位体「星界」',
      body: `**音楽的同位体 {{ruby::星界::せかい::SEKAI}}** は、ヰ世界情緒の歌声を原型として開発された AI 歌唱合成ソフトウェアであり、神椿「音楽的同位体」シリーズの中核の一員である。

| 項目 | 内容 |
| :--- | :--- |
| **音源原型** | ヰ世界情緒 |
| **エンジン** | CeVIO AI / Synthesizer V AI（二エンジン戦略） |
| **声質** | 情緒の広い音域、オペラ的な共鳴、透明な高音を受け継ぎ、壮大な叙事や幻想系の編曲を得意とする |
| **代表コンピ** | 《ISE+YOU SEKAI COMPILATION ALBUM メタモルフォーゼ》（2023-05-24） |
| **二次創作** | 世界中のクリエイターへ商用利用を含めてほぼ無償で開放され、幻想・和風・シンフォニックロック系の作品を大量に生んでいる |

> **雛形との関係**：星界と情緒の関係は単なる「音源と演者」ではない。公式はこれを同一の「歌の声」の**デジタル側の同位体**と位置づけており、両者は世界観における「歌曲の特異点」という identity を共有している。`
    },
    {
      heading: '## ライブアーカイヴ',
      body: `- **ヰ世界情緒 STREAMING COVER LIVE「キャンディライブ」シリーズ**：カバー中心のオンライン配信ライブ。「キャンディライブ 2」も制作され、個人公演以外で最も継続的な表現の場となっている；
- **ヰ世界情緒 1st ONE-MAN LIVE「Anima」**：**Day 1 / Day 2** の二日構成。「魂（Anima）」を主題に、情緒の古典的世界観と 3D ステージ演出を全面的に統合した；
- **ヰ世界情緒 Mini-Live「parallel canvas」**：小規模な実験的ライブで、絵画と音楽を並走させる越境的な表現を試みた；
- **ヰ世界情緒 2nd ONE-MAN LIVE「Anima Ⅱ -神椿市参番街-」**：「Anima」シリーズを継承しつつ、「神椿市参番街」と題して《神椿市建設中。》の街区体系に直接接続している。`
    },
    {
      heading: '## エピソードと界隈の文化',
      body: `- **形態が物語である**：ヰ世界情緒は V.W.P の中で最も形態体系が大きく、命名も統一されている（すべて花の名）。「普遍体—変異体—思念体」の三層構造は作品の主題と相互に照応する；
- **自ら筆を執る**：2025 年の思念体「Seventh Heaven」は、自身の形態のデザインと作詞を初めて自ら担当した事例であり、創作主体性のさらなる拡張を示す；
- **共演と交流**：[春猿火](/ja/artists/vwp/harusaruhi) と関係が深い——{{spoiler::春猿火が成人式後に行きたいと語っていた「水族館」は、のちに情緒と一緒に出かけている。}}
- **声のラベル**：情緒の声は「バロックの華やかさが少女の脆さを包む」と評されることが多く、V.W.P の中で最も「非日常／幻想系」の編曲を担う声部である。`
    }
  ],
  en: [
    {
      heading: '## Complete Singing Form Archive',
      body: `ISEKAIJOUCHO's visual system is the most elaborate in V.W.P. It takes **flowers** as its core motif and is led by the illustrator **orie**.

> **How the forms are used**: across her channels, avatars, backgrounds and collaboration key visuals are **all in the universal form**, and most song illustrations use it too; the mutant forms can be roughly described as **live-show only**. Costumes from the stage play "Otogibanashi (Some)" belong to a separate lineage and are excluded here.

### Universal Form · "Anemone"

- **Anemone I / Anemone II** are both designed by the illustrator **orie**.
- "Anemone" means the **anemone flower**, and the two anemones beside her are, by variety, "five-leaf anemones" — also called European anemones.
- The flower{{spoiler::-familiar?}}'s name is **{{ruby::anemos::アネモス}}**, from the Greek word for "**wind**".

| Form | Class | Debut / notes |
| :--- | :--- | :--- |
| **Anemone I** | Universal | The baseline everyday form and the most widely used key visual |
| **Anemone II** | Universal | An evolved everyday form by orie |
| **{{ruby::花魁鳥::おいらどり::oiradori}}** | Witch special singing form | Revealed 13 March 2021 at "Fukakai Two Q2" alongside the other four members of V.W.P. Broadly similar to Anemone I, with the witches' shared hennin, flower ornamentation on the hat, and rust-red lines added to the dress |
| **{{ruby::八咫烏::やたがらす::yatagarasu}}** | Witch special singing form | Revealed 13 January 2024 at 2nd ONE-MAN LIVE "Phenomenon 2" |
| **Heliotrope** | Mutant | A live-only altered form |
| **Nemophila I / II** | Universal | A two-stage form themed on the nemophila |
| **Calla lily** | Mutant | An altered form themed on the calla lily |
| **Margaret Sol** | Mutant | An altered form themed on the marguerite (sun) |
| **Margaret Luna** | Mutant | An altered form themed on the marguerite (moon) |
| **Sunflower** | Universal | A form themed on the sunflower |
| **Edelweiss** | Mutant | An altered form themed on the edelweiss |
| **{{ruby::Seventh Heaven::セブンスヘブン}}** | **Thought-form** | Debuted in the MV for her original song "Mirai no Katachi" on 25 March 2025. **The design is by ISEKAIJOUCHO herself, and she wrote the lyrics too** — the first time she authored the art direction of one of her own forms |

> **What the lineage means**: the three tiers of "universal form (flower) → mutant (altered flower) → thought-form (sublimated)" are not mere costume changes but a complete **morphological fable**, mapping precisely onto the themes of growth, mutation and transcendence that run through her work.`
    },
    {
      heading: '## Companion: the Anemones "anemos"',
      body: `The two anemones beside ISEKAIJOUCHO are named **anemos**, from the Greek word for "**wind**".

- **Why the name**: Greek ἄνεμος means "wind", and the anemone's genus name *Anemone* shares the same root; folklore holds that anemones open only in the wind.
- **Where it sits**: like [KAF](/en/artists/vwp/kaf)'s Laplace and [RIM](/en/artists/vwp/rim)'s Hastur it belongs to the witches' "companion" system, though its form is a pair of flowers rather than a single creature.
- **Echo in the world**: the image of wind runs through her singing as well — her breath control is often described as "wind passing through a flowerbed".`
    },
    {
      heading: '## Voice Acting Roles',
      body: `| Year | Work | Role | Type |
| :--- | :--- | :--- | :--- |
| 2025 | *[KAMITSUBAKI CITY UNDER CONSTRUCTION](/en/projects/arg/kamitsubaki-city)* | **Yogawa Sekai** | TV anime |
| 2025 | *[KAMITSUBAKI CITY REGENERATE](/database/projects/kamitsubaki-city-regenerate)* | **Yogawa Sekai** | Game |

> **Yogawa Sekai** is ISEKAIJOUCHO's corresponding character within the *KAMITSUBAKI CITY* setting, and the most classical and serene of the five witches.`
    },
    {
      heading: '## Exhibitions and Art Projects',
      body: `- **ISEKAIJOUCHO Exhibition**: a solo exhibition centred on illustrations, song art and world-building visuals — a rare "visual-archive-first" physical exhibition in the KAMITSUBAKI system that lays out the orie design lineage and the evolution of her own aesthetic.
- **Stage play "Otogibanashi (Some)"**: a theatrical adaptation of the audio-drama world; because its costume system is separate from her everyday singing forms it is excluded from the form lineage.
- **Artistic position**: ISEKAIJOUCHO is the member most closely tied to painting, literature and classical art, and her projects regularly push past music into exhibition and theatre.`
    },
    {
      heading: '## Musical Isotope "SEKAI"',
      body: `**Musical Isotope {{ruby::星界::せかい::SEKAI}}** is the AI singing synthesizer developed from ISEKAIJOUCHO's voice, and a core member of KAMITSUBAKI's Musical Isotope series.

| Item | Detail |
| :--- | :--- |
| **Voice source** | ISEKAIJOUCHO |
| **Engines** | CeVIO AI / Synthesizer V AI (dual-engine strategy) |
| **Vocal character** | Inherits her wide range, operatic resonance and transparent highs; excels in grand narrative and fantasy arrangements |
| **Signature compilation** | *ISE+YOU SEKAI COMPILATION ALBUM Metamorphose* (24 May 2023) |
| **UGC ecosystem** | Licensed to global creators on near-royalty-free commercial terms, producing a large body of fantasy, Japanese-style and symphonic-rock work |

> **Relationship to the template**: SEKAI is not merely a "voice bank and its performer". The studio positions it as the **digital-side isotope** of the same singing voice, sharing the identity of a "song singularity" within the lore.`
    },
    {
      heading: '## Live Performance Archive',
      body: `- **ISEKAIJOUCHO STREAMING COVER LIVE "Candy Live" series**: cover-driven online streaming shows, followed by "Candy Live 2" — her most continuous outlet outside solo concerts.
- **ISEKAIJOUCHO 1st ONE-MAN LIVE "Anima"**: a two-day structure (Day 1 / Day 2) themed on the soul (*anima*), fully integrating her classical world-view with 3D stage production.
- **ISEKAIJOUCHO Mini-Live "parallel canvas"**: a small experimental show exploring painting and music running in parallel.
- **ISEKAIJOUCHO 2nd ONE-MAN LIVE "Anima II -Kamitsubaki City Sanban-gai-"**: continues the "Anima" series while naming itself after a district of *KAMITSUBAKI CITY*, tying directly into that project's district system.`
    },
    {
      heading: '## Anecdotes and Community Culture',
      body: `- **Form as narrative**: ISEKAIJOUCHO has the largest and most systematically named form catalogue in V.W.P (all flowers); the three tiers of universal, mutant and thought-form interlock with the themes of her work.
- **Taking up the pen**: the 2025 thought-form "Seventh Heaven" was the first time she designed one of her own forms and wrote its lyrics, marking a further expansion of her creative authorship.
- **Interaction**: she is close to [HARUSARUHI](/en/artists/vwp/harusaruhi) — {{spoiler::the aquarium HARUSARUHI said she wanted to visit after coming of age is the one she later visited together with ISEKAIJOUCHO.}}
- **Vocal label**: her voice is often described as "baroque splendour wrapping a girl's fragility", and she carries the most "otherworldly / fantasy" arrangements in V.W.P.`
    }
  ]
};

for (const lang of ['zh', 'ja', 'en']) {
  const n = appendSections('people/solo/isekaijoucho', 'isekaijoucho', lang, isekai[lang]);
  console.log(`isekaijoucho/${lang}: appended ${n} sections`);
}
