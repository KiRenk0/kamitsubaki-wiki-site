# Support page configuration

Routes: `/support` redirects to `/zh/support/`. Localized pages use
`/{locale}/support/` for `zh`, `zh-tw`, `zh-hk`, `ja`, and `en`.
The existing footer and language switcher link to the localized route.

## Public data

Edit `src/data/support.ts`. It exports the typed `SupportData` structure:

- `channels`: add a channel with a stable `id`, localized `name` and
  `description`, and the project's verified HTTPS `url`. `null` shows a
  “coming soon” label without a clickable link. The Afdian and GitHub Sponsors
  entries are intentionally awaiting real account URLs. Additional channels
  render through the same component; no platform-specific SDK is needed.
- `currency`: ISO currency code for operating cost estimates (initially CNY).
- `costs`: annual estimates in major currency units, not cents. Use `null` for
  unpublished figures and `0` only for a verified zero cost. Estimates are
  separate from actual annual expenses.
- `annualReports`: add one record per year; newest appears first. Each record
  specifies its own `currency`, net `received` after platform fees, actual
  `spent`, `asOf` date (`YYYY-MM-DD`), optional localized `note`, and optional
  HTTPS `reportUrl`. Do not mix currencies in a record. Use `asOf` and `note`
  to identify partial-year coverage. The displayed difference is receipts
  minus expenses, excluding prior-year balances; it remains unpublished if
  either amount is unknown. Negative differences are supported.
- `sponsors`: public display names only, stable `id`, optional HTTPS profile
  `url`, and explicit `public: true` consent for display. Array order determines
  display order, without tiers or amount ranking. Do not commit private names,
  contact details, transaction IDs, or payment records, even if `public` is
  false. The initial empty list is intentional, not a fabricated supporter list.

Example public sponsor, after permission has been obtained:

```ts
{ id: 'community-member', name: 'Display name', public: true, url: null }
```

## Copy and presentation

`src/data/supportCopy.ts` contains the page and footer copy in Simplified Chinese,
Japanese, and English. Existing `resolveLocaleCopy` handles Taiwan and Hong Kong
Traditional Chinese conversion. Channel and cost descriptions live beside their
data in `support.ts`, with the same three source languages.

The page uses `BaseLayout`, `SiteNav`, `SiteFooter`, and the existing language and
theme controls. `src/styles/support.css` uses the shared theme/color/radius tokens.
Year records use native `<details>` and require no page-specific JavaScript.

## Live API integration

The static data remains the build-time fallback. `src/scripts/supportPage.js`
fetches `GET /api/support` from `PUBLIC_SUPPORT_API_BASE` (default:
`https://api.kamitsubaki.wiki`) when the page opens or the reader selects refresh.
Only validated public data replaces the four dynamic regions; the layout, copy,
navigation, and open/closed yearly records are retained. Optional session cache
preserves a recent successful response, and failures leave existing content in
place with a retry action. Without JavaScript the build-time fallback remains.

Manage actual data at the backend `/admin/support` console: edit, save draft,
then publish. No frontend rebuild is needed for published data updates. Annual
receipts and expenses are derived from editable ledger entries; published
entries are shown in each annual record. The backend public contract is documented
in its `docs/support.md`. Public names/descriptions carry locale keys; new text
uses the matching translation, falling back to Simplified Chinese when empty.

For local development, set `PUBLIC_SUPPORT_API_BASE=http://127.0.0.1:8789` while
running the backend's isolated `scripts/preview-support-admin.mjs` harness.
Keep this local URL out of production builds. The API must allow the frontend
origin through the existing backend CORS configuration.

The frontend includes no payment SDK, login, or membership system. The backend
uses the existing administrator login and D1 binding; there are no payment
webhooks. Support never unlocks KAMITSUBAKI content or changes reading access.

特别协力者由后端 `/admin/collaborators` 独立编辑发布，公共接口为 `/api/collaborators`。前端入口仍是首页现有“特别协力者”名片，不并入赞助墙。`PUBLIC_COLLABORATORS_API_BASE` 可覆盖接口域名；原有 `src/data/manualContributors.json` 保留为静态兜底。控制台支持公开资料、多语言、联系方式、隐藏和排序；具体迁移与 API 见后端 `docs/support.md`。

## 共用名单排序

`src/lib/supporterOrder.mjs` 为特别协力者和 Sponsor Wall 共用的排序函数：`pinned: true` 按后台顺序置于最前，其余随机排列，不修改原始数据。后台上移/下移控制置顶项之间的顺序；取消置顶后回到随机组，保存并发布后生效。静态兜底与 API 使用同样规则。小池默认置顶保存在 `src/data/manualContributors.json`，不再写死在组件中。

名单分别通过 `/admin/collaborators` 和 `/admin/support` 的感谢名单编辑。后端种子位于 `content/collaboratorDefaults.json`、`content/supportDefaults.json`，已建立草稿后以后台数据为准。API 故障时可能保留旧缓存或构建时的兜底名单；需要彻底撤下署名时，应同时更新静态兜底并重建。

后台新增历史恢复、JSON 导入/导出和快捷保存；完整迁移、发布与回滚步骤见后端 `docs/support-release.md`。本轮未部署生产。
