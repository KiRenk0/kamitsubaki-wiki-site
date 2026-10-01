import { appendSections } from '../entry-append.mjs';

const compilations = {
  kafu: { zh: '《KAF+YOU KAFU COMPILATION ALBUM シンメトリー》', ja: '《KAF+YOU KAFU COMPILATION ALBUM シンメトリー》', en: '*KAF+YOU KAFU COMPILATION ALBUM Symmetry*', date: '2021-11-24', src: '花譜（KAF）', srcEn: 'KAF' },
  sekai: { zh: '《ISE+YOU SEKAI COMPILATION ALBUM メタモルフォーゼ》', ja: '《ISE+YOU SEKAI COMPILATION ALBUM メタモルフォーゼ》', en: '*ISE+YOU SEKAI COMPILATION ALBUM Metamorphose*', date: '2023-05-24', src: 'ヰ世界情绪', srcEn: 'ISEKAIJOUCHO' },
  rime: { zh: '《RIM+YOU RIME COMPILATION ALBUM パラドクス》', ja: '《RIM+YOU RIME COMPILATION ALBUM パラドクス》', en: '*RIM+YOU RIME COMPILATION ALBUM Paradox*', date: '2023-01-25', src: '理芽（RIM）', srcEn: 'RIM' },
  coko: { zh: '《KOKO+YOU COKO COMPILATION ALBUM エクスタシー》', ja: '《KOKO+YOU COKO COMPILATION ALBUM エクスタシー》', en: '*KOKO+YOU COKO COMPILATION ALBUM Ecstasy*', date: '2023-08-30', src: '幸祜', srcEn: 'KOKO' },
  haru: { zh: '《HARU+YOU HARU COMPILATION ALBUM カタルシス》', ja: '《HARU+YOU HARU COMPILATION ALBUM カタルシス》', en: '*HARU+YOU HARU COMPILATION ALBUM Catharsis*', date: '2024-03-20', src: '春猿火', srcEn: 'HARUSARUHI' }
};

const flavor = {
  kafu: {
    zh: '以花譜（KAF）的歌声为声源原型，是神椿"音乐的同位体"系列的**第一弹**，也是整个系列中传播规模最大、对华语与全球同人圈影响最深远的一支声库。',
    ja: '花譜（KAF）の歌声を音源原型とし、神椿「音楽的同位体」シリーズの**第一弾**にして、シリーズ中もっとも広く伝播し、中華圏と世界の同人シーンに最も深い影響を与えた声庫である。',
    en: 'Built from KAF\'s voice, it is the **first** entry in the Musical Isotope series and by far the most widely propagated, with the deepest influence on the Chinese-language and global creator communities.'
  },
  sekai: {
    zh: '以ヰ世界情绪（ISEKAIJOUCHO）的歌声为声源原型，承袭其宽阔音域与歌剧式共鸣，是神椿同位体系中"幻想／宏大叙事"路线的代表声库。',
    ja: 'ヰ世界情緒（ISEKAIJOUCHO）の歌声を音源原型とし、その広い音域とオペラ的な共鳴を受け継ぐ。神椿の同位体群の中でも「幻想／壮大な叙事」路線を代表する声庫である。',
    en: 'Built from ISEKAIJOUCHO\'s voice and inheriting her wide range and operatic resonance, it represents the "fantasy / grand narrative" strand of the Isotope family.'
  },
  rime: {
    zh: '以理芽（RIM）的歌声为声源原型，承袭其沙哑质感与都市流行语感，是同位体系中"都市／双语"路线的代表声库。',
    ja: '理芽（RIM）の歌声を音源原型とし、そのハスキーな質感と都市型ポップスの語感を受け継ぐ。同位体群の中でも「都市／バイリンガル」路線を代表する声庫である。',
    en: 'Built from RIM\'s voice and inheriting her husky texture and urban-pop sensibility, it represents the "urban / bilingual" strand.'
  },
  coko: {
    zh: '以幸祜（KOKO）的歌声为声源原型，承袭其高穿透力的摇滚声线，是同位体系中"高张力摇滚"路线的代表声库。',
    ja: '幸祜（KOKO）の歌声を音源原型とし、その高い穿透力のロックボーカルを受け継ぐ。同位体群の中でも「高張力ロック」路線を代表する声庫である。',
    en: 'Built from KOKO\'s voice and inheriting her piercing rock delivery, it represents the "high-tension rock" strand.'
  },
  haru: {
    zh: '以春猿火（HARUSARUHI）的歌声为声源原型，承袭其高密度咬字与说唱语速，是同位体系中"说唱／实验"路线的代表声库。',
    ja: '春猿火（HARUSARUHI）の歌声を音源原型とし、その高密度のディクションとラップの語速を受け継ぐ。同位体群の中でも「ラップ／実験」路線を代表する声庫である。',
    en: 'Built from HARUSARUHI\'s voice and inheriting her dense diction and rap cadence, it represents the "rap / experimental" strand.'
  }
};

