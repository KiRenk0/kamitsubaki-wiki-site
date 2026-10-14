# Production baseline

Production uses remote `main` and Cloudflare Git integration. Read `docs/operations/release-runbook.md` before publishing. Keep concurrent feature work isolated; merge with latest main, never deploy an older feature snapshot. Do not use raw `wrangler pages deploy` to bypass `scripts/release-build.mjs`. The release guard rejects non-main, stale main, changed source, and dirty builds; preserve it. Preserve account avatar/menu/main-site security together with the gallery and Lucide icons. Verify both flows after shared releases. Never force-push main.

# Pull request maintenance

After each completed implementation or update, synchronize the associated PR description with the current scope, validation results, and remaining limitations. Use a Chinese PR title that describes the current changes, and update it when the scope changes.
