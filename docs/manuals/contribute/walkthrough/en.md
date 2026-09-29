---
book: contribute
chapter: walkthrough
locale: en
order: 10
title: "From a source to a public page: complete walkthrough"
summary: Revise one entry from evidence gathering through the site editor or GitHub, review, release, and careful AI assistance.
---

## How to use this guide

If this is your first contribution, follow the steps in order. If you are stuck on one part, use the table of contents to jump there. The example is a sourced correction to an existing entry. It deliberately contains no invented event date or announcement URL: supply your own real source. The older guide's sequence still applies: choose a route, locate the source file, consult the syntax guide, inspect the diff, submit a PR, then follow checks and review. The site editor provides another route through those same decisions.

### Prepare four things

1. **The target page.** Search the [database](/en/database/) for the name and aliases. Open the entry in your source language and confirm its identity. An empty filtered list does not prove that an entry does not exist.
2. **Original evidence.** Keep the title, publisher, URL, publication date, and exact passage supporting the fact you want to add. A screenshot can help identify it; include the accessible original page whenever possible.
3. **One intended correction.** Write down what currently appears, what should change, and why. If the source gives only a month, do not invent a day. Separate a documented fact from an interpretation.
4. **Rights information.** If you cannot identify the origin and usage basis of an image, contribute the text first. The text license does not grant rights to photos, covers, lyrics, or video. Read [sources and rights](/en/docs/contribute/rights/).

## Step 1: Enter from the record

Read the current article and its references. Use “Improve this entry” or “Edit source” on the record to open the editor. Confirm that the selected entity, language, and source file match your intended change. For a new entry, choose “Encyclopedia entry” on the [contribution page](/en/contribute/), then select an entity type and original language. Chinese, Japanese, and English source records for one entity share one stable ID; Traditional Chinese is generated from the Chinese source.

For a GitHub contribution, follow the source-file link from the record and check the path under `src/content/`. Do not edit `dist/`, `.astro/`, or `node_modules/`. The older person-entry outline remains useful: overview, role and creative position, history, representative works, related projects, references, and official links. Adapt it to the current record's type and retain accurate existing material.

## Step 2: Make only supported changes

The site editor loads the existing entry. Pick the language and add the documented sentence to the right section. Put dates, relationships, and credits in their corresponding structured fields when those fields exist; do not hide them only in prose. Inspect unfamiliar markup before changing it. The [full content and style guide](/en/docs/contribute/format/) covers structure, classification, voice, dates, sources, privacy, and language. The [full syntax guide](/en/docs/contribute/syntax/) gives copyable frontmatter, Markdown, ruby, disclosures, media embeds, and lyric examples.

Suppose a source establishes only that a project announced an event in September 2026. “September 2026” is supported; “September 1” is not. Do not add a name, location, or participant that the source does not identify. Place a citation near the claim and keep the original title and URL in the references. If a detail remains uncertain, say what needs verification rather than completing the entry by guessing.

**Entry attachments and the image archive have different workflows.** An entry's inline or cover image travels with its GitHub proposal. You can [submit standalone photos or create a design set](/en/docs/contribute/gallery/) for the archive. People and types can be classified later, but each image still needs an author, a verifiable source and a basis for use. Do not upload an entire design set as entry attachments. If you add a local character accent, derive it from a stable official visual reference; otherwise use the default interface. Interface colors never desaturate the artwork.

## Step 3: Preview and inspect the diff

Open the editor preview. Check heading order, contents anchors, images, links, and citations against the reader. Inspect the diff and make sure it includes only intended changes. **Saving a local draft is not submitting for review.** Keep the draft while checking facts. If the connection fails, export or copy your work before refreshing.

For GitHub, work in your own branch or fork. Check YAML frontmatter quoting and indentation, and keep identity fields such as `id`, `locale`, and `entityType` stable. New language files for one entity use the same ID. Run `pnpm test`, `pnpm check`, and `pnpm build`, then review Files changed on the PR. Read the actual failure line if a check fails; avoid unrelated edits.

## Step 4: Submit, respond, and verify release

On the site, click “Submit for review” and wait for a record ID or PR link. Confirm the record in the [creator center](/en/account/creator/). “Saved” and “Staged upload” are earlier states. After a timeout, check for an existing record before retrying. If a reviewer requests changes, revise **the same submission** using their feedback.

On GitHub, open a Pull Request that explains the target entry, the source, the reason for the change, and checks performed. Respond to review in the same PR and push changes to the same branch. A GitHub-only contribution may not appear in the site creator center; use the PR for its status. Passing CI, approval, merge, and site deployment are separate events. Open the public entry after release and verify the change. For a chronicle revision, also confirm the public event version.

## Applying the method to other contributions

| Type | Gather first | Verify result in |
| --- | --- | --- |
| [Article](/en/docs/contribute/article/) | Thesis, author, sources, related records | Preview, review record, public article |
| [Image archive](/en/docs/contribute/gallery/) | Author, source and basis for use per image; people, type, tags and set can follow later | Private staging, per-image review, classification proposals, public images |
| [Chronicle](/en/docs/contribute/chronicle/) | Date precision, track, related entries, verifiable source | Event preview, PR review, public event version |

A one-day event is a point on the timeline; a lasting event occupies its real date span. Year-only and month-only events remain uncertain intervals. Both additions and revisions can start in the site editor. On GitHub, a new event uses its own YAML file; a revision changes only its target event.

## Ask AI to check, not invent

Give an AI assistant the source material you already collected and ask it to organize or identify gaps. **It cannot replace the original source or supply missing dates, people, rights, or translations.** You can adapt these prompts:

> I am updating [entry and language] on KAMITSUBAKI Wiki about [specific claim]. Use only the source material I paste. List (1) facts directly supported, with the corresponding passage; (2) date precision—year, month, or day, without guessing; (3) information still needing verification; and (4) a suitable section. Keep the source title and URL. Do not invent citations or assess image rights. Source: [title, URL, relevant excerpt]

> Compare my before and after paragraphs with the source. For each sentence, flag claims absent from the source, citations too far from their claims, accurate existing information I accidentally removed, and interpretations stated as fact. Add no new facts. Before: [text]. After: [text]. Source: [text].

Check every suggestion against the original page yourself. Lyrics, translation, image attribution, and timestamps deserve extra attention. The older lyric formatting prompt and syntax examples remain in the [full syntax guide](/en/docs/contribute/syntax/).

## Final check before submission

- I searched names and aliases and found no duplicate entry or event.
- Every new factual claim has an original source; date precision matches that source.
- I preserved accurate prose, references, and unfamiliar markup.
- I checked rights for images, lyrics, and third-party text.
- Headings, images, links, and contents work in preview.
- I received a submission receipt or actually opened a GitHub PR; a draft is not a submission.
- After merge I will verify the public page before describing the work as released.
