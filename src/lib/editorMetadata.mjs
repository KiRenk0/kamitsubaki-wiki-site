export const metadataDefaults = {
  seo:{title:'',description:'',image:'',keywords:[],noindex:false},
  theme:{name:'',accentColor:'#6bd7c3',mutedColor:'#397c70',surfaceColor:'#111211',highlightColor:'#f1faf7',palette:[{label:'',value:'#6bd7c3'}]},
  license:{code:'CC-BY-NC-SA-4.0',attribution:'',sourceTitle:'',sourceUrl:'',modifications:'',note:''},
  officialLinks:[{label:'',href:''}], featuredEntries:[{label:'',href:'',kind:'artist'}],
  tracks:[{disc:1,number:'1',title:'',artist:'',duration:'',songId:''}],
  lyricsSources:[{label:'',href:'',provider:'official',checkedAt:''}],
  artistIds:[],affiliations:[],designCredits:[],contentStatus:'published',inactive:false,
  debutDate:'',categoryOrder:0,itemOrder:0,categorySubtitle:'',code:'',meta:'',romanizedTitle:'',duration:'',
};
export const metadataOptions = kind => ['seo','license', ...(['artists','songs','albums'].includes(kind)?['theme','categoryOrder','itemOrder','categorySubtitle','code']:[]), ...({artists:['officialLinks','featuredEntries','affiliations','designCredits','inactive','debutDate','meta','contentStatus'],songs:['artistIds','lyricsSources','contentStatus'],albums:['officialLinks','tracks','romanizedTitle','duration'],projects:['officialLinks'],logs:[]}[kind]||[])];
const names = {
  seo:['搜索与分享','Search and sharing','検索・共有'],theme:['主题配色','Theme colors','テーマ配色'],license:['授权与署名','License and attribution','ライセンス・帰属'],officialLinks:['官方链接','Official links','公式リンク'],featuredEntries:['相关词条','Related articles','関連記事'],tracks:['曲目列表','Track list','収録曲'],lyricsSources:['歌词来源','Lyric sources','歌詞の出典'],artistIds:['参与艺人标识','Contributing artist IDs','参加アーティスト ID'],affiliations:['所属组合 / 厂牌','Affiliations','所属'],designCredits:['设计人员','Design credits','デザイン担当'],contentStatus:['完善状态','Completeness','整備状況'],inactive:['停止活动','Inactive','活動終了'],debutDate:['出道日期','Debut date','デビュー日'],categoryOrder:['分类排序','Category order','カテゴリ順'],itemOrder:['词条排序','Entry order','記事順'],categorySubtitle:['分类副标题','Category subtitle','カテゴリ副題'],code:['编号','Code','コード'],meta:['附注','Note','備考'],romanizedTitle:['罗马字标题','Romanized title','ローマ字タイトル'],duration:['时长','Duration','長さ'],
  title:['标题','Title','タイトル'],description:['说明','Description','説明'],image:['图片地址','Image URL','画像 URL'],keywords:['关键词','Keywords','キーワード'],noindex:['不被搜索引擎收录','Hide from search engines','検索エンジンから除外'],name:['名称','Name','名前'],accentColor:['主色','Accent color','メイン色'],mutedColor:['辅助色','Muted color','補助色'],surfaceColor:['背景色','Surface color','背景色'],highlightColor:['高光色','Highlight color','強調色'],palette:['色板','Palette','パレット'],label:['显示名称','Label','表示名'],value:['颜色值','Color value','色値'],attribution:['原作者署名','Attribution','著者名'],sourceTitle:['原文标题','Source title','原文タイトル'],sourceUrl:['原文链接','Source URL','原文 URL'],modifications:['修改说明','Modifications','変更点'],note:['补充说明','Note','備考'],href:['链接','Link','リンク'],kind:['类型','Kind','種類'],disc:['碟号','Disc','ディスク番号'],number:['曲序','Track number','曲順'],artist:['艺人','Artist','アーティスト'],songId:['歌曲条目路径','Song entry path','楽曲記事パス'],provider:['来源类型','Source type','出典種別'],checkedAt:['核对日期','Checked on','確認日'],
};
export function metadataLabel(key,locale) { return names[key]?.[locale==='en'?1:locale==='ja'?2:0] || key; }
export const metadataChoices = {
  'license.code':['CC-BY-NC-SA-4.0','CC-BY-NC-SA-3.0-CN','rights-reserved','authorized-use'],
  contentStatus:['published','stub'],provider:['official','publisher','lyrics-service'],kind:['artist','project','album','song'],
};
export function newMetadataItem(path, array) {
  const key=path.split('.')[0];
  if(key==='theme'&&path.endsWith('palette'))return {label:'',value:'#6bd7c3'};
  const exemplar=metadataDefaults[key]?.[0];
  if(exemplar&&typeof exemplar==='object')return structuredClone(exemplar);
  const existing=array.find(item=>item&&typeof item==='object');
  return existing ? Object.fromEntries(Object.entries(existing).map(([key,value])=>[key,typeof value==='number'?0:typeof value==='boolean'?false:Array.isArray(value)?[]:''])) : '';
}
export function advancedErrors(meta) {
  const errors=[];
  const link = value => /^(?:https?:\/\/[^\s]+|\/(?!\/)[^\s]*)$/.test(value || '');
  if(meta.theme) {
    if(!meta.theme.accentColor||!Array.isArray(meta.theme.palette)) errors.push('theme');
    for(const row of meta.theme.palette||[])if(!row.label||!/^#[0-9a-f]{6}$/i.test(row.value))errors.push('theme');
  }
  if(meta.license) {
    if(!metadataChoices['license.code'].includes(meta.license.code))errors.push('license');
    if(meta.license.sourceUrl&&!link(meta.license.sourceUrl))errors.push('license');
    if(meta.license.code==='CC-BY-NC-SA-3.0-CN'&&['attribution','sourceTitle','sourceUrl','modifications'].some(key=>!meta.license[key]))errors.push('license');
  }
  for(const key of ['officialLinks','featuredEntries','lyricsSources'])for(const row of meta[key]||[]) {
    if(!row.label||!link(row.href))errors.push(key);
    if(key==='lyricsSources'&&(!row.href.startsWith('https://')||!metadataChoices.provider.includes(row.provider)||!/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/.test(row.checkedAt)))errors.push(key);
    if(key==='featuredEntries'&&!metadataChoices.kind.includes(row.kind))errors.push(key);
  }
  if(meta.artistIds && (!meta.artistIds.includes(meta.artistId)||new Set(meta.artistIds).size!==meta.artistIds.length||meta.artistIds.some(id=>! /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))))errors.push('artistIds');
  for(const row of meta.tracks||[])if(!row.title||(row.disc!==undefined&&(!Number.isInteger(row.disc)||row.disc<1)))errors.push('tracks');
  return [...new Set(errors)];
}
