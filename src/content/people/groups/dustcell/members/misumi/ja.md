---
schemaVersion: 2
id: misumi
entityType: person
name: Misumi
romanizedName: Misumi
roles:
  - composer
  - arranger
  - producer
lifecycle:
  activity: active
relations:
  - type: member-of
    target: dustcell
contentStatus: published
locale: ja
summary: DUSTCELLのコンポーザー・プロデューサー。ボカロPとしても数々の殿堂入り曲を輩出するサウンドアーキテクト。
sources:
  - id: allt-artist-profile
    title: Misumi - ALLT STUDIO artist profile
    url: https://alltstudio.jp/artist/misumi/
    type: official
  - id: thinkr-studio-reform
    title: "THINKR: New Studio Announcement"
    url: https://newstudio.thinkr.jp/
    type: official
  - id: dustcell-interview-2020
    title: DUSTCELL interview - BIG UP!zine (2020-05-29)
    url: https://big-up.style/zine/article/interview/20200529-6867
    type: interview
    publisher: BIG UP!zine
    publishedAt: "2020-05-29"
evidence:
  - id: reviewed-creator-roles
    field: roles
    sourceIds:
      - allt-artist-profile
      - dustcell-interview-2020
    checkedAt: "2026-11-15"
    status: reviewed
    note: The official profile documents composition and arrangement. The first-person DUSTCELL
      interview introduces Misumi as composer/producer.
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

DUSTCELLの楽曲制作・サウンドプロデュース全般を担当。2015年よりボカロPとして活動し、『反重力の街』など11曲以上の殿堂入りを達成。「美と狂気」をテーマに先鋭的なエレクトロロックを構築。
