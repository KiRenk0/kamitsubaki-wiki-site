---
locale: en
translationKey: edit-guide
eyebrow: CONTRIBUTOR ONBOARDING
title: Full Guide Before Editing
intro: |
  This page is aligned with the current workflow of the repository.

  You can switch freely between two versions below:

  - **Complete beginner**: a slower step-by-step walkthrough
  - **With coding experience**: a faster repo-model and PR-flow version

  Both paths lead to the same GitHub editor for the current source file.
back: Back to home
targetLabel: About to edit
targetIntro: |
  First confirm that the path shown below is really the source file you intend to change.

  If it is wrong, stop here. Go back to the relevant wiki article and enter again from the local “Edit source file” link so you do not start with the wrong file.
invalidTarget: No valid edit target was found. Enter from the “Edit source file” button on a specific wiki article.
switchLabel: Choose your guide version
variants:
  - key: beginner
    label: Complete beginner
    description: |
      Best for people making a first contribution to this repository, or anyone not yet comfortable with Markdown, GitHub web editing, PRs, or CI. It explains more of the path in plain language.
    sections:
      - title: "Step 1: confirm exactly which file you are about to change"
        body: |
          The path shown at the top of this page is the real repository file you are about to edit.

          Read that path first and classify it:

          - `src/content/artists/...`: artist, creator, group, and similar entry pages
          - `src/content/projects/...`: project and derived-plan pages
          - `src/content/logs/...`: observation logs, news, and timeline updates
          - `src/content/site/...`: homepage labels, navigation, footer copy, section text
          - `src/content/contribute/...`: the contributor guide pages themselves

          If you are fixing copy, adding facts, updating metadata, or adjusting images, that is usually a **content edit** and should stay inside `src/content/`.
      - title: "Step 2: remember that content and implementation are separate here"
        body: |
          The most important rule for beginners is:

          > **Most wiki contributions change content files, not page code.**

          So start by asking “which content file should this live in?” rather than “which component should I change?”

          The most common shapes are:

          ```text
          src/content/artists/<category>/<entry>/<locale>.md
          src/content/projects/<category>/<project>/<locale>.md
          src/content/logs/<year>/<record>/<locale>.md
          ```

          The homepage sections `01. DATABASE`, `02. PROTOCOLS`, and `03. LOG` are designed to render from this structure automatically.
      - title: "Step 3: learn the metadata block at the top of a file"
        body: |
          Each entry file has two parts: **frontmatter** and **body content**.

          The frontmatter is the block between the opening `---` lines. It stores structured metadata. The body comes after the second `---` and contains the actual wiki writing.

          ```yaml
          ---
          locale: "en"
          translationKey: "kaf"
          name: "KAF"
          romanizedName: "KAF"
          statusLabel: "STATUS"
          status: "ACTIVE"
          image: "https://example.com/image.jpg"
          ---
          ```

          The first fields to understand are:

          - `locale`
          - `translationKey`
          - `name`
          - `romanizedName`
          - `statusLabel` and `status`
          - `image`

          > `translationKey` must remain identical across the localized files, or the site will stop treating them as one entry.

          Artist entries can also include `theme`, which controls the article theme color and the palette panel in the infobox.

          ```yaml
          theme:
            name: "KAF Bloom"
            accentColor: "#F29AC2"
            mutedColor: "#E63145"
            surfaceColor: "#111321"
            highlightColor: "#FFF6FA"
            palette:
              - label: "KAF Pink"
                value: "#F29AC2"
              - label: "Bloom Red"
                value: "#E63145"
          ```

          Do not invent colors casually. Prefer official artist pages, official key visuals, official album covers, or character material. Put the strongest recognition color in `accentColor`, and keep `surfaceColor` dark enough for comfortable reading.
      - title: "Step 4: follow the three-language rule when creating entries"
        body: |
          The site supports three locale routes:

          ```text
          /zh/  Chinese, default locale
          /ja/  Japanese
          /en/  English
          ```

          So when you add a new translatable record, the safest pattern is:

          - create `zh.md`
          - create `ja.md`
          - create `en.md`

          Even if the body text is incomplete, try to create the full structure from the start.
      - title: "Step 5: write the body as clean Markdown"
        body: |
          The article body is ordinary Markdown. You can use:

          - paragraphs
          - lists
          - bold text
          - blockquotes
          - inline code and code blocks
          - tables
          - links

          When in doubt, start from the most stable information:

          1. basic identity details
          2. debut timing or project affiliation
          3. official links or source notes
          4. then fuller descriptive paragraphs

          Avoid these mistakes:

          - editing `dist/`, `.astro/`, or `node_modules/`
          - moving large wiki passages into implementation files
          - filling empty sections with placeholder copy
      - title: "Step 6: what to do when GitHub opens"
        body: |
          After you use the final action on this page, GitHub will usually open the web editor for the current file.

          Once you are there:

          1. confirm the file path still matches the one shown here
          2. edit the frontmatter or article body
          3. scroll to the commit form
          4. write a short, clear commit message

          If GitHub asks how to save the change:

          - already on your own branch: commit directly there
          - not on your own branch: choose **Create a new branch for this commit and start a pull request**
      - title: "Step 7: after saving, the workflow becomes PR plus CI"
        body: |
          This repository uses a GitHub Pull Request workflow.

          A normal path looks like this:

          1. edit the file
          2. commit to your branch
          3. open a Pull Request
          4. wait for CI
          5. address review comments or failing checks

          The core validation commands are:

          ```bash
          pnpm test
          pnpm check
          pnpm build
          ```

          If CI fails, keep working on the **same branch**. You do not need a new PR.
      - title: "Step 8: the most common mistakes"
        body: |
          The usual mistakes are:

          - editing the wrong file path
          - forgetting one of the locale files
          - letting `translationKey` drift across locales
          - mixing content edits with implementation changes
          - committing generated output
          - using placeholder text instead of real content

          Quick self-check:

          1. Am I editing something inside `src/content/...`?
          2. Have I considered the localized files?
          3. Am I changing content, not implementation?
          4. Would another maintainer immediately understand what changed?
    finalTitle: Start editing the current source file
    finalBody: |
      If the guide above makes sense, you are ready to continue.

      The two links below serve different purposes:

      - **Still want to review repository rules**: open the full contribution guide
      - **Already know you want to change this exact file**: open the GitHub editor for the current source file

      After that, continue with the normal path:

      1. edit the file
      2. commit to your branch
      3. open a Pull Request
      4. wait for CI
      5. keep fixing review or CI issues on the same branch
    finalLinkLabel: Open GitHub source editor
  - key: experienced
    label: With coding experience
    description: |
      Best for people already comfortable with Git, GitHub, PRs, and CI who mainly need the repository model, content constraints, and the shortest path to safe editing.
    sections:
      - title: Start from the target file, not the abstract page
        body: |
          The important thing on this page is the target path above.

          In this repo, you are editing a concrete `src/content/...` file, not “a page” in the abstract. Content is the primary data source.

          Quick classification:

          - `src/content/artists/...`: DATABASE entries
          - `src/content/projects/...`: PROTOCOLS cards and project pages
          - `src/content/logs/...`: LOG news-style records
          - `src/content/site/...`: homepage and chrome copy
      - title: The current repo constraints
        body: |
          The main constraints right now are:

          1. content and implementation are separated
          2. the site runs in three locales
          3. homepage sections try to render from folder structure
          4. metadata is mostly automated, with `seo.*` as explicit overrides

          In practice, content editing should prioritize:

          - correct folder placement
          - stable `translationKey`
          - schema-valid frontmatter
          - preserving auto-generated category and entry behavior
      - title: Directory model and common path shapes
        body: |
          Primary content model:

          ```text
          src/content/artists/<category>/<entry>/<locale>.md
          src/content/projects/<category>/<project>/<locale>.md
          src/content/logs/<year>/<record>/<locale>.md
          ```

          Common actions:

          - add a category: create a first-level folder
          - add an entry: create a second-level folder plus localized files
          - tune ordering: use `categoryOrder` / `itemOrder`
          - tune display labels: use `categoryTitle` / `categorySubtitle`
          - override SEO precisely: use `seo.title` / `seo.description` / `seo.image`
      - title: Frontmatter fields that matter most
        body: |
          You do not need every field on every edit, but these are the most relevant:

          - `locale`
          - `translationKey`
          - `name`
          - `romanizedName`
          - `image`
          - `statusLabel` / `status`
          - `categoryTitle` / `categorySubtitle`
          - `categoryOrder` / `itemOrder`
          - `theme.*`
          - `seo.*`

          For localized entries:

          - keep `translationKey` identical
          - prefer all three locale files to exist together
          - the bodies can vary in completeness, but the structure should stay aligned
          - keep `theme` color values synchronized across locales, while localizing `palette.label`
      - title: Shortest safe GitHub web-edit flow
        body: |
          The shortest safe path is:

          1. open the GitHub editor for the current file
          2. edit frontmatter and/or Markdown body
          3. commit to your branch
          4. open a PR
          5. let CI run

          If GitHub asks about branch strategy:

          - already on your own branch: commit directly
          - not on your own branch: create a new branch and start the PR
      - title: CI model and failure patterns
        body: |
          The three checks worth keeping in your head are:

          ```bash
          pnpm test
          pnpm check
          pnpm build
          ```

          They broadly cover:

          - content structure and i18n assumptions
          - Astro diagnostics and collection schema
          - static build integrity

          Common failure sources:

          - YAML/frontmatter indentation errors
          - mismatched `translationKey` or locale values
          - directory shape not matching the auto-render assumptions
          - mixing content changes with implementation edits
    finalTitle: Enter the current file directly
    finalBody: |
      If you already understand the content model and PR path, you can go straight to GitHub now.

      Recommended flow:

      1. edit the current file
      2. commit to your branch
      3. open a Pull Request
      4. review CI
      5. keep fixing on the same branch

      If you need the longer explanation again, open the full contribution guide.
    finalLinkLabel: Open the current file in GitHub
docs: Read the full contribution guide
docsPath: docs/contributing.en.md
---

<!-- guide content is configured through frontmatter; keep a non-empty body so Astro always indexes this file -->
