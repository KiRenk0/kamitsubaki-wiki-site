---
book: "develop"
chapter: "operations"
locale: "zh-tw"
order: 4
title: "本地開發、檢查與釋出"
summary: "按前後端契約、遷移和真實流程分層驗證，保留回滾依據。"
generatedFromHash: "0a16c4e993a4192d5fdb"
generated: true
generatedFrom: "zh"
---

<!-- AUTO-GENERATED FROM zh; DO NOT EDIT DIRECTLY. -->

## 本地準備

分別確認主站與後端倉庫的分支、未提交檔案、環境變數名稱及當前服務地址。前端使用 pnpm；文件只在主站 `docs/` 編輯，執行 `node scripts/sync-docs.mjs` 更新工作區映象。環境檔案與金鑰不得寫入 Markdown、提交或瀏覽器日誌。

## 針對性檢查

文件修改至少執行 `node scripts/check-docs.mjs`、`node scripts/sync-docs.mjs --check` 和 `pnpm check`；前臺路由變更再執行 `pnpm build`。內容結構變更先執行 `pnpm validate:content`，介面契約變更檢查 `node scripts/v3/sync-editor-schema.mjs --check` 與 `node scripts/v3/sync-gallery-contract.mjs --check`。根據實際改動補充針對性後端測試，不用無關的大量重複測試掩蓋流程問題。

## 釋出與回滾

上線前記錄前後端提交號、D1 遷移、Worker 配置、R2 繫結和前端目標版本。需要資料庫遷移時先備份、在預覽環境演練，確認 Worker 與前端介面相容，再依釋出手冊操作。詞條要檢查 GitHub PR 稽核、合併和靜態站更新；文章要檢查真實登入、資料庫草稿、審批及公開讀取；相簿要檢查私有暫存、批次提交、逐圖稽核和公開地址。構建成功或本地模擬不等於真實雲端流程通過。

出現故障時先停住進一步釋出，儲存請求編號、記錄狀態與日誌，核對是否有已經成功的寫入，再按已記錄的版本回滾前端或 Worker。D1 遷移與公開資料不能靠簡單回退程式碼來“撤銷”；應有備份和單獨的資料修復方案。驗收記錄分別標註本地、模擬服務和真實服務，不宣稱未走通的流程已上線可用。

## 按變更範圍執行檢查

| 變更 | 至少檢查 |
| --- | --- |
| 說明書與連結 | `node scripts/check-docs.mjs`、`node scripts/sync-docs.mjs --check`、`pnpm check`。 |
| 分類與詞條後設資料 | `pnpm validate:content`、`node scripts/v3/sync-editor-schema.mjs --check`。 |
| 相簿契約 | `node scripts/v3/sync-gallery-contract.mjs --check`，再驗證後端遷移和許可權。 |
| 前臺路由或元件 | `pnpm check`、`pnpm build`、受影響流程的瀏覽器檢查。 |
| 釋出候選 | 構建連結、靜態資源審計、後端測試、真實賬號投稿與稽核。 |

不要把一次舊版本的測試數字寫成當前釋出保證。構建前確認環境變數名稱，但不把值寫入文件、命令輸出或截圖。文件映象檢查失敗時，只在主站 `docs/` 修正文稿，然後重新同步映象。

## 釋出順序和證據

先固定前後端提交和本次 D1 遷移，再備份資料庫、在預覽環境演練；有跨層改動時先保持後端向後相容。按依賴釋出資料庫遷移、Worker 和前端，然後分別驗收詞條 PR、文章 D1、相簿私有暫存／公開 R2。記錄真實服務的請求與記錄編號、公開頁面和回滾版本。模擬 D1/R2、靜態構建和瀏覽器本地預覽各自只能證明對應層。

故障時先核對是否已經產生寫入；回滾程式碼不等於撤銷資料庫遷移，也不能刪除已經公開的物件。需要資料修復時保留審計記錄並制定單獨方案。正式流程以倉庫內釋出手冊為維護來源，站內本章提供安全的總覽。
