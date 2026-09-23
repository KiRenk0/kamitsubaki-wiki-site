---
book: "develop"
chapter: "operations"
locale: "zh-hk"
order: 4
title: "本地開發、檢查與發佈"
summary: "按前後端契約、遷移和真實流程分層驗證，保留回滾依據。"
generatedFromHash: "0a16c4e993a4192d5fdb"
generated: true
generatedFrom: "zh"
---

<!-- AUTO-GENERATED FROM zh; DO NOT EDIT DIRECTLY. -->

## 本地準備

分別確認主站與後端倉庫的分支、未提交文件、環境變量名稱及當前服務地址。前端使用 pnpm；文檔只在主站 `docs/` 編輯，運行 `node scripts/sync-docs.mjs` 更新工作區鏡像。環境文件與密鑰不得寫入 Markdown、提交或瀏覽器日誌。

## 針對性檢查

文檔修改至少執行 `node scripts/check-docs.mjs`、`node scripts/sync-docs.mjs --check` 和 `pnpm check`；前台路由變更再運行 `pnpm build`。內容結構變更先運行 `pnpm validate:content`，接口契約變更檢查 `node scripts/v3/sync-editor-schema.mjs --check` 與 `node scripts/v3/sync-gallery-contract.mjs --check`。根據實際改動補充針對性後端測試，不用無關的大量重複測試掩蓋流程問題。

## 發佈與回滾

上線前記錄前後端提交號、D1 遷移、Worker 配置、R2 綁定和前端目標版本。需要數據庫遷移時先備份、在預覽環境演練，確認 Worker 與前端接口兼容，再依發佈手冊操作。詞條要檢查 GitHub PR 審核、合併和靜態站更新；文章要檢查真實登錄、數據庫草稿、審批及公開讀取；圖庫要檢查私有暫存、批次提交、逐圖審核和公開地址。構建成功或本地模擬不等於真實雲端流程通過。

出現故障時先停住進一步發佈，保存請求編號、記錄狀態與日誌，核對是否有已經成功的寫入，再按已記錄的版本回滾前端或 Worker。D1 遷移與公開數據不能靠簡單回退代碼來“撤銷”；應有備份和單獨的數據修復方案。驗收記錄分別標註本地、模擬服務和真實服務，不宣稱未走通的流程已上線可用。

## 按變更範圍運行檢查

| 變更 | 至少檢查 |
| --- | --- |
| 説明書與鏈接 | `node scripts/check-docs.mjs`、`node scripts/sync-docs.mjs --check`、`pnpm check`。 |
| 分類與詞條元數據 | `pnpm validate:content`、`node scripts/v3/sync-editor-schema.mjs --check`。 |
| 圖庫契約 | `node scripts/v3/sync-gallery-contract.mjs --check`，再驗證後端遷移和權限。 |
| 前台路由或組件 | `pnpm check`、`pnpm build`、受影響流程的瀏覽器檢查。 |
| 發佈候選 | 構建鏈接、靜態資源審計、後端測試、真實賬號投稿與審核。 |

不要把一次舊版本的測試數字寫成當前發佈保證。構建前確認環境變量名稱，但不把值寫入文檔、命令輸出或截圖。文檔鏡像檢查失敗時，只在主站 `docs/` 修正文稿，然後重新同步鏡像。

## 發佈順序和證據

先固定前後端提交和本次 D1 遷移，再備份數據庫、在預覽環境演練；有跨層改動時先保持後端向後兼容。按依賴發佈數據庫遷移、Worker 和前端，然後分別驗收詞條 PR、文章 D1、圖庫私有暫存／公開 R2。記錄真實服務的請求與記錄編號、公開頁面和回滾版本。模擬 D1/R2、靜態構建和瀏覽器本地預覽各自只能證明對應層。

故障時先核對是否已經產生寫入；回滾代碼不等於撤銷數據庫遷移，也不能刪除已經公開的對象。需要數據修復時保留審計記錄並制定單獨方案。正式流程以倉庫內發佈手冊為維護來源，站內本章提供安全的總覽。
