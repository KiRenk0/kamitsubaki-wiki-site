import {resolveLocaleCopy} from './i18n.mjs';

// The previous public catalog is archived outside the repository while the
// reader-facing documentation is rewritten. Keep old URLs redirectable.
export const retiredDocSlugs=[
 'using-the-site','editor','frontend-system','contributing','files-and-images',
 'licensing','metadata-schema','entity-classification','feature-maintenance',
 'article-publishing','gallery-r2','page-system','reader','architecture',
 'release-runbook',
];

export const docsCenterCopy=locale=>resolveLocaleCopy({
 zh:{title:'文档中心',eyebrow:'DOCUMENTATION',home:'返回首页',intro:'旧文档已归档，新的使用与贡献指南正在整理。',notice:'文档整理中',detail:'目前暂无可阅读的文档。投稿入口仍可正常使用。',contribute:'前往参与共建'},
 en:{title:'Documentation',eyebrow:'DOCUMENTATION',home:'Back to home',intro:'The previous documents have been archived while the new guides are prepared.',notice:'Guides in progress',detail:'No documents are available to read yet. Contribution tools remain available.',contribute:'Go to contribute'},
 ja:{title:'ドキュメントセンター',eyebrow:'DOCUMENTATION',home:'ホームへ',intro:'旧文書を保管し、新しい利用・投稿ガイドを整理しています。',notice:'文書を整理中',detail:'現在、公開中の文書はありません。投稿機能は引き続き利用できます。',contribute:'投稿へ'},
},locale);
