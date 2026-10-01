---
book: develop
chapter: architecture
locale: en
order: 1
title: Frontend repository and integration boundaries
summary: Understand the public frontend, encyclopedia sources, and user-visible submission paths.
---

## Public scope

This repository maintains the Astro frontend, encyclopedia Markdown, taxonomy data, shared components, and site manuals. The server is **closed source**. Its source code, layout, data model, authorization implementation, and deployment material are outside this manual and are not provided to external developers. Work against the public types, configuration, and user-visible behavior in this frontend repository; do not infer server internals from the interface.

## Frontend content sources

Entries are built as static pages from Markdown and metadata in `src/content/`. `src/data/` contains public structured material such as taxonomy and chronicle events. `docs/manuals/` is the single source for the in-site manuals; the workspace-level `docs/` is a generated mirror and must not be edited. Published articles and gallery items are supplied by the site service. Do not create matching Markdown files in this repository to imitate their public status.

## States the interface must show

| Content | Frontend entry point | When readers can see the result |
| --- | --- | --- |
| Encyclopedia entry | Reader edit action or contribution center | After the GitHub proposal is reviewed, merged, and the static site is updated. |
| Article | Articles area and shared editor | After review is complete and the public reading page is available. |
| Gallery set | Set-based upload workspace | After the set information and at least one image are approved and appear in the public gallery. |

Creator Center presents all three record types but preserves their actual statuses. Local save, cloud draft, staged image, submitted for review, approved, and public are distinct. The interface must use the service response, not treat 100% file transfer or a button click as approval.

## Integration principles

The frontend consumes only service results intended for its interface. On expired sign-in, loading failure, version conflict, or denied access, preserve unsubmitted text and metadata and offer an accurate recovery action. Public pages display public versions; work in progress is shown only in authorized contributor views. When service behavior changes, maintainers confirm the public-facing contract privately. This manual records only results that users and frontend developers need to observe.
