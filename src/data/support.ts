/** Public support-page data. Never put private donor or payment records here. */
export type LocalizedText = { zh: string; ja: string; en: string; 'zh-tw'?: string; 'zh-hk'?: string };

export interface SupportChannel {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  /** null keeps the channel visible, without an active payment link. */
  url: string | null;
  qrImageUrl?: string | null;
  qrCrop?: {sourceUrl:string;x:number;y:number;width:number;height:number;sourceWidth:number;sourceHeight:number} | null;
  recipientLabel?: LocalizedText | null;
}

export interface SupportCost {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  /** Annual estimate, in major currency units; null means not published. */
  annualEstimate: number | null;
}

export interface SupportAnnualReport {
  year: number;
  currency: string;
  /** Net receipts after platform fees, and actual project expenses. */
  received: number | null;
  spent: number | null;
  /** ISO date (YYYY-MM-DD) through which the figures are recorded. */
  asOf: string | null;
  note: LocalizedText | null;
  reportUrl: string | null;
  entries?: { id: string; date: string; type: 'income' | 'expense'; description: LocalizedText; amount: number }[];
}

export interface Sponsor {
  tier?: string;
  pinned?: boolean;
  id: string;
  name: string;
  /** Public opt-in only. Do not store private names even with this set false. */
  public: boolean;
  url: string | null;
}

export interface SupportData {
  currency: string;
  channels: SupportChannel[];
  costs: SupportCost[];
  annualReports: SupportAnnualReport[];
  sponsors: Sponsor[];
}

export const supportData: SupportData = {
  currency: 'CNY',
  channels: [
    {
      id: 'afdian',
      name: { zh: '爱发电', ja: '愛発電 / Afdian', en: 'Afdian' },
      description: {
        zh: '通过爱发电支持日常维护，让这份共同整理的记录持续更新。',
        ja: '愛発電を通じて、日々のメンテナンスと記録の更新を支援できます。',
        en: 'Help maintain the wiki and keep our shared archive growing through Afdian.',
      },
      url: 'https://afdian.com/a/LinkTh1rsty',
      qrImageUrl: 'https://kamitsubaki.wiki/support-qr/afdian.svg',
    },
    {
      id: 'github-sponsors',
      name: { zh: 'GitHub Sponsors', ja: 'GitHub Sponsors', en: 'GitHub Sponsors' },
      description: {
        zh: '通过 GitHub Sponsors 支持项目的开发、维护与社区共建。',
        ja: 'GitHub Sponsors を通じて、開発・保守とコミュニティの活動を支援できます。',
        en: 'Support development, maintenance, and community contributions through GitHub Sponsors.',
      },
      url: null,
    },
    {"id": "wechat", "name": {"zh": "微信赞赏", "zh-tw": "微信讚賞", "zh-hk": "微信讚賞", "ja": "WeChat 支援", "en": "WeChat appreciation"}, "description": {"zh": "使用微信扫一扫打开赞赏页面，为观测站发一份电。支持自愿，金额由你自主决定。", "zh-tw": "使用微信掃一掃開啟讚賞頁面，為觀測站發一份電。支持自願，金額由你自主決定。", "zh-hk": "使用微信掃一掃開啟讚賞頁面，為觀測站發一份電。支持自願，金額由你自主決定。", "ja": "WeChatで支援コードを読み取ってください。支援は任意、金額は自由です。", "en": "Scan the appreciation code with WeChat. Supporting is optional, and the amount is up to you."}, "url": null, "qrImageUrl": "https://kamitsubaki.wiki/support-qr/wechat-appreciation.png", "recipientLabel": {"zh": "赞赏方：リンク._Official", "zh-tw": "讚賞方：リンク._Official", "zh-hk": "讚賞方：リンク._Official", "ja": "受取人：リンク._Official", "en": "Recipient: リンク._Official"}, "qrCrop": {"sourceUrl": "https://kamitsubaki.wiki/support-qr/wechat-appreciation.png", "x": 318, "y": 183, "width": 516, "height": 516, "sourceWidth": 1152, "sourceHeight": 1152}},
    {"id": "alipay", "name": {"zh": "支付宝", "zh-tw": "支付寶", "zh-hk": "支付寶", "ja": "Alipay", "en": "Alipay"}, "description": {"zh": "使用支付宝扫一扫，支持站点运行、资料整理与持续维护。金额由你自主决定。", "zh-tw": "使用支付寶掃一掃，支持站點運行、資料整理與持續維護。金額由你自主決定。", "zh-hk": "使用支付寶掃一掃，支持網站運作、資料整理與持續維護。金額由你自主決定。", "ja": "Alipayで読み取ると、サイトの運営・資料整理・保守を支援できます。金額は自由です。", "en": "Scan with Alipay to support hosting, research and maintenance. Choose your own amount."}, "url": null, "qrImageUrl": "https://kamitsubaki.wiki/support-qr/alipay.jpg", "recipientLabel": {"zh": "收款方：Th1tsty.(**哲)", "zh-tw": "收款方：Th1tsty.(**哲)", "zh-hk": "收款方：Th1tsty.(**哲)", "ja": "受取人：Th1tsty.(**哲)", "en": "Recipient: Th1tsty.(**哲)"}, "qrCrop": {"sourceUrl": "https://kamitsubaki.wiki/support-qr/alipay.jpg", "x": 336, "y": 960, "width": 1036, "height": 1036, "sourceWidth": 1708, "sourceHeight": 2560}},
  ],
  costs: [
    {
      id: 'domain',
      name: { zh: '域名', ja: 'ドメイン', en: 'Domain' },
      description: { zh: '域名续费，让观测站始终有一个固定地址。', ja: '観測所のアドレスを維持するためのドメイン更新。', en: 'Domain renewals to keep a permanent home for the archive.' },
      annualEstimate: null,
    },
    {
      id: 'infrastructure',
      name: { zh: '托管与基础设施', ja: 'ホスティング・インフラ', en: 'Hosting & infrastructure' },
      description: { zh: '站点托管、计算与存储等运行资源。', ja: 'ホスティング、コンピューティング、ストレージなどの運用リソース。', en: 'Hosting, compute, and storage that keep the site available.' },
      annualEstimate: null,
    },
    {
      id: 'services',
      name: { zh: '站点服务', ja: 'サイト内サービス', en: 'Site services' },
      description: { zh: '搜索、AI 辅助等公共功能所需的服务用量。', ja: '検索や AI 補助など、公開機能に必要なサービス利用料。', en: 'Service usage for shared features such as search and AI assistance.' },
      annualEstimate: null,
    },
    {
      id: 'maintenance',
      name: { zh: '维护与工具', ja: '保守・ツール', en: 'Maintenance & tools' },
      description: { zh: '备份、监测与持续维护所需的工具。', ja: 'バックアップ、監視、継続的な保守に必要なツール。', en: 'Tools for backups, monitoring, and ongoing maintenance.' },
      annualEstimate: null,
    },
  ],
  annualReports: [
    { year: 2026, currency: 'CNY', received: null, spent: null, asOf: null, note: null, reportUrl: null },
  ],
  sponsors: [],
};
