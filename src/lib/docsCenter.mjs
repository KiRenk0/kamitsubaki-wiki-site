import contributingZh from '../../docs/contributing.md?raw';
import contributingEn from '../../docs/contributing.en.md?raw';
import contributingJa from '../../docs/contributing.ja.md?raw';
import filesZh from '../../docs/files-and-images.md?raw';
import filesEn from '../../docs/files-and-images.en.md?raw';
import filesJa from '../../docs/files-and-images.ja.md?raw';
import licensingZh from '../../docs/licensing.md?raw';
import licensingEn from '../../docs/licensing.en.md?raw';
import licensingJa from '../../docs/licensing.ja.md?raw';
import metadata from '../../docs/category-optimization/metadata-schema-v2.md?raw';
import classification from '../../docs/maintenance/entity-classification.md?raw';
import features from '../../docs/v3/feature-maintenance.md?raw';
import articles from '../../docs/v3/article-publishing.md?raw';
import gallery from '../../docs/v3/gallery-r2.md?raw';
import pageSystem from '../../docs/design/page-system.md?raw';
import reader from '../../docs/reader-component.md?raw';
import architectureZh from '../../docs/architecture.md?raw';
import architectureEn from '../../docs/architecture.en.md?raw';
import architectureJa from '../../docs/architecture.ja.md?raw';
import release from '../../docs/operations/release-runbook.md?raw';
import {resolveLocaleCopy} from './i18n.mjs';
import {dirname,posix} from 'node:path';

const localized=(zh,en,ja)=>({zh,en,ja});

export const docsCenterCopy=locale=>resolveLocaleCopy({
  zh:{title:'文档中心',intro:'查找投稿、内容维护、界面设计与发布流程的现行规范。每份文档都有稳定地址，历史资料不会混入操作指南。',eyebrow:'DOCUMENTATION',home:'返回首页',contribute:'贡献中心',search:'搜索文档',searchHint:'输入标题、用途或关键词',all:'全部',empty:'没有匹配的文档',contents:'本篇目录',back:'返回文档中心',language:'文档语言',source:'仓库原文',read:'阅读文档',current:'现行规范',guide:'操作指南'},
  en:{title:'Documentation',intro:'Find the current rules for contribution, content maintenance, interface design and release work. Every document has a stable address.',eyebrow:'DOCUMENTATION',home:'Back to home',contribute:'Contribution hub',search:'Search documentation',searchHint:'Search titles, tasks or keywords',all:'All',empty:'No matching documents',contents:'On this page',back:'Back to documentation',language:'Document language',source:'Repository source',read:'Read document',current:'Current standard',guide:'Procedure'},
  ja:{title:'ドキュメントセンター',intro:'投稿、コンテンツ保守、画面設計、リリース作業の現行ルールを探せます。各文書には安定した URL があります。',eyebrow:'DOCUMENTATION',home:'ホームへ',contribute:'貢献センター',search:'文書を検索',searchHint:'タイトル・用途・キーワードで検索',all:'すべて',empty:'該当する文書はありません',contents:'この文書の目次',back:'文書一覧へ',language:'文書の言語',source:'リポジトリ原文',read:'文書を読む',current:'現行規則',guide:'操作ガイド'},
},locale);

export const docsCategories=[
  {id:'start',number:'01',label:localized('投稿与入门','Contribute','投稿と入門')},
  {id:'content',number:'02',label:localized('内容与功能','Content and features','コンテンツと機能')},
  {id:'design',number:'03',label:localized('界面与组件','Interface and components','画面とコンポーネント')},
  {id:'system',number:'04',label:localized('架构与发布','Architecture and release','構成とリリース')},
];

