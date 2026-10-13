import curatedTitles from '../data/gallery-display-titles.json' with {type:'json'};
// Display names are separate from immutable source titles and creator credits.
const terms = [
 [/classroom group screenshot/gi, '教室群像截图'],
 [/classroom portrait screenshot/gi, '教室角色截图'],
 [/combined 2DAYS LIVE announcement/gi, '双日演出宣传图'],
 [/exhibition key visual/gi, '展览主视觉'],
 [/collaboration key visual/gi, '联动主视觉'],
 [/album artwork|アルバムアートワーク/gi, '专辑视觉'],
 [/Haru character official game screenshot/gi, '春琉角色游戏截图'],
 [/Haru character game key visual/gi, '春琉角色游戏主视觉'],
 [/official music[- ]video key visual/gi, 'MV 主视觉'],
 [/official game key visual/gi, '游戏主视觉'],
 [/official game screenshot/gi, '游戏截图'],
 [/official music[- ]video/gi, 'MV'],
 [/streaming cover-live key visual/gi, '翻唱演出主视觉'],
 [/MVキービジュアル|MVビジュアル|MV illustration/gi, 'MV 插画'],
 [/公式ライブKV|ライブキービジュアル|演唱会主视觉/g, '演出主视觉'],
 [/公式コラボKV/g, '联动主视觉'],
 [/公式六人キービジュアル/g, '六人主视觉'],
 [/キービジュアル|key visual|公式KV/gi, '主视觉'],
 [/公式ファンアート/g, '官方同人插画'],
 [/MVイラスト|MV用イラスト/g, 'MV 插画'],
 [/線画ジャケット/g, '线稿封面'],
 [/ジャケット/g, '封面'],
 [/公開原画/g, '公开原画'],
 [/OFFICIAL LIVE GOODS|OFFICIAL GOODS|STANDARD GOODS/gi, '官方周边视觉'],
 [/公式アーティスト集合ビジュアル/g, '官方团体视觉'],
 [/公式アーティストビジュアル/g, '官方艺人视觉'],
 [/公式特集ページビジュアル/g, '官方专题视觉'],
 [/公開ビジュアル/g, '公开视觉'],
 [/コラボビジュアル|コラボレーション・アート/g, '联动视觉'],
 [/KVイラスト/g, '主视觉插画'],
 [/アートワーク/g, '作品视觉'],
 [/Special BOX/gi, '特别版 BOX'],
 [/Streaming Cover Live|Cover Live/gi, '翻唱演出'],
 [/([0-9]+)(?:st|nd|rd|th) ONE-MAN LIVE/gi, '第 $1 场个人演出'],
 [/ONE-MAN LIVE/gi, '个人演出'],
 [/TWO-MAN LIVE/gi, '双人演出'],
 [/VIRTUAL MINI LIVE/gi, '虚拟迷你演出'],
 [/\bKV\b/g, '主视觉'],
 [/動画用公式配布イラスト/g, '官方视频配布插画'],
 [/告知ビジュアル/g, '活动宣传图'],
 [/album box-front illustration/gi, '专辑外盒插画'],
 [/公式/g, '官方'],
];
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export function galleryDisplayText(value, names = [], locale = 'zh') {
 let result = String(value || '').trim();
 if (!locale.startsWith('zh')) return result;
 for (const [alias, name] of [...names].sort((a,b)=>b[0].length-a[0].length)) {
  if (!alias || alias === name) continue;
  const pattern = /^[\x00-\x7F]+$/.test(alias) ? `(?<![\\p{L}\\p{N}])${escape(alias)}(?![\\p{L}\\p{N}])` : escape(alias);
  result = result.replace(new RegExp(pattern, 'gu'), () => name);
 }
 for (const [pattern, replacement] of terms) result = result.replace(pattern, replacement);
 return result.replace(/\s*[—–]\s*/g, '｜').replace(/\s*\|\s*/g,'｜').replace(/\s{2,}/g,' ').trim();
}
/** @param {any} photo @param {{subject?:string,type?:string,locale?:string,names?:string[][]}} options */
export function galleryPhotoPresentation(photo, {subject='', type='', locale='zh', names=[]} = {}) {
 const curated=locale==='zh'?curatedTitles[photo.id]:undefined;
 const currentTitle=String(photo.title||photo.name||'');
 // Only the exact imported revision gets an editorial display override.
 // A later community correction takes precedence automatically.
 const matching=curated&&currentTitle===curated.original;
 if(matching)subject=curated.subject;
 let title = matching?curated.title:galleryDisplayText(currentTitle, names, locale);
 if (/^[\da-f-]{30,}\.(?:jpe?g|png|webp|gif|avif)$/i.test(title)) title = '';
 if (subject && title.startsWith(subject) && (title===subject || /^[\s｜/·:：「『\d-]/u.test(title.slice(subject.length)))) title = title.slice(subject.length).replace(/^[\s｜/·:：-]+/,'');
 title = title.replace(/\.(?:png|jpe?g|webp|avif)$/i, '').trim();
 if (locale.startsWith('zh')) {
  const purpose=title.match(/(?:MV 主视觉|游戏主视觉|演出主视觉|展览主视觉|联动主视觉|六人主视觉|主视觉(?:插画)?|MV 插画|线稿封面|封面|公开原画|游戏截图|官方周边视觉|活动宣传图|专辑外盒插画|专辑视觉|作品视觉)(?:\s*\d+)?$/u);
  if(purpose){const prefix=title.slice(0,purpose.index).trim();if(prefix&&!prefix.endsWith('｜'))title=`${prefix}｜${purpose[0]}`;}
  title = title.replace(/｜\s+/g,'｜');
  const material = String(photo.notes || '').match(/(?:^|\n)资料类型：([^\n。]{1,60})/);
  if (!matching && photo.setId && material && !title.includes(material[1])) title += `｜${material[1]}`;
  const shot = String(photo.sourceTitle || '').match(/カット\s*(\d+)/);
  if (shot && photo.setId && !title.includes(`镜头 ${shot[1]}`)) title += `｜镜头 ${shot[1]}原画`;
 }
 if (!title) title = type;
 // A single separator format is also used in the viewer and accessible labels.
 const fullTitle = [subject,title].filter(Boolean).join('｜');
 return {title, fullTitle, subject, type};
}
