# 神椿影像馆 — upstream UI fidelity

The user explicitly requires the original open-source ChronoFrame UI and animations (2026-10-26 follow-up). Do not redesign or add Wiki-specific visual controls.

- Source: HoshinoSuzumi/chronoframe `016ac44f38aeb7ed30b2899870484f6b352ae59f`, original shared gallery layer. Album listing directly uses stable v1.0.2 source at commit `730eaddc511662741f48c2fa80108847d24325ce`, with template, styles, hover motion, random timing and waterfall keyframes unchanged. Only type import and API transport change.
- Official visual reference: https://lens.bh8.ga/ and its albums page. Screenshots in the owning task evidence directory.
- Keep original photo wall, embedded header, spacing, colors, fonts, filters, sort menu, albums and viewer templates. The approved first-release exceptions below may change functional conditions; preserve geometry, styles and motion.
- Keep original motion-v transitions/springs/stagger, album card hover movement, infinite alternating waterfall animation, viewer opening/closing, thumbnail strip and WebGL zoom behavior. Do not replace animation with static images or globally disable motion.
- Identity text/avatar and data/runtime adaptations differ. No extra Wiki navigation row, custom empty-state panel, source-button row, or replacement sort UI.
- Native server processing and dynamic OG are outside this host; their transport/runtime replacements must not alter gallery presentation.
- Keep the original control styling. Close unconnected controls under the confirmed first-release scope; account operations remain on the Wiki.
- List uses local 480px public derivatives. Viewer streams originals on demand. Never invent EXIF, GPS or capture dates.
- Desktop verification: 1440 x 900. Mobile: 390 x 844. Compare the same route/state against official source and verify animation running state as well as screenshots.

## Selected entrance integration, 2026-10-26

The user selected entrance concept 1. Its design belongs to ../../docs/design/visual-roam/DESIGN.md; the original gallery UI inside this app remains unchanged. The app now mounts at /visuals/, including all API/media/assets. Host CSS opts into the Wiki native document-navigation transition, respecting reduced motion, without changing internal gallery motion. Live data uses the full published catalog with batched loading; query time and album-projection creation time are not photographic capture dates.

## Original identity asset, 2026-10-26

Use public/wiki-avatar.svg, an unchanged copy of the owning Wiki public/brand/kamitsubakiwiki-square.svg vector original (400×400 viewBox). Avatar, loading identity and favicon reference this original; no redraw, sharpening or artificial enlargement. Source SHA-256 is recorded in design/wiki-avatar-source.json. Preserve the upstream avatar size/shape and intentionally blurred backdrop.

## Confirmed first-release exceptions

The user explicitly chose browse/albums/filter/originals and closing unfinished functionality. Keep original wall/viewer/album layouts and motion. Add a small original-component-based footer for count, load-more, loading, empty/error and retry. Hide sign-in/map/reaction controls, filter tabs without real metadata and photographic-date sorting. Use published modification time by default; source dates are not capture dates. Full metadata filtering must not eagerly render the entire wall. Footer source link offers the corresponding modified source while retaining upstream credit.
