---
locale: en
translationKey: format-guide
title: Unified Content Style Guide
description: "A shared standard for article structure, naming, prose, sources, dates, media, and multilingual content that keeps the wiki accurate, neutral, readable, and maintainable."
---

This guide explains how wiki content should be organized and written. For the contribution workflow, start with the [contribution guide](/en/contribute/edit). For Markdown, frontmatter, and media syntax, use the [syntax and properties guide](/en/contribute/syntax).

The goal is not to make every article identical. It is to help readers understand the subject, verify the information, and leave an article that another editor can update safely. Adapt a recommended structure when the subject calls for it, and never create empty sections merely to fill a template.

## Scope and requirement levels

This guide applies to leads, prose, sections, frontmatter, infoboxes, references, links, and media descriptions. Preserve lyrics, direct quotations, in-work dialogue, official names, code, and data-field values faithfully instead of rewriting them to match article prose. The surrounding explanation remains subject to this guide.

- “Must” and “must not” mark requirements involving factual accuracy, privacy, safety, sourcing, or site structure.
- “Should” and “prefer” mark the normal recommendation. A different choice needs a clear content or readability reason.
- “May” marks an optional choice based on the needs of an entry; it is not required everywhere.
- Copyright, privacy, source material, the site schema, and the [syntax and properties guide](/en/contribute/syntax) take priority if they conflict with this guide. When uncertain, preserve the source and explain the issue in the Pull Request.

## Core principles

### Write verifiable content

Dates, credits, affiliations, biographies, quotations, rankings, and assessments should be directly supported by public sources. A source must contain the information stated next to it; a page that only mentions a song does not support a claim about that song's cultural impact.

- Prefer official websites, announcements, work pages, stores, formal interviews, publications, and editorially reviewed reporting.
- First-party sources are suitable for straightforward facts such as release dates, track lists, lineups, and self-announcements.
- Claims about influence, reception, controversy, or status should normally use reliable independent secondary sources and identify whose assessment is being described.
- If no reliable source can be found, leave the claim out. AI output, search-result snippets, other wikis, and content aggregators are not substitutes for the underlying source.

This follows the reasoning behind Wikipedia's policies on [verifiability](https://en.wikipedia.org/wiki/Wikipedia:Verifiability) and [reliable sources](https://en.wikipedia.org/wiki/Wikipedia:Reliable_sources): readers should be able to reach material that genuinely supports the statement.

### Stay neutral and attribute opinions

An article explains facts and significant viewpoints; it does not campaign for an artist, project, fandom, or critic. Avoid promotional or verdict-like language such as “legendary,” “the greatest ever,” “obviously,” or “a disastrous betrayal.”

When a source makes an assessment, attribute it to the person or publication that made it:

```md
Avoid: This is a groundbreaking masterpiece.

Prefer: In a 2025 review, music publication X described the song as representative of the group's change in style.[Source](https://example.com/review)
```

Every `example.com` link on this page is a formatting placeholder and must not be used as a source in a real entry.

For disputed subjects, summarize the significant positions found in reliable sources and give them weight in proportion to their coverage. Do not argue with a position in the article or manufacture a fifty-fifty balance. See Wikipedia's [neutral point of view](https://en.wikipedia.org/wiki/Wikipedia:Neutral_point_of_view) guideline.

### Do not add original conclusions

If source A reports an event appearance and source B reports a release on the same day, that does not establish a causal relationship between the two. Do not infer identities, relationships, motives, or unannounced projects from clothing, voices, account activity, timing coincidences, or fragments of interviews.

You may accurately summarize what sources state. You may not combine several sources into a conclusion that none of them makes. See Wikipedia's [no original research](https://en.wikipedia.org/wiki/Wikipedia:No_original_research) policy.

### Be accurate, concise, and consistent

Prefer direct, understandable sentences and keep one main topic in each paragraph. Preserve a reasonable and consistent naming, date, or punctuation style already established within an article. Change it only when accuracy or readability clearly improves, and keep the scope of that change explicit.

## Article names and proper nouns

An article title should be recognizable, precise, concise, and consistent with related entries. Use the current official name by default. Preserve official capitalization, spacing, punctuation, and full-width or half-width forms rather than “correcting” the brand. This is also consistent with Wikipedia's [article titles](https://en.wikipedia.org/wiki/Wikipedia:Article_titles) guidance.

