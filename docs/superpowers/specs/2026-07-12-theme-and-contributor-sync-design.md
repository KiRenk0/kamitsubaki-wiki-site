# Theme System and Contributor Sync Reliability Design

## Goal

Restore the site's original KAMITSUBAKI-inspired editorial identity, provide polished light and dark themes, and make contributor synchronization reliable, observable, privacy-safe, and correct by unique Git commit.

## Reference Design Language

The current KAMITSUBAKI STUDIO website uses a stark monochrome editorial system: paper-white space, pure black graphics and typography, thin rules, asymmetric fixed rails, oversized central symbols, compact uppercase navigation, reversed black labels, and deliberate rather than decorative motion. The fan Wiki will adapt these principles without copying official assets or implying affiliation.

The resulting visual language uses:

- High-contrast black and paper-white foundations.
- Strong hierarchy through scale, weight, whitespace, and rules rather than many colors.
- Compact uppercase metadata paired with readable serif editorial headings.
- Inverted labels and restrained accent color for state and interaction.
- Existing observation-terminal details retained as fan-Wiki identity.

## Theme Architecture

The document root exposes `data-theme="light"` or `data-theme="dark"`. A three-state preference supports `system`, `light`, and `dark`.

An inline script in the document head reads the saved preference before first paint, resolves system preference when necessary, applies the resolved theme, and sets `color-scheme`. This prevents a flash of the wrong theme. A reusable theme toggle cycles through system, light, and dark; its accessible label and visible state are localized and it listens for system changes while in system mode.

Theme preference is stored under a versioned local-storage key. Storage failure must not prevent the page from rendering.

## Color System

Global semantic tokens replace color intent rather than mechanically inverting pixels:

- `--surface-canvas`, `--surface-raised`, `--surface-subtle`, `--surface-inverse`
- `--text-primary`, `--text-secondary`, `--text-muted`, `--text-inverse`
- `--line-strong`, `--line-default`, `--line-soft`
- `--accent`, `--accent-contrast`, `--focus-ring`
- `--shadow-color`, `--noise-opacity`

Light mode uses paper white with black typography and clearly visible neutral rules. Dark mode uses near-black surfaces with off-white typography and avoids stacking indistinguishable gray layers. Artist-specific colors remain optional accents and never replace core text or surface tokens.

Existing Tailwind-like `text-white`, `border-white`, `bg-white`, and `bg-black` utilities are widespread. A compatibility layer maps their generated color variables into semantic theme behavior, while high-traffic components are explicitly refactored to semantic classes. This hybrid approach avoids a risky whole-site rewrite while making both themes visually complete.

## Component Scope

The theme applies to:

- Base document, preloader, noise, cursor, and selection.
- Desktop and mobile navigation, language links, and the new theme control.
- Homepage hero, about, database, projects, logs, contributor honor wall, and footer.
- Article header, reading progress, table of contents, prose, infobox, metadata chips, and source links.
- Contributor guide, progress controls, prompt blocks, and route cards.
- Social contact and AI observer panels, including scrims, dialogs, history, composer, and messages.

No official logo, type asset, or proprietary graphic is copied.

## Contributor Sync Root Cause

GitHub Actions runs are currently marked successful even though `CONTRIBUTOR_SYNC_TOKEN` is empty. The workflow prints a skip message and exits with code zero. Therefore new author commits are present on `main` but never reach the contributor database.

The current database sync is insert-only. Re-running a corrected grouped feed would not remove old file-level events, so historical counts would remain inflated. Event identity also includes the path, which represents file edits rather than unique contribution commits.

## Contributor Sync Design

### Frontend repository

- The workflow fails clearly when `CONTRIBUTOR_SYNC_TOKEN` is absent.
- `GITHUB_TOKEN` and repository identity are passed to the sync script.
- Git history is grouped by contributor, commit, collection, and entry.
- GitHub's commit API is used opportunistically to enrich commit authors with login, avatar, and profile URL. A failed lookup falls back to the existing hashed private identity.
- The sync payload declares replacement semantics for the `git-history` source.
- Logs report accepted events, contributor count, and whether identity enrichment ran.

### Backend repository

- A validated replacement flag is accepted only by the authenticated admin sync route.
- Replacement sync removes prior events for the same source before inserting the complete normalized snapshot.
- Contributor statistics are rebuilt after replacement, including contributors who no longer have events.
- Counts use unique commit semantics. Bots are excluded from public totals and rankings.
- The API continues returning the existing public shape for compatibility.
- Sync failures are recorded and returned as non-success responses.

Replacement happens only after the payload is validated. The existing database remains unchanged if request authentication or validation fails.

## Configuration

The same random secret value must be configured as:

- GitHub Actions repository secret `CONTRIBUTOR_SYNC_TOKEN` in `LinkTh1rsty/kamitsubaki-wiki-site`.
- Cloudflare Worker secret `CONTRIBUTOR_SYNC_TOKEN` for the AI observer backend.

The workflow uses the built-in `GITHUB_TOKEN`; no personal access token is required for public commit enrichment. `CONTRIBUTORS_API_BASE` remains optional because the production Worker URL has a safe default.

## Error Handling and Observability

- Missing sync secret is a failed Action with an actionable message.
- GitHub identity enrichment failure is non-fatal and logged as a fallback.
- Backend replacement and insertion errors fail the request and mark the sync run failed.
- Frontend contributor display distinguishes loading, empty, and API failure states.
- Theme storage and media-query failures fall back to system or dark without blocking navigation.

## Testing and Verification

Automated tests cover theme preference resolution, pre-paint initialization, toggle state, localization, semantic tokens, light-mode contrast contracts, GitHub identity enrichment fallback, replacement payloads, backend replacement behavior, unique commit totals, bot exclusion, and missing-secret workflow failure.

Browser verification covers home, artist entry, contribution guide, and AI panel in both themes at 375, 768, 1024, and 1440 pixel widths. It checks contrast, horizontal overflow, fixed controls, theme persistence, system-mode changes, and reduced motion.

## Acceptance Criteria

- Light mode visibly reflects the official site's high-contrast monochrome editorial language without copying official assets.
- Dark mode preserves the fan Wiki's observation-terminal character with clearer depth and hierarchy.
- Theme choice supports system, light, and dark, persists, and never flashes the wrong theme on load.
- Every major page and floating panel remains usable and readable in both themes.
- Missing contributor configuration cannot appear as a successful sync.
- A full replacement sync removes historical file-level duplicates.
- Aqaz and later contributors appear after configuration and a successful manual or main-branch sync.
- Plaintext author email addresses are never sent to or returned by the backend.
