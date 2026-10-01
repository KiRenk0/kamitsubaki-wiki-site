import { appendSections as insertSections } from '../entry-append.mjs';

const kaf = {
  zh: [
    {
      heading: '## 角色视觉形象全谱系（形态演进档案）',
      body: `花譜的形象并非固定不变，而是随着演唱会、单曲与世界观的推进持续"羽化"。全部形态均由角色原案 [PALOW.](/zh/artists/creators/palow) 主导设计，并由演出或 MV 首次公开：

| 公开日期 | 形态名称 | 首次公开场合与设计要点 |
| :--- | :--- | :--- |
| 2018-10-18 | **第一形态·{{ruby::雛鳥::ひなどり::hinadori}}** | 出道初形象。藏青色兜帽灰白连帽衫，衫身多为藏青色菱形花纹；兜帽造型取自伙伴「拉普拉斯」（鱼），内穿纯白连衣裙，中长发左右对称扎成双麻花辫垂于胸前，苋红色过膝长袜配紫底白短靴。 |
| 2019-04-12 | **高中生制服形象** | 普通高中生黑色西装制服配百褶裙，黑色水手袜与学生皮鞋。 |
| 2019-06-04 | **短袖形象** | 在原卫衣基础上微调，袖子挽起，长袜换为短袜。 |
| 2019-08-01 | **特殊歌唱用形态·{{ruby::星鴉::ほしがらす::hoshigarasu}}** | 于 1st ONE-MAN LIVE「不可解」公开。礼服保留兜帽与配色，并将拉普拉斯造型特征大胆融入。 |
| 2019-08-02 | **白衬衫形象** | 白色学生衬衫配红色缎带、黑色格子裙与黑色中袜，出现于《命に嫌われている。》MV。 |
| 2019-08-30 | **第一形态·雛鳥·黑** | 于手游《47 HEROINES》合作 MV 中公开。 |
| 2019-09-29 | **特殊歌唱用形态·{{ruby::瑠璃鶲::るりびたき::ruribitaki}}** | 于世界首个 VTuber 新感觉时尚 T 台秀＆音乐 live「FAVRIC」公开。 |
| 2020-03-14 | **第二形态·{{ruby::青雀::あおすずめ::aosuzume}}** | 由 PALOW. 绘制的新形象。{{spoiler::此后花譜大多以该形象进行活动。}} |
| 2020-03-23 | **特殊歌唱形态·{{ruby::隼::はやぶさ::hayabusa}}** | 配合 NTT docomo 联动「HAYABUSA EXPERIENCE by 3.5D × docomo」主题曲《戸惑いテレパシー》公开。外衣灰黑带绿白花纹，内穿较紧身白色连衣裙。 |
| 2020-10-10 | **特殊歌唱用形态·{{ruby::金糸雀::かなりあ::kanaria}}** | 于「不可解弐 Q1」公开。衣装大体与隼相似，亮点在于颜色可在黄绿与藏青之间转换。 |
| 2021-03-13 | **魔女特殊歌唱用形态·{{ruby::花魁鳥::おいらどり::oiradori}}** | 于「不可解弐 Q2」与 V.W.P 另外四人一同公开的魔女集会统一礼装。 |
| 2021-06-12 | **特殊歌唱用形态·金鶏 / 第二形态·青雀黑** | 于「不可解弐 Q3」公开。 |
| 2021-10-18 | **第三形态·{{ruby::燕::つばめ::tsubame}}** | 于《花譜 #88「深化弐」》公布。 |
| 2022-08-24 | **特殊歌唱用形态·{{ruby::軍鶏::しゃも::shamo}} / 燕（壊）** | 于「不可解参（狂）」公开，带有强张力与对立感。 |
| 2022-10-14 | **私服衣装** | 于花譜展3「この時間は、言葉にしなくていいの。」作为主视觉公开，深蓝为主配白色菱形花纹与条纹的短袖连衣裙。 |
| 2022-10-26 | **{{ruby::銀河を統べし花譜::ぎんがをすべしかふ::ginga wo suberu kafu}}** | 于电视节目《バーチャルシンガー花譜の廻れ！MAD TV》公开由花譜本人设计的衣装，后收入 Blu-ray 时正式命名。 |
| 2023-03-04 | **第四形态·{{ruby::雉::きじ::kiji}} / 燕（想）/ 軍鶏（想）** | 于「不可解参（想）」公开。{{spoiler::场刊中 PALOW. 曾记为「軍鶏（解）」，但神椿官网与各媒体报道均采用「軍鶏（想）」，本条目以后者为准。}} |

> **形态命名规律**：花譜的形态几乎全部以鸟类命名（雛鳥、星鴉、瑠璃鶲、青雀、隼、金糸雀、花魁鳥、金鶏、燕、軍鶏、雉），呼应其"雏鸟羽化"的成长母题；而"特殊歌唱用形态"则专门服务于体育馆级大型公演。`
    },
    {
      heading: '## 伙伴与使魔「拉普拉斯」',
      body: `**拉普拉斯**（{{ruby::ラプラス::らぷらす::rapurasu}}）是自企划最初便与花譜相伴的鱼形存在，定位更接近"伙伴"或"使魔"。

- **设计起源**：拉普拉斯并非一开始就有完整设定，而是随着企划推进逐渐被构想成形的；它的形象后来直接被用作花譜第一形态兜帽的造型原型。
- **粉丝认知**：比起运营团队的设想，拉普拉斯以远超预期的速度被观测者喜爱，如今在某种程度上已成为花譜的象征，并在众多原创曲 MV 中现身。{{spoiler::由于体型巨大，不少粉丝都发出过"好大一只拉普拉斯啊！"的惊叹。}}
- **世界观地位**：在花譜的御伽噺声剧线索中，拉普拉斯被推测与"三人得以回到现在"这一核心谜题存在关联。`
    },
    {
      heading: '## 御伽噺（Otogibanashi）声剧与世界观线索',
      body: `**御伽噺**（{{ruby::御伽噺::おとぎばなし::otogibanashi}}）是收录于花譜专辑中的声剧单元，是神椿世界观的重要补充与记录，现已更新至第三幕。其时间线顺序为**第二幕 → 第零幕 → 第一幕**，与常规播放顺序并不一致。

{{details::展开整理出的御伽噺线索与推测}}

**已确认的线索**

1. 第零幕中的"我"与第一幕中的"我"并非同一个人；
2. 第零幕中的我、花譜与**背叛魔女**都来自未来；
3. 背叛魔女的名字是**大河莉莉**；
4. 未来发生了波及全球的世界大战，世界因战争毁灭；
5. 三人曾经历过某种实验，且记忆存在一定程度的缺失；
6. 实验最后背叛魔女做了很过分的事，花譜来到现在的原因之一便是向背叛魔女复仇；
7. 第一幕中的"我"曾与花譜见过面，却忘记了约定、也不相信花譜所说的话；
8. 第二幕的对话发生在未来，第二幕中的"我"与第零幕中的"我"是同一个人；
9. 第二幕中花譜透露自己有一个哥哥；
10. 未来的物资十分匮乏；
11. **嘉年华**是重要线索——它是一场为某种实验而设置、规模超过十万人的筛选行动；
12. 未来毁灭于春天。

**基于线索的推测**

{{spoiler::原创曲的歌词与 PV 中含有世界观线索及剧情；三人能来到现在推测与拉普拉斯有关；推测嘉年华可能是世界大战的诱因；推测三人的实验开始于嘉年华之后；推测花譜的眼睛（黄红蓝三色同心环瞳孔）为实验的结果。}}

{{/details}}`
    },
    {
      heading: '## 配音作品',
      body: `作为虚拟歌手，花譜亦以声优身份参与动画与游戏演出，并在其中延续"森先化歩"这一世界观化身：

| 年份 | 作品 | 角色 | 类别 |
| :--- | :--- | :--- | :--- |
| 2022 | 《Muv-Luv Alternative 第二期》 | XM3 | 电视动画 |
| 2025 | 《[神椿市建设中。](/zh/projects/arg/kamitsubaki-city)》 | **森先化歩** | 电视动画 |
| 2025 | 《[神椿市建設中。REGENERATE](/zh/projects/city-project/city-games/kamitsubaki-city-regenerate)》 | **森先化歩** | 游戏 |

> **森先化歩**（{{ruby::森先化歩::もりさきかほ::morisaki kaho}}）是花譜在《神椿市建设中。》世界观中的对应角色，也是该企划的第一特异点。`
    },
    {
      heading: '## 商业合作、Tie-up 与跨界联动',
      body: `花譜的歌声被大量动画、电影、游戏与商业企划起用，是虚拟歌手进入主流商业体系的代表性案例：

| 时间 | 合作对象 | 曲目 / 内容 |
| :--- | :--- | :--- |
| 2019-06-28 | 电影《ホットギミック ガールミーツボーイ》 | 主题曲《[夜が降り止む前に](/zh/songs/kaf/originals/yoru-ga-furiyamu-mae-ni)》 |
| 2019-09-11 | 音乐游戏《Cytus II》 | 联动合作 |
| 2020-04 | TV 动画《黑色五叶草》第 11 期 | 片尾曲《[アンサー](/zh/songs/kaf/originals/アンサー-answer)》（第 129 话 ED） |
| 2020-04 | 能量饮料 ZONe 企划「超没入」 | 《[危ノーマル](/zh/songs/kaf/originals/危ノーマル-abnormal)》 |
| 2020-07 | Netflix 动画《日本沈没2020》 | 全球终章主题曲《景色》 |
| 2020-07 | NTT docomo 5G 概念线上展 | 《{{ruby::戸惑いテレパシー::とまどいてれぱしー::tomadoi telepathy}}》 |
| 2019-08-30 | 手游《47 HEROINES》 | 合作 MV 与新形态「雛鳥·黑」 |
| 2019-09-29 | 时尚 T 台秀＆音乐 live「FAVRIC」 | 新形态「瑠璃鶲」公开 |
| 2021-05-19 | 剧场版动画《映画大好きポンポさん》 | 插曲《[例えば](/zh/songs/kaf/originals/例えば-for-example)》 |
| 2021-10-18 | 「组曲」跨界企划 | 与主流音乐人（大竹重幸、MAISONdes / ツミキ、岸田繁等）合作 |
| 2022-10 | TV 动画《福星小子》 | 《トウキョウ・シャンディ・ランデヴ feat. 花譜, ツミキ》 |
| 2025-04 | 电视动画《中禅寺先生物怪讲义录》 | 片头主题曲 |

> **关于「组曲」**：花譜自 2021 年活动三周年起启动与现实界音乐人合作的「组曲」企划，第一期共 15 曲，于 2024 年 1 月以与岸田繁合作的《[愛のまま](/zh/songs/kaf/suites/愛のまま-still-in-love)》宣告完结；随后于 2024 年 2 月启动「组曲2」。`
    },
    {
      heading: '## 电台与电视媒体出演',
      body: `- **冠名广播**：《{{ruby::ぱんぱかカフぃ(R)::ぱんぱかかふぃ::panpaka kafi}}》（InterFM），2022 年 4 月起开播，先后推出「上京編」「羽田(夜)編」等篇章，是花譜首次拥有常规地面广播节目；
- **NHK 音乐节目**：2021 年 11 月 15 日登上 NHK《沼にハマってきいてみた》，现场演唱《[過去を喰らう](/zh/songs/kaf/originals/kako-wo-kurau)》与《[海に化ける](/zh/songs/kaf/originals/海に化ける-turn-into-the-sea)》；
- **冠名电视节目**：2022 年 10 月起于 TOKYO MX 播出《バーチャルシンガー花譜の廻れ！MAD TV》，节目中公开了由花譜本人设计的衣装雏形，后命名为「銀河を統べし花譜」。`
    },
    {
      heading: '## 观测者社群与里程碑数据',
      body: `- **粉丝称谓**：粉丝的称号为 **「观测者」**，参与 2019 年众筹的粉丝另称为 **「{{spoiler::共犯者}}」**。此称谓后来亦可泛指神椿旗下 V.W.P 的粉丝群体。
- **众筹奇迹**：2019 年为筹备 1st ONE-MAN LIVE「不可解」，Campfire 众筹目标 500 万日元，最终筹得超过 4000 万日元，约为预定金额的 **8 倍**。{{spoiler::花譜本人被这一数字吓到，随后连发数条推特，并转发运营方对众筹资金处理方式的说明，表示自己会继续加油。}}
- **频道规模**：至 2023 年 2 月，花譜 YouTube 频道订阅约 **77.1 万**，bilibili 频道关注约 **26.3 万**；2024 年 6 月 21 日 YouTube 订阅正式突破 **100 万**。
- **社群文化**：围绕花譜形成了"观测者—共犯者"的双层身份认同，并延伸出"魔女集会"式的集体观演仪式。`
    },
    {
      heading: '## 轶事与圈内文化',
      body: `- **声线与语言力**：在「不可解弐 Q1」上，花譜声明自己的"语言力"为 **530000**，{{spoiler::连乐队四人都忍俊不禁——此处 neta 了《龙珠》中弗利萨战斗力 530000 的设定}}；到「不可解弐 Q2」时，这一指标被本人更新为 **{{spoiler::-53 万}}**。
- **身高愿望**：花譜曾在推特上表示想成长为"八头身"。
- **亲笔签名**：2020 年 12 月 13 日，花譜分享自己为 Fan Club 限定《魔法》专辑亲笔签名的照片。{{spoiler::部分签名会附带小动物图案。据 PIEDPIPER 说明，FC 限定专辑数量达数千规模，签名耗时远超预估，花譜本人也在课余时间积极签名，还请各位耐心等候（粉丝则调侃这是"腱鞘炎危机"）。}}
- **沉淀曲目**：《{{ruby::祭壇::さいだん}}》《{{ruby::宣戦::せんせん}}》《{{ruby::言霊::ことだま}}》三首原创曲曾长期未再演出，{{spoiler::后在 Q2 以出人意料的方式回归。}}
- **碎碎念推文**：「不可解弐 Q1」前，花譜在推特上公开了大量碎碎念，{{spoiler::以至于很多人误以为这些是演唱会内容预告。}}
- **Spoon 假冒事件**：2021 年 1 月至 2 月，日本 Spoon 平台出现系列假冒花譜的直播事件。1 月 11 日凌晨首次出现"花譜@本人"名义的直播，PIEDPIPER 约半小时后澄清并非本人并请求停止，相关账号随后被永久冻结；花譜本人当日回应「モノマネは嬉しいのですが、なりすましは観測者の皆にも誤解させてしまうし、私も困ってしまうのでやめてほしいです！花譜のSpoonアカウント無いです！」，{{spoiler::并在同日把推特昵称改成「花譜@超本人」以防大家分不清真假页面。}}1 月 31 日假冒事件再起，2 月 1 日神椿官方发表声明，表示已将相关投稿与行为作为法律措施提交律师处理；花譜当晚以「**なりすましは！よくない！**」回应，{{spoiler::并半开玩笑地威胁"如果再发生，就让花譜的通用语言变成泰语"。}}
- **合作伙伴**：视觉与 MV 制作长期由川サキ（川サキケンジ）等创作者操刀；词曲方面与 [カンザキイオリ](/zh/artists/creators/kanzaki-iori) 的长期合作被视为神椿美学的基石。`
    }
  ],
  ja: [
    {
      heading: '## 造形・形態の全系譜',
      body: `花譜の姿は固定されたものではなく、ライブ・楽曲・世界観の進行に合わせて「羽化」を続けている。いずれもキャラクター原案 [PALOW.](/ja/artists/creators/palow) が主導し、公演や MV で初公開された。

| 公開日 | 形態名 | 初公開の場とデザイン要点 |
| :--- | :--- | :--- |
| 2018-10-18 | **第一形態・{{ruby::雛鳥::ひなどり::hinadori}}** | デビュー当初の姿。紺色のフード付きグレー白パーカー、紺の菱形紋様、フードの造形は相棒「ラプラス」（魚）に由来。白いワンピース、二本の三つ編み、苋紅色のニーハイソックス。 |
| 2019-04-12 | **高校生制服姿** | 黒のブレザー制服にプリーツスカート、黒のソックスと学生靴。 |
| 2019-06-04 | **半袖姿** | パーカーの袖をまくり、ソックスを短いものに変更。 |
| 2019-08-01 | **特殊歌唱用形態・{{ruby::星鴉::ほしがらす::hoshigarasu}}** | 1st ONE-MAN LIVE「不可解」で公開。フードと配色を保ちつつ、ラプラスの意匠を大胆に取り込んだ礼装。 |
| 2019-08-02 | **白シャツ姿** | 白い学生シャツに赤いリボン、黒いチェック柄のスカート。《命に嫌われている。》MV に登場。 |
| 2019-08-30 | **第一形態・雛鳥・黒** | スマホゲーム《47 HEROINES》コラボ MV で公開。 |
| 2019-09-29 | **特殊歌唱用形態・{{ruby::瑠璃鶲::るりびたき::ruribitaki}}** | 世界初の VTuber 新感覚ファッションショー＆音楽ライブ「FAVRIC」で公開。 |
| 2020-03-14 | **第二形態・{{ruby::青雀::あおすずめ::aosuzume}}** | PALOW. による新造形。{{spoiler::以降、花譜は主にこの姿で活動する。}} |
| 2020-03-23 | **特殊歌唱形態・{{ruby::隼::はやぶさ::hayabusa}}** | NTT docomo 連動「HAYABUSA EXPERIENCE by 3.5D × docomo」テーマ曲《戸惑いテレパシー》に合わせて公開。 |
| 2020-10-10 | **特殊歌唱用形態・{{ruby::金糸雀::かなりあ::kanaria}}** | 「不可解弐 Q1」で公開。衣装は隼に近く、黄緑と紺の間で色が変化する。 |
| 2021-03-13 | **魔女特殊歌唱用形態・{{ruby::花魁鳥::おいらどり::oiradori}}** | 「不可解弐 Q2」で V.W.P の他の四人とともに公開された魔女集会の正装。 |
| 2021-06-12 | **特殊歌唱用形態・金鶏 / 第二形態・青雀黒** | 「不可解弐 Q3」で公開。 |
| 2021-10-18 | **第三形態・{{ruby::燕::つばめ::tsubame}}** | 《花譜 #88「深化弐」》で公布。 |
| 2022-08-24 | **特殊歌唱用形態・{{ruby::軍鶏::しゃも::shamo}} / 燕（壊）** | 「不可解参（狂）」で公開。強い緊張感と対立の趣を持つ。 |
| 2022-10-14 | **私服衣装** | 花譜展3「この時間は、言葉にしなくていいの。」のメインビジュアルとして公開。 |
| 2022-10-26 | **{{ruby::銀河を統べし花譜::ぎんがをすべしかふ::ginga wo suberu kafu}}** | テレビ番組《バーチャルシンガー花譜の廻れ！MAD TV》で公開された花譜本人デザインの衣装。 |
| 2023-03-04 | **第四形態・{{ruby::雉::きじ::kiji}} / 燕（想）/ 軍鶏（想）** | 「不可解参（想）」で公開。{{spoiler::場刊では「軍鶏（解）」と記されたが、公式サイトと各媒体は「軍鶏（想）」を採用しているため本項では後者に従う。}} |

> **命名の法則**：花譜の形態はほぼ全て鳥の名で統一されており（雛鳥・星鴉・瑠璃鶲・青雀・隼・金糸雀・花魁鳥・金鶏・燕・軍鶏・雉）、「雛鳥が羽化する」という成長の主題をなぞっている。`
    },
    {
      heading: '## 相棒・使い魔「ラプラス」',
      body: `**ラプラス**は企画当初から花譜に寄り添う魚型の存在で、いわば「相棒」あるいは「使い魔」にあたる。

- **デザインの起源**：当初から完全な設定があったわけではなく、企画の進行に伴って形作られ、のちに第一形態のフードの造形そのものに採用された。
- **ファンの認知**：運営の想定を超える速さで観測者に愛され、今では花譜の象徴のひとつとなっており、多くのオリジナル曲 MV にも登場する。{{spoiler::あまりに大きいため、「ラプラス大きすぎ！」という驚きの声も多く上がった。}}
- **世界観上の位置**：御伽噺の手がかりにおいて、三人が「現在」へ来られたこととラプラスの関連が推測されている。`
    },
    {
      heading: '## 御伽噺（おとぎばなし）声劇と世界観の手がかり',
      body: `**御伽噺**は花譜のアルバムに収録された声劇ユニットで、神椿世界観の重要な補完と記録にあたる。現在は第三幕まで更新されている。時系列は**第二幕 → 第零幕 → 第一幕**であり、再生順とは一致しない。

{{details::御伽噺から整理された手がかりと推測を開く}}

**確認されている手がかり**

1. 第零幕の「私」と第一幕の「私」は同一人物ではない；
2. 第零幕の私・花譜・**裏切り魔女**はいずれも未来から来ている；
3. 裏切り魔女の名は**大河莉莉**；
4. 未来では世界大戦が起こり、世界は戦争によって滅びた；
5. 三人はある実験を経験しており、記憶に一定程度の欠落がある；
6. 実験の最後に裏切り魔女が非常に過激な行いをなし、花譜が現在へ来た目的の一つは復讐である；
7. 第一幕の「私」は花譜と会ったことがあるのに約束を忘れ、花譜の言葉を信じていない；
8. 第二幕の対話は未来で行われ、第二幕の「私」は第零幕の「私」と同一人物；
9. 第二幕で花譜は自分に兄がいることを明かす；
10. 未来は物資が極度に乏しい；
11. **カーニバル**は重要线索で、ある実験のために設けられた十万人規模の選別行動である；
12. 未来は春に滅びた。

**推測**

{{spoiler::オリジナル曲の歌詞と PV には世界観の线索と筋書きが含まれる；三人が現在へ来られたのはラプラスと関係すると推測される；カーニバルが世界大戦の誘因かもしれない；三人の実験はカーニバルの後に始まったと推測される；花譜の瞳（黄・赤・青の同心円）は実験の結果であると推測される。}}

{{/details}}`
    },
    {
      heading: '## 出演・声優作品',
      body: `| 年 | 作品 | 役 | 種別 |
| :--- | :--- | :--- | :--- |
| 2022 | 《Muv-Luv Alternative 第二期》 | XM3 | テレビアニメ |
| 2025 | 《[神椿市建設中。](/ja/projects/arg/kamitsubaki-city)》 | **森先化歩** | テレビアニメ |
| 2025 | 《[神椿市建設中。REGENERATE](/ja/projects/city-project/city-games/kamitsubaki-city-regenerate)》 | **森先化歩** | ゲーム |

> **森先化歩**は《神椿市建設中。》世界観における花譜の対応キャラクターであり、同企画の第一特異点である。`
    },
    {
      heading: '## 商業タイアップとコラボレーション',
      body: `| 時期 | 相手 | 内容 |
| :--- | :--- | :--- |
| 2019-06-28 | 映画《ホットギミック ガールミーツボーイ》 | 主題歌《[夜が降り止む前に](/ja/songs/kaf/originals/yoru-ga-furiyamu-mae-ni)》 |
| 2019-09-11 | 音楽ゲーム《Cytus II》 | コラボ |
| 2020-04 | TV アニメ《ブラッククローバー》第 11 期 | ED《[アンサー](/ja/songs/kaf/originals/アンサー-answer)》 |
| 2020-04 | ZONe「超没入」企画 | 《[危ノーマル](/ja/songs/kaf/originals/危ノーマル-abnormal)》 |
| 2020-07 | Netflix アニメ《日本沈没2020》 | グランドフィナーレ主題歌《景色》 |
| 2020-07 | NTT docomo 5G コンセプト展 | 《戸惑いテレパシー》 |
| 2019-08-30 | スマホゲーム《47 HEROINES》 | コラボ MV と新形態「雛鳥・黒」 |
| 2019-09-29 | ファッションショー＆音楽ライブ「FAVRIC」 | 新形態「瑠璃鶲」公開 |
| 2021-05-19 | 劇場アニメ《映画大好きポンポさん》 | 挿入歌《[例えば](/ja/songs/kaf/originals/例えば-for-example)》 |
| 2021-10-18 | 「組曲」企画 | 大竹重幸・MAISONdes／ツミキ・岸田繁らとのコラボ |
| 2022-10 | TV アニメ《うる星やつら》 | 《トウキョウ・シャンディ・ランデヴ feat. 花譜, ツミキ》 |
| 2025-04 | テレビアニメ《中禅寺先生物怪講義録》 | オープニング主題歌 |

> **「組曲」について**：活動三周年となる 2021 年 10 月に始動した、現実の音楽家とのコラボ企画。第一期は全 15 曲で、2024 年 1 月の岸田繁との《[愛のまま](/ja/songs/kaf/suites/愛のまま-still-in-love)》をもって完結、同年 2 月より「組曲2」が始動した。`
    },
    {
      heading: '## ラジオ・テレビ出演',
      body: `- **冠ラジオ**：《ぱんぱかカフぃ(R)》（InterFM）。2022 年 4 月開始で、「上京編」「羽田(夜)編」などの章を展開。花譜にとって初のレギュラー地上波特番となった；
- **NHK 音楽番組**：2021 年 11 月 15 日《沼にハマってきいてみた》に出演し、《[過去を喰らう](/ja/songs/kaf/originals/kako-wo-kurau)》と《[海に化ける](/ja/songs/kaf/originals/海に化ける-turn-into-the-sea)》を披露；
- **冠テレビ番組**：2022 年 10 月より TOKYO MX で《バーチャルシンガー花譜の廻れ！MAD TV》を放送。番組内で花譜本人デザインの衣装が公開され、のちに「銀河を統べし花譜」と命名された。`
    },
    {
      heading: '## 観測者コミュニティとマイルストーン',
      body: `- **ファン呼称**：ファンの称号は **「観測者」**、2019 年のクラウドファンディング参加者は特に **「{{spoiler::共犯者}}」** と呼ばれる。この呼称は後に神椿 V.W.P 全体のファンを指すこともある。
- **クラウドファンディングの奇跡**：2019 年の 1st ONE-MAN LIVE「不可解」開催にあたり Campfire で目標 500 万円を設定したところ、最終的に **4000 万円超**（目標の約 8 倍）を集めた。{{spoiler::花譜本人はこの数字に驚き、複数のツイートを連投。運営による資金の扱いに関する説明を引用し、今後も頑張ると述べた。}}
- **チャンネル規模**：2023 年 2 月時点で YouTube 登録者約 **77.1 万**、bilibili フォロワー約 **26.3 万**。2024 年 6 月 21 日に YouTube 登録者 **100 万** を突破。
- **コミュニティ文化**：「観測者—共犯者」という二層のアイデンティティと、「魔女集会」的な集団観覧の儀式性が形成されている。`
    },
    {
      heading: '## エピソードと界隈の文化',
      body: `- **語彙力**：「不可解弐 Q1」で花譜は自身の「語彙力」を **530000** と宣言した。{{spoiler::バンドメンバー四人も思わず笑ってしまったという——《ドラゴンボール》のフリーザ戦闘力 530000 のネタである}}。「不可解弐 Q2」ではこの数値は **{{spoiler::-53 万}}** に更新された。
- **身長への願い**：ツイッターで「八頭身になりたい」と語ったことがある。
- **直筆サイン**：2020 年 12 月 13 日、Fan Club 限定《魔法》アルバムへの直筆サインの写真を公開。{{spoiler::一部のサインには小動物の絵が添えられている。PIEDPIPER によれば FC 限定盤は数千規模で、サインの所要時間は想定を大きく超えたため、花譜本人も授業の合間を縫って署名を進めており、辛抱強く待ってほしいと呼びかけられた（ファンはこれを「腱鞘炎の危機」とからかった）。}}
- **封印曲**：《祭壇》《宣戦》《言霊》の三曲は長らく再演されなかったが、{{spoiler::Q2 で意外な形で復活した。}}
- **つぶやき**：「不可解弐 Q1」の直前、花譜はツイッターで大量のつぶやきを投稿し、{{spoiler::多くのファンがライブ内容の予告だと誤解した。}}
- **Spoon なりすまし事件**：2021 年 1 月から 2 月にかけて、Spoon 上で花譜を騙る配信が相次いだ。1 月 11 日未明に「花譜@本人」名義の配信が出現し、PIEDPIPER が約 30 分後に本人ではないと訂正して中止を求めた。該当アカウントはその後永久凍結された。花譜本人は「モノマネは嬉しいのですが、なりすましは観測者の皆にも誤解させてしまうし、私も困ってしまうのでやめてほしいです！花譜のSpoonアカウント無いです！」と応じ、{{spoiler::同日中に Twitter の表示名を「花譜@超本人」に変更して真贋を分かりやすくした。}}1 月 31 日に再度なりすましが発生し、2 月 1 日に神椿公式が声明を発表、該当の投稿と行為を法的措置として弁護士に提出済みと告知。花譜はその夜「**なりすましは！よくない！**」と反応し、{{spoiler::再発した場合は花譜の使用言語をタイ語にすると半ば冗談めかして警告した。}}
- **制作パートナー**：映像・MV は川サキ（川サキケンジ）らが長く手がけ、詞曲では [カンザキイオリ](/ja/artists/creators/kanzaki-iori) との長期協働が神椿美学の基盤とみなされている。`
    }
  ],
  en: [
    {
      heading: '## Complete Visual Form Archive',
      body: `KAF's appearance is not fixed: it has continued to "fledge" alongside each live show, single, and lore development. Every form is designed under the direction of character designer [PALOW.](/en/artists/creators/palow) and debuted at a performance or music video.

| Debut | Form | First appearance and design notes |
| :--- | :--- | :--- |
| 2018-10-18 | **First Form · {{ruby::雛鳥::ひなどり::hinadori}}** | The debut look: a grey-white hoodie with a navy hood and navy diamond motifs, the hood shaped after her companion "Laplace" (a fish). A pure white dress, twin braids, amaranth over-knee socks and purple-soled white boots. |
| 2019-04-12 | **High-school uniform** | Standard black blazer uniform with pleated skirt, black socks and school shoes. |
| 2019-06-04 | **Short-sleeve look** | The hoodie with rolled sleeves and shorter socks. |
| 2019-08-01 | **Special Singing Form · {{ruby::星鴉::ほしがらす::hoshigarasu}}** | Revealed at 1st ONE-MAN LIVE "Fukakai". Keeps the hood and palette while boldly incorporating Laplace's motifs. |
| 2019-08-02 | **White shirt look** | A white school shirt with red ribbon and black checked skirt, seen in the "Inochi ni Kirawareteiru." music video. |
| 2019-08-30 | **First Form · Hinadori Black** | Revealed in the collaboration MV for the mobile game *47 HEROINES*. |
| 2019-09-29 | **Special Singing Form · {{ruby::瑠璃鶲::るりびたき::ruribitaki}}** | Revealed at "FAVRIC", the world's first VTuber fashion-runway and music live event. |
| 2020-03-14 | **Second Form · {{ruby::青雀::あおすずめ::aosuzume}}** | A new design by PALOW. {{spoiler::From this point on KAF appeared mostly in this form.}} |
| 2020-03-23 | **Special Singing Form · {{ruby::隼::はやぶさ::hayabusa}}** | Tied to the NTT docomo campaign "HAYABUSA EXPERIENCE by 3.5D × docomo" and its theme "Tomadoi Telepathy". |
| 2020-10-10 | **Special Singing Form · {{ruby::金糸雀::かなりあ::kanaria}}** | Revealed at "Fukakai Two Q1". Close to the Hayabusa design, with colours shifting between yellow-green and navy. |
| 2021-03-13 | **Witch Special Singing Form · {{ruby::花魁鳥::おいらどり::oiradori}}** | The shared witch-assembly attire unveiled with the other four members of V.W.P at "Fukakai Two Q2". |
| 2021-06-12 | **Special Singing Form · Kinkeii / Second Form · Aosuzume Black** | Revealed at "Fukakai Two Q3". |
| 2021-10-18 | **Third Form · {{ruby::燕::つばめ::tsubame}}** | Announced in "KAF #88 Fukaka Ni". |
| 2022-08-24 | **Special Singing Form · {{ruby::軍鶏::しゃも::shamo}} / Tsubame (Broken)** | Revealed at "Fukakai San (Kyou)", carrying a strong sense of tension and opposition. |
| 2022-10-14 | **Casual outfit** | Unveiled as the key visual for KAF Exhibition 3, "This Time, You Don't Have to Put It Into Words." |
| 2022-10-26 | **{{ruby::銀河を統べし花譜::ぎんがをすべしかふ::ginga wo suberu kafu}}** | An outfit designed by KAF herself, shown on the TV programme *Virtual Singer KAF no Maware! MAD TV*. |
| 2023-03-04 | **Fourth Form · {{ruby::雉::きじ::kiji}} / Tsubame (Sou) / Shamo (Sou)** | Revealed at "Fukakai San (Sou)". {{spoiler::The programme booklet recorded "Shamo (Kai)", but the official site and press use "Shamo (Sou)"; this entry follows the latter.}} |

> **Naming pattern**: nearly every form is named after a bird (hinadori, hoshigarasu, ruribitaki, aosuzume, hayabusa, kanaria, oiradori, kinkeii, tsubame, shamo, kiji), echoing the theme of a fledgling growing its wings.`
    },
    {
      heading: '## Companion and Familiar: Laplace',
      body: `**Laplace** is a fish-shaped presence who has accompanied KAF since the very beginning of the project, functioning less as a mascot than as a **companion or familiar**.

- **Design origin**: Laplace did not begin with a complete setting; it took shape as the project progressed and was eventually adopted as the very structure of KAF's first-form hood.
- **Fan perception**: loved by observers far faster than the team anticipated, Laplace has become something of a symbol of KAF and appears in numerous original music videos. {{spoiler::Being so large, it has drawn plenty of exclamations along the lines of "Laplace is huge!"}}
- **Place in the lore**: among the clues in the Otogibanashi audio dramas, Laplace is speculated to be connected to how the three characters were able to travel to the present.`
    },
    {
      heading: '## Otogibanashi Audio Dramas and Lore Clues',
      body: `**Otogibanashi** (御伽噺) is an audio-drama unit included on KAF's albums and serves as an important supplement and record of the KAMITSUBAKI worldview. It has now reached its third act. Its chronological order is **Act Two → Act Zero → Act One**, which does not match the order of playback.

{{details::Open the clues and deductions drawn from Otogibanashi}}

**Confirmed clues**

1. The "I" of Act Zero and the "I" of Act One are not the same person.
2. The "I" of Act Zero, KAF, and the **Betrayer Witch** all come from the future.
3. The Betrayer Witch's name is **Ookawa Riri**.
4. A world war engulfed the globe in the future, and the world was destroyed by it.
5. The three underwent some kind of experiment and their memories are partially missing.
6. At the end of the experiment the Betrayer Witch did something unforgivable, and one reason KAF came to the present is revenge.
7. The "I" of Act One had met KAF before, yet forgot the promise and does not believe what KAF says.
8. The dialogue in Act Two takes place in the future, and its "I" is the same person as the "I" of Act Zero.
9. In Act Two, KAF reveals that she has an older brother.
10. Resources in the future are extremely scarce.
11. The **Carnival** is a key clue: a screening operation of more than 100,000 people staged for an experiment.
12. The future was destroyed in spring.

**Deductions**

{{spoiler::The lyrics and PVs of original songs contain lore clues and plot; the three were presumably able to travel to the present through Laplace; the Carnival may be the trigger of the world war; their experiment likely began after the Carnival; KAF's eyes — concentric yellow, red, and blue rings — are presumably a result of that experiment.}}

{{/details}}`
    },
    {
      heading: '## Voice Acting Roles',
      body: `| Year | Work | Role | Type |
| :--- | :--- | :--- | :--- |
| 2022 | *Muv-Luv Alternative* Season 2 | XM3 | TV anime |
| 2025 | *[KAMITSUBAKI CITY UNDER CONSTRUCTION](/en/projects/arg/kamitsubaki-city)* | **Morisaki Kaho** | TV anime |
| 2025 | *[KAMITSUBAKI CITY REGENERATE](/en/projects/city-project/city-games/kamitsubaki-city-regenerate)* | **Morisaki Kaho** | Game |

> **Morisaki Kaho** is KAF's corresponding character within the *KAMITSUBAKI CITY* setting and the first singularity of the project.`
    },
    {
      heading: '## Commercial Tie-ups and Collaborations',
      body: `| Date | Partner | Content |
| :--- | :--- | :--- |
| 2019-06-28 | Film *Hot Gimmick: Girl Meets Boy* | Theme song "[Yoru ga Furiyamu Mae ni](/en/songs/kaf/originals/yoru-ga-furiyamu-mae-ni)" |
| 2019-09-11 | Rhythm game *Cytus II* | Collaboration |
| 2020-04 | TV anime *Black Clover* cour 11 | Ending theme "[Answer](/en/songs/kaf/originals/アンサー-answer)" |
| 2020-04 | ZONe "Choubotsunyuu" campaign | "[Abnormal](/en/songs/kaf/originals/危ノーマル-abnormal)" |
| 2020-07 | Netflix anime *Japan Sinks: 2020* | Grand finale theme "Keshiki" |
| 2020-07 | NTT docomo 5G concept exhibition | "Tomadoi Telepathy" |
| 2019-08-30 | Mobile game *47 HEROINES* | Collaboration MV and the new form Hinadori Black |
| 2019-09-29 | Fashion runway & music live "FAVRIC" | Debut of the form Ruribitaki |
| 2021-05-19 | Anime film *Pompo: The Cinéphile* | Insert song "[Tatoeba](/en/songs/kaf/originals/例えば-for-example)" |
| 2021-10-18 | "Kumikyoku" (Suite) project | Collaborations with Ohtake Shigeyuki, MAISONdes / Tsumiki, Kishida Shigeru and others |
| 2022-10 | TV anime *Urusei Yatsura* | "Tokyo Shandy Rendezvous feat. KAF, Tsumiki" |
| 2025-04 | TV anime *Chuzenji-sensei Mononoke Kougiroku* | Opening theme |

> **On the "Suite" project**: launched in October 2021 for KAF's third anniversary, it pairs her with real-world musicians. The first series of 15 songs concluded in January 2024 with "[Ai no Mama](/en/songs/kaf/suites/愛のまま-still-in-love)" featuring Kishida Shigeru, and "Suite 2" began in February 2024.`
    },
    {
      heading: '## Radio and Television Appearances',
      body: `- **Regular radio**: *Panpaka KAFi (R)* on InterFM, launched in April 2022 with chapters including "Joukyou-hen" and "Haneda (Night)-hen" — KAF's first regular terrestrial radio programme.
- **NHK music programme**: on 15 November 2021 she appeared on *Numa ni Hamatte Kiite Mita*, performing "[Kako wo Kurau](/en/songs/kaf/originals/kako-wo-kurau)" and "[Umi ni Bakeru](/en/songs/kaf/originals/海に化ける-turn-into-the-sea)".
- **Regular TV programme**: from October 2022, TOKYO MX aired *Virtual Singer KAF no Maware! MAD TV*, in which an outfit designed by KAF herself was shown and later named "Ginga wo Suberu KAF".`
    },
    {
      heading: '## Observer Community and Milestones',
      body: `- **Fan names**: fans are titled **"Observers" (観測者)**, while those who backed the 2019 crowdfunding are additionally called **"{{spoiler::Accomplices}}."** The term later came to refer broadly to fans of KAMITSUBAKI's V.W.P.
- **The crowdfunding miracle**: for the 1st ONE-MAN LIVE "Fukakai" in 2019, a Campfire campaign with a ¥5,000,000 goal ultimately raised **over ¥40,000,000 — roughly eight times the target**. {{spoiler::KAF herself was taken aback by the figure, posted several tweets in a row, and shared the team's statement on how the funds would be handled, promising to keep working hard.}}
- **Channel scale**: as of February 2023 her YouTube channel had roughly **771,000** subscribers and her bilibili channel about **263,000** followers; on 21 June 2024 the YouTube channel passed **one million** subscribers.
- **Community culture**: the two-tier identity of "observer / accomplice" and a witch-assembly style of collective viewership have become a hallmark of the fandom.`
    },
    {
      heading: '## Anecdotes and Community Culture',
      body: `- **Vocabulary power**: at "Fukakai Two Q1" KAF declared her "vocabulary power" to be **530,000**. {{spoiler::Even the four band members could not help laughing — a nod to Frieza's battle power of 530,000 in *Dragon Ball*.}} By "Fukakai Two Q2" she had revised the figure to **{{spoiler::−530,000}}**.
- **A wish about height**: she once tweeted that she wanted to grow into an eight-head-tall figure.
- **Handwritten signatures**: on 13 December 2020 she shared photos of herself signing fan-club-exclusive copies of *Maho*. {{spoiler::Some signatures came with small animal drawings. According to PIEDPIPER, the fan-club edition ran into the thousands, so signing took far longer than expected; KAF kept signing between classes and asked fans to be patient — which fans joked was a "tendonitis crisis."}}
- **Shelved songs**: three originals — *Saidan*, *Sensen*, and *Kotodama* — went unperformed for a long stretch, {{spoiler::before returning at Q2 in an unexpected way.}}
- **Stream of consciousness**: before "Fukakai Two Q1" KAF posted a flood of musings on Twitter, {{spoiler::leading many to mistake them for concert previews.}}
- **The Spoon impersonation incident**: between January and February 2021 a series of accounts impersonated KAF on the Japanese platform Spoon. On the small hours of 11 January a stream appeared under the name "KAF@the real one"; PIEDPIPER clarified within about half an hour that it was not her and asked for it to stop, and the account was permanently suspended. KAF responded that "impressions are welcome, but impersonation misleads observers and troubles me — please stop! There is no KAF Spoon account!", {{spoiler::and changed her Twitter display name to "KAF@the super real one" the same day so people could tell the pages apart.}} Impersonation resurfaced on 31 January, and on 1 February KAMITSUBAKI STUDIO issued a statement that the posts had been submitted to lawyers as a legal matter. That night KAF responded, "**Impersonation is! Not okay!**", {{spoiler::half-jokingly threatening that if it happened again she would make Thai the language of KAF.}}
- **Creative partners**: visual and MV production has long been handled by Kawasaki Kenji and others, while her songwriting partnership with [Kanzaki Iori](/en/artists/creators/kanzaki-iori) is regarded as the foundation of the KAMITSUBAKI aesthetic.`
    }
  ]
};

for (const lang of ['zh', 'ja', 'en']) {
  const n = insertSections('people/solo/kaf', 'kaf', lang, kaf[lang]);
  console.log(`kaf/${lang}: inserted ${n} sections`);
}
