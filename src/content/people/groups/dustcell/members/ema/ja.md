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
locale: ja
summary: DUSTCELLのボーカル・作詞。透明感と狂気を併せ持つ歌声と、赤裸々な感情を紡ぐリリックが支持を集める。
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

## プロフィール

DUSTCELLの歌唱・作詞担当。「音楽を通じて誰かの細胞の一部になりたい」という思いからユニット名に共鳴。HALのTVCMソング『命の行方』等で全国的な注目を集める。
