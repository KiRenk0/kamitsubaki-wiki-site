# KAMITSUBAKI Wiki Site

[中文](README.md) · [日本語](README.ja.md) · [Documentation](docs/README.md) · [Architecture](docs/architecture.en.md) · [Contribution center](https://kamitsubaki.wiki/en/contribute/)

An unofficial multilingual KAMITSUBAKI STUDIO fan encyclopedia. Astro generates the public site statically. Encyclopedia entries are maintained in this repository; articles and gallery sets are submitted through the site service. Publication requires review. The server is closed source; its code, architecture, and operations material are not provided to external developers.

## Contribution paths

- Encyclopedia entries: use the reader's edit action or create an entry in the contribution center, then submit a GitHub change proposal.
- Research articles: save a cloud draft at `/{locale}/articles/submit/` and send it for review.
- Gallery: privately stage images at `/{locale}/gallery/manage/`, then submit the set for review.
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

For a frontend release candidate, run content validation, `astro check`, affected self-contained frontend tests, a production build, generated-link and asset audits, documentation checks, and the mirror check. Tests requiring the private service are run by maintainers in their private environment. Use [the documentation index](docs/README.md) for current guidance and [V3 acceptance status](docs/v3/acceptance/README.md) for remaining blockers.

A successful build does not prove real sign-in, GitHub submission, article review, gallery upload, or production release. Server operation and release follow private maintainer procedures. The active development branch is `V3.0.0`.
