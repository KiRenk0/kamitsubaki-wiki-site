---
locale: en
translationKey: edit-guide
eyebrow: CONTRIBUTOR GUIDE
title: Your first contribution can be simple.
intro: |
  You do not need to know how to code or use Git. Choose the route that matches where you are now, and this guide will take you from **creating a GitHub account** to editing wiki content and **submitting a Pull Request**.

  A mistake will not instantly break the site. A Pull Request is a request for review; maintainers check the change before it is merged.
primaryAction: Choose my route
journeyLabel: One contribution, three stages
journeySteps:
  - Prepare your account
  - Edit the content
  - Submit a PR
back: Back to home
targetLabel: Target file
targetIntro: |
  When you arrive from an article, this is the real source file you will change. If it is wrong, return to the article and use “Edit source” again.
invalidTarget: No file was selected. You can still learn here; enter from a specific article when you are ready to edit.
switchLabel: Where are you starting from?
switchHint: Choose the statement that matches your situation. You can switch routes at any time, and progress is saved in this browser.
durationLabel: Estimated time
outcomeLabel: You will finish with
progressLabel: Completed
resetLabel: Reset route progress
resetConfirm: Clear the saved progress for this route in this browser?
completeLabel: Mark this step complete
completedLabel: Step completed
checkpointLabel: "You are ready when:"
aiHelpTitle: Stuck? Copy this prompt into an AI tool
aiHelpBody: Copy the full prompt into an AI assistant you trust. Never give an AI your password, email verification code, 2FA code, recovery code, token, cookie, or other private account data.
aiCopyLabel: Copy help prompt
aiCopiedLabel: Copied — you can ask your AI now
glossaryTitle: Four words to know
glossary:
  - term: Repository
    definition: The project space containing the website files and their history—like a public project folder.
  - term: Fork
    definition: A safe copy under your account. Editing it does not directly change the live wiki.
  - term: Commit
    definition: A saved record of one change with a short explanation. It is not the final PR.
  - term: Pull Request / PR
    definition: A request asking maintainers to review changes from your copy and merge them into the original project.
