// Stage taxonomy for the format-guide skeleton (contribute/format-guide):
//   概述 → 角色与创作定位 → 基本资料与人物设定 → 活动历程 → 代表作品 →
//   相关企划 → 参考资料 → 外部链接
// Numeric stages: 0 preamble (intro before the first `##`), 1 概述, 2 创作定位,
// 3 基本资料/设定, 4 活动历程, 5 代表作品/数据, 5.5 相关企划与关联结构,
// 6 参考资料, 7 外部链接. First match wins, so the order of this table matters.
const STAGES = [
  [7, /外部链接|外部連結|外部リンク|External Links|外部網站|外部网站/],
  [6, /参考资料|參考資料|参考資料|参考文献|參考文獻|References|Sources|出典|来源|來源|参见|參見/],

  // 概述 / 概念定义
  [1, /概述|概要|Overview|简介|簡介|介紹|Introduction|(?<!サウンドトラック)(?<!アルバム)紹介|引言|はじめに|概念|Concept|Definition|定義|定义|什么是|とは/],

  // 先处理语义明确但会被 stage 1/2 关键词抢先匹配的标题
  [3, /デザインと声の位置づけ|Design and Voice Positioning/],

  // 角色与创作定位
  [2, /创作定位|創作定位|企划定位|企劃定位|位置づけ|位置|Positioning|Position|Place|创作谱系|創作系譜|Lineage|役割と創作|Role and Creative|Role in|艺术定位|藝術定位|音楽性|音乐风格|音樂風格|音乐性|創作理念|创作理念|创作哲学|創作哲學|Artistic|艺术语言|芸術言語|美学|美學|Aesthetic|Musical Style|Musicality|风格|風格|Style|人物像|性格|Personality|役割/],

  // 「代表作品与相关条目」类标题以作品清单为主体，仍归入代表作品
  [5, /代表作品と関連項目|代表作品与相关条目|代表作品與相關條目|Representative Works and Related Entries|Works and Related|代表作品与关联|代表作品與關聯/],

  // 相关企划 / 关联结构
  [5.5, /相关企划|相關企劃|关联企划|關聯企劃|関連企画|関連設定|关联结构|關聯結構|相关项目|相關項目|関連項目|项目关联|項目關聯|関連プロジェクト|关联项目|Project connections|Related|Links to|つながり|関わり|伴走|Symbiotic|Relationship|Interaction|Affiliated|Brand|関連ブランド|施設|设施|设施|企画との関わり|企划との関わり|企划的关联|企劃的關聯|与其他企划|との関係|伴生关系|伴生關係|新ユニット|新组合|新組合|New Unit|関係系譜|关系谱系|關係譜系/],

  // 基本资料与人物设定
  [3, /基本资料|基本資料|Basic Information|人物设定|人物設定|キャラクター設定|Character Setting|Basic Profile|角色设计|角色設計|角色视觉|角色視覺|角色形象|视觉|視覺|Visual|造型|形態|形态|设定|設定|設計|设计|Design|形象|伙伴|相棒|使魔|Familiar|Companion|拉普拉斯|Laplace|哈斯塔|Hastur|anemos|Forms|歌唱形态|歌唱形態|造形|ビジュアル|デザイン|プロフィール|Profile|Core Members|Members|メンバー|成员|成員|Staff|スタッフ|制作人员|制作陣|Line-up|Roster|旗下|所属|所属メンバー|登場|Characters|キャラクター|Worldview|架构|架構|板块|板塊|Divisions|Label|少女「アメ」|命名の含意|命名内涵|命名內涵|Meaning of the Name|組の構成|组合构成|組合構成|Girl “Ame”|Girl "Ame"|レーベル構成と創作部門|創作部門/],

  // 活动历程
  [4, /活动历程|活動歷程|活动历史|活動歷史|活動歴|活動略歴|活動履歴|活动略历|歩み|あゆみ|Activity|Activities|Briefs|历程|歷程|History|経歴|Career|沿革|年表|Chronology|Timeline|年譜|演出|现场|現場|巡演|Tour|上映|ライブ|Live|配音|Voice Acting|声優|出演|商业|商業|电台|電台|Radio|广播|廣播|媒体|媒體|Tie|タイアップ|联动|聯動|Exhibition|展|发布|發佈|Restructuring|組織再編|再編|重组|重組|变迁|變遷|Evolution|Business|Model|运营|運営|Operating|里程碑|Milestone|戦役|战役|戰役|最近の活動|近期活动|近期活動|コラボレーションと最近の活動|配信番組|直播节目|直播節目|Streaming Programme/],


  // 代表作品 / 曲目 / 数据档案
  [5, /代表作品|作品|曲目|曲|歌|Songs|Song|Works|Discography|Album|アルバム|专辑|專輯|合辑|合輯|名曲|Archive|アーカイブ|Archiving|归档|歸檔|索引|Index|Catalogue|Catalog|目录|目錄|统计|統計|Statistics|データ|Data|記録|记录|档案|檔案|资料|資料|Specs|Specification|仕様|技术|技術|制作规格|製作規格|引擎|エンジン|Compilation|コンピレーション|命名|Naming|Name and Identity|Meaning of the Name|授权|授權|Licensing|生态|生態|Ecosystem|社群|Community|コミュニティ|チャンネル|文化|Culture|Anecdotes|轶事|軼事|エピソード|Gallery|ギャラリー|Series|シリーズ|系列|Record|投稿|Upload|Uploads|Soundtrack|サウンドトラック|紹介|Cover|声劇|Audio Drama|御伽噺|Commissioned-song|Vol\.|Music and|音楽と|音乐与|音樂與|同位体|Isotope|Composition|構成と創作/]
];

export function stageOf(heading) {
  if (!heading) return 0;
  const h = heading.replace(/^#+\s*/, '');
  for (const [stage, re] of STAGES) if (re.test(h)) return stage;
  return null; // unknown
}
