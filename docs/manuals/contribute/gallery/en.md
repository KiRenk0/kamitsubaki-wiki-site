---
book: contribute
chapter: gallery
locale: en
order: 6
title: Upload sets and reference images
summary: Add photos to each set, inspect dimensions and progress, stage files, then submit for review.
---

## Create a set

From the [gallery](/en/gallery/), open the [upload workspace](/en/gallery/manage/) and sign in. Create one set for one group of images. **Character is required**; set name, form, date, tags, publisher, source, and notes may be completed later. Shared information is entered once for the set. Create another set for a different group: there is no need to add images to a global queue and move them afterward.

## Add photos to that set

Use Add photos to this set, select multiple files, or drop/paste into that set. PNG, JPEG, WebP, and GIF are supported. One batch holds up to 100 images, **20 MiB per image**. Each image row displays a thumbnail, file size, format, resolution, and upload state. Reorder images, select a cover, and add an individual title, description, or source. An empty image source inherits the set source. Verify the character and set for each image before uploading.

## Upload and stage

Upload all photos transfers up to three files concurrently. The percentage represents bytes transmitted; after 100%, wait for server validation and the **Staged** response. Retry a failed file individually. Retrying a batch does not resend already staged files. The interface reads the remaining daily quota from the server. A standard account defaults to 100 new images per day, subject to the current configuration, resetting at 00:00 UTC. Updating an existing image without replacing its file does not count as a new upload.

## Submit, restore, and revise

After checking every set and image, separately use **Submit all sets for review**. Staged files are private in R2, unavailable through the public gallery or image URL. A successful submission returns a receipt and batch ID; follow it in [Creator Center](/en/account/creator/). Unsubmitted batches are retained for 30 days, with an expiry time in the workspace. The current account's browser IndexedDB stores the queue. If it warns that files were not backed up, reselect files that were not staged. A `?batch=` link restores a server batch. Changes to a public set require review; the original public version remains visible, and a partially returned set can be corrected image by image.

## Example: two sets in one batch

For three images of Character A's default outfit and three of a stage outfit, create **two sets**, select the same character in each, and give each set its own name. Add the three files inside each set. Put a shared source on the set; override one image's source if it came from a different official page. This keeps set identity and image-level review clear.

File size is the original file size; resolution is decoded pixel width and height. Preview scaling does not alter the original. Check order and cover before submission; title and description can be added later. Adding a file is not uploading it, and 100% transfer is not approval. Wait for each file's server-confirmed **Staged** status, then submit the **set batch** for review.

## Connection failures and quota

Do not create repeated batches after a connection error. Inspect individual file states, retry failures, and check the `?batch=` link and Creator Center for an existing record. A staged file should not consume quota again. If the browser says a queued file was not backed up locally, reselect the original during recovery. Daily remaining quota comes from the server; it is not a fixed per-set capacity.

## After partial approval

Open the batch detail and separate shared-metadata review from each image result. A set stays private if shared metadata fails or no image is approved. With partial approval, only approved images appear publicly. Correct the returned image's title, description, source, or file as requested; do not reupload approved originals. A public set retains its old public version while a change awaits review.