variants:
  - key: beginner
    label: I do not have a GitHub account
    summary: "Start at zero: sign up, verify your email, edit in the browser, and submit your first PR without installing software."
    audience: Zero-experience route · no coding required
    duration: About 35–55 minutes
    outcome: Your first complete PR
    description: |
      This is the most complete and reassuring route. You only need an email account and a modern browser. Everything happens on the web—**you do not need Git, a terminal, or a code editor**.

      Follow it in order the first time. On future contributions, the shorter web-editing route will be enough.
    sections:
      - title: Prepare what you need
        summary: GitHub and contributing are free; all you need is email, a browser, the fact you want to change, and a reliable source.
        body: |
          Prepare a long-term email address you can access, a modern browser, the information you want to change, and a reliable source that supports it.

          You do **not** need a payment card, GitHub Pro, Git, a terminal, a code editor, or the GitHub app. Changes are first saved in your own safe copy and then reviewed through a PR.

          > Keep passwords, verification codes, 2FA codes, and recovery codes private. Maintainers and AI assistants never need them.
        checkpoint: You have access to your email and understand that the complete browser workflow is free.
        action:
          label: Read GitHub's official account guide
          href: https://docs.github.com/en/get-started/start-your-journey/creating-an-account-on-github
        aiPrompt: |
          I am about to make my first contribution to a fan wiki and know nothing about GitHub. Explain Repository, Fork, Commit, and Pull Request in very simple English, and explain why a PR cannot instantly break the live website. Do not assume I can code, and never ask for a password or verification code.
      - title: Create a free personal GitHub account
        summary: Follow GitHub's sign-up prompts, choose a public username, then verify your email. GitHub Free is enough.
        body: |
          1. Open the GitHub sign-up page below.
          2. Sign up with email, or use a supported Google or Apple sign-in option shown by GitHub.
          3. Choose a username you are comfortable displaying publicly beside your contributions.
          4. Create a strong, unique password and store it safely.
          5. Complete any verification GitHub requests.

          Choose a free personal account if plans are shown. Then open GitHub's verification email and follow the link. An unverified email prevents important actions such as creating forks and Pull Requests.

          If the email does not arrive, check spam, then open avatar → `Settings` → `Emails` → `Resend verification email`. Request a new link if the old one has expired.
        checkpoint: You can sign in, and your primary email is shown as verified under Settings → Emails.
        action:
          label: Open GitHub sign up
          href: https://github.com/signup
        aiPrompt: |
          I am creating a free personal GitHub account. Explain the current sign-up fields one step at a time and tell me which profile information will be public. Do not generate, collect, or ask me to share a password, email verification code, 2FA code, or recovery code. If I describe an error, give only safe troubleshooting steps.
      - title: Understand the four-part workflow
        summary: You do not need to learn Git; remember “repository → fork → commit → Pull Request.”
        body: |
          Think of contributing as submitting writing to an editorial team:

          - The **repository** is the shared project folder.
          - A **fork** is your personal working copy.
          - A **commit** saves one change with a short note.
          - A **Pull Request** submits that saved change for review.

          A PR is not a direct edit to the live site. Review comments are a normal part of collaboration, not a failed contribution.

          **Checks / CI** are automatic tests. Green means the files passed; red means there is a specific issue to inspect and fix.
        checkpoint: You can explain that a commit saves the change and a PR sends it to maintainers for review.
        aiPrompt: |
          Explain Repository, Fork, Branch, Commit, Pull Request, and Checks/CI using an “article submitted to an editorial team” analogy for a nontechnical reader. End with a plain-text flow from editing to merge, without command-line jargon.
      - title: Confirm the target file and source
        summary: Check the path, locale, and evidence before editing so you do not change the wrong article.
        body: |
          The target at the top should begin with `src/content/`, for example:

          ```text
          src/content/artists/vwp/kaf/en.md
          ```

          `zh.md` is Chinese, `ja.md` is Japanese, and `en.md` is English. Common folders are `artists/`, `projects/`, `logs/`, and `site/`.

          Prepare a traceable source. Prefer official websites and announcements, then official social posts, formal interviews, or reliable publications. Do not treat AI output, rumors, or unverifiable fan discussion as factual evidence.
        checkpoint: The path points to the right entry and locale, and you know what reliable source supports the new information.
        aiPrompt: |
          I am editing KAMITSUBAKI FAN WIKI. My target is: {{TARGET_PATH}}

          Explain what content type and locale this path represents, and whether my proposed change belongs in frontmatter or the Markdown body. Do not invent artist facts. If I lack a source, tell me to find an official source first. Do not suggest changing dist, .astro, node_modules, or unrelated code.
      - title: Open the GitHub web editor
        summary: The final button opens the file. GitHub may ask you to sign in and automatically create a fork.
        body: |
          Use the edit action at the end of this route. Sign in if necessary. Without write access, GitHub may show **Fork this repository** or create a fork when you propose the change. This is expected and safe.

          Confirm the file path again. Button labels can change slightly, but the flow stays:

          ```text
          File → Edit → Preview → Commit / Propose changes → Pull Request
          ```

          If the pencil action is unavailable, confirm that you are signed in and your email is verified, then re-enter from the wiki article.
        checkpoint: You can see the GitHub editor, and its file path exactly matches the target shown here.
        action:
          label: Read GitHub's official editing guide
          href: https://docs.github.com/en/repositories/working-with-files/managing-files/editing-files
        aiPrompt: |
          I am editing a file in someone else's public GitHub repository. The target is: {{TARGET_PATH}}

          Based on the page text I describe, tell me only the next button to use. An automatic fork is expected. Never ask for my password, verification code, cookie, token, or full account details. If a screenshot is useful, tell me to hide private information first.
      - title: Edit frontmatter and body safely
        summary: Most contributions change text. Preserve the structure at the top and do not remove fields you do not understand.
        body: |
          A Markdown content file normally has frontmatter and body content:

          ```yaml
          ---
          locale: en
          translationKey: kaf
          name: "KAF"
          image: "https://example.com/image.jpg"
          ---

          ## Overview
          Normal article text starts here.
          ```

          Keep both `---` lines, existing keys, quotes, and indentation. `locale` must match the filename, and localized files for one entry share the same `translationKey`. Use spaces, not tabs, in YAML.

          Make the smallest relevant change; include a source for new facts; never add placeholders, guesses, AI-invented facts, credentials, tokens, or private personal information.
        checkpoint: The edit is focused, the structure is intact, facts are sourced, and no private data is present.
        aiPrompt: |
          Act as a careful Markdown editor. I am editing {{TARGET_PATH}}. I will provide a proposed excerpt and a reliable source. Change only facts directly supported by that source; preserve YAML fields, indentation, and both --- markers; do not invent facts or touch unrelated paragraphs. Return the complete revised excerpt and a short change list. Stop and ask for better evidence if the source is insufficient.
      - title: Preview the diff and create a commit
        summary: Review Preview / Changes, then write a short message describing exactly what you changed.
        body: |
          In Preview or Changes, green usually means added and red means removed. Check for accidental deletion, damaged `---` markers, the wrong locale, strange indentation, broken links, or incorrect dates and names.

          Click **Commit changes...** and use a clear message such as:

          ```text
          docs: correct KAF debut date
          docs: add KAF official link
          docs: fix a typo in KAF entry
          ```

          For an external contributor, the final action may be **Propose changes**. A commit saves the change to your fork/branch; you still need to create the PR on the next page.
        checkpoint: The diff contains only your intended edit, and the commit message accurately describes it.
        aiPrompt: |
          Review the GitHub diff I paste for {{TARGET_PATH}}. Check accidental deletions, YAML structure, locale consistency, unsupported facts, and private data. Then suggest three concise English commit messages. Do not assume anything outside the pasted diff.
      - title: Create your first Pull Request
        summary: Confirm the original repository and main branch, write a clear title and description, then create the PR.
        body: |
          On the comparison page, confirm the base repository is `LinkTh1rsty/kamitsubaki-wiki-site`, the base branch is `main`, and the head/compare side is your fork and new branch.

          A useful PR description includes:

          ```markdown
          ## What changed
          - Added a 2024 activity entry

          ## Source
          - Official announcement: https://...

          ## Locale and scope
          - English; KAF entry only
          ```

          Click **Create pull request**. You are done when you see a numbered PR page. A normal content fix does not need to be a draft. Allowing maintainer edits is usually helpful for small corrections.
        checkpoint: A numbered Pull Request page exists and shows your title, description, commits, and changed files.
        action:
          label: Read GitHub's official fork PR guide
          href: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork
        aiPrompt: |
          Help me write a KAMITSUBAKI FAN WIKI Pull Request for {{TARGET_PATH}}. I will provide the real change and source. Produce a concise title, a Markdown body with “What changed / Source / Locale and scope,” and a final checklist. Never invent a change, test result, or source.
      - title: Read checks, comments, and change requests
        summary: Wait for automated checks. Red is not the end—open Details, fix the specific issue, and keep the same PR.
        body: |
          Yellow or gray means checks are still running; green means they passed; red means a check failed. Open **Details** and start with the first concrete error. Common causes are YAML indentation, missing fields, an invalid locale, or broken Markdown.

          Edit the same file on the same fork/branch and commit again. New commits automatically appear in the existing PR—do not open a duplicate PR.

          Maintainers may comment in Conversation or on a line under Files changed. Make the requested change, then reply briefly. A review request is a normal collaboration step.
        checkpoint: You understand the PR's current state and have located the exact issue if a check or review needs action.
        aiPrompt: |
          My GitHub PR has a failed check or review comment for {{TARGET_PATH}}. I will paste the public error or comment. Explain it in plain language, propose the smallest fix, and remind me to update the same branch and PR. Do not guess at logs I have not shown or ask for private credentials.
      - title: Finish and follow the result
        summary: Your contribution is complete once the PR is submitted; follow notifications until it is merged or closed.
        body: |
          **Open** means the PR is being reviewed or waiting for changes. **Merged** means the change has entered the project and will appear after deployment. **Closed** means it was closed without merging; read the maintainer's explanation.

          Reviews may take time. Do not close a PR simply because it is waiting. If you discover a problem, update the same branch or leave a clear comment. Even a sourced date correction or typo fix is a valuable contribution.
        checkpoint: Your PR is submitted, you know where to follow it, and you have completed one traceable contribution.
        aiPrompt: |
          Based on the GitHub PR status I describe, explain whether it is Open, Merged, or Closed and tell me the next necessary action in beginner-friendly English. Never ask for account credentials.
    finalTitle: Send your contribution to the maintainers
    finalBody: |
      Final check: correct file, verifiable content, clear source, no placeholders, guesses, or private information. Then follow **Edit → Preview → Commit / Propose changes → Create pull request**. If you get stuck, use the AI help prompt inside the matching step.
    finalLinkLabel: Edit the current file on GitHub
  - key: web
    label: I have an account and want web editing
    summary: Use the browser to edit an existing file, commit, create a PR, and make follow-up fixes—no local tools.
    audience: Web-editing route · no installation required
    duration: About 15–30 minutes
    outcome: One browser-based PR
    description: |
      For contributors who can sign in to a verified GitHub account and want the shortest safe browser workflow. It skips account setup and focuses on the target, editor, fork, PR, checks, and follow-up edits.
    sections:
      - title: Confirm account, target, and scope
        summary: Sign in, confirm your verified email, and check the target path and locale.
        body: |
          The target must begin with `src/content/` and match the intended locale. Keep one PR focused on one subject. New facts need a traceable official or reliable source; AI can check wording but is not a source.
        checkpoint: The account works, the path and locale are correct, and you can state the PR's single purpose.
        aiPrompt: |
          Help me scope a small wiki change for {{TARGET_PATH}}. I will describe the issue and source. Tell me what belongs in this PR and what unrelated cleanup I should avoid. Do not invent facts.
      - title: Edit and preview in the browser
        summary: Accept an automatic fork if required, preserve frontmatter, and review the diff.
        body: |
          Open the target with the final action. If GitHub requests a fork, continue. Preserve YAML markers, keys, quotes, and indentation. In Preview / Changes, make sure red and green lines show only the intended edit. Never add credentials, tokens, private contact details, placeholders, or unsupported claims.
        checkpoint: The diff is focused and the YAML/Markdown structure remains valid.
        action:
          label: Official GitHub web-editing guide
          href: https://docs.github.com/en/repositories/working-with-files/managing-files/editing-files
        aiPrompt: |
          Review my proposed Markdown diff for {{TARGET_PATH}}. Check YAML, Markdown, accidental deletion, locale consistency, sourcing, and privacy. Suggest only the smallest necessary corrections.
      - title: Commit and propose the change
        summary: Use a meaningful commit message; GitHub will save the change to your fork/branch.
        body: |
          Click **Commit changes...** and use a concise message such as `docs: correct KAF event date`. External contributors may see **Propose changes** and an automatic fork. Keep the generated topic branch; do not try to write directly to upstream `main`.
        checkpoint: The commit exists in your fork/branch and GitHub has opened a comparison or PR page.
        aiPrompt: |
          Give me five concise `docs: ...` commit messages for the actual edit I describe in {{TARGET_PATH}}. Do not exaggerate scope.
      - title: Create the Pull Request
        summary: Base is the original main branch; head is your fork. Describe the change, source, locale, and scope.
        body: |
          Confirm upstream `LinkTh1rsty/kamitsubaki-wiki-site:main` as the base. Use your fork/branch as head. Include what changed, the supporting source, and locale/scope, then click **Create pull request**. A numbered PR page confirms success.
        checkpoint: The numbered PR page shows the expected title, description, commits, and files.
        action:
          label: Official fork PR guide
          href: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork
        aiPrompt: |
          Draft a concise PR title and Markdown body for {{TARGET_PATH}} using only the real change and source I provide. Include What changed, Source, and Locale/scope. Do not invent evidence.
      - title: Handle checks and review
        summary: Open Details for red checks and push fixes to the same branch and PR.
        body: |
          Wait for checks. Open the first concrete error if one fails. Fix the same fork/branch; new commits update the existing PR automatically. Reply to review comments after addressing them, and do not open a replacement PR for CI fixes.
        checkpoint: Checks pass, or you have located and fixed the specific issue in the same PR.
        aiPrompt: |
          Explain this public GitHub Actions error or review comment for {{TARGET_PATH}} and give the smallest fix. Do not guess missing logs; remind me to update the same PR.
      - title: Update or close an existing PR correctly
        summary: Further commits join the original PR. Close only when you truly intend to stop.
        body: |
          Edit the same branch to add corrections. Leave a short reply explaining what changed. Waiting is not a reason to close a PR. Close only when you no longer intend to continue; the public history will remain.
        checkpoint: You know how to update the original PR and understand Open, Merged, and Closed.
        aiPrompt: |
          I have an open GitHub PR. Based on the page information I describe, help me confirm the same fork and branch so my next commit updates the original PR. Do not suggest a duplicate PR.
    finalTitle: Review once, then submit
    finalBody: |
      Verify the path, diff, sources, and privacy, then follow **Edit → Preview → Propose changes → Create pull request → Checks / review**.
    finalLinkLabel: Open the GitHub web editor
  - key: experienced
    label: I know Git and GitHub
    summary: A concise reference for the repository model, locale constraints, validation commands, and fork PR strategy.
    audience: Developer route · repository constraints
    duration: About 10–20 minutes
    outcome: A repository-compliant PR
    description: |
      For contributors already comfortable with forks, branches, commits, PRs, and CI. Use the web editor, GitHub Desktop, or a local Git workflow; this route focuses on this Astro repository's content model and review expectations.
    sections:
      - title: Establish the content model
        summary: Content Collections are the primary source; routes and homepage sections render from the folder structure.
        body: |
          ```text
          src/content/artists/<category>/<entry>/<locale>.md
          src/content/projects/<category>/<project>/<locale>.md
          src/content/logs/<year>/<record>/<locale>.md
          src/content/site/<locale>.json
          ```

          Do not include `dist/`, `.astro/`, `node_modules/`, or hard-coded article copy in components in a content PR.
        checkpoint: The change is classified as content or implementation and the target matches its collection path.
        aiPrompt: |
          Review whether {{TARGET_PATH}} fits this repository's artists/projects/logs/site content model and explain its likely rendering impact. Avoid assumptions about code I have not supplied.
      - title: Apply schema and localization constraints
        summary: content.config.ts validates frontmatter; localized records share translationKey and structure.
        body: |
          `locale` is `zh | ja | en`. Localized files share a stable `translationKey`. Artists, projects, and logs have distinct schemas. Prefer `zh.md`, `ja.md`, and `en.md` together for a new entry; incomplete bodies may be empty but must not use placeholder prose.

          Keep `theme.*` color values consistent across locales, localize only palette labels, and use `seo.*` only for deliberate metadata overrides.
        checkpoint: Frontmatter satisfies its collection schema and locale/translationKey match sibling files.
        aiPrompt: |
          Act as an Astro Content Collections reviewer. Against the content.config.ts schema I provide, validate frontmatter for {{TARGET_PATH}} and list type, enum, required-field, and i18n consistency issues without inventing defaults.
      - title: Choose web, Desktop, or local Git
        summary: Web is fine for one file; use a topic branch for multi-file entries and structural work.
        body: |
          External contributors should target upstream `LinkTh1rsty/kamitsubaki-wiki-site:main` from a personal fork branch.

          ```bash
          git switch main
          git pull --ff-only upstream main
          git switch -c docs/update-kaf
          # edit content
          git add src/content/...
          git commit -m "docs: update KAF entry"
          git push -u origin docs/update-kaf
          ```

          Keep generated output, local settings, and unrelated formatting out of the PR. Confirm rights and project media policy before adding images.
        checkpoint: The topic branch starts from current upstream/main and the staged diff contains only relevant files.
        aiPrompt: |
          Review the `git status` and `git diff --stat` I provide for a content PR centered on {{TARGET_PATH}}. Flag unrelated files, but never recommend reset --hard or deleting unconfirmed user work.
      - title: Run the same validation as CI
        summary: Run tests, Astro check, and build; fix the first root-cause error.
        body: |
          ```bash
          pnpm test
          pnpm check
          pnpm build
          ```

          `check` catches collection schema and Astro/TypeScript issues; `build` validates static routes and rendering. Start from the first concrete error rather than downstream cascades.
        checkpoint: All commands pass, or the PR clearly records an objective reason local validation was unavailable.
        aiPrompt: |
          I will paste output from pnpm test, pnpm check, or pnpm build. Identify the first root cause, distinguish schema errors from implementation errors, and propose the smallest fix without inventing file contents.
      - title: Write a reviewable PR
        summary: Make scope, sources, locale, validation, and risk obvious; target upstream/main.
        body: |
          Include a change summary, motivation, sources mapped to the facts they support, locale/file scope, validation commands actually run, and screenshots only for visible implementation changes. Keep the diff single-purpose and reviewable.
        checkpoint: Base/head are correct and the description lets a reviewer understand scope and evidence before opening every file.
        aiPrompt: |
          Using only the real diff, sources, and validation results I provide, draft a concise PR title and Markdown body for {{TARGET_PATH}} with Summary, Sources, Locales/scope, and Validation. Do not invent tests or evidence.
      - title: Complete review on the same branch
        summary: Push CI and review fixes to the head branch and preserve the conversation history.
        body: |
          New commits update the PR. Prefer small fixes for explicit issues. Avoid duplicate PRs or rewriting a branch under active review unless a maintainer asks. Resolve content conflicts by rechecking facts and sibling locales, not just deleting conflict markers.
        checkpoint: CI passes, review comments are answered, and the final diff remains focused and free of generated output.
        aiPrompt: |
          Classify the PR review comments and diff I provide into required fixes, clarification questions, and optional suggestions. Give a minimal same-branch repair order and avoid destructive Git commands.
    finalTitle: Submit within the repository rules
    finalBody: |
      Final check: collection path and schema are valid, localization strategy is explicit, sources are traceable, the diff is focused, and `pnpm test`, `pnpm check`, and `pnpm build` pass.
    finalLinkLabel: Open the current file directly
docs: Read the full contribution guide
docsPath: docs/contributing.en.md
---

<!-- guide content is configured through frontmatter; keep a non-empty body so Astro always indexes this file -->