const engine = {
  zh: `神椿的音乐同位体项目建立在**双引擎**声学架构之上，两套引擎的技术路线各有侧重：

| 引擎 | 开发方 | 技术特征 |
| :--- | :--- | :--- |
| **CeVIO AI** | Techno-Speech | 由 HMM 与深度神经网络（DNN）混合演进而来，能够极致捕捉人类歌手原声中颤音、换气声、声带摩擦微噪等"不完美但富有生命力"的真实声学细节 |
| **Synthesizer V AI** | Dreamtonics（第五代引擎） | 全链路自回归声学模型，具备跨语言歌唱能力（日／英／中三语自然过渡）、多情绪参量（Power / Soft / Clear）无缝变形，渲染速度与可编辑性极高 |

> **双引擎意义**：CeVIO AI 负责"保留人味的不完美"，Synthesizer V AI 负责"跨语言与高度可编辑"，两者共同覆盖了从还原真人演唱质感，到面向全球创作者自由编创的完整需求。`,
  ja: `神椿の音楽的同位体プロジェクトは**二つのエンジン**による音響アーキテクチャの上に築かれている。それぞれ技術的な狙いが異なる。

| エンジン | 開発 | 技術的特徴 |
| :--- | :--- | :--- |
| **CeVIO AI** | Techno-Speech | HMM と深層ニューラルネットワーク（DNN）の混合から発展し、人間の歌唱原音にあるビブラート、ブレス、声帯摩擦の微細なノイズといった「不完全だが生命感のある」ディテールを極限まで捉える |
| **Synthesizer V AI** | Dreamtonics（第五世代） | 全工程を自己回帰型音響モデルで処理し、言語を跨いだ歌唱（日・英・中の自然な遷移）、複数の感情パラメータ（Power / Soft / Clear）のシームレスな変形、高い描画速度と編集性を備える |

> **二エンジンの意味**：CeVIO AI は「人間らしい不完全さの保持」を、Synthesizer V AI は「多言語と高い編集性」を担う。両者が揃うことで、実唱の質感の再現から、世界中のクリエイターによる自由な制作までを一貫してカバーする。`,
  en: `The Musical Isotope project is built on a **dual-engine** acoustic architecture, each engine serving a different purpose.

| Engine | Developer | Technical character |
| :--- | :--- | :--- |
| **CeVIO AI** | Techno-Speech | Evolved from a hybrid of HMM and deep neural networks (DNN), it captures vibrato, breath and vocal-fold micro-noise — the "imperfect but alive" detail of a real singer — to an extreme degree |
| **Synthesizer V AI** | Dreamtonics (5th generation) | A fully autoregressive acoustic model with cross-lingual singing (natural Japanese/English/Chinese transitions), seamless morphing of emotion parameters (Power / Soft / Clear), and very high render speed and editability |

> **Why both**: CeVIO AI preserves human imperfection; Synthesizer V AI handles cross-lingual work and deep editability. Together they cover everything from reproducing a live vocal texture to giving global creators full creative latitude.`
};

