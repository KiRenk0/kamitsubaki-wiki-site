# V3 Architecture

V3 は Schema v2 のエンティティと独立した機能データを使用します。ホームの分類はレビュー済み classification-map.json に従い、フォルダー名や本文から推測しません。登録簿が言語、固定 ID、ルート、逆方向の関連を解決します。配置は contentLayout.mjs が決定し、編集用バックエンドへ同期します。

| Source | Responsibility |
| --- | --- |
| `src/content/` | Schema v2 entities and source languages |
| `src/data/classification-map.json` | Reviewed classification and hierarchy |
| `src/lib/entitySchema.mjs` | Validated metadata fields |
| `src/lib/entityRegistry.mjs` | IDs, routes, language resolution and relationships |
| `src/lib/contentLayout.mjs` | Physical content directories |
| `src/data/chronicle/`, `src/data/taxonomy/eras.yml` | Events and era boundaries |
| Worker + D1 + R2 | Gallery proposals, review and published assets |
| Editor Worker + GitHub | Article proposals and attachments |

[Contribution guide](manuals/contribute/start/ja.md) · [Content layout](v3/content-layout.md) · [Gallery](v3/gallery-r2.md) · [Maintenance index](README.md)

The gallery uses private staging and owner approval. Logged-in users can submit uploads and metadata changes; role is required and other metadata is optional. Public gallery data does not pass through GitHub. Article publication still requires review, merge and deployment.

Deployment and real workflow acceptance are recorded separately from implementation and local tests. Historical architecture is retained in `archive/`.
