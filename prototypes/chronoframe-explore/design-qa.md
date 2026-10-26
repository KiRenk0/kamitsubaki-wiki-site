# Local design and integration QA — 2026-10-26

Current target: confirmed first-release scope at `/visuals/`, all published images with batches; browse, tags/text/sort, albums and originals; no unconnected controls. Production is not yet released.

## Visual fidelity

The selected entrance is option 1 in `../../docs/design/visual-roam/`. Main Explore keeps its original cards and adds the panorama. Same-viewport reference comparisons from the original-UI restoration remain in the owning workspace task evidence (`compare-albums-desktop.jpg`, `compare-albums-mobile.jpg`). The stable v1.0.2 album listing template/styles/animation remain exact. Other functional exceptions are recorded in UPSTREAM.md and the honest `design/upstream-ui-integrity.json` source hashes. Do not interpret older 11-file checks as a claim that all new functional scripts are byte-identical.

Keep the original identity SVG (400×400 viewBox), fonts, spacing, photo tiles, stacked-card presentation, motion-v, Swiper and WebGL. Full-catalog screenshots: `full-catalog-wall-mobile.png`, `full-catalog-album-mobile.png`, `full-catalog-viewer-mobile.png`, `full-catalog-albums-desktop.png`, `release-entry-desktop.png`. Screenshots are in the coordinator's task evidence.

## Actual local behavior

- Real local workerd reads anonymous production-published data. Public total observed: 1830; initial wall24 then48 records; filtering all metadata finds223 flower/KAF records, exceeding the former185-photo selection. Cards remain bounded by the reveal limit.
- Nine projected albums; KAF slug redirect, total223 and24-to48 paging checked. Original background scroll-up/down computed transforms change between samples; desktop8/mobile3 tracks come from original listing source.
- Mobile390×844 wall and album have no horizontal overflow. Original viewer loads its image, ArrowRight changes the query photo, close returns to the album; no warning/error console entries. Full original and thumbnail byte responses are independently checked through local HTTP.
- Unfinished map/login/reaction controls and unsupported filters are closed. Full metadata preparation exposes progress/error/retry, rather than silently filtering only a partial list.
- Old gallery and account source are untouched. Production entrance links/preview images from all five built locales point to the canonical main `/visuals/`; local development uses the task proxy. The entrance forces full document navigation.

## Checks

Independent adapter/feed tests cover publication/unsafe URLs, bounded bodies, stalled pagination, records beyond the old selection, retry preserving ordered results, late old-generation responses and opening filters during an active page. Type checking and Cloudflare-module build are required. Main Wiki checks include900 tests with the matching read-only backend checkout, Astro794 files with0 errors/0 warnings (126 hints), UI icons/actions/tokens, docs/workflow/lyrics, complete standard build (9720 pages), built links and Pages asset audit (18355/20000 files). Backend-dependent checks are distinguished from the earlier866-test standalone run.

This local acceptance and build are not live-delivery proof. The workspace release manifest must fix the exact reviewed source/artifact/checks. Cloud startup, route installation and live release markers are verified only after explicit production approval. No production write, migration, new paid resource or plan upgrade has occurred.
