# KAMITSUBAKI Wiki Site

[中文](README.md) · [English](README.en.md) · [文書一覧](docs/README.md) · [構成](docs/architecture.ja.md) · [投稿センター](https://kamitsubaki.wiki/ja/contribute/)

非公式の多言語 KAMITSUBAKI STUDIO ファン百科です。公開サイトは Astro で静的生成します。百科項目は GitHub、独立記事は D1、ギャラリーの情報と画像は D1/R2 で管理し、公開前に必ず審査します。

## 投稿経路

- 百科項目：閲覧画面の編集ボタン、または投稿センターから GitHub 変更提案を送ります。
- 研究記事：`/{locale}/articles/submit/` で D1 下書きを保存し、審査へ送ります。
- ギャラリー：`/{locale}/gallery/manage/` から投稿し、承認までは非公開 R2 に保存します。
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

リリース候補ではコンテンツ検証、`astro check`、全テスト、本番ビルド、生成リンク、Pages 資産、文書とミラーを確認します。手順は [文書一覧](docs/README.md)、未完了条件は [V3 審査状況](docs/v3/acceptance/README.md) にあります。

ビルド成功だけでは OAuth、GitHub 投稿、D1/R2 審査、本番デプロイを実証できません。遠隔移行と公開は別途承認が必要です。開発ブランチは `V3.0.0` です。
