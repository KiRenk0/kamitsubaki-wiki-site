---
book: develop
chapter: architecture
locale: en
order: 1
title: Repositories and system architecture
summary: Understand the static site, Worker, database, image storage, and submission boundaries.
---

## Repository responsibilities

`kamitsubaki-wiki-site` owns the Astro frontend and encyclopedia Markdown. `kamitsubaki-wiki-site-backend` provides sign-in, submissions, review, and APIs. The workspace-level `docs/` directory mirrors the site repository's `docs/`; edit the site source and run `node scripts/sync-docs.mjs`. Do not treat the mirror or build output as the source of documentation.

## Three data paths

Encyclopedia entries are built as static pages from Markdown and metadata. The in-site editor proposes changes through GitHub PRs; the public page changes after review, merge, and deployment. Articles live in separate D1 document and revision tables and are read through a public API after approval; they do not create encyclopedia PRs. Gallery images enter private R2 staging through the Worker, while sets and image revisions live in D1; approved content becomes publicly readable. Creator Center adapts records from all three services without pretending that they share storage or identical statuses.

## Permissions and publication

Public reads return only public versions. Signed-in contributors can save and submit their own drafts or propose changes to public content. Review endpoints enforce maintainer identity, ownership, and version checks. A staged gallery image, merged entry PR, and approved article each have a different route to publication. The frontend must present the actual service state rather than infer success from a button click.

## Request and publication paths

| Content | Submission and staging | Public read after review | Frontend rebuild required? |
| --- | --- | --- | --- |
| Encyclopedia entry | Editor → Worker submission → GitHub PR | Merge source and deploy static page | Yes |
| Article | Shared editor → D1 draft and revision | Approved revision via public article API | No |
| Gallery set | Upload workspace → Worker → private R2 staging and D1 records | Approved set and images via public API and image domain | No |

Account record reads require identity and ownership checks. Public APIs must never expose drafts or unreviewed file URLs. Gallery public and staging objects are separate; 100% transfer only completes client upload. Review writes require permissions and version checks so two maintainers cannot silently overwrite one another.

## Sources and mirrors

The site's `docs/manuals/` is the single source of manual text; the workspace-level `docs/` is a mirror. `src/content/` holds encyclopedia sources, while `src/data/` holds taxonomy and chronicle data. Article bodies and gallery revisions belong to the database, not new Markdown pretending to be public records. Record matching site/Worker commits, D1 migrations, and R2 bindings before deployment. A frontend build does not prove live writes work.
