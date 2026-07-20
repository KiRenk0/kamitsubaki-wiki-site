# Architecture

[English](architecture.en.md) / [中文](architecture.md) / [日本語](architecture.ja.md)

This site is a static Astro wiki with URL-based internationalization and content separated from implementation.

## Runtime

```text
/      -> redirects to /zh/
/zh/   -> Chinese site
/ja/   -> Japanese site
/en/   -> English site
```

The production build is static HTML, CSS, and browser JavaScript. It does not require a backend at runtime.

## Content Flow

```text
src/content/**/*.json or .md
  -> src/content.config.ts validates schemas
  -> Astro Content Collections load records
  -> src/lib/homeData.mjs localizes, groups, and sorts records
  -> src/lib/metadata.mjs builds page metadata
  -> src/pages/[locale]/index.astro renders the home page
  -> src/pages/[locale]/artists/[...id].astro renders wiki articles
  -> src/components/*.astro render UI
```

Implementation files should receive content through props. Do not hardcode large public-facing content arrays in components or pages.

## Main Directories

```text
src/content.config.ts   Content Collection schemas
src/content/            Editable wiki content
src/lib/                Data shaping, i18n, and metadata helpers
src/pages/              Static routes
src/components/         Presentational components
src/layouts/            Shared HTML layout
src/styles/global.css   Tailwind entry and global visual system
src/scripts/            Browser interactions
tests/                  Node test runner checks
```

## Content Collections

- `site`: site chrome and page labels from JSON
- `artists`: Markdown wiki pages for artists, creators, units, and isotopes
- `projects`: Markdown project records
- `logs`: Markdown timeline records
- `songs`: Markdown song entries
- `albums`: Markdown album entries with structured track lists
- `announcements`: Markdown home-page announcements
- `syntaxGuide` and `editGuide`: in-site contribution documentation

Schemas live in `src/content.config.ts`. `pnpm check` validates them.

Homepage DATABASE categories are derived from the first folder level in `src/content/artists/<category>/<entry>/<locale>.md`. `categoryTitle`, `categorySubtitle`, `categoryOrder`, `itemOrder`, and `code` are optional display overrides.

## Current Feature Map

- Branded external links: `src/lib/externalPlatforms.mjs` is the shared registry used by `ExternalLinkCard.astro`, `PlatformIcon.astro`, and the article enhancement script.
- Special contributors: records live in `src/data/manualContributors.json` and `ManualContributors.astro` displays them in randomized order. Personal introductions and messages remain exactly as submitted.
- Site branding: the long and square logos are `public/brand/kamitsubakiwiki-long.svg` and `public/brand/kamitsubakiwiki-square.svg`; `src/lib/i18n.mjs` provides the three localized site names.
- Announcement board: the home page selects the pinned or latest record from the `announcements` collection and displays it through `AnnouncementModal.astro`.
- Album artist categories: `src/lib/musicCatalog.mjs` groups albums by the artist ID in their directory; `src/pages/[locale]/albums/artists/[artist].astro` renders each category and prefers the matching `artists` entry's `image` for its cover.
- Layered content licensing: `src/content.config.ts` validates four `license` markers, `ContentLicenseNotice.astro` renders entry licensing and media exclusions on detail pages, and `src/pages/[locale]/license.astro` generates the localized copyright pages. Authoring rules live in [Content licensing and attribution](licensing.en.md).

Public feature data belongs in content or data files, while components only render it. Every translatable entry must include `zh`, `ja`, and `en` files with the same `translationKey` and route structure.

## Metadata

Page metadata is built in `src/lib/metadata.mjs`. Content files can override it with optional `seo` frontmatter. When it is missing, the site scans the first Markdown paragraph as the description and uses `image` for link previews.

`BaseLayout.astro` renders description, canonical, Open Graph, Twitter card, and robots tags. Set `PUBLIC_SITE_URL` during deployment to generate absolute canonical URLs.

## Reader UI

Artist detail pages keep a stable wiki layout:

- compact navigation bar
- article header with language links and edit entry
- table of contents when headings exist
- Markdown article body when content exists
- metadata infobox

Empty article bodies are valid and render without filler text.

## Styling And Assets

Tailwind CSS v4 is compiled through `@tailwindcss/vite`. Do not add a runtime Tailwind CDN script.

Global styles live in `src/styles/global.css`, including fonts, colors, responsive reader typography, infobox, table of contents, preloader, cursor, reveal, noise, and list-row effects.

## Verification

CI and local development use the same commands:

```bash
pnpm test
pnpm check
pnpm build
```

The GitHub Actions workflow is `.github/workflows/ci.yml`.
