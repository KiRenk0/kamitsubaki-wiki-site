# V3 Architecture

V3 uses Schema v2 entities and separate feature data. Homepage classification follows the reviewed classification-map.json, not folder names or prose. The entity registry resolves languages, stable IDs, routes and inverse relations. contentLayout.mjs determines file locations and is synchronized with the editor backend.

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

[Contribution guide](contributing.en.md) · [Content layout](v3/content-layout.md) · [Gallery](v3/gallery-r2.md) · [Maintenance index](README.md)

The gallery uses private staging and owner approval. Logged-in users can submit uploads and metadata changes; role is required and other metadata is optional. Public gallery data does not pass through GitHub. Article publication still requires review, merge and deployment.

Deployment and real workflow acceptance are recorded separately from implementation and local tests. Historical architecture is retained in `archive/`.