- On first mention, a person, artist, group, song, or project may include both its official original name and a familiar form in the current language.
- Choose one clear short form afterward. Do not continually alternate between romanization, Japanese, and translation within the same passage. When both a reading and romanization are needed, prefer a `ruby` reading with the romanization in parentheses; follow the [syntax and properties guide](/en/contribute/syntax) for the exact markup.
- Add disambiguation only when names collide, and use only enough detail to distinguish the entries.
- Do not invent abbreviations or translations. If a helpful unofficial translation is necessary, label it as provisional and retain the official name.
- URL directories, `translationKey`, and frontmatter follow the [syntax and properties guide](/en/contribute/syntax). Do not rename stable identifiers merely because display text changes.

## Leads and section structure

### Let the lead answer three questions

The page title is generated from frontmatter, so the body begins with a short lead rather than repeating an `#` heading. A lead should normally establish:

1. what the subject is;
2. how it relates to KAMITSUBAKI, an artist, or a relevant project; and
3. the most important distinguishing information supported by sources.

The lead summarizes the body and should not introduce an assessment that is never explained later. One paragraph is enough for a short entry; two or three is usually enough for a mature article. Keep detailed chronologies, complete track lists, and exhaustive collaborations out of the opening.

### Start body headings at level two

Use `##` for main sections and `###` below them without skipping levels. Prefer short noun phrases. Avoid uninformative headings such as “Other” or “Some information,” and avoid links, bold text, or decorative symbols inside headings.

```md
## Overview
## Activity history
### 2024
## Notable works
## References
## External links
```

Organize for comprehension: identify the subject first, then explain its history, works, or relationships, followed by references and external links. Chronologies normally run oldest to newest. A recent-activity log may run newest to oldest, but one list must use one direction consistently.

## Recommended structures by entry type

These structures are starting points, not mandatory forms. Remove sections with no content and add clearly named sections when a subject needs them.

### Artists and characters

```md
Lead

## Overview
## Character and creative role
## Profile and setting
## Activity history
## Notable works
## Related projects
## References
## External links
```

Separate information about real people from fictional character settings. Do not present in-universe facts, official promotional framing, and real-world activity as the same kind of fact. Apply the privacy rules below to performers, private identities, and unannounced relationships.

### Songs

```md
Lead

## Overview
## Release and versions
## Credits and performances
## Listen and watch
## References
```

Lyrics, translations, readings, and word-level timelines must follow the [syntax and properties guide](/en/contribute/syntax). Use formal credits; do not identify instruments, samples, or performers solely by ear.

### Albums and releases

```md
Lead

## Overview
## Release and editions
## Track notes
## References
## External links
```

Do not mechanically repeat structured release dates, catalog numbers, and tracks already present in frontmatter. Use the prose to explain edition differences, context, and facts that need interpretation.

### Projects and events

```md
Lead

## Overview
## History
## Members and related subjects
## Works or activities
## References
## External links
```

Distinguish an announcement from a launch, performance, release, or ending. Do not use a teaser date as the date on which an event occurred. Mark a future event or release as “expected,” “planned,” or “scheduled,” and update the wording if the official information changes. For stories and ARGs, explicitly separate in-universe events, promotional framing, and real-world events.

### Observation logs

Build a log around one clear date and event. State what happened, then explain its relationship to the subject being tracked. Do not preserve live speculation, fan rumor, or unconfirmed plans as fact. When later information changes the picture, update the description while retaining any necessary chronological context.

## Frontmatter and infoboxes

- Frontmatter is structured data used by pages, lists, and search indexes; an infobox is a visual summary for readers. Their core facts must agree, but they do not need to repeat the same wording.
- Field names, types, date formats, and allowed values must follow the [syntax and properties guide](/en/contribute/syntax) and content schema. Do not invent an unrecognized field.
- Put only stable facts worth checking at a glance in an infobox. Do not include personal opinions, promotional copy, fan discussion, or unconfirmed speculation.
- Prefer official material for names, images, and affiliations. If reliable unofficial compilation has genuine value, first describe its source and nature in the prose. An “unofficial” label does not make unverified information suitable for an infobox.
- The artist frontmatter `code` field follows the label numbering systems already established on the site: `P` plus a number for Phenomenon Record, `S` plus a number for SINSEKAI RECORD, and `G` plus a number for Girls Revolution Project. Record only a number confirmed by an existing entry or maintenance material; never infer one from display order.

## Prose and paragraphs

