# V.W.P Artists

Use this folder for the five core V.W.P member pages.

The folder name `vwp` creates the homepage category automatically.

## Recommended Article Shape

Every launch-quality V.W.P page should follow this structure:

```md
## Overview
## Role and Creative Position
## Activity History
## Representative Works and Related Entries
## Related Projects / Setting
## References
## External Links
```

## Source Priority

Use sources in this order:

1. Official artist pages
2. Official news / release pages
3. Official YouTube / discography information
4. Wikipedia for cross-checking
5. Major media interviews if needed

Do not paste source prose directly. Rewrite it into neutral wiki-style summary text.

## Minimum Completion Standard

- `zh.md`: full launch article with complete body sections
- `ja.md`: complete lead, core sections, and references
- `en.md`: complete lead, core sections, and references

## Common Frontmatter

```yaml
---
locale: zh
translationKey: kaf
name: 花譜
romanizedName: KAF
meta: "DEBUT: 2018.10.18"
debutDate: "2018-10-18"
profileTagline: "One-sentence identity summary."
designCredits:
  - "Character design: ..."
affiliations:
  - "KAMITSUBAKI STUDIO"
  - "V.W.P"
officialLinks:
  - label: "Official artist page"
    href: "https://..."
featuredEntries:
  - label: "Related entry"
    href: "/zh/projects/..."
    kind: "project"
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
    - label: "Observation Navy"
      value: "#111321"
    - label: "Soft Light"
      value: "#FFF6FA"
---
```

## Theme Color Rules

Theme colors are part of the article metadata. They should identify the character, not decorate the page randomly.

Use this source order:

1. Official KAMITSUBAKI artist page
2. Official key visual or character visual
3. Official album / live / project artwork
4. Widely repeated official motif colors

Use the fields like this:

- `accentColor`: strongest character recognition color
- `mutedColor`: supporting or contrasting color
- `surfaceColor`: dark readable article surface
- `highlightColor`: light highlight for accents
- `palette`: visible swatches with labels that explain the color source

Current V.W.P reference palettes:

```text
KAF: KAF Bloom
  pink hair / red flowers / observation navy

RIM: RIM Neuromance
  red key visual / deep blue hair / neon cyan geometry

HARUSARUHI: Harusaruhi Impact
  impact yellow / fire red / electric blue / stage black

ISEKAIJOUCHO: Isekaijoucho Dark Canvas
  dark singer tone / green-gray world / orange light / pale glow

KOKO: KOKO Lightning Rock
  lightning violet / cold blue / rock black / metal white
```

If the official visual direction is unclear, leave `theme` out until a better source is available.

Optional display fields commonly used here:

```text
categoryTitle: ...
categorySubtitle: ...
categoryOrder: 1
itemOrder: 1
code: "01"
```
