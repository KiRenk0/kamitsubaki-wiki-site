# Content Licensing And Attribution

[English](licensing.en.md) / [中文](licensing.md) / [日本語](licensing.ja.md)

The site uses layered licensing. The public [`/en/license`](https://kamitsubaki.wiki/en/license) page is the reader-facing policy; this document explains how authors record licensing in the repository.

## Default Rules

- Unless otherwise marked, original text that the site has authority to license is available under [CC BY-NC-SA 4.0 International](https://creativecommons.org/licenses/by-nc-sa/4.0/).
- Images, cover art, lyrics, audio, video, character designs, logos, trademarks, and other third-party material are excluded from the default text license.
- Text from another site or author keeps its original terms. A license marker is not a substitute for permission and cannot legitimize material that the project has no right to use.
- Program source code and repository software files are outside the content CC license. Do not add a repository-root `LICENSE` containing the content license.
- The contribution interface does not obtain a blanket CC grant. Another contributor's text is covered by 4.0 only when the rightsholder separately gives clear permission or the entry records the applicable license.

## Entry License Field

Artist, project, log, song, and album frontmatter can use these `license.code` values:

| `code` | Use |
| --- | --- |
| `CC-BY-NC-SA-4.0` | Original text that the site has authority to license |
| `CC-BY-NC-SA-3.0-CN` | Third-party text, translations, or adaptations under the 3.0 China Mainland license |
| `rights-reserved` | Material for which the original rightsholder reserves rights |
| `authorized-use` | Material used only within a specific authorization |

An unknown `code` fails `pnpm check` or the production build.

### Site-original text

```yaml
license:
  code: "CC-BY-NC-SA-4.0"
  attribution: "LinkTh1rsty"
```

### Third-party text under an earlier CC license

Copied, translated, rewritten, or merged third-party text under 3.0 CN must retain its original license version and record all attribution fields:

```yaml
license:
  code: "CC-BY-NC-SA-3.0-CN"
  attribution: "Original author and contributors"
  sourceTitle: "Original entry title"
  sourceUrl: "https://example.com/original-entry"
  modifications: "Reorganized and rewritten from the source entry with additional references."
```

The schema requires `attribution`, `sourceTitle`, `sourceUrl`, and `modifications` for 3.0 CN. Translations derived from the same source must retain the marker in every locale file.

### Reserved rights and specific authorization

```yaml
license:
  code: "rights-reserved"
  attribution: "Original author or rightsholder"
  sourceUrl: "https://example.com/original"
  note: "Copyright remains with the original rightsholder."
```

```yaml
license:
  code: "authorized-use"
  attribution: "Rightsholder name"
  note: "Used on this site within the rightsholder's authorization."
```

Use `authorized-use` only when authorization has actually been obtained. A `rights-reserved` marker does not itself give the site permission to copy material.

## Images And Other Media

Entry pages display a shared media exclusion, so do not mark an entire article `rights-reserved` merely because it includes official artwork. Assess text and media separately.

- Prefer official pages, licensed distribution services, or material covered by explicit permission.
- Record media provenance in the entry's sources and explain the source and basis for use in the PR.
- Do not add unknown-origin files, watermark removals, artificial upscales, or material beyond what an encyclopedia description needs.
- Add full lyrics only when a source clearly permits republication or the project has specific permission.

## Review Checklist

- Is the text original, specifically authorized, or governed by a third-party license?
- Does the marker preserve the source license and exact version?
- Are the source page, attribution, and changes recorded?
- Could images, lyrics, or embedded media be mistaken for default CC-licensed text?
- Do all three locales use consistent provenance and license logic?
- Do `pnpm test`, `pnpm check`, and `pnpm build` pass?