- Use restrained, explanatory prose. Avoid advertising copy, recommendations, jokes at the subject's expense, direct appeals to the reader, and excessive exclamation.
- Keep one main topic in each paragraph and start a new paragraph when the topic changes.
- Prefer explicit subjects. When several artists, works, or organizations are present, avoid ambiguous pronouns.
- Use absolute dates instead of “yesterday,” “recently,” or “this year.”
- Do not use bold text as a substitute for headings, and do not bold entire paragraphs.
- Quote only the short portion needed to understand a point, with a speaker and source. Accurately paraphrase the remainder in your own words.
- Do not repeat frontmatter, infobox, or earlier prose merely to make the article look complete.

## Dates, times, and numbers

Frontmatter dates use `YYYY-MM-DD`, `YYYY-MM`, or `YYYY` as required by the schema. In prose, format them naturally for each language:

- English: `14 March 2025`
- Chinese: `2025年3月14日`
- Japanese: `2025年3月14日`

If only the month is known, do not invent a day. If only the year is known, do not guess the month. When a stream, release, or announcement depends on a precise time, include a time zone such as `20:00 UTC+8` or `21:00 JST`. Do not use the ambiguous abbreviation `CST` by itself. Keep number, unit, and percentage formatting consistent within an article.

Add an as-of date or reporting period to changing figures such as age, chart position, play count, or member count:

```md
As of July 2026, the official page lists 12 tracks.[Source](https://example.com/official)
```

## Lists, tables, and timelines

Use prose for context and relationships, lists for parallel items, and tables for repeated fields that readers need to compare. Do not turn one or two sentences into a table for decoration.

- Use parallel grammar within a list: for example, begin every item with a date or every item with a work title.
- Give each table column one meaning and a self-explanatory heading. Move long explanations outside the table.
- Keep the date precision and sorting direction consistent in a timeline.
- Use “not announced” or an equivalent phrase for an unknown value; do not substitute `0`.
- Break a wide table into smaller tables or lists when it is difficult to read on mobile.
- A complex timeline or event table may summarize the main events in prose before placing the complete data in an appendix or child page.
- When a long table interrupts the article, it may use a folding structure supported by the [syntax and properties guide](/en/contribute/syntax). The summary must identify its contents, and an essential conclusion must not exist only inside the folded region.
- Explanatory text is normally left-aligned, short status values may be centered, and figures that need digit-by-digit comparison may be right-aligned. Keep one alignment within a column.

## Sources and references

### Match the source to the claim

| Content | Preferred source | Caution |
| --- | --- | --- |
| Release dates, tracks, members, announcements | Official sites, stores, work pages, accounts | Supports only what the subject officially published |
| Biography and creative process | Formal interviews, event material, publications | Separate the interviewee's statement from the writer's analysis |
| Reception, influence, controversy | Editorially reviewed independent media, research, specialist publications | Attribute the view and give it appropriate weight |
| Charts and statistics | Original chart or platform page | State chart name, region, and reporting date |
| Historical web content | Reputable web archive | Identify the original page and its archived status |

A social post can support its author's own announcement, but it is usually insufficient for a contentious claim about another person. Anonymous leaks, screenshots without context, unauthorized reposts, and generative-AI output are not sources.

Wikipedia may help locate terminology or leads, but it is not the final source for this wiki. Open the underlying reference it cites and confirm that it directly supports your wording.

### Place a citation near its claim

Put a source beside the sentence or paragraph that it supports. Do not collect unidentified links at the end and leave readers to guess their purpose. Use link text that identifies the page:

```md
Prefer: The single was released on 14 March 2025.[Official release page](https://example.com/release)

Avoid: The single was released on 14 March 2025.

## References

- [Click here](https://example.com/release)
```

One citation at the end of a paragraph can support several consecutive statements from the same source. Cite separately when a paragraph mixes sources or different kinds of assessment.

## Living people, privacy, and controversy

For living people, accuracy and privacy take priority over completeness. Do not add an unsupported legal name, address, school, family detail, health or financial information, private account, identity theory, or interpersonal dispute. Do not assemble small facts in a way that helps identify someone whose identity has not been made public.

Negative or potentially reputation-damaging material requires high-quality sources and direct relevance to the article. Omit it when only rumor, anonymous posts, or fan discussion exists. Information being visible somewhere online does not automatically make it appropriate to republish. Wikipedia's [biographies of living persons](https://en.wikipedia.org/wiki/Wikipedia:Biographies_of_living_persons) policy provides a useful safety model.

## Multilingual content

Chinese, Japanese, and English entries should communicate the same core facts, but word order, punctuation, and explanatory detail may follow each language. They do not need to be literal sentence-by-sentence translations.

