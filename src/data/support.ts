/** Public support-page data. Never put private donor or payment records here. */
export type LocalizedText = { zh: string; ja: string; en: string; 'zh-tw'?: string; 'zh-hk'?: string };

export interface SupportChannel {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  /** null keeps the channel visible, without an active payment link. */
  url: string | null;
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
