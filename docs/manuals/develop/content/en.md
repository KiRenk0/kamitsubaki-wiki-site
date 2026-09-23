---
book: develop
chapter: content
locale: en
order: 2
title: Classification, metadata, and content
summary: Maintain encyclopedia and Explore data using the map, schema, and explicit relationships.
---

## Content identity

Encyclopedia sources live under `src/content/` and are identified by stable ID, entity type, and language. Metadata `schemaVersion: 2` is not the same number as website V3. Before changing a field, inspect `src/lib/entitySchema.mjs`, `src/lib/metadata.mjs`, and `src/lib/contentLayout.mjs`, then synchronize editor and backend contracts. Changing a display label alone is insufficient. Simplified Chinese, Japanese, and English sources share an entity identity; Traditional Chinese is generated from Simplified Chinese.

## Classification and directories

People, groups, and projects follow `src/data/classification-map.json` and its detailed map. Do not infer a home-page level merely from an “artist” label. Content layout rules derive new source paths, but a new entity still needs placement in reviewed directory nodes. Tracks use `performers`; releases use `releaseType`; other types use their structural fields. A website URL is not a source-file path.

## Relationships and feature data

`relations`, `performers`, `credits`, and form lineage drive related records, work credits, and the switcher. Article-to-entry links store explicit target IDs; they are never inferred from body WikiLinks. Chronicle events live under `src/data/chronicle/`, with eras defined by `src/data/taxonomy/eras.yml`; a date in prose does not create an event. Gallery characters derive from entity metadata, but images and review data remain in the Worker, D1, and R2.

## Change procedure

After modifying classification, fields, or layout rules, inspect migrations and multilingual counterparts, run content validation and the editor/gallery contract checks, and keep the original prose and sources. Use migration reports and source hashes when relevant; do not rewrite facts merely to satisfy a validator.

## One entity, several discovery paths

`classification.primary` selects canonical storage; `classification.additional` adds directory entrances without cloning Markdown. A unit member needs a real `member-of` relationship and unit target. `presentation.morphing.group` assembles a visual lineage, but each form retains its own ID, body, artwork, and classification. Similar appearance alone is not evidence of identity.

| Change | Maintain here | Never replace with |
| --- | --- | --- |
| People/unit hierarchy | `src/data/classification-map.json` and entity classification | Hard-coded IDs in home components. |
| Track/release placement | `performers`, `releaseType`, and metadata | Guessing from URL strings. |
| Chronicle event | `src/data/chronicle/` and era data | A date only in prose. |
| Forms and links | `presentation.morphing`, `relations` | Inferring identity from a mention. |
| Related articles | Explicit entry IDs on article revisions | Scanning WikiLinks in article text. |

## Adding an entry

Search stable IDs and all languages, choose the entity type, then use the classification map for primary and additional entrances. Verify actual content languages in `zh.md`, `ja.md`, and `en.md`; copied Chinese is not an English or Japanese translation. Generate Traditional Chinese from Simplified Chinese. Add evidenced properties and body, run `pnpm validate:content`, and check editor contracts if the schema changed. A canonical path move needs old-URL redirects and a migration report to prove body text was preserved.

## Minimal category and form example

This is a **structural example**. IDs such as `example-unit` are placeholders, not real archive records; verify real target IDs in the catalog first.

```yaml
schemaVersion: 2
id: example-member
locale: en
entityType: person
name: Example Member
romanizedName: Example Member
roles: [vocalist]
lifecycle:
  activity: active
classification:
  primary: groups
  group: example-unit
  additional: [creators]
relations:
  - type: member-of
    target: example-unit
presentation:
  morphing:
    group: example-family
    slot: virtual-artist
    order: 1
```

`group` requires a target `unit` and a matching `member-of` relation; a folder name alone is insufficient. A person can have several membership edges but only one primary archive. A form group clusters the selector and does not itself assert identity; add a correct `relations` type when an actual relationship is known. Additional categories are entrances to one record, not duplicate Markdown.

For an existing entity, first inspect a read-only migration report for old URLs, languages, IDs, and body hashes. Then move the source and add redirects. Validate cross-language classification, existing relation targets, and stub status. Correct the metadata or evidence rather than inventing prose to pass validation. The complete field definition lives in `src/lib/entitySchema.mjs`.