- Keep official names, dates, numbers, catalog codes, and URLs aligned across languages.
- Recheck sources while translating. A claim is not reliable merely because it already appears in another language.
- When the target language has no established translation, retain the official name and add a brief explanation on first mention.
- Do not treat machine translation as a finished draft. Human review is essential for names, honorifics, omitted subjects, and work-specific context. Generative AI may assist translation, but it is not a source for facts or translations. Check and revise every adopted sentence, and disclose AI assistance when required by the project.
- When adding or removing an important fact, update all three languages when practical. Do not copy a translation you cannot verify.

## Links, images, and media

Use a descriptive article name for internal links rather than “click here.” External links belong mainly beside the facts they source or in a separate “External links” section. That section is for official homepages, official accounts, and pages of lasting reader value; it is distinct from references.

Every image and media item needs a clear and lawful basis for use. Alternative text should communicate information in the image that matters to the article, not merely say “image” or repeat the filename. Keep captions factual and identify the creator, date, or source when required. Do not replace searchable, translatable text with an image or stack promotional art purely for decoration.

Follow the [syntax and properties guide](/en/contribute/syntax) for players, lyric components, readings, and image paths.

## Edit scope and collaboration

Keep one change focused on a clear purpose, such as “add an official source for the release,” “standardize the artist name within this article,” or “reorganize an overlong activity history.” Do not rewrite an entire article while adding one date.

If an existing style is accurate, readable, and internally consistent, normally keep it even when it differs from personal preference. Explain large renames, section-system changes, or removal of sourced material in the Pull Request before they are merged.

Describe the result and reason in a commit or Pull Request summary. Avoid labels such as “update” or “fix known issues” that do not let a reviewer judge the scope:

```text
content(kaf): add 2025 performance record and official source
docs(format): align dates and version sections in song entries
```

## Common rewrites

### Replace promotion with verifiable facts

```md
Before: Her incomparable voice made her an instant sensation.

After: She released her first single in 2024; by December that year, it had entered the top ten of the X chart.[Release source](https://example.com/release) [Chart source](https://example.com/chart)
```

### Replace relative time with exact dates

```md
Before: Officials recently announced that she would appear at a new show.

After: On 18 July 2026, the official site announced that she would appear at the X show on 2 September.[Official announcement](https://example.com/news)
```

### Limit a claim to what sources support

```md
Before: Teasers appeared on the same day, proving that both projects share a universe.

After: Both projects published teasers on 1 June 2025. As of that date, officials had not described a relationship between them.[Project A](https://example.com/a) [Project B](https://example.com/b)
```

## Pre-submission checklist

- Can a first-time reader understand the subject from the title, lead, and section order?
- Does every new factual claim have a public source that directly supports it?
- Are confirmed facts, attributed assessments, and editor opinion clearly separated?
- Have original inference, promotion, rumor, and unnecessary private information been removed?
- Are names, capitalization, dates, time zones, numbers, and punctuation consistent?
- Are lists and tables clearer than prose and readable on mobile?
- Are internal links, external links, alternative text, and media sources accurate?
- Do important names, figures, and links agree across all three languages?
- Is the change limited to its stated purpose, and has the diff been previewed?
- Do the Markdown and frontmatter pass the [syntax and properties guide](/en/contribute/syntax) checks?

## References

This site-specific guide adapts the following Wikipedia editorial principles. These links document the editorial method; they do not replace the original sources required for article facts:

- [Manual of Style](https://en.wikipedia.org/wiki/Wikipedia:Manual_of_Style): clear, concise, consistent article organization and prose.
- [Neutral point of view](https://en.wikipedia.org/wiki/Wikipedia:Neutral_point_of_view): represent significant viewpoints fairly and attribute them.
- [Verifiability](https://en.wikipedia.org/wiki/Wikipedia:Verifiability): make important statements checkable by readers.
- [Reliable sources](https://en.wikipedia.org/wiki/Wikipedia:Reliable_sources): choose sources appropriate to the kind of claim.
- [No original research](https://en.wikipedia.org/wiki/Wikipedia:No_original_research): do not create conclusions absent from the cited material.
- [Article titles](https://en.wikipedia.org/wiki/Wikipedia:Article_titles): use recognizable, precise, concise, and consistent names.
- [Biographies of living persons](https://en.wikipedia.org/wiki/Wikipedia:Biographies_of_living_persons): handle privacy, disputes, and potentially harmful material with particular care.
