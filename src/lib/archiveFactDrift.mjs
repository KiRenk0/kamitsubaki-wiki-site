import {resolveLocaleCopy} from './i18n.mjs';

// Public edit targets must remain repository-relative on both Windows and POSIX.
function sourcePath(entry) {
 const path=String(entry.filePath || '').replaceAll('\\','/');
 const relative=path.startsWith('src/content/')?path:path.split('/src/content/')[1];
 const target=path.startsWith('src/content/')?relative:relative?'src/content/'+relative:null;
 return target && !target.split('/').includes('..') && target.endsWith('.md')?target:null;
}

export function archiveFactDrift(id,field,canonical,translation) {
 return {id,field,locale:translation.data.locale,kind:'fact-drift',
  canonical:{locale:canonical.data.locale,value:canonical.data[field],sourceFile:sourcePath(canonical)},
  translation:{locale:translation.data.locale,value:translation.data[field],sourceFile:sourcePath(translation)}};
}

export const archiveFactCopy=locale=>resolveLocaleCopy({
 zh:{canonical:'规范事实',translation:'原始译文事实',edit:'打开源稿',note:'差异尚未核实。规范值用于查询，不表示它已经由来源证实；修订前请核对原始资料。'},
 en:{canonical:'Canonical fact',translation:'Original translated fact',edit:'Open source draft',note:'This difference is unresolved. The canonical value drives queries; it is not automatically source-verified. Check original sources before editing.'},
 ja:{canonical:'基準の事実',translation:'原訳に記載された事実',edit:'原稿を開く',note:'未確認の差異です。検索の基準値は出典による確認済みとは限りません。修正前に原資料を確認してください。'},
},locale);
