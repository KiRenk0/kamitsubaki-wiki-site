---
book: develop
chapter: content
locale: ja
order: 2
title: 分類・メタデータ・コンテンツ
summary: 分類図、スキーマ、明示的な関連を使って百科と探索資料を維持します。
---

## コンテンツの識別

百科のソースは `src/content/` にあり、安定 ID、エンティティの種類、言語で識別します。メタデータの `schemaVersion: 2` とサイトの V3 は別の番号です。フィールド変更前に `src/lib/entitySchema.mjs`、`src/lib/metadata.mjs`、`src/lib/contentLayout.mjs` を確認し、エディターとバックエンドの契約も同期してください。表示ラベルだけの変更では不十分です。簡体字中国語、日本語、英語の原稿は同じエンティティの識別子を共有し、繁体字は簡体字から生成します。

## 分類とディレクトリ

人物、グループ、企画などは `src/data/classification-map.json` と詳細な分類図に従います。「アーティスト」というラベルからトップページの階層を推測しないでください。新規ソースのパスは内容配置規則から決まりますが、審査済みの一覧ノードへの配置も必要です。楽曲は `performers`、リリースは `releaseType` などの構造化項目で分類します。サイト URL はソースファイルのパスではありません。

## 関連と機能データ

`relations`、`performers`、`credits`、形態の系譜が関連項目、作品クレジット、切替器を動かします。記事と項目の関連は対象 ID を明示して保存し、本文の WikiLink から推測しません。年代記の出来事は `src/data/chronicle/` にあり、時代は `src/data/taxonomy/eras.yml` で定義します。本文の日付は自動で出来事になりません。ギャラリーのキャラクター一覧は項目メタデータから同期しますが、画像と審査データは Worker、D1、R2 に残ります。

## 変更手順

分類、フィールド、配置規則を変更したら、移行結果と多言語の対応を確認し、コンテンツ検証、エディターのスキーマ、ギャラリー契約を検査します。元の文章と出典を保持し、必要なら移行報告と元ファイルのハッシュを確認します。検査を通すためだけに事実を書き換えないでください。

## 一つの実体と複数の入口

`classification.primary` は正規の保存場所を決め、`classification.additional` は Markdown を複製せず一覧入口を増やします。ユニットのメンバーには実際の `member-of` 関係と対象ユニットが必要です。`presentation.morphing.group` は形態の表示をまとめますが、各形態には独自の ID・本文・画像・分類があります。外見が似ているだけで同一性を推測しません。

| 変更 | 保守する場所 | 代用してはいけない方法 |
| --- | --- | --- |
| 人物・ユニット階層 | `src/data/classification-map.json` と実体分類 | ホームのコンポーネントに ID を直書きする。 |
| 楽曲・リリースの配置 | `performers`、`releaseType` 等 | URL 文字列から種類を推測する。 |
| 年代記の出来事 | `src/data/chronicle/` と紀元設定 | 本文に日付だけ書く。 |
| 形態・関係 | `presentation.morphing`、`relations` | 本文の言及から同一性を推定する。 |
| 関連記事 | 記事修訂に保存した明示的な項目 ID | 記事の WikiLink を走査する。 |

## 項目追加の順序

安定 ID と全言語を検索し、実体種類を選び、分類図で主分類と追加入口を決めます。`zh.md`、`ja.md`、`en.md` は実際の本文言語を確認し、中国語のコピーを日英の翻訳としません。繁体字は簡体字から生成します。根拠のある属性と本文を書いて `pnpm validate:content` を実行します。schema 変更時はエディター契約も確認します。正規パスの移動には旧 URL の転送と本文保全を示す移行報告が必要です。

## 分類と形態の最小例

これは**構造の例**です。`example-unit` などの ID は実在する項目ではなく、実際の対象 ID は先に一覧で確認してください。

```yaml
schemaVersion: 2
id: example-member
locale: ja
entityType: person
name: 例示メンバー
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

`group` には対象の `unit` と一致する `member-of` 関係が必要で、フォルダー名だけでは足りません。複数のユニットに所属しても主保存場所は一つです。形態グループは選択器をまとめるだけで同一性を断定しません。実際の関係は正しい `relations` 種別で記録します。追加分類は一つの項目への入口であり、Markdown の複製ではありません。

既存の実体を移す前に、読み取り専用の移行報告で旧 URL・言語・ID・本文ハッシュを確認し、移動後に転送を付けます。言語間の分類一致、関係先の存在、仮項目の状態を検証します。検証のために本文の事実を作らず、フィールドや出典を直してください。完全な定義は `src/lib/entitySchema.mjs` にあります。
