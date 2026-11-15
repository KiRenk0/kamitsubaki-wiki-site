---
schemaVersion: 2
id: ema
entityType: person
name: EMA
romanizedName: EMA
roles:
  - vocalist
  - lyricist
  - composer
lifecycle:
  activity: active
relations:
  - type: member-of
    target: dustcell
contentStatus: published
locale: en
summary: Vocalist and lyricist of DUSTCELL, commanding raw emotional power spanning delicate
  whispers to fierce screams.
sources:
  - id: allt-artist-profile
    title: EMA - ALLT STUDIO artist profile
    url: https://alltstudio.jp/artist/ema/
    type: official
  - id: thinkr-studio-reform
    title: "THINKR: New Studio Announcement"
    url: https://newstudio.thinkr.jp/
    type: official
  - id: ema-plain-credits
    title: "EMA: PLAIN official release credits"
    url: https://kamitsubaki.jp/news/2023/10/25/2731/
    type: official
evidence:
  - id: reviewed-creator-roles
    field: roles
    sourceIds:
      - allt-artist-profile
      - ema-plain-credits
    checkedAt: "2026-11-15"
    status: reviewed
    note: The official PLAIN credits name EMA for lyrics and music. The profile identifies her as
      DUSTCELL vocalist; these roles do not imply credits on every track.
  - id: reviewed-activity
    field: lifecycle
    sourceIds:
      - allt-artist-profile
    checkedAt: "2026-11-15"
    status: reviewed
    note: Current official artist profile and documented releases support active status as of the review
      date. No individual career start day is inferred from DUSTCELL formation.
affiliations:
  - organization: kamitsubaki-studio
    current: false
  - organization: allt-studio
    current: true
---

## Profile

Vocalist and lyricist of DUSTCELL. Her distinctive voice anchors the duo’s sound, moving fluidly between cool introspection and electrifying catharsis.
