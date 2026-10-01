---
book: develop
chapter: frontend
locale: en
order: 3
title: Frontend pages and shared components
summary: Extend the site with the shared page shell, Reader, and interaction conventions.
---

## Page structure

The primary areas are Encyclopedia, Articles, Explore, LABs, and Contribute. Feature paths and grouping are registered in `src/lib/siteFeatures.mjs`; do not maintain different hard-coded addresses in the home page, navigation, and secondary pages. Use shared `WorkspaceShell` and `WorkspaceHeader` components for secondary pages and keep back and primary actions in stable positions. Determine the owning area and narrow-screen layout before adding an entry point.

## Reading and content display

Entries, articles, and manuals reuse suitable forms of `Reader.astro`. These manual pages pass rendered Markdown headings to `variant="guide"` and use its existing outline and anchor behavior. A separate layout with similar CSS is not a substitute. The home page's clear hover artwork, entry-reader backgrounds, image-and-name form selector, and batched expansion are regression baselines. Check them whenever shared styles change.

## Controls and motion

Cross-page navigation, view switching, and filtering have different semantics; use a slider only for a real view relationship. Controls need visible focus, loading, empty, and failure states. Reserve space for images and fonts. Motion must be interruptible and respect reduced-motion preferences. Do not fix a layout jump by removing reader backgrounds or hover feedback. Keep common controls neutral and reserve entity theme colors for the corresponding content.

## Choose semantics before components

For cross-page navigation use text links, breadcrumbs, or `WorkspaceLinkNavigation`. For exclusive in-page views use `ContentTabs` or a selector with an explicit current item. For filtering use search and `WorkspaceFilters`. Use `WorkspaceState` and `WorkspaceEmptyState` for loading, no results, and errors. Back navigation sits above the title; the primary action sits at the title's right and moves below it on narrow screens. Do not add a decorative slider to unrelated pages.

Use `Reader.astro` for long content. Entries use `variant="entry"` with artwork and sidebar; articles use the essay layout; manual chapters use `variant="guide"` with renderer `headings`. Each outline `slug` must match the body heading `id`. Reader already handles scroll tracking, narrow-screen folding, keyboard access, and reduced motion; do not duplicate its script in pages.

## Visual and interaction regression

Retain clear hover artwork for entries, tracks, and releases on Home; entry backgrounds and local theme color; the image-and-name form selector; and batched expansion. Reserve image ratios and control dimensions. First positioning must not animate; rapid switching should cancel the previous animation. Check light/dark, keyboard focus, narrow width, and reduced motion. Page CSS should lay out content rather than override shared button and filter states.
