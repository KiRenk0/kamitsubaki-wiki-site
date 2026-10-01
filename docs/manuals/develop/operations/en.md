---
book: develop
chapter: operations
locale: en
order: 4
title: Frontend development and acceptance
summary: Check frontend changes by scope and distinguish local behavior from real submissions.
---

## Local setup

Check the frontend branch and pending changes, install Node.js and pnpm, then run `pnpm install --frozen-lockfile` and `pnpm dev`. Edit manuals only under this repository's `docs/manuals/`, then run `node scripts/sync-docs.mjs` for the workspace mirror. Never put secrets in the repository, screenshots, or browser logs. Server operation, releases, and incident response follow private maintainer procedures and are not documented here.

## Checks by change

| Frontend change | Suggested checks |
| --- | --- |
| Manual text and links | `node scripts/check-docs.mjs`, `node scripts/sync-docs.mjs --check`. |
| Taxonomy and entry metadata | `pnpm validate:content`; inspect affected languages and directories. |
| Pages, controls, and reader | `pnpm check`, `pnpm build`, then use the affected desktop and narrow-screen flows. |
| Submission UI | Local drafts, sign-in state, errors, receipt, and Creator Center navigation. |

A successful build proves only that static output can be generated. Label mocked responses, browser preview, and real account submissions separately in acceptance records. Preserve existing entry prose and review records when using test data.

## Frontend release boundary

Record the frontend candidate commit, build result, affected pages, visible regressions, and restore version. Before release, maintainers confirm the dependent service is available and verify the real entry, article, and gallery paths. If the page disagrees with the service state, pause the frontend release and retain a reproducible URL and receipt number; server diagnosis and recovery follow private procedures. This public manual contains no server repository, configuration, data migration, or deployment commands.
