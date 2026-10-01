---
book: contribute
chapter: start
locale: en
order: 1
title: Choose a contribution
summary: Choose among four tasks and the site or GitHub route; follow saving, review, and publication.
---

## Choose the right task

At [Contribute](/en/contribute/), choose an **encyclopedia entry**, **article**, **photo or design set**, or **chronicle event**. Entry and event changes become GitHub pull-request proposals. Articles can be saved as cloud drafts. Gallery photos are privately staged before review; people and image type can be suggested later. Submission requires sign-in and maintainer review; save states and publication conditions differ.

## Check before writing

Search for an existing entry, article, or set, including aliases, languages, and group hierarchy. Prepare a traceable source, author, date, and grounds for using any artwork. Preserve correct existing text when making a correction. Keep sourced facts distinct from interpretation: use entries for reference material and articles for extended argument or perspective.

## Saving is not submitting

The editor distinguishes a **local draft** from a **cloud draft**. The gallery also shows **waiting**, **uploading**, and **staged** files. Work enters review only after the relevant Submit for review action succeeds and returns a record ID. Follow that receipt to [Creator Center](/en/account/creator/) and verify the status. After a network error, look for an existing record before retrying so you do not create a duplicate.

<a id="site-route"></a>
## Route one: edit on the site

1. Choose a task at [Contribute](/en/contribute/). Load an existing entry before editing it; choose an article, [photos or a design set](/en/gallery/manage/), or a new or existing [chronicle event](/en/chronicle/?view=list).
2. Check the language and existing text. Prepare a traceable source URL, date, and any image permission basis. Use year or month precision when the source does not establish a day.
3. Save a draft and inspect the preview. A local draft stays in this browser; a cloud draft belongs to your account. A staged gallery file is still private.
4. Submit for review and keep the record ID. [Creator Center](/en/account/creator/) shows feedback, PR links, and the next action.
5. Revise the same submission if changes are requested. A merged PR can remain “awaiting site publication” until the public site includes that version.

If saving fails, keep a local copy. After a submit timeout, check for an existing record before retrying. If the source version changed, read the latest file and compare the changes before resubmitting.

<a id="github-route"></a>
## Route two: contribute through GitHub

1. Follow an entry's “Edit source file” link or locate its `src/content/.../zh.md`, `ja.md`, or `en.md` file. Existing chronicle events are in `src/data/chronicle/<year>.yml`; new events use individual `src/data/chronicle/<year>/event-<id>.yml` files.
2. Fork the repository or create a branch. Read the [syntax guide](/en/docs/contribute/syntax/) and [style guide](/en/docs/contribute/format/). Change only the target content and preserve stable IDs, sources, and valid existing text.
3. Preview the diff, check links, dates, image paths, and YAML, then commit and open a pull request against the main branch. Explain the scope, sources, and checks actually performed.
4. Answer review comments in the same PR. After a maintainer merges it, wait for the website build and check the public page. GitHub contributions may not appear in the site's Creator Center.

For build failures, read the PR checks; for merge conflicts, update from the main branch and compare each change before resolving it.

## Using AI while preparing material

AI can organize sources you provide, explain a field, or flag uncertainty. Try: “Use only the source excerpts below. Organize the event into title, date and precision, summary, related entries, and sources. Mark missing facts for manual checking. Do not invent people, dates, or citations. Sources: [paste excerpts].” Check every field against the original source before submitting. AI output is not a source.

## Continue by task

- [Edit or create an entry](/en/docs/contribute/entry/)
- [Complete content and style guide](/en/docs/contribute/format/) and [complete syntax and properties guide](/en/docs/contribute/syntax/)
- [Submit or revise an article](/en/docs/contribute/article/)
- [Upload photos, create a design set and suggest classifications](/en/docs/contribute/gallery/)
- [Add or revise a chronicle event](/en/docs/contribute/chronicle/)
- [Understand reviews and returned work](/en/docs/contribute/review/)