const licence = {
  zh: `神椿在音乐同位体项目上摒弃了传统艺人经纪的封闭限制，建立了一套**颠覆性的开放二创授权闭环**：

1. **商用免授权门槛**：允许同人音乐人在特定收益限额内自由使用同位体声库制作原创曲，并直接上线流媒体平台；
2. **官方合辑反哺收编**：通过官方合辑征集企划，把民间优秀创作者与作品收编进主流官方专辑，形成"民间创作 → 官方认证 → 更大传播"的正向循环；
3. **生态成果**：这一机制促成了《{{ruby::キュートなカノジョ::きゅーとなかのじょ::cute na kanojo}}》《{{ruby::フォニイ::ふぉにい::phony}}》等现象级高播放同人神曲的诞生，使 AI 歌声真正进入主流流行文化的核心视野。

> **行业意义**：相较于传统唱片体系对二次创作的严格限制，神椿选择把"声库"当作生态入口而非封闭资产，这也是同位体系列能够在数年内积累出海量 UGC 作品的根本原因。`,
  ja: `神椿は音楽的同位体プロジェクトにおいて、従来の芸能事務所型の閉鎖的な制限を捨て、**画期的なオープン二次創作ライセンスの循環**を築いた。

1. **商用利用のしきい値の開放**：同人音楽家が一定の収益上限内で同位体声庫を自由に用いてオリジナル曲を制作し、そのままストリーミング配信できるようにした；
2. **公式コンピへの還流と収録**：公式コンピレーションの公募を通じて、民間の優れたクリエイターと作品をメジャーの公式アルバムへと取り込み、「民間の創作 → 公式の認証 → さらなる伝播」という正の循環を生んだ；
3. **生態系の成果**：《{{ruby::キュートなカノジョ::きゅーとなかのじょ::cute na kanojo}}》《{{ruby::フォニイ::ふぉにい::phony}}》など現象級の再生数を誇る同人楽曲が生まれ、AI 歌唱が主流ポップカルチャーの中心へと踏み込んだ。

> **業界的意味**：二次創作を厳しく制限する従来のレコード体系に対し、神椿は「声庫」を閉じた資産ではなく生態系への入口として扱った。これが数年で膨大な UGC を蓄積できた根本的な理由である。`,
  en: `For the Musical Isotope project KAMITSUBAKI abandoned the closed restrictions of conventional artist management and built an **open, self-reinforcing licensing loop**.

1. **A commercial-use threshold instead of a ban**: doujin musicians may freely use the voice libraries within a defined revenue ceiling and release the resulting originals straight to streaming platforms.
2. **Official compilations that absorb the scene**: through open calls for official compilation albums, outstanding community creators and works are brought onto major releases, creating a cycle of "community creation → official validation → wider reach".
3. **Results**: this mechanism produced phenomenon-level UGC hits such as "{{ruby::キュートなカノジョ::きゅーとなかのじょ::cute na kanojo}}" and "{{ruby::フォニイ::ふぉにい::phony}}", carrying AI singing into the centre of mainstream pop culture.

> **Industry significance**: where the traditional record system restricts derivative works, KAMITSUBAKI treats a voice library as a gateway into an ecosystem rather than a closed asset — the fundamental reason the Isotope family accumulated such a vast body of UGC within a few years.`
};

const relation = {
  kafu: {
    zh: `| 项目 | 内容 |
| :--- | :--- |
| **声源原型（模板）** | [花譜（KAF）](/zh/artists/vwp/kaf) |
| **同属体系** | [V.W.P](/zh/artists/vwp/vwp) 五位魔女的同位体矩阵之一 |
| **首发形态** | CeVIO AI（后续追加 Synthesizer V AI 版本） |
| **世界观定位** | 神椿"歌曲特异点"在数字侧的分身，与花譜共享同一"歌之声"的来源 |

> **命名规则**：音乐同位体的官方名称前缀直接取自声源魔女（KAFU←KAF、RIME←RIM、SEKAI←ISEKAIJOUCHO、COKO←KOKO、HARU←HARUSARUHI），这一命名法本身即宣示了"同一存在的不同形态"这一设定内核。`,
    ja: `| 項目 | 内容 |
| :--- | :--- |
| **音源原型（テンプレート）** | [花譜（KAF）](/ja/artists/vwp/kaf) |
| **所属体系** | [V.W.P](/ja/artists/vwp/vwp) 五人の魔女の同位体マトリクスの一角 |
| **初出形態** | CeVIO AI（のちに Synthesizer V AI 版を追加） |
| **世界観上の位置** | 神椿の「歌曲の特異点」のデジタル側の分身。花譜と同じ「歌の声」の来源を共有する |

> **命名規則**：音楽的同位体の名称は音源の魔女から直接取られている（KAFU←KAF、RIME←RIM、SEKAI←ISEKAIJOUCHO、COKO←KOKO、HARU←HARUSARUHI）。この命名法自体が「同一存在の異なる形態」という設定の核を宣言している。`,
    en: `| Item | Detail |
| :--- | :--- |
| **Voice template** | [KAF](/en/artists/vwp/kaf) |
| **System** | One node of the five-witch isotope matrix of [V.W.P](/en/artists/vwp/vwp) |
| **First release** | CeVIO AI (a Synthesizer V AI edition followed) |
| **Position in the lore** | The digital-side counterpart of KAMITSUBAKI's "song singularity", sharing one source of "singing voice" with KAF |

> **Naming rule**: each Isotope's official name is drawn directly from its source witch (KAFU←KAF, RIME←RIM, SEKAI←ISEKAIJOUCHO, COKO←KOKO, HARU←HARUSARUHI). The convention itself declares the core idea: different forms of one existence.`
  }
};
// Reuse the KAFU-style relation table for every isotope, swapping identifiers.
function relationFor(id, srcZh, srcJa, srcEn, anchor) {
  return {
    zh: relation.kafu.zh
      .replace('[花譜（KAF）](/zh/artists/vwp/kaf)', `[${srcZh}](/zh/artists/${anchor})`)
      .replace('花譜と同じ', `${srcZh}と同じ`),
    ja: relation.kafu.ja
      .replace('[花譜（KAF）](/ja/artists/vwp/kaf)', `[${srcJa}](/ja/artists/${anchor})`),
    en: relation.kafu.en
      .replace('[KAF](/en/artists/vwp/kaf)', `[${srcEn}](/en/artists/${anchor})`)
      .replace('with KAF', `with ${srcEn}`)
  };
}

