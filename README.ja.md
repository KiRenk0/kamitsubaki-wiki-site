# KAMITSUBAKI Wiki Site

[中文](README.md) · [English](README.en.md) · [文書一覧](docs/README.md) · [構成](docs/architecture.ja.md) · [投稿センター](https://kamitsubaki.wiki/ja/contribute/)

非公式の多言語 KAMITSUBAKI STUDIO ファン百科です。公開サイトは Astro で静的生成します。百科項目は本リポジトリで管理し、記事とギャラリーはサイトから投稿します。公開には審査が必要です。サーバー側は非公開ソースであり、コード、構成、運用資料は外部開発者に提供しません。

## 投稿経路

- 百科項目：閲覧画面の編集ボタン、または投稿センターから GitHub 変更提案を送ります。
- 研究記事：`/{locale}/articles/submit/` でクラウド下書きを保存し、審査へ送ります。
- ギャラリー：`/{locale}/gallery/manage/` で画像を非公開で一時保存し、セットを審査へ送ります。
- 画像・出典・権利：[画像とファイル](docs/manuals/contribute/entry/ja.md) と [ライセンス](docs/manuals/contribute/rights/ja.md) を確認してください。

[V3 投稿ガイド](docs/manuals/contribute/start/ja.md) に従い、廃止済みの `artists/`・`albums/` ディレクトリや旧 frontmatter 例は使用しないでください。

## コンテンツ構造

`src/content/` には `people`、`units`、`isotopes`、`songs`、`releases`、`projects`、`lives`、`organizations`、`lore`、旧記事ソース、サイト文言があります。同じ項目の `zh.md`・`ja.md`・`en.md` は一つのディレクトリに置き、安定した `id` を共有します。繁体字版は自動生成します。

分類と保存先はメタデータ、`classification-map.json`、`contentLayout.mjs` から決まり、公開 URL はエンティティ登録表が生成します。[コンテンツディレクトリ](src/content/README.md) と [Metadata Schema v2](docs/category-optimization/metadata-schema-v2.md) を参照してください。

## ローカル開発

```sh
pnpm install --frozen-lockfile
pnpm dev
```

フロントの公開候補ではコンテンツ検証、`astro check`、影響する単独のフロントテスト、本番ビルド、生成リンク、静的資産、文書とミラーを確認します。非公開サービスを必要とするテストは保守者が私有環境で実行します。手順は [文書一覧](docs/README.md)、未完了条件は [V3 審査状況](docs/v3/acceptance/README.md) にあります。

ビルド成功だけでは実際のログイン、GitHub 投稿、記事審査、画像投稿、本番公開を実証できません。サーバーの運用と公開は保守者の非公開手順に従います。開発ブランチは `V3.0.0` です。
