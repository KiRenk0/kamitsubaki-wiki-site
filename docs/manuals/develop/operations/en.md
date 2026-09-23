---
book: develop
chapter: operations
locale: en
order: 4
title: Local development, checks, and release
summary: Validate contracts, migrations, and real flows separately, with a rollback record.
---

## Local preparation

Check the site and backend branches, pending changes, environment variable names, and active service addresses. The frontend uses pnpm. Edit documentation only in the site repository's `docs/` and run `node scripts/sync-docs.mjs` to refresh the workspace mirror. Never put environment secrets in Markdown, commits, or browser logs.

## Focused checks

For documentation, run `node scripts/check-docs.mjs`, `node scripts/sync-docs.mjs --check`, and `pnpm check`; run `pnpm build` when routes change. Content structure changes also need `pnpm validate:content`. Contract changes need `node scripts/v3/sync-editor-schema.mjs --check` and `node scripts/v3/sync-gallery-contract.mjs --check`. Add backend tests for the affected behavior, without treating a large unrelated test suite as proof of a user flow.

## Release and rollback

Record site and backend commits, D1 migration level, Worker configuration, R2 bindings, and target frontend version before release. Back up data and rehearse migrations in preview, confirm Worker/frontend compatibility, then follow the release runbook. For entries, verify PR review, merge, and static-site update. For articles, verify real sign-in, cloud draft, approval, and public read. For gallery, verify private staging, batch submission, per-image review, and public image access. A build or local mock cannot prove the cloud path.

If a release fails, pause further rollout, preserve request IDs, record states, and logs, and check for writes that already succeeded. Roll back frontend or Worker code to recorded versions as appropriate. A D1 migration or published data is not undone merely by reverting code; use a backup and explicit data-repair procedure. Label acceptance evidence as local, simulated, or real service, and leave untested paths unclaimed.

## Run checks matched to the change

| Change | Minimum checks |
| --- | --- |
| Manuals and links | `node scripts/check-docs.mjs`, `node scripts/sync-docs.mjs --check`, `pnpm check`. |
| Classification or entry metadata | `pnpm validate:content`, `node scripts/v3/sync-editor-schema.mjs --check`. |
| Gallery contract | `node scripts/v3/sync-gallery-contract.mjs --check`, then backend migration and permission checks. |
| Frontend routes or components | `pnpm check`, `pnpm build`, and affected browser flows. |
| Release candidate | Built links, static-asset audit, backend tests, and real account submission/review. |

Do not reuse old version test counts as a current release claim. Check environment variable names before building without putting values in manuals, command output, or screenshots. When the mirror check fails, edit only the site's `docs/` source and sync again.

## Release order and evidence

Freeze site/Worker commits and planned D1 migrations, back up the database, and rehearse in preview. Keep backend changes backward-compatible across releases where possible. Deploy migrations, Worker, and site in dependency order. Then separately verify entry PRs, article D1, and gallery private staging/public R2 with real accounts. Record service record IDs, public pages, and rollback versions. A simulated D1/R2 test, static build, and local browser preview each prove only their layer.

When a failure occurs, first check whether a write already succeeded. Reverting code does not undo a D1 migration or remove public objects. Preserve audit history and plan any data repair separately. The repository release runbook remains the maintainer source; this chapter is the public operational overview.