const kafuHits = {
  zh: {
    heading: '## 现象级二创名曲档案',
    body: `可不声库在投入市场后迅速引发 VOCALOID／同人音乐圈层的现象级爆发，以下曲目被视为这一浪潮的标志性坐标：

| 曲目 | 创作者 | 意义 |
| :--- | :--- | :--- |
| **《{{ruby::キュートなカノジョ::きゅーとなかのじょ::cute na kanojo}}》** | syudou | 将可不特有的气声与病态轻快的律动结合，成为可不人气爆发的引火索之一 |
| **《{{ruby::フォニイ::ふぉにい::phony}}》** | ツミキ | 以激烈的鼓点切片与假声转音成为可不历史上播放量与翻唱量最高的代表作之一，被海内外无数歌手翻唱 |
| **《{{ruby::マーシャル・マキシマイザー::まーしゃるまきしまいざー::marshall maximizer}}》** | 柊マグネタイト | 以超高密度节拍与高速咬字展现可不机械感与灵活度的极限 |

> **历史定位**：这些作品诞生于平成与令和交替期，被普遍视为"AI 歌声进入主流流行文化中心"的转折点；可不也因此成为神椿五位同位体中知名度最高、跨圈层影响力最强的一支。`
  },
  ja: {
    heading: '## 現象級二次創作の名曲アーカイブ',
    body: `可不の声庫は市場投入後ただちに VOCALOID／同人音楽シーンで現象級の爆発を引き起こした。以下はその波を象徴する座標である。

| 曲 | クリエイター | 意義 |
| :--- | :--- | :--- |
| **《{{ruby::キュートなカノジョ::きゅーとなかのじょ::cute na kanojo}}》** | syudou | 可不特有の息混じりの声と病みかわいいグルーヴを結びつけ、人気爆発の導火線の一つとなった |
| **《{{ruby::フォニイ::ふぉにい::phony}}》** | ツミキ | 激しいビートの断片とファルセットの転音で、可不の歴史で最も再生・カバーされた代表作の一つとなり、国内外の無数の歌手に歌われた |
| **《{{ruby::マーシャル・マキシマイザー::まーしゃるまきしまいざー::marshall maximizer}}》** | 柊マグネタイト | 超高密度のビートと高速のディクションで、可不の機械的な質感と柔軟さの限界を提示した |

> **歴史的位置**：これらの作品は平成と令和の交代期に生まれ、「AI 歌唱が主流ポップカルチャーの中心へ入った」転換点と広く見なされている。可不は神椿の五つの同位体の中でもっとも知名度が高く、越境的な影響力を持つ。`
  },
  en: {
    heading: '## Landmark UGC Hit Archive',
    body: `Once released, the KAFU library triggered a phenomenon-level explosion across the Vocaloid and doujin scenes. The following tracks are landmarks of that wave.

| Track | Creator | Significance |
| :--- | :--- | :--- |
| **"{{ruby::キュートなカノジョ::きゅーとなかのじょ::cute na kanojo}}"** | syudou | Fused KAFU's breathy timbre with a sickly-sweet groove, becoming one of the fuses for her surge in popularity |
| **"{{ruby::フォニイ::ふぉにい::phony}}"** | Tsumiki | Its slashed drums and falsetto turns made it one of the most played and most covered songs in KAFU's history, sung by countless artists at home and abroad |
| **"{{ruby::マーシャル・マキシマイザー::まーしゃるまきしまいざー::marshall maximizer}}"** | Hiiragi Magnetite | Showcases the extremes of KAFU's mechanical texture and agility through ultra-dense beats and rapid-fire diction |

> **Historical position**: these works appeared at the turn of the Heisei and Reiwa eras and are widely regarded as the turning point at which AI singing entered the centre of mainstream pop culture. KAFU is consequently the best known and most cross-community Isotope in the KAMITSUBAKI family.`
  }
};