export const docsCatalog=[
  {slug:'contributing',category:'start',title:localized('贡献指南','Contribution guide','貢献ガイド'),summary:localized('从选择修改到提交审核的完整流程。','The complete path from choosing a change to review.','修正の選択からレビュー提出までの流れ。'),status:'guide',language:'localized',source:'docs/contributing.md',markdown:localized(contributingZh,contributingEn,contributingJa),keywords:'投稿 编辑 review github'},
  {slug:'files-and-images',category:'start',title:localized('图片与附件','Images and files','画像とファイル'),summary:localized('词条附件、目录、命名、来源与上传规则。','Paths, names, sources and upload rules for article assets.','記事画像のパス、命名、出典、アップロード規則。'),status:'current',language:'localized',source:'docs/files-and-images.md',markdown:localized(filesZh,filesEn,filesJa),keywords:'图片 附件 image upload r2'},
  {slug:'licensing',category:'start',title:localized('许可与署名','Licensing and attribution','許諾と署名'),summary:localized('文字、图片和第三方材料的许可边界。','Licensing boundaries for text, images and third-party material.','文章・画像・第三者素材の許諾範囲。'),status:'current',language:'localized',source:'docs/licensing.md',markdown:localized(licensingZh,licensingEn,licensingJa),keywords:'版权 授权 license attribution'},
  {slug:'metadata-schema',category:'content',title:localized('元数据规范','Metadata schema','メタデータ仕様'),summary:localized('V3 实体类型、字段、关系与迁移规则。','V3 entity types, fields, relations and migration rules.','V3 の型、フィールド、関係、移行規則。'),status:'current',language:'zh',source:'docs/category-optimization/metadata-schema-v2.md',markdown:metadata,keywords:'metadata frontmatter yaml entity schema'},
  {slug:'entity-classification',category:'content',title:localized('实体分类维护','Entity classification','エンティティ分類'),summary:localized('新增条目、多分类、团体成员与形态的维护方法。','How to maintain new records, multiple categories, groups and forms.','新規項目、複数分類、グループ、形態の保守方法。'),status:'current',language:'zh',source:'docs/maintenance/entity-classification.md',markdown:classification,keywords:'分类 目录 艺人 团体 morphing'},
  {slug:'feature-maintenance',category:'content',title:localized('功能数据维护','Feature data maintenance','機能データ保守'),summary:localized('时间轴、关联、图库与跨词条数据的维护入口。','Maintenance paths for chronology, relations, gallery and linked data.','年表、関係、ギャラリー、連携データの保守。'),status:'current',language:'zh',source:'docs/v3/feature-maintenance.md',markdown:features,keywords:'时间轴 关联 chronicle relations'},
  {slug:'article-publishing',category:'content',title:localized('文章投稿与审核','Article publishing','記事投稿とレビュー'),summary:localized('D1 文章投稿、编辑、审核与公开流程。','D1 article submission, editing, review and publication.','D1 記事の投稿、編集、レビュー、公開。'),status:'guide',language:'zh',source:'docs/v3/article-publishing.md',markdown:articles,keywords:'文章 投稿 d1 审核'},
  {slug:'gallery-r2',category:'content',title:localized('图库投稿与审核','Gallery and R2','ギャラリーと R2'),summary:localized('R2 图片上传、角色元数据和审核公开流程。','R2 uploads, character metadata and moderated publication.','R2 アップロード、キャラクター情報、公開審査。'),status:'guide',language:'zh',source:'docs/v3/gallery-r2.md',markdown:gallery,keywords:'图库 gallery r2 worker 图片'},
  {slug:'page-system',category:'design',title:localized('二级页面规范','Secondary page system','下層ページ規則'),summary:localized('统一页面层级、按钮位置、滑块与紧凑卡片。','Shared hierarchy, actions, navigation and compact cards.','共通の階層、操作、ナビ、コンパクトカード。'),status:'current',language:'zh',source:'docs/design/page-system.md',markdown:pageSystem,keywords:'ui 页面 组件 workspace button'},
  {slug:'reader',category:'design',title:localized('阅读器组件','Reader component','リーダーコンポーネント'),summary:localized('目录、背景、信息卡和正文阅读体验规范。','Rules for contents, backgrounds, info cards and prose.','目次、背景、情報カード、本文表示の規則。'),status:'current',language:'zh',source:'docs/reader-component.md',markdown:reader,keywords:'阅读器 reader toc 背景'},
  {slug:'architecture',category:'system',title:localized('系统架构','Architecture','システム構成'),summary:localized('前端、内容、后端和外部服务之间的边界。','Boundaries between frontend, content, backend and services.','フロント、コンテンツ、バックエンド、外部サービスの境界。'),status:'current',language:'localized',source:'docs/architecture.md',markdown:localized(architectureZh,architectureEn,architectureJa),keywords:'架构 backend worker api'},
  {slug:'release-runbook',category:'system',title:localized('V3 发布手册','V3 release runbook','V3 リリース手順'),summary:localized('构建、真实流程验收、预览与发布前检查。','Build, end-to-end acceptance, preview and release checks.','ビルド、実フロー検証、プレビュー、公開前確認。'),status:'guide',language:'zh',source:'docs/operations/release-runbook.md',markdown:release,keywords:'发布 上线 qa release cloudflare'},
];

export function localizeDoc(value,locale){return typeof value==='string'?value:resolveLocaleCopy(value,locale);}
export function getDocsCategory(id){return docsCategories.find(category=>category.id===id);}
export function getDocsDocument(slug){return docsCatalog.find(document=>document.slug===slug);}
export function rewriteDocsCenterLinks(html,document,locale){
  const bySource=new Map(docsCatalog.map(entry=>[entry.source,entry.slug]));
  return html.replace(/href="(?!https?:|\/|#)([^"?#]+\.md)(#[^"]*)?"/g,(_match,relativePath,hash='')=>{
    const source=posix.normalize(posix.join(dirname(document.source),relativePath));
    const target=bySource.get(source);
    return target
      ? `href="/${locale}/docs/${target}/${hash}"`
      : `href="https://github.com/LinkTh1rsty/kamitsubaki-wiki-site/blob/V3.0.0/${source}${hash}"`;
  });
}
