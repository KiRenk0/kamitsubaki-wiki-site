# Image uploads, paths and file organization

Keep original bytes, dimensions and format: no upload compression or conversion is required. Upload larger originals directly through GitHub, bypassing the Wiki upload API. The in-site attachment tool also preserves originals, but accepts at most 750 KB each, 8 images and 4 MB total.

## Where files belong

| Content | Repository path | Rule |
| --- | --- | --- |
| Artists / groups | `src/content/artists/<group>/<entry>/en.md` | Follow existing groups, e.g. `vwp/kaf` |
| Songs | `src/content/songs/<artist>/<group>/<song>/en.md` | Inspect neighboring entries first |
| Albums | `src/content/albums/<artist>/<album>/en.md` | Track lists belong in album properties |
| Projects | `src/content/projects/<group>/<project>/en.md` | Reuse existing groups |
| Events / timeline | `src/content/logs/<entry>/en.md` | Follow the neighboring date fields |
| Announcements | `src/content/announcements/<entry>/en.md` | Edit through GitHub |
| Original images | `public/images/<type>/<entry>/filename.png` | Use `artists`, `songs`, `albums`; new project/log images may use `projects`, `logs` |
| In-site attachments | `public/images/contributions/<hash>.png` | Automatically named; do not rename hashes |
| Guide copy | `src/content/contribute/`, `src/lib/editorGuide.mjs` | Edit source languages |
| This guide / developer docs | `docs/` | This guide also generates the site page |
| Navigation / site copy | `src/content/site/` | JSON; use GitHub |

Keep existing paths; these conventions do not request a mass migration. New names should use lowercase letters, digits and hyphens, e.g. `kaf-live-2026-09-14-01.jpg`. Preserve the real extension; renaming it does not convert an image. Reuse the same image across languages.

Source files are `zh.md`, `ja.md`, `en.md`; translations share `translationKey`. Submit only languages with real content and add missing translations later. Traditional Chinese (`zh-tw`, `zh-hk`) is generated from Simplified Chinese. Do not commit `dist/`, `.astro/`, `node_modules/`, `public/thumbnails/` or `.cache/`.

## Upload originals on GitHub

1. Open [the site repository](https://github.com/LinkTh1rsty/kamitsubaki-wiki-site). Fork it if you lack write permission.
2. Create a contribution branch from current `main`, such as `content/kaf-images`. For an existing PR, use its source branch so commits update that PR.
3. Open the destination, such as `public/images/artists/kaf/`, and choose **Add file → Upload files**. Select the original. If the folder does not exist, prepare a `kaf` folder locally containing the images and upload that folder from `public/images/artists/`. Check the complete paths before committing.
4. Commit to the contribution branch. Open the uploaded file and check spelling, case and extension. Pasting an image into an Issue/PR comment is not this repository upload workflow.
5. Edit the article Markdown on the same branch, set its image path as below, and record the source, author and permission. Include both images and Markdown in one PR.
6. Open a PR to the original repository's `main`. Verify both file types under **Files changed**, follow checks and review, and wait for merge and successful deployment.

GitHub browser uploads are limited to **25 MiB per file**. This project also audits Pages asset sizes; ask maintainers about larger files instead of assuming they can be published. Prefer PNG/JPEG/WebP; confirm support and purpose before adding SVG, animation or other attachments. [Official GitHub upload instructions](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)

## Set the image path

| Location | Value |
| --- | --- |
| Repository | `public/images/artists/kaf/kaf-live-2026.jpg` |
| Article properties → cover image | `/images/artists/kaf/kaf-live-2026.jpg` |
| Image block → image URL | `/images/artists/kaf/kaf-live-2026.jpg` |
| YAML | `image: "/images/artists/kaf/kaf-live-2026.jpg"` |
| Markdown | `![KAF on stage](/images/artists/kaf/kaf-live-2026.jpg)` |

Remove only the leading `public`; keep the leading `/images/`. Do not use `/public/images/`, a computer path, a temporary `blob:` URL or a GitHub `/blob/branch/` file-view page. An authorized external image must use a stable direct HTTPS image URL.

Use Article properties for the cover. For the body, choose Insert content → Image, then set its address and description; edit an existing image in Block properties. Entering a path does not upload a file.

## Images that are not deployed yet

- If the image is already merged and deployed, enter `/images/...` in the editor, verify its preview and submit the article.
- To submit a new image and article together, write in the editor, export the complete Markdown, and upload it with the original to the same GitHub branch/PR. A preview on the current site may show a missing image until deployment.
- In-site automatic submissions do not import images from a separate GitHub branch. Either deploy the image first, or put the exported article and image in one GitHub PR.

## Replace and verify

Prefer a new filename when replacing an image to avoid stale caches. Search the repository for cover, body, SEO and translated references before moving or deleting an existing image, and update every reference.

Check the original opens, paths match exactly, sources/authorship/permission are recorded, images and article are in the same PR or images are already deployed, and checks pass. After deployment, open the real article and image URL. Uploading does not place third-party images under the site's text license.

The existing thumbnail pipeline can create separate display images for lists. It never overwrites repository originals; this is separate from preserving original uploads.