const anchors = { kafu: 'vwp/kaf', sekai: 'vwp/isekaijoucho', rime: 'vwp/rim', coko: 'vwp/koko', haru: 'vwp/harusaruhi' };

for (const id of ['kafu', 'sekai', 'rime', 'coko', 'haru']) {
  const c = compilations[id];
  const f = flavor[id];
  const sections = {
    zh: [
      {
        heading: '## 官方合辑系列与命名体系',
        body: `${f.zh}

| 项目 | 内容 |
| :--- | :--- |
| **首发合辑** | ${c.zh}（${c.date}） |
| **合辑命名** | 采用「声源魔女代号 + YOU」的公式，即「${c.src} 与你」之意 |
| **声源原型** | ${c.src} |
| **发行体系** | [KAMITSUBAKI STUDIO](/database/studios/thinkr) 音乐的同位体系列 |

> **命名体系的意义**：以「X+YOU」命名官方合辑，把同位体从"工具"重新定义为"与听众共同创作的伙伴"。合辑所收录的曲目全部来自受邀或被选中的创作者，是官方与民间创作生态直接交汇的产物。`
      },
      { heading: '## 声学引擎与声库规格', body: engine.zh },
      { heading: '## 开放二创授权与生态闭环', body: licence.zh },
      { heading: '## 与声源魔女的关系谱系', body: relationFor(id, c.src, c.src, c.srcEn, anchors[id]).zh }
    ],
    ja: [
      {
        heading: '## 公式コンピレーションと命名体系',
        body: `${f.ja}

| 項目 | 内容 |
| :--- | :--- |
| **初のコンピ** | ${c.ja}（${c.date}） |
| **命名** | 「音源の魔女のコード + YOU」という式を採用、すなわち「${c.src} と あなた」の意 |
| **音源原型** | ${c.src} |
| **リリース体系** | [KAMITSUBAKI STUDIO](/database/studios/thinkr) 音楽的同位体シリーズ |

> **命名体系の意味**：公式コンピを「X+YOU」と名付けることで、同位体を「道具」ではなく「聴き手とともに創作する相棒」として再定義している。収録曲はいずれも招請または選抜されたクリエイターによるもので、公式と民間の創作生態が直接交差した産物である。`
      },
      { heading: '## 音響エンジンと声庫の仕様', body: engine.ja },
      { heading: '## オープン二次創作ライセンスと生態系', body: licence.ja },
      { heading: '## 音源の魔女との関係系譜', body: relationFor(id, c.src, c.src, c.srcEn, anchors[id]).ja }
    ],
    en: [
      {
        heading: '## Official Compilations and Naming System',
        body: `${f.en}

| Item | Detail |
| :--- | :--- |
| **First compilation** | ${c.en} (${c.date}) |
| **Naming** | Follows the formula "source-witch code + YOU", meaning "${c.srcEn} and you" |
| **Voice template** | ${c.srcEn} |
| **Release system** | [KAMITSUBAKI STUDIO](/database/studios/thinkr) Musical Isotope series |

> **What the naming means**: titling the official compilations "X+YOU" redefines the Isotope from a "tool" into "a partner who creates alongside the listener". Every track on the compilations comes from an invited or selected creator, making them a direct intersection of the official and community creative ecosystems.`
      },
      { heading: '## Acoustic Engines and Library Specifications', body: engine.en },
      { heading: '## Open Licensing and the Derivative-Work Ecosystem', body: licence.en },
      { heading: '## Relationship to the Source Witch', body: relationFor(id, c.src, c.src, c.srcEn, anchors[id]).en }
    ]
  };
  for (const lang of ['zh', 'ja', 'en']) {
    const list = [...sections[lang]];
    if (id === 'kafu') list.push(kafuHits[lang]);
    const n = appendSections(`isotopes/${id}`, id, lang, list);
    console.log(`${id}/${lang}: appended ${n} sections`);
  }
}
