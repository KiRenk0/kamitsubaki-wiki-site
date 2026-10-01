---
book: contribute
chapter: review
locale: en
order: 8
title: Submission status and returned work
summary: Follow receipts in Creator Center and distinguish drafts, review, partial approval, and publication.
---

## Receipts and records

After an entry, article, or gallery submission succeeds, stay on the page long enough to read its receipt and record ID. Use Track review to open that record, or search [My Space → Creator Center](/en/account/creator/) by title, type, and status. Open the detail for the review note and next action. Local drafts are listed separately and are not cloud submissions. Confirm the signed-in account before concluding that a record has disappeared.

## Read the actual status

| Status | Meaning and next step |
| --- | --- |
| Local draft | Only in this browser; continue editing or export a backup. |
| Cloud draft | Saved to its service but not submitted; check and submit. |
| Image staged | File is in private staging; the set still needs submission. |
| Pending / in review | A maintainer has not approved it; avoid duplicate proposals. |
| Returned | Read the note, correct the work, and resubmit. |
| Partially approved | Gallery review may approve only some images; inspect each result. |
| Approved, awaiting publication | Review is recorded, but the gallery has not synchronized the public images yet. Keep the record; a maintainer can retry publication. |
| Partially public | Some images are public while others remain pending, returned, or awaiting synchronization. Open the set for image-level results. |
| Approved / merged | Review or GitHub merge finished; an entry may still await site deployment. |
| Hidden | The content is no longer listed publicly; check the record or ask a maintainer why. |
| Public | The public entry, article, or gallery page can serve it. |

In Creator Center, you can choose **Delete draft** for your own unsubmitted local or cloud draft. Confirming cannot be undone; private staged files in a gallery draft are also cleared. Submitted, returned, and published records are not draft deletions. A maintainer can move a published article, photo, or set to the recycle bin and then permanently delete it there. Deleting a set retains its photos as hidden independent records.

## Revise and recover

Open the record and use Continue editing or Revise and resubmit. A returned gallery image can be corrected without reuploading approved files. A new article revision does not replace the still-public old version while pending. After a network failure, check Creator Center for the receipt or record before retrying. If sign-in expires, sign in again and verify local content. On a version conflict, reload the latest version and merge deliberately rather than overwriting another person's reviewed changes.

## Completion differs by submission type

An entry proposal becomes a GitHub PR. Maintainer review is followed by **merge and site deployment** before the static page changes. An approved article revision is served through the public API; the earlier version remains visible while a new one is pending or returned. Gallery review covers set metadata and each image; at least one image must pass for a set to become public. Creator Center lists all three, while detail pages preserve their real states.

## Troubleshoot in order

1. **No receipt after submission:** do not submit again immediately. Refresh Creator Center, check the account, type, title, or batch, and open any newly created record.
2. **Status seems unchanged:** inspect the last update and review note. For galleries inspect per-image results; for entries inspect PR and deployment progress. A browser-local draft does not prove a server submission.
3. **Returned work:** read the exact reason, find the relevant field or paragraph, preserve valid text, and resubmit from the same record.
4. **Version conflict:** stop retrying the old page. Load the latest public or reviewed version and merge your edits deliberately.
5. **Missing public page:** distinguish approval from sync/deployment and check content language. Keep the record ID for the maintainer; do not duplicate the contribution.
