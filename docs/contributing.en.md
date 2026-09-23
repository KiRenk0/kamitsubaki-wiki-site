# V3 contribution guide

[中文](contributing.md) · [日本語](contributing.ja.md) · [Maintenance index](README.md)

## Choose a workflow

Edit an existing entry from its reader's edit action, which supplies the actual source path. Create encyclopedia entries in the contribution editor. Articles have a [separate submission page](/en/articles/submit/): save a database draft, submit it, and wait for the site owner’s review. Upload reference images or improve their metadata in [Gallery contributions](/en/gallery/manage/).

Encyclopedia entries use GitHub proposals. Article drafts, revisions and published versions use separate D1 tables, with moderation at `/admin/articles`; they do not create GitHub PRs. Gallery submissions use the Worker, private R2 staging and D1 records; no GitHub file change is needed. Signed-in users may suggest improvements to anyone's published gallery records. The site owner reviews changes before publication.

## Track a submission

After signing in, open [My Space → Creator center](/en/account/creator/) for entry, article and gallery records. A successful submission leaves a receipt on the editor or uploader with a record ID and a direct review-progress link. Search or filter the center by type and status, open a record to read feedback, then choose Continue editing when action is needed. Browser-only drafts are shown separately from cloud records; staging gallery files is not the same as submitting them for review. Entries become public only after review, GitHub merge and site deployment. Articles and gallery sets follow their own review and publication steps. New decisions and feedback appear as in-site notices and are marked read only after opening the matching record.

## Write an entry

1. Search for an existing entity before creating another translation or spelling of it.
2. Choose its type and source language. Use a stable lowercase ID with digits and hyphens. All translations share that ID.
3. Complete the template's required fields, then write Markdown and cite sources. Use `contentStatus: stub` for unfinished entries; basic identity fields remain required.
4. Reference entity IDs in `relations`, `performers`, `credits` and `affiliations`. Keep factual uncertainty explicit and preserve existing prose.
5. Preview the page and inspect the diff. Submit for review and update the same proposal when revisions are requested.
6. For entries, publication follows approval, merge and deployment. A submitted proposal is not a published page.

## Metadata, categories and paths

`schemaVersion: 2` identifies the metadata protocol, not the website release. `presentation.image` and `presentation.theme` control images and reader appearance; morphing uses `presentation.morphing`. Relations and credits generate linked records. `sources`, `license` and `lifecycle` describe provenance, permissions and archive state.

The approved `src/data/classification-map.json` controls curated people, unit members and project branches. A new file does not automatically appear in every homepage category. Maintainers must register new IDs in the appropriate approved branch.

`src/lib/contentLayout.mjs` derives directories and is synchronized to the backend. Songs use `performers`: a single primary performer gets its own directory, multiple primary performers use `collaborations`, and missing performers use `unassigned`. Releases use `releaseType`; articles use `articleCategory`. Use the real source path, not a page URL, when editing files.

## Languages and linked features

Author `zh.md`, `ja.md` and `en.md` with consistent identity and structural metadata. Traditional Chinese variants are generated. Do not edit generated files or label untranslated Chinese prose as completed English or Japanese.

Chronicle records live in `src/data/chronicle/` and link to entities by ID. Era assignment follows configured date ranges. Dates in prose do not automatically become events. Gallery images require a character; all descriptive fields are optional and may be improved later. Every change is reviewed.

## Submit and verify

Use the currently designated development branch as the base for a contribution branch; do not write directly to the release branch. Include the reason, sources and relevant checks in the PR. Images must actually be uploaded: a local filesystem path is not a public image URL.

Maintainer checks include `pnpm validate:content`, schema and gallery contract synchronization, documentation mirror checks and `pnpm build`. Manually exercise affected UI flows. A successful build does not prove a real GitHub submission, attachment upload or production deployment succeeded.

See [files and images](files-and-images.en.md), [metadata specification](category-optimization/metadata-schema-v2.md) and [gallery maintenance](v3/gallery-r2.md) for details.
