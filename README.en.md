# KAMITSUBAKI Wiki Site

[中文](README.md) · [日本語](README.ja.md) · [Documentation](docs/README.md) · [Architecture](docs/architecture.en.md) · [Contribution center](https://kamitsubaki.wiki/en/contribute/)

An unofficial multilingual KAMITSUBAKI STUDIO fan encyclopedia. Astro generates the public site statically. Encyclopedia entries live in GitHub, independent articles in D1, and gallery metadata/images in D1 and R2. Publication always requires review.

## Contribution paths

- Encyclopedia entries: use the reader's edit action or create an entry in the contribution center, then submit a GitHub change proposal.
- Research articles: save a D1 draft at `/{locale}/articles/submit/` and send it for review.
- Gallery: upload at `/{locale}/gallery/manage/`; files remain in private R2 staging until approval.
- Images, sources and rights: see [files and images](docs/manuals/contribute/entry/en.md) and [licensing](docs/manuals/contribute/rights/en.md).

Follow the [V3 contribution guide](docs/manuals/contribute/start/en.md). Do not reuse retired `artists/` or `albums/` directories or legacy frontmatter examples.

## Content model

`src/content/` contains `people`, `units`, `isotopes`, `songs`, `releases`, `projects`, `lives`, `organizations`, `lore`, archived article sources, and localized site copy. Each entity keeps `zh.md`, `ja.md`, and `en.md` together and shares one stable `id`; Traditional Chinese is generated.

Metadata, `classification-map.json`, and `contentLayout.mjs` determine classification and source paths. The entity registry generates public URLs. See the [content directory guide](src/content/README.md) and [Metadata Schema v2](docs/category-optimization/metadata-schema-v2.md).

## Local development

```sh
pnpm install --frozen-lockfile
pnpm dev
```

For a release candidate, run content validation, `astro check`, the full Node test suite, production build, generated-link audit, Pages asset audit, documentation check and mirror check. Use [the documentation index](docs/README.md) for exact commands and [V3 acceptance status](docs/v3/acceptance/README.md) for remaining blockers.

A successful build does not prove real OAuth, GitHub submission, D1/R2 moderation, or production deployment. Remote migrations and releases are separately authorized operations. The active development branch is `V3.0.0`.
