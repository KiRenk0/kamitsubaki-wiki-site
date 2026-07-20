# コンテンツのライセンスと出典表示

[English](licensing.en.md) / [中文](licensing.md) / [日本語](licensing.ja.md)

本サイトは階層型ライセンスを採用します。公開表示は [`/ja/license`](https://kamitsubaki.wiki/ja/license) を基準とし、この文書ではリポジトリ内での記述方法を説明します。

## 既定のルール

- 別途表示がない限り、本サイトが許諾権限を有するオリジナル文章は [CC BY-NC-SA 4.0 国際](https://creativecommons.org/licenses/by-nc-sa/4.0/)で提供されます。
- 画像、ジャケット、歌詞、音声・映像、キャラクターデザイン、ロゴ、商標、その他の第三者素材は既定の文章ライセンスに含まれません。
- 他のサイトや著作者に由来する文章には元の条件が適用されます。ライセンス表示は転載許可の代わりにはならず、権利のない利用を正当化しません。
- プログラムコードとソフトウェアファイルはコンテンツ向け CC ライセンスの対象外です。
- 投稿画面では一律の CC 許諾を取得しません。他の投稿者の文章は、権利者が別途明示的に同意した場合、または記事に対応するライセンスが記録されている場合だけ 4.0 の対象になります。

## 記事の `license` フィールド

アーティスト、プロジェクト、ログ、楽曲、アルバムの YAML frontmatter で次の値を使用できます。

| `code` | 用途 |
| --- | --- |
| `CC-BY-NC-SA-4.0` | 本サイトが許諾できるオリジナル文章 |
| `CC-BY-NC-SA-3.0-CN` | 3.0 中国大陸版で提供される第三者の文章、その翻訳・翻案 |
| `rights-reserved` | 原権利者が権利を留保する内容 |
| `authorized-use` | 権利者からの特定の許諾範囲で使用する内容 |

未定義の `code` は `pnpm check` またはビルドで失敗します。

### 本サイトのオリジナル文章

```yaml
license:
  code: "CC-BY-NC-SA-4.0"
  attribution: "LinkTh1rsty"
```

### 旧版 CC ライセンスで提供される第三者の文章

複製、翻訳、改稿、統合した場合は 3.0 CN を維持し、次の情報をすべて記録します。

```yaml
license:
  code: "CC-BY-NC-SA-3.0-CN"
  attribution: "原著作者と投稿者"
  sourceTitle: "元記事のタイトル"
  sourceUrl: "https://example.com/original-entry"
  modifications: "元記事を整理・改稿し、出典を補足。"
```

`attribution`、`sourceTitle`、`sourceUrl`、`modifications` のいずれかがない場合、schema 検証は失敗します。同じ文章を元にした翻訳にも各言語ファイルでこの表示が必要です。

### 権利留保と個別許諾

```yaml
license:
  code: "rights-reserved"
  attribution: "原著作者または権利者"
  sourceUrl: "https://example.com/original"
  note: "著作権は原著作者に帰属します。"
```

```yaml
license:
  code: "authorized-use"
  attribution: "権利者名"
  note: "権利者の許諾により、本サイトに限り使用します。"
```

`authorized-use` は実際に許諾を得た場合だけ使用します。`rights-reserved` と書くだけで複製権が得られるわけではありません。

## 画像とその他のメディア

詳細ページには共通のメディア除外表示があります。公式画像があるという理由だけで記事全体を `rights-reserved` にしないでください。

- 公式ページ、正規配信サービス、または許諾済み素材を優先します。
- 本文の出典と PR に、画像の出所と利用根拠を記録します。
- 出典不明、透かし除去、人工的な拡大、百科紹介の範囲を超える素材は追加しません。
- 歌詞全文は、転載を認める明確な出典または個別許諾がある場合だけ追加します。

## レビュー時の確認

- オリジナル、許諾済み、または第三者ライセンスのどれか。
- 元のライセンスと同じバージョンを使用しているか。
- 元ページ、表示名、変更内容が揃っているか。
- 画像や歌詞が文章の CC ライセンスに含まれるように見えていないか。
- 3 言語で出典とライセンスの扱いが一致しているか。
- `pnpm test`、`pnpm check`、`pnpm build` が通るか。
