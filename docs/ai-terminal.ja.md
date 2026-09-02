# 統合 AI ウィジェット

[English](ai-terminal.en.md) / [中文](ai-terminal.md) / [日本語](ai-terminal.ja.md)

Wiki ウィジェットは統合 AI サービスの軽量な入口であり、別のアシスタントではありません。既定は知識 Agent `observer` です。Observer と五つの Persona、会話管理、メモリ管理の完全版は `https://chat.kamitsubaki.wiki/<locale>/` にあります。

`AiChatWidget.astro` が三言語の構造を描画し、`src/scripts/aiChatWidget.js` が bootstrap、credentials、SSE、OAuth 復帰、Observer 履歴を処理します。`ExperiencePortals.astro` はゲームと AI 端末の入口です。

`PUBLIC_AI_OBSERVER_API_BASE` に Worker オリジンを設定します。ウィジェットは credentials 付きで `/api/ai/v2/bootstrap`、`/chat`、`/conversations?agentId=observer`、所有権確認済みの会話詳細 API を呼び出します。セッショントークンを保存したり、モデル、Persona、Gateway、AstrBot config の入力を追加したりしないでください。

匿名利用は Observer の五回プレビューで、必要に応じて Turnstile を使います。Persona 会話はログイン済みの完全版端末で行います。引用は構造化された `source` SSE だけから描画します。OAuth 復帰後は bootstrap を再取得し、一回限りの query parameter を削除します。

三言語、ライト／ダーク、デスクトップ／モバイル、匿名枠、GitHub/Google 復帰、ストリーム中断、引用、Observer 履歴操作、言語を保持する端末リンクを検証してください。エラー表示に VPS 構成、key、DB、内部 URL、上流 stack trace を含めてはいけません。

