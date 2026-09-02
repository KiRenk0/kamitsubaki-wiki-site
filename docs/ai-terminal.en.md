# Unified AI Widget

[English](ai-terminal.en.md) / [中文](ai-terminal.md) / [日本語](ai-terminal.ja.md)

The Wiki widget is the lightweight entry to the unified AI service, not a separate assistant. It defaults to the `observer` knowledge Agent. The full Observer/persona lobby, conversation management, and memory UI live at `https://chat.kamitsubaki.wiki/<locale>/`.

Implementation: `AiChatWidget.astro` renders localized structure; `src/scripts/aiChatWidget.js` handles bootstrap, credentials, SSE, OAuth return state, and Observer history; `ExperiencePortals.astro` exposes the game and terminal experiences.

Set `PUBLIC_AI_OBSERVER_API_BASE` to the Worker origin. The widget calls `/api/ai/v2/bootstrap`, `/chat`, `/conversations?agentId=observer`, and owned conversation detail routes with credentials included. Never store session tokens or add model, Persona, Gateway, or AstrBot configuration fields.

Anonymous visitors receive five Observer previews and may be challenged by Turnstile. Persona chat belongs in the signed-in full terminal. Render citations only from structured `source` SSE events. After OAuth, refresh bootstrap and remove one-time callback query parameters.

Test English, Chinese, and Japanese; light/dark themes; desktop/mobile; anonymous quota; GitHub/Google return; interrupted streams; citations; Observer history actions; and locale-preserving terminal links. User-facing errors must not expose VPS topology, keys, database details, internal URLs, or upstream stack traces.

