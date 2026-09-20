# V3 Architecture

V3 使用 Schema v2 实体与独立的功能数据。首页分类由审核过的 classification-map.json 决定，不能根据文件夹或正文自动推断。实体注册表解析多语言记录、稳定 ID、路由与双向关联；文件路径由 contentLayout.mjs 推导，并同步到编辑器后端。

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

[Contribution guide](contributing.md) · [Content layout](v3/content-layout.md) · [Gallery](v3/gallery-r2.md) · [Maintenance index](README.md)

The gallery uses private staging and owner approval. Logged-in users can submit uploads and metadata changes; role is required and other metadata is optional. Public gallery data does not pass through GitHub. Article publication still requires review, merge and deployment.

Deployment and real workflow acceptance are recorded separately from implementation and local tests. Historical architecture is retained in `archive/`.
