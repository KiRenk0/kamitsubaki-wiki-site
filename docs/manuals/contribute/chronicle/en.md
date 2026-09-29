---
book: contribute
chapter: chronicle
locale: en
order: 7
title: Add or revise a chronicle event
summary: Work through date precision, related entries, sources, drafts, PR review, and publication.
---

## Decide whether to add or revise

Search the [event list](/en/chronicle/?view=list) for the event and related names. For an existing event, choose “Revise this event” in its details so the editor loads the source version. Create a new event from [Contribute](/en/contribute/) only when it is missing. New events live in individual YAML files; revisions change only the target event in its existing file.

## Set date precision and category

Use the most precise date established by your source: `YYYY-MM-DD` for a known day, `YYYY-MM` for a known month, or `YYYY` for a known year. Add an end date for a lasting event. The public timeline marks year and month dates as uncertain intervals instead of inventing a day. Choose at least one narrative track and event type, then set the importance.

## Write text, links, and sources

You may draft in Chinese, Japanese, or English. The title and summary in your original language are required. Add translations if available; the page labels missing translations with the original language. Related entries use stable IDs such as `kaf`; leave them empty if unsure. Include at least one source title and URL where readers can verify the event. Check each important date, person, and claim against that source.

## Save, preview, and submit

1. Check the preview for title, date precision, category, and sources.
2. Save a draft. Keep a local copy when offline or signed out; after signing in, save it to your account.
3. Submit for review and keep the receipt. The API accepts structured event fields and rechecks sources and the original file version before creating a GitHub PR.
4. Follow the PR and feedback in [Creator Center](/en/account/creator/). Revise the same submission if changes are requested. If the source changed, read the latest version and compare before resubmitting.
5. A merged PR is still awaiting site publication. The record becomes published only after the public event manifest contains this submission's version.

## Troubleshooting

- Invalid source: provide a directly verifiable URL and a descriptive title. A search result or AI response is not a primary source.
- Date mismatch: pair `YYYY` with year, `YYYY-MM` with month, and `YYYY-MM-DD` with day precision.
- Source conflict: your draft remains. Compare the current event before resubmitting; do not overwrite unrelated changes.
- Merged PR, missing event: wait for the site build and publication, then check the public timeline.

For direct GitHub contributions, follow the [GitHub route](/en/docs/contribute/start/#wiki-content-github-route).
