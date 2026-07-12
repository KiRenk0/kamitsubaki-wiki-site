# KAMITSUBAKI-Inspired Theme System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add flash-free system, light, and dark themes that adapt the official site's monochrome editorial language across every major fan-Wiki surface.

**Architecture:** A pure preference module resolves and cycles theme state, while BaseLayout applies it before paint and a reusable control changes it at runtime. Semantic CSS tokens define both palettes; a compatibility layer covers existing color utilities and targeted component rules polish high-traffic surfaces.

**Tech Stack:** Astro 6, browser ES modules, Node.js test runner, Tailwind CSS v4 utilities, plain CSS.

## Global Constraints

- Do not copy official logos or proprietary graphics.
- Support exact preferences `system`, `light`, and `dark`.
- Store preference under `kamitsubaki-wiki:theme:v1`.
- Prevent wrong-theme flash before first paint.
- Do not add a runtime dependency.
- Maintain readable 4.5:1 body-text contrast in both themes.
- Respect `prefers-reduced-motion`.
- Do not stage `promo/`.

---

### Task 1: Theme preference state

**Files:** Create `src/lib/themePreference.mjs`; create `tests/theme.test.mjs`.

**Interfaces:** `normalizeThemePreference(value)`, `resolveTheme(preference, prefersDark)`, `nextThemePreference(preference)`.

- [ ] Write tests asserting invalid values become `system`, system follows the media query, explicit choices win, and cycling is `system → light → dark → system`.
- [ ] Run `node --test tests/theme.test.mjs`; expect module-not-found failure.
- [ ] Implement the three pure functions with no DOM dependency.
- [ ] Run `node --test tests/theme.test.mjs`; expect all tests to pass.
- [ ] Commit `src/lib/themePreference.mjs` and `tests/theme.test.mjs` as `feat: add theme preference state`.

### Task 2: Flash-free initialization and localized control

**Files:** Create `src/components/ThemeToggle.astro`; create `src/scripts/themeToggle.js`; modify `src/layouts/BaseLayout.astro`; modify `src/content/site/{zh,ja,en}.json`; modify `src/content.config.ts`; modify `tests/theme.test.mjs`.

**Interfaces:** BaseLayout receives `themeToggle` copy from localized site content; root exposes resolved `data-theme` and preference `data-theme-preference`.

- [ ] Add source-contract tests for the storage key, pre-paint head script, `matchMedia`, localized labels, `aria-live`, and the reusable component mount.
- [ ] Run the focused tests and verify they fail because theme initialization and copy are absent.
- [ ] Add localized system/light/dark labels and schema, write the inline initializer with guarded storage access, mount the control in navigation, and implement storage plus media-query updates.
- [ ] Run focused tests and `pnpm check`; expect zero failures and diagnostics.
- [ ] Commit as `feat: add accessible theme controls`.

### Task 3: Semantic light and dark tokens

**Files:** Modify `src/styles/global.css`; modify `tests/theme.test.mjs`.

**Interfaces:** CSS exposes all surface, text, line, accent, focus, shadow, and noise variables under both resolved themes.

- [ ] Add tests for every semantic token, `color-scheme`, selection, body, scrollbar, preloader, cursor, compatibility selectors, and theme-control styling.
- [ ] Run focused tests and verify missing-token failure.
- [ ] Implement paper-white light tokens and near-black dark tokens, then map global primitives and common utility color variables to them.
- [ ] Run focused tests and `pnpm check`; expect pass.
- [ ] Commit as `style: establish monochrome theme tokens`.

### Task 4: Core page and article theming

**Files:** Modify `src/styles/global.css`; modify high-traffic Astro components only where semantic hooks are required; modify `tests/theme.test.mjs`.

**Interfaces:** Home sections, nav, footer, article chrome, infobox, prose, contributor wall, and contribution guide use semantic surfaces in both themes.

- [ ] Add contract tests for home, article, guide, contributor, navigation, and footer light-theme selectors.
- [ ] Run focused tests and verify selectors are absent.
- [ ] Add scoped light-theme rules and semantic hooks while preserving artist accent variables and avoiding layout changes.
- [ ] Run `pnpm test` and `pnpm check`; expect pass.
- [ ] Commit as `style: theme core wiki surfaces`.

### Task 5: Floating panels and overlays

**Files:** Modify `src/styles/global.css`; modify `tests/theme.test.mjs`.

**Interfaces:** Social contact, AI observer, dialogs, history, messages, composer, launchers, and scrims use panel-specific semantic variables derived from the global theme.

- [ ] Add contract tests for light and dark AI variables, readable message surfaces, contact panel, scrim, dialog, composer, and fixed-button contrast.
- [ ] Run focused tests and verify failure.
- [ ] Define theme-derived AI and floating-panel variables and replace fixed dark backgrounds in those surfaces.
- [ ] Run `pnpm test` and `pnpm check`; expect pass.
- [ ] Commit as `style: theme floating observer panels`.

### Task 6: Browser and production verification

**Files:** Modify only files needed to correct discovered defects.

**Interfaces:** Produces verified behavior, no new public API.

- [ ] Run `pnpm test`, `pnpm check`, and `pnpm build`; expect 0 test failures, 0 diagnostics, and a completed static build.
- [ ] Inspect home, `/zh/artists/solo/teresa/`, `/zh/contribute/edit`, and the AI panel at 375, 768, 1024, and 1440 pixels in both themes.
- [ ] Verify theme persistence across navigation, system preference response, keyboard focus, reduced motion, no horizontal overflow, and no fixed-control overlap.
- [ ] Run `git diff --check` and confirm `promo/` remains untracked.
- [ ] Commit visual corrections as `fix: polish theme responsiveness` only when corrections exist.
