import { appendSections } from '../entry-append.mjs';

const data = {
  harusaruhi: {
    zh: [
      {
        heading: '## 角色视觉形象与造型档案',
        body: `春猿火的人设由插画师**穂竹藤丸**担当，整体呈现出"街头少年感 × 高温燃烧"的视觉取向：

| 项目 | 设定内容 |
| :--- | :--- |
| 发色与发型 | 黑色及腰长发，部分地方挑染红色与蓝色 |
| 瞳色 | 黄色眼瞳 |
| 配饰 | 戴着带有链条与黄色麻花结饰的耳机 |
| 上装 | 白色无袖背心、红色露指手套、蓝色露肩外套 |
| 下装 | 黑色短裤与高筒马丁靴 |
| 袜装 | **左腿为破碎长袜，右腿为束带网袜**（左右不对称是其标志性设计） |

> 春猿火的不对称袜装设计与"破碎—束缚"的意象，直接呼应其音乐中反复出现的**反抗、伤口与自我解放**主题，也是 V.W.P 五人中最具攻击性的视觉构成。`
      },
      {
        heading: '## 「春猿火自由律」系列',
        body: `**「春猿火自由律」**是春猿火自 2020 年起在 Twitter 上连载的短篇说唱（Rap）企划，由不同制作人提供伴奏、春猿火与 **たかやん** 共同作词，以接近"即兴日记"的形式记录日常心情与时代情绪。

| 编号 | 公开时间 | 曲名 | 制作人 (Prod.) | 作词 |
| :--- | :--- | :--- | :--- | :--- |
| #01 | 2020-06-13 | 《初見さんラップ》 | Kiyoto | たかやん・春猿火 |
| #02 | 2020-07-04 | 《おうちこもりラップ》 | RIKIYA | たかやん・春猿火 |
| #03 | 2020-08-05 | 《平和祈るラップ》 | Sinato | たかやん・春猿火 |
| #04 | 2020-10-14 | 《ラブレター》 | Piper Beats | たかやん・春猿火 |
| #05 | 2020-12-17 | 《iのアンサー》 | pink | たかやん・春猿火 |

> **意义**：该系列是神椿体系中少见的"持续连载型"创作企划，也是春猿火确立说唱身份的关键路径——{{spoiler::她实际上是在进入神椿之后才真正开始认真挑战 rap 的}}，自由律系列正是这段成长的可视化记录。2026 年发行的专辑《[自由律](/zh/albums/harusaruhi/harusaruhi-jiyuritsu)》即以此系列命名，成为其音乐生涯的命名原点。`
      },
      {
        heading: '## 配音作品',
        body: `| 年份 | 作品 | 角色 | 类别 |
| :--- | :--- | :--- | :--- |
| 2025 | 《[神椿市建设中。](/zh/projects/arg/kamitsubaki-city)》 | **朝主派流** | 电视动画 |
| 2025 | 《[神椿市建設中。REGENERATE](/zh/projects/city-project/city-games/kamitsubaki-city-regenerate)》 | **朝主派流** | 游戏 |

> **朝主派流**（{{ruby::朝主派流::あさぬしはる::asanushi haru}}）是春猿火在《神椿市建设中。》世界观中的对应角色，性格果敢、擅长近身行动，与春猿火本人的舞台气质高度一致。`
      },
      {
        heading: '## 商业 Tie-up 与主题曲',
        body: `| 曲目 | Tie-up | 时期 |
| :--- | :--- | :--- |
| 《Oarana》 | 动画《[地球外少年少女](/zh/projects/unlisted/unknown-lab-projects)》主题歌 | 2022 年 |

> 除动画主题曲外，春猿火亦为 TV 动画《[神椿市建设中。](/zh/projects/arg/kamitsubaki-city)》等企划提供主题曲与插曲，是 V.W.P 中与影像作品结合较为紧密的成员之一。`
      },
      {
        heading: '## 现场演出档案',
        body: `### 春猿火 STREAMING COVER LIVE「シュークリームライブ」

- 以翻唱为核心的线上直播专场系列，是春猿火在无法举办线下演出时期的主要表达场域；
- 曲目横跨动画歌曲、VOCALOID 曲目与 J-ROCK，突出其极具冲击力的说唱与爆发力；
- 后续另推出「シュークリームライブ 2」，延续该系列的线上演出版图。

### 春猿火 1st ONE-MAN LIVE「シャーマニズム」

- **时间**：2021 年 8 月 27 日；
- **结构**：以《詠唱》作为"前部"引入，随后连续演唱《[逆転](/zh/songs/harusaruhi/originals/逆転)》《猛進》《Life Up》《[オオゴト](/zh/songs/harusaruhi/originals/オオゴト)》等核心曲目；
- **命名逻辑**：「シャーマニズム（萨满主义）」与其世界观中"以声音召唤与驱散"的魔女职能相呼应；
- **系列延续**：此后陆续展开「シャーマニズム II」「シャーマニズム III」等专场，形成神椿个人专场中延续性最强的系列之一。`
      },
      {
        heading: '## 个人见解与轶事',
        body: `- **说唱起步**：{{spoiler::进入神椿之后才开始认真挑战 rap}}，此前并非以说唱歌手身份活动；
- **名字由来**：春猿火名字的由来是"秘密"；
- **喜欢的动物**：猫{{spoiler::因为看不懂它在想什么}}与仓鼠{{spoiler::因为看得懂它在想什么}}；
- **称呼偏好**：不喜欢被别人叫作"姐姐"或"大姐头"，大部分时候被称呼为"春ちゃん"；
- **近期沉迷**：泡芙；
- **喜欢的歌手**：supercell、EGOIST，以及 rapper 唾奇；
- **成人礼之后想去的地方**：水族馆。{{spoiler::后来和情绪一起去了。}}
- **擅长的运动**：游泳，{{spoiler::但因为太久没游泳，已经忘记最后一次游泳是什么时候了。}}
- **对神椿的大家**：自称是全员粉丝。{{spoiler::想摸摸花譜的头，想和理芽一起唱摇篮曲，想请教情绪唱歌的技巧。}}
- **声线评价**：{{spoiler::因为声线和唱法的变化幅度很大，曾被调侃有"多重人格"。}}`
      }
    ],
    ja: [
      {
        heading: '## 造形・ビジュアル資料',
        body: `春猿火のキャラクターデザインはイラストレーター**穂竹藤丸**が担当し、全体に「ストリートの少年感 × 高温の燃焼」という方向性を持つ。

| 項目 | 設定 |
| :--- | :--- |
| 髪 | 黒の腰まであるロングヘア、一部に赤と青のメッシュ |
| 瞳 | 黄色 |
| アクセサリー | チェーンと黄色い麻花結びの飾りが付いたヘッドホン |
| 上着 | 白のノースリーブ、赤のフィンガーレスグローブ、青のオフショルダー |
| 下衣 | 黒のショートパンツとハイカットブーツ |
| ソックス | **左足は破れたロングソックス、右足はストラップ付きの網タイツ**（左右非対称が最大の特徴） |

> 左右非対称のソックスと「破壊—束縛」のモチーフは、彼女の音楽に繰り返し現れる**反抗・傷・自己解放**の主題と呼応しており、V.W.P の中でも最も攻撃的な視覚構成である。`
      },
      {
        heading: '## 「春猿火自由律」シリーズ',
        body: `**「春猿火自由律」**は 2020 年から Twitter 上で連載された短編ラップ企画である。異なるプロデューサーがトラックを提供し、春猿火と **たかやん** が共同で作詞する。「即興の日記」に近い形式で、日常の心情と時代の空気を記録してきた。

| 番号 | 公開日 | 曲名 | Prod. | 作詞 |
| :--- | :--- | :--- | :--- | :--- |
| #01 | 2020-06-13 | 《初見さんラップ》 | Kiyoto | たかやん・春猿火 |
| #02 | 2020-07-04 | 《おうちこもりラップ》 | RIKIYA | たかやん・春猿火 |
| #03 | 2020-08-05 | 《平和祈るラップ》 | Sinato | たかやん・春猿火 |
| #04 | 2020-10-14 | 《ラブレター》 | Piper Beats | たかやん・春猿火 |
| #05 | 2020-12-17 | 《iのアンサー》 | pink | たかやん・春猿火 |

> **意義**：神椿の中で珍しい「連載型」の創作企画であり、春猿火がラッパーとしての identity を確立した主要な道筋である。{{spoiler::実際に本格的にラップへ挑戦し始めたのは神椿に入ってからであり}}、自由律シリーズはその成長の可視化された記録である。2026 年発表のアルバム《[自由律](/ja/albums/harusaruhi/harusaruhi-jiyuritsu)》はこのシリーズから名付けられた。`
      },
      {
        heading: '## 出演・声優作品',
        body: `| 年 | 作品 | 役 | 種別 |
| :--- | :--- | :--- | :--- |
| 2025 | 《[神椿市建設中。](/ja/projects/arg/kamitsubaki-city)》 | **朝主派流** | テレビアニメ |
| 2025 | 《[神椿市建設中。REGENERATE](/ja/projects/city-project/city-games/kamitsubaki-city-regenerate)》 | **朝主派流** | ゲーム |

> **朝主派流**は《神椿市建设中。》世界観における春猿火の対応キャラクターであり、行動力と近接戦を得意とする性格は春猿火本人のステージ上の気質と一致している。`
      },
      {
        heading: '## 商業タイアップと主題歌',
        body: `| 曲 | Tie-up | 時期 |
| :--- | :--- | :--- |
| 《Oarana》 | アニメ《地球外少年少女》主題歌 | 2022 年 |

> アニメ主題歌のほか、TV アニメ《[神椿市建設中。](/ja/projects/arg/kamitsubaki-city)》などにも主題歌・挿入歌を提供しており、V.W.P の中でも映像作品との結びつきが強いメンバーの一人である。`
      },
      {
        heading: '## ライブアーカイヴ',
        body: `### 春猿火 STREAMING COVER LIVE「シュークリームライブ」

- カバーを中心としたオンライン配信ライブシリーズで、オフライン公演が難しい時期における春猿火の主要な表現の場であった；
- アニソン、ボカロ曲、J-ROCK まで幅広く選曲し、圧倒的なラップと爆発力を際立たせた；
- 続編として「シュークリームライブ 2」も制作され、シリーズとして定着している。

### 春猿火 1st ONE-MAN LIVE「シャーマニズム」

- **日時**：2021 年 8 月 27 日；
- **構成**：《詠唱》を「前部」として導入し、その後《[逆転](/ja/songs/harusaruhi/originals/逆転)》《猛進》《Life Up》《[オオゴト](/ja/songs/harusaruhi/originals/オオゴト)》などの中核曲を連続して歌唱；
- **命名の論理**：「シャーマニズム（呪術・薩満）」は、声で呼び寄せ祓うという魔女の職能と響き合う；
- **シリーズ展開**：のちに「シャーマニズム II」「シャーマニズム III」へと続き、神椿の個人公演の中でも最も連続性の強いシリーズのひとつとなった。`
      },
      {
        heading: '## 人物像とエピソード',
        body: `- **ラップの出発点**：{{spoiler::本格的にラップへ挑戦し始めたのは神椿に入ってから}}で、それ以前はラッパーとして活動していたわけではない；
- **名前の由来**：春猿火という名前の由来は「秘密」；
- **好きな動物**：猫{{spoiler::考えていることが読めないから}}とハムスター{{spoiler::考えていることが読めるから}}；
- **呼ばれ方**：姉や姐さんと呼ばれるのは好まず、多くは「春ちゃん」と呼ばれる；
- **最近の推し**：シュークリーム；
- **好きな歌手**：supercell、EGOIST、ラッパーの唾奇；
- **成人式の後に行きたい場所**：水族館。{{spoiler::のちに情緒と一緒に行った。}}
- **得意な運動**：水泳。{{spoiler::ただし長く泳いでおらず、最後に泳いだのがいつかも忘れてしまった。}}
- **神椿のメンバーについて**：全員のファンだと公言している。{{spoiler::花譜の頭を撫でたい、理芽と一緒に子守唄を歌いたい、情緒に歌のコツを教わりたい。}}
- **声の評価**：{{spoiler::声質と歌唱法の振れ幅が大きいため、多重人格ではないかとからかわれたことがある。}}`
      }
    ],
    en: [
      {
        heading: '## Visual Design Archive',
        body: `HARUSARUHI's character design is by the illustrator **Hotake Fujimaru**, oriented around a "streetwise youth × high-temperature combustion" aesthetic.

| Element | Setting |
| :--- | :--- |
| Hair | Waist-length black hair with red and blue streaks |
| Eyes | Yellow |
| Accessories | Headphones with a chain and a yellow braided-knot ornament |
| Upper | White sleeveless top, red fingerless gloves, blue off-shoulder jacket |
| Lower | Black shorts and high-cut boots |
| Socks | **Torn long sock on the left leg, strapped mesh tights on the right** — the asymmetric detail is her signature |

> The asymmetrical socks and the "fracture–binding" motif echo the themes of **defiance, wounds and self-liberation** that recur throughout her music, making her the most aggressive visual composition in V.W.P.`
      },
      {
        heading: '## The "HARUSARUHI Jiyuuritsu" Series',
        body: `**"HARUSARUHI Jiyuuritsu"** is a short-form rap series she posted on Twitter from 2020 onward. Different producers supplied the tracks while HARUSARUHI and **Takayan** co-wrote lyrics, recording everyday moods and the temper of the times in something close to an improvised diary.

| No. | Date | Track | Prod. | Lyrics |
| :--- | :--- | :--- | :--- | :--- |
| #01 | 2020-06-13 | "Shokunin-san Rap" | Kiyoto | Takayan / HARUSARUHI |
| #02 | 2020-07-04 | "Ouchi Komori Rap" | RIKIYA | Takayan / HARUSARUHI |
| #03 | 2020-08-05 | "Heiwa Inoru Rap" | Sinato | Takayan / HARUSARUHI |
| #04 | 2020-10-14 | "Love Letter" | Piper Beats | Takayan / HARUSARUHI |
| #05 | 2020-12-17 | "i no Answer" | pink | Takayan / HARUSARUHI |

> **Significance**: a rare serialised creative project within KAMITSUBAKI, and the main path by which HARUSARUHI established her identity as a rapper — {{spoiler::she only began seriously taking on rap after joining the studio}}. The 2026 album *[Jiyuuritsu](/en/albums/harusaruhi/harusaruhi-jiyuritsu)* takes its title from this series.`
      },
      {
        heading: '## Voice Acting Roles',
        body: `| Year | Work | Role | Type |
| :--- | :--- | :--- | :--- |
| 2025 | *[KAMITSUBAKI CITY UNDER CONSTRUCTION](/en/projects/arg/kamitsubaki-city)* | **Asanushi Haru** | TV anime |
| 2025 | *[KAMITSUBAKI CITY REGENERATE](/en/projects/city-project/city-games/kamitsubaki-city-regenerate)* | **Asanushi Haru** | Game |

> **Asanushi Haru** is HARUSARUHI's corresponding character in the *KAMITSUBAKI CITY* setting; her decisiveness and preference for close-quarters action match HARUSARUHI's own stage temperament.`
      },
      {
        heading: '## Commercial Tie-ups and Theme Songs',
        body: `| Track | Tie-up | Period |
| :--- | :--- | :--- |
| "Oarana" | Theme song for the anime *Extraterrestrial Boys and Girls* | 2022 |

> Beyond anime themes, HARUSARUHI has supplied theme songs and inserts for projects including the TV anime *[KAMITSUBAKI CITY UNDER CONSTRUCTION](/en/projects/arg/kamitsubaki-city)*, making her one of the members most closely bound to filmed works.`
      },
      {
        heading: '## Live Performance Archive',
        body: `### HARUSARUHI STREAMING COVER LIVE "Choux Cream Live"

- A cover-driven online streaming series that served as her primary outlet when physical shows were difficult.
- The set lists ranged across anime songs, Vocaloid tracks and J-rock, foregrounding her forceful rap delivery and explosive energy.
- A sequel, "Choux Cream Live 2", followed, establishing the series as a fixture.

### HARUSARUHI 1st ONE-MAN LIVE "Shamanism"

- **Date**: 27 August 2021.
- **Structure**: opened with "Juju" as a "prelude", then ran through core songs including "[Gyakuten](/en/songs/harusaruhi/originals/逆転)", "Moushin", "Life Up" and "[Oogoto](/en/songs/harusaruhi/originals/オオゴト)".
- **Naming logic**: "shamanism" resonates with the witch's function of summoning and dispelling through voice.
- **Series continuation**: followed by "Shamanism II" and "Shamanism III", making it one of the most continuous solo concert series in KAMITSUBAKI.`
      },
      {
        heading: '## Personality and Anecdotes',
        body: `- **Rap origins**: {{spoiler::she only started seriously taking on rap after joining KAMITSUBAKI}} and had not previously worked as a rapper.
- **Name origin**: the reason behind the name HARUSARUHI is "a secret".
- **Favourite animals**: cats {{spoiler::because she cannot read what they are thinking}} and hamsters {{spoiler::because she can}}.
- **How she likes to be addressed**: she dislikes being called "big sister" or "boss" and is mostly called "Haru-chan".
- **Current obsession**: choux cream.
- **Favourite artists**: supercell, EGOIST, and the rapper Tsubaki.
- **Where she wants to go after coming of age**: the aquarium. {{spoiler::She later went with ISEKAIJOUCHO.}}
- **Sport she is good at**: swimming — {{spoiler::though she has not swum in so long that she has forgotten when the last time was.}}
- **On her colleagues**: she says she is a fan of every KAMITSUBAKI member. {{spoiler::She wants to pat KAF on the head, sing a lullaby with RIM, and ask ISEKAIJOUCHO for singing tips.}}
- **On her voice**: {{spoiler::because the range of her timbre and technique is so wide, she has been teased about having multiple personalities.}}`
      }
    ]
  },
  koko: {
    zh: [
      {
        heading: '## 角色视觉形象与造型档案',
        body: `幸祜的形象由设计师 **[SWAV](/zh/artists/creators/koko)** 设计，是 V.W.P 中最具"机能战术风"的一体化造型：

| 部位 | 细节 |
| :--- | :--- |
| 发色与发型 | 及腰双色长发，上端为灰／黑色，末梢部分为紫／蓝色，闪耀金属质感 |
| 瞳色与面部 | 紫色瞳，**右侧眼角有两枚泪痣** |
| 配饰 | 双耳佩戴圆形金属耳环；颈部有颈环，中央亦有圆形金属配饰 |
| 上装 | 黑色短夹克，内着灰黑色露脐紧身衣，外加皮质背心，上着紫／白色领带 |
| 下装 | 灰黑色紧身短裤，腰际与腹股沟处有战术风绑带，两侧配有机能风小包 |
| 袜与鞋 | 黑色皮质光泽紧身袜，其内侧与右靴膝盖处开放；鞋子为高帮运动鞋 |
| 其他 | 左手戴有手套 |

**造型演进**

- **2021 年 3 月 13 日**：于花譜「不可解弐 Q2」中首次展示 3D 形象与「{{ruby::花魁鳥::おいらどり::oiradori}}」着装，该礼装原设由 [PALOW.](/zh/artists/creators/palow) 设计；
- **2021 年 12 月 29 日**：于个人 1st ONE-MAN LIVE「PLAYER」中展示由 SWAV 设计的新衣装 **「Type-real Alnair」**，发型改为高马尾，服装变为夹克配短裙的设计，运动鞋亦一并换新。`
      },
      {
        heading: '## 配音作品',
        body: `| 年份 | 作品 | 角色 | 类别 |
| :--- | :--- | :--- | :--- |
| 2025 | 《[神椿市建设中。](/zh/projects/arg/kamitsubaki-city)》 | **輪廻此処** | 电视动画 |
| 2025 | 《[神椿市建設中。REGENERATE](/zh/projects/city-project/city-games/kamitsubaki-city-regenerate)》 | **輪廻此処** | 游戏 |

> **輪廻此処**（{{ruby::輪廻此処::りんねここ::rinne koko}}）是幸祜在《神椿市建设中。》世界观中的对应角色。`
      },
      {
        heading: '## 商业 Tie-up 与主题曲',
        body: `| 曲目 | Tie-up | 时期 |
| :--- | :--- | :--- |
| 《ASH》 | 新·学园 RPG《モナーク / Monark》插曲 | 2021 年 |
| 《TIME》 | TV 动画《五亿年按钮》片头曲 | 2022 年 |
| 《私を纏う》 | 游戏《制服女友》片头曲 | 2023 年 |

> 幸祜的歌曲频繁被游戏与动画起用，其高穿透力的摇滚声线在"战斗／抗争"语境中具有极高的适配度。`
      },
      {
        heading: '## 现场演出档案',
        body: `- **幸祜 STREAMING COVER LIVE「あられライブ / ARARE」系列**：以翻唱为核心的线上直播专场，另有「あられライブ 2 / ARARE2」，是幸祜在个人专场之外最主要的持续演艺场域；
- **幸祜 1st ONE-MAN LIVE「PLAYER」**：2021 年 12 月 29 日举办，本场公开了由 SWAV 设计的新衣装「Type-real Alnair」；{{spoiler::在演出前夕，幸祜曾以钢琴弹唱自己的原创曲《harmony》。}}
- **幸祜 2nd ONE-MAN LIVE「PLAYERII -神椿市肆番街-」**：以"神椿市肆番街"为题，把个人专场与《神椿市建设中。》的世界观街区分区命名体系直接连接；
- **SINGULARITY LIVE vol.2**：与[春猿火](/zh/artists/vwp/harusaruhi)的双人专场，两人以截然不同的声线取向（高穿透摇滚 × 高密度饶舌）构成强烈对撞。`
      },
      {
        heading: '## 轶事与圈内文化',
        body: `- **投稿格式**：翻唱曲的编号写作「No.xxx」，简介处固定使用「歌ってみました。No.xxx TO BE CONTINUE.」；
- **眼镜属性**：拥有 4 副有度数的眼镜（红色镜框、蓝色镜框、圆框，以及一副一低头就会掉的黑框）。非必要戴眼镜或没戴隐形的场合，会把眼镜挂在领口、视野模糊地走路，{{spoiler::之后便会弄丢眼镜。}}
- **话痨**：发推数量与频率极高，会分享生活中的趣事与奇思妙想，{{spoiler::话痨程度被称为神椿第一。}}
- **社恐阴角**：早期神椿直播企划中，与他人共同参加活动时经常一言不发（自闭），与网络上的形象反差极大，且说话非常容易咬舌头。{{spoiler::虽然社恐在后期有所改善，但咬舌头的毛病依然时常出现。}}
- **画伯**：绘画技巧非常"强大"（抽象意义上）。绘制的宠物猫「**ネ祜**」（谐音猫 neko）是全神椿最受欢迎的形象之一，相关周边是神椿展上最快售罄的商品；后来她绘制了各种场景的ネ祜，甚至用作会限壁纸。{{spoiler::在「現象」live 前夕，她为 V.W.P 其他四人绘制了不同类型的ネ祜，并制作了里版的「魔女集会·現象」Live 宣传画，名为「言笑·ネ祜集会」。}}
- **天然呆**：录歌时忘记摘口罩被提醒；把自己的耳机忘在冰箱里；开车去买特价菜，结果因为太兴奋把车留在了超市。直播时也憨憨的；
- **电波系**：会在推特上发一些不明所以的奇思妙想；
- **舞台反差**：虽然社恐，但 Live 时台风极好，YouTube 单人直播效果也很好（且是直播时间劳模），兼具可爱与帅气，平时和唱歌时会切换模式；
- **生活观**：随和温柔、珍惜生活。小时候写下的梦想是"**普通而幸福地活着**"；
- **二次元**：选曲基本都是动画歌曲与术力口；
- **游戏玩家**：喜欢射击游戏，玩过 PUBG，接触过 APEX，会打雀魂；{{spoiler::曾在第一次 V.G.P 里大开杀戒（斯普拉遁），也因为玩《阿尔宙斯》摸了很久的鱼。打游戏的时候会张嘴散热。}}
- **唱歌习惯**：唱歌时喜欢用右脚打拍子；录歌时把打拍子的声音录了进去，于是选择脱掉鞋子录音。{{spoiler::Live 时也可以看到她喜欢抖右腿。}}
- **表情包之王**：YouTube 直播时能截出大量生草表情与 GIF；
- **海外经历**：曾经在海外留过学，因此英语口音很好；
- **厨神**：{{spoiler::第一次烤面包把面包烤焦了，还把图片发给了春酱；第二次终于做出了正常的食物。}}
- **钢琴**：会弹钢琴，{{spoiler::曾在「PLAYER」前夕弹唱自己的原创曲《harmony》。}}
- **追星成功**：在加入 V.W.P 之前，本人就是观测者；
- **平行人生**：{{spoiler::如果没有加入 V.W.P 成为幸祜，就会去音乐学校当鼓手讲师。曾是某个独立乐队的鼓手。}}
- **性格**：坚忍、认真、笨拙而纯粹、一往无前，同时也会在心里和暗地里默默替他人着想；{{spoiler::然而正是这样温柔而不懂变通的性格，让她吃过很多哑巴亏，甚至被自己信任的人背叛伤害过。}}`
      },
      {
        heading: '## V.W.P 成员互动档案',
        body: `幸祜自出道以来便在 Twitter 上持续分享与神椿其他成员的互动合影，被粉丝戏称为"神椿第一后宫王"。以下为已记录的互动节点：

| 时间 | 互动内容 |
| :--- | :--- |
| 2020-11-07 | 发布与其他 4 位成员会面的合影 |
| 2020-11-11 | 恰逢 Pocky 日，发布与[理芽](/zh/artists/vwp/rim)的合影 |
| 2020-11-24 | 发布与[春猿火](/zh/artists/vwp/harusaruhi)在涩谷购物的合影 |
| 2020-12-01 | 发布与[ヰ世界情绪](/zh/artists/vwp/isekaijoucho)的冬装合影 |
| 2020-12-08 | 发布与[花譜](/zh/artists/vwp/kaf)雪中约会（？）的短视频 |
| 2021-01-07 | 发布与春猿火碰面的合影 |
| 2021-02-09 | 发布与理芽一起选购巧克力的合影 |

> 这些互动记录构成了 V.W.P"魔女集会"关系网的重要民间史料，也从侧面印证了五人组合在正式结成前后的真实交流密度。`
      }
    ],
    ja: [
      {
        heading: '## 造形・ビジュアル資料',
        body: `幸祜の造形はデザイナー **[SWAV](/ja/artists/creators/koko)** によるもので、V.W.P の中でもっとも「機能的・タクティカル」な一体型デザインである。

| 部位 | 詳細 |
| :--- | :--- |
| 髪 | 腰までのツートンロング。上は灰／黒、毛先は紫／青で金属的な質感 |
| 瞳と顔 | 紫の瞳、**右の目尻に泣きぼくろが二つ** |
| アクセサリー | 両耳に丸い金属ピアス、首にチョーカー（中央にも丸い金属装飾） |
| 上着 | 黒のショートジャケット、灰黒のへそ出しインナー、レザーベスト、紫／白のネクタイ |
| 下衣 | 灰黒のショートパンツ、腰と股関節部にタクティカルなストラップ、両側に機能的なポーチ |
| ソックスと靴 | 黒のレザー調光沢タイツ（内側と右ブーツの膝部分がオープン）、ハイカットスニーカー |
| その他 | 左手にグローブ |

**造形の変遷**

- **2021 年 3 月 13 日**：花譜「不可解弐 Q2」にて 3D 姿と「{{ruby::花魁鳥::おいらどり::oiradori}}」の衣装を初披露。この礼装の原案は [PALOW.](/ja/artists/creators/palow)；
- **2021 年 12 月 29 日**：1st ONE-MAN LIVE「PLAYER」にて SWAV デザインの新衣装 **「Type-real Alnair」** を披露。髪はハイポニーテール、衣装はジャケット＋スカートに刷新され、スニーカーも新調された。`
      },
      {
        heading: '## 出演・声優作品',
        body: `| 年 | 作品 | 役 | 種別 |
| :--- | :--- | :--- | :--- |
| 2025 | 《[神椿市建設中。](/ja/projects/arg/kamitsubaki-city)》 | **輪廻此処** | テレビアニメ |
| 2025 | 《[神椿市建設中。REGENERATE](/ja/projects/city-project/city-games/kamitsubaki-city-regenerate)》 | **輪廻此処** | ゲーム |

> **輪廻此処**は《神椿市建设中。》世界観における幸祜の対応キャラクターである。`
      },
      {
        heading: '## 商業タイアップと主題歌',
        body: `| 曲 | Tie-up | 時期 |
| :--- | :--- | :--- |
| 《ASH》 | 新・学園 RPG《モナーク／Monark》挿入歌 | 2021 年 |
| 《TIME》 | TV アニメ《五億年ボタン》オープニング | 2022 年 |
| 《私を纏う》 | ゲーム《制服彼女》オープニング | 2023 年 |

> 幸祜の楽曲はゲームやアニメに起用されることが多く、その高い穿透力のロックボーカルは「戦い／抗い」の文脈と極めて相性が良い。`
      },
      {
        heading: '## ライブアーカイヴ',
        body: `- **幸祜 STREAMING COVER LIVE「あられライブ / ARARE」シリーズ**：カバー中心のオンライン配信ライブ。「あられライブ 2 / ARARE2」も制作され、個人公演以外で最も継続的な表現の場となっている；
- **幸祜 1st ONE-MAN LIVE「PLAYER」**：2021 年 12 月 29 日開催。SWAV デザインの新衣装「Type-real Alnair」が公開された。{{spoiler::公演の直前には、ピアノ弾き語りで自身のオリジナル曲《harmony》を披露している。}}
- **幸祜 2nd ONE-MAN LIVE「PLAYERII -神椿市肆番街-」**：個人公演と《神椿市建設中。》の街区命名体系を直接結びつけたタイトル；
- **SINGULARITY LIVE vol.2**：[春猿火](/ja/artists/vwp/harusaruhi)とのツーマンライブ。全く異なる声質（高穿透ロック × 高密度ラップ）が強くぶつかり合う構成となった。`
      },
      {
        heading: '## エピソードと界隈の文化',
        body: `- **投稿フォーマット**：カバー曲の番号は「No.xxx」と表記し、概要欄には「歌ってみました。No.xxx TO BE CONTINUE.」と定型で記す；
- **メガネ属性**：度入りのメガネを 4 本所持（赤縁、青縁、丸縁、そして頭を下げると落ちる黒縁）。必要な場面やコンタクトをしていない場面ではメガネを襟元にかけたまま、視界のぼやけた状態で歩き、{{spoiler::その後メガネを失くしてしまう。}}
- **おしゃべり**：ツイートの数と頻度が極めて多く、日常の出来事や奇想を共有する。{{spoiler::そのおしゃべりぶりは神椿一と称される。}}
- **人見知り・陰キャ**：初期の神椿配信企画では、他メンバーと一緒の場面でほとんど発言しないことが多く、ネット上の姿とのギャップが非常に大きかった。また非常に噛みやすい。{{spoiler::人見知りは後期に改善されたが、噛み癖は今も頻繁に現れる。}}
- **画伯**：絵の技術が「非常に強い」（抽象的な意味で）。描いた飼い猫「**ネ祜**」（猫 neko の音）は神椿で最も人気のある図像のひとつで、関連グッズは神椿展で最速で完売した。のちに様々なシチュエーションのネ祜を描き、会限壁紙にも使用。{{spoiler::「現象」ライブの直前には V.W.P の他の四人それぞれのネ祜を描き、裏版の「魔女集会・現象」ライブ告知ビジュアルを制作した（題して「言笑・ネ祜集会」）。}}
- **天然**：レコーディング時にマスクを外し忘れて注意された／自分のヘッドホンを冷蔵庫に忘れた／特売の食材を買いに車で出かけ、興奮のあまり車をスーパーに置いて帰った。配信でもどこかとぼけている；
- **電波系**：ツイッターで時折、脈絡のない奇想を投稿する；
- **ステージとのギャップ**：人見知りでありながらライブの佇まいは非常に良く、YouTube の单人配信も好評（しかも配信時間の働き者）。可愛さと格好良さを併せ持ち、普段と歌唱時でモードが切り替わる；
- **生活観**：穏やかで優しく、生活を大切にする。子供の頃に書いた夢は「**普通に幸せに生きる**」；
- **二次元**：選曲はほぼアニソンとボカロ；
- **ゲーマー**：シューティングが好きで、PUBG を遊び、APEX にも触れ、雀魂も打つ。{{spoiler::最初の V.G.P では大暴れし（スプラトゥーン）、《アルセウス》で長時間サボったこともある。ゲーム中は口を開けて放熱する。}}
- **歌唱時の癖**：歌うときは右足で拍子を取る。録音時にその拍子の音が入ってしまったため、靴を脱いで録音した。{{spoiler::ライブでも右足をよく揺らしているのが分かる。}}
- **ミームの王**：YouTube 配信では大量の草生える表情と GIF が切り出せる；
- **海外経験**：かつて海外に留学していたため、英語の発音が良い；
- **料理の達人**：{{spoiler::最初にパンを焼いたときは焦がしてしまい、その写真を春ちゃんに送った。二度目でようやく普通の食べ物ができた。}}
- **ピアノ**：ピアノが弾ける。{{spoiler::「PLAYER」の直前には自身のオリジナル曲《harmony》を弾き語りした。}}
- **夢の追跡**：V.W.P に加入する前から、本人は観測者であった；
- **もうひとつの人生**：{{spoiler::V.W.P の幸祜になっていなければ、音楽学校でドラムの講師になるつもりだった。かつてとあるインディーズバンドのドラマーだった。}}
- **性格**：忍耐強く、真面目で、不器用なほど純粋、一直線。同時に心の中で、そして陰で他者のために動く。{{spoiler::しかし、そうした優しく不器用な性格ゆえに多くの損をしてきて、信頼していた人に裏切られ傷ついたこともある。}}`
      },
      {
        heading: '## V.W.P メンバーとの交流記録',
        body: `幸祜はデビュー以来、神椿の他メンバーとの交流写真をツイッターで継続的に公開しており、ファンからは「神椿一のハーレム王」とからかわれている。以下は記録された主な交流である。

| 日付 | 内容 |
| :--- | :--- |
| 2020-11-07 | 他の 4 名との集合写真を公開 |
| 2020-11-11 | ポッキーの日に[理芽](/ja/artists/vwp/rim)との写真を公開 |
| 2020-11-24 | [春猿火](/ja/artists/vwp/harusaruhi)と渋谷で買い物した写真を公開 |
| 2020-12-01 | [ヰ世界情緒](/ja/artists/vwp/isekaijoucho)との冬服ツーショットを公開 |
| 2020-12-08 | [花譜](/ja/artists/vwp/kaf)との雪中デート（？）動画を公開 |
| 2021-01-07 | 春猿火と会った際の写真を公開 |
| 2021-02-09 | 理芽と一緒にチョコレートを選ぶ写真を公開 |

> これらの記録は V.W.P「魔女集会」の関係網を知る上での重要な民間史料であり、五人組が正式に結成される前後の実際の交流密度を裏付けている。`
      }
    ],
    en: [
      {
        heading: '## Visual Design Archive',
        body: `KOKO's design is by **[SWAV](/en/artists/creators/koko)** and is the most tactical, integrated look in V.W.P.

| Part | Detail |
| :--- | :--- |
| Hair | Waist-length two-tone hair, grey/black at the top and purple/blue at the tips, with a metallic sheen |
| Eyes and face | Purple eyes, **two tear moles at the outer corner of the right eye** |
| Accessories | Round metal earrings; a choker with a round metal ornament at its centre |
| Upper | Black cropped jacket over a grey-black midriff top, leather vest, purple/white tie |
| Lower | Grey-black fitted shorts with tactical straps at the waist and groin and utility pouches at the hips |
| Socks and shoes | Glossy black leather-look tights, open on the inner side and at the right boot's knee; high-top sneakers |
| Other | A glove on the left hand |

**Design evolution**

- **13 March 2021**: her 3D model and the "{{ruby::花魁鳥::おいらどり::oiradori}}" attire were shown for the first time at KAF's "Fukakai Two Q2", the dress originally designed by [PALOW.](/en/artists/creators/palow).
- **29 December 2021**: at her 1st ONE-MAN LIVE "PLAYER" she unveiled the SWAV-designed **"Type-real Alnair"**, with hair in a high ponytail, the outfit reworked into a jacket and skirt, and new sneakers.`
      },
      {
        heading: '## Voice Acting Roles',
        body: `| Year | Work | Role | Type |
| :--- | :--- | :--- | :--- |
| 2025 | *[KAMITSUBAKI CITY UNDER CONSTRUCTION](/en/projects/arg/kamitsubaki-city)* | **Rinne Koko** | TV anime |
| 2025 | *[KAMITSUBAKI CITY REGENERATE](/en/projects/city-project/city-games/kamitsubaki-city-regenerate)* | **Rinne Koko** | Game |

> **Rinne Koko** is KOKO's corresponding character within the *KAMITSUBAKI CITY* setting.`
      },
      {
        heading: '## Commercial Tie-ups and Theme Songs',
        body: `| Track | Tie-up | Period |
| :--- | :--- | :--- |
| "ASH" | Insert song for the school RPG *Monark* | 2021 |
| "TIME" | Opening theme for the TV anime *The 500 Million Year Button* | 2022 |
| "Watashi wo Matou" | Opening theme for the game *Seifuku Kanojo* | 2023 |

> KOKO's songs are frequently licensed for games and anime; her piercing rock vocal sits especially well with contexts of struggle and defiance.`
      },
      {
        heading: '## Live Performance Archive',
        body: `- **KOKO STREAMING COVER LIVE "Arare / ARARE" series**: cover-focused online streaming shows, followed by "Arare Live 2 / ARARE2" — her most continuous outlet outside solo concerts.
- **KOKO 1st ONE-MAN LIVE "PLAYER"** (29 December 2021): premiered the SWAV-designed "Type-real Alnair". {{spoiler::Just before the show she performed her original "harmony" on piano.}}
- **KOKO 2nd ONE-MAN LIVE "PLAYERII -Kamitsubaki City Yonban-gai-"**: directly links her solo concert to the district-naming system of *KAMITSUBAKI CITY*.
- **SINGULARITY LIVE vol.2**: a two-man live with [HARUSARUHI](/en/artists/vwp/harusaruhi), pitting two utterly different vocal approaches — piercing rock against dense rap — against each other.`
      },
      {
        heading: '## Anecdotes and Community Culture',
        body: `- **Upload format**: her covers are numbered "No.xxx" and the description always reads "歌ってみました。No.xxx TO BE CONTINUE."
- **The glasses trait**: she owns four pairs of prescription glasses (red frames, blue frames, round frames, and a black pair that slips off whenever she lowers her head). When she does not need them or is not wearing contacts she hangs them from her collar and walks around with blurred vision, {{spoiler::and then loses them.}}
- **The talker**: she tweets extremely often and at great length, sharing daily incidents and whims — {{spoiler::her chattiness is reputed to be the greatest in KAMITSUBAKI.}}
- **Shy introvert**: in early KAMITSUBAKI streams she would often stay silent when appearing with others, a stark contrast to her online persona, and she trips over her words very easily. {{spoiler::The shyness improved later, but the verbal stumbles persist.}}
- **The artist**: her drawing ability is "very strong" in the abstract sense. Her cat drawing "**Nekoko**" (a pun on *neko*) is one of the most beloved images in KAMITSUBAKI, and its merchandise sold out fastest at the studio's exhibitions; she later drew Nekoko in many situations, even using it as a members-only wallpaper. {{spoiler::On the eve of the "Phenomenon" live she drew a different Nekoko for each of the other four V.W.P members and produced an alternative "Witch Assembly · Phenomenon" promo image titled "Gen Warai · Nekoko Assembly".}}
- **Scatterbrained**: reminded at a recording session that she still had her mask on; left her headphones in the fridge; drove out to buy discounted groceries and, in her excitement, left the car at the supermarket.
- **Offbeat streak**: she occasionally posts entirely unexplained musings on Twitter.
- **Stage contrast**: despite the shyness she has superb stage presence and her solo YouTube streams work well too — and she is a workhorse of streaming hours. Cute and cool at once, she switches modes between everyday and singing.
- **Outlook on life**: easygoing, gentle, and appreciative of ordinary life. The dream she wrote down as a child was to "**live ordinarily and happily**."
- **Anime fan**: her cover selections are almost all anime songs and Vocaloid tracks.
- **Gamer**: fond of shooters, has played PUBG and tried APEX, and plays Mahjong Soul. {{spoiler::She once went on a rampage in the first V.G.P event (Splatoon) and idled for a long stretch over *Legends: Arceus*. She opens her mouth to cool down while gaming.}}
- **Singing habit**: she keeps time with her right foot while singing; because the tapping got into a recording she took her shoes off to record. {{spoiler::You can see the right leg bouncing during lives too.}}
- **Meme royalty**: her YouTube streams yield a huge volume of reaction faces and GIFs.
- **Overseas experience**: she once studied abroad, which is why her English pronunciation is good.
- **Would-be chef**: {{spoiler::her first attempt at baking bread burned it and she sent the photo to Haru-chan; the second attempt finally produced something edible.}}
- **Piano**: she can play, {{spoiler::and performed her original "harmony" on piano just before "PLAYER".}}
- **A fan who made it**: before joining V.W.P she was herself an observer.
- **The other path**: {{spoiler::had she not become KOKO of V.W.P, she would have become a drum instructor at a music school — she was once the drummer in an indie band.}}
- **Character**: persevering, earnest, awkwardly pure and unstoppable, while quietly looking out for others in her own way. {{spoiler::Yet precisely this gentle inflexibility has cost her dearly, and she has been hurt by people she trusted.}}`
      },
      {
        heading: '## Interactions with V.W.P Members',
        body: `Since her debut KOKO has continually posted photos of her interactions with other KAMITSUBAKI members on Twitter, earning her the fan nickname "the studio's number-one harem king". The following are documented milestones.

| Date | Interaction |
| :--- | :--- |
| 2020-11-07 | Posted a group photo with the other four members |
| 2020-11-11 | Posted a photo with [RIM](/en/artists/vwp/rim) on Pocky Day |
| 2020-11-24 | Posted a photo shopping in Shibuya with [HARUSARUHI](/en/artists/vwp/harusaruhi) |
| 2020-12-01 | Posted a winter-outfit photo with [ISEKAIJOUCHO](/en/artists/vwp/isekaijoucho) |
| 2020-12-08 | Posted a short video of a "date in the snow (?)" with [KAF](/en/artists/vwp/kaf) |
| 2021-01-07 | Posted a photo of meeting up with HARUSARUHI |
| 2021-02-09 | Posted a photo choosing chocolates together with RIM |

> These records are important grassroots material for understanding the web of relationships behind V.W.P's "witch assemblies", and they testify to how much the five actually interacted around the time the group was formally formed.`
      }
    ]
  }
};

for (const [id, byLang] of Object.entries(data)) {
  for (const lang of ['zh', 'ja', 'en']) {
    const n = appendSections(`people/solo/${id}`, id, lang, byLang[lang]);
    console.log(`${id}/${lang}: appended ${n} sections`);
  }
}
