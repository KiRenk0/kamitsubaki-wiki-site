# 画像アップロード・パス・ファイル分類

原本のバイト列・解像度・形式を保持し、圧縮や変換は要求しません。大きい原本はGitHubへ直接アップロードし、WikiのアップロードAPIを経由しません。サイト内添付も原本を保持しますが、1枚750 KB、最大8枚、合計4 MBの制限があります。

## 保存先

| 内容 | リポジトリ内のパス | ルール |
| --- | --- | --- |
| アーティスト・グループ | `src/content/artists/<分類>/<記事>/ja.md` | `vwp/kaf`など既存の分類に合わせる |
| 楽曲 | `src/content/songs/<アーティスト>/<分類>/<曲>/ja.md` | 近くの記事を確認する |
| アルバム | `src/content/albums/<アーティスト>/<アルバム>/ja.md` | 曲目はアルバムの属性に記入 |
| 企画 | `src/content/projects/<分類>/<企画>/ja.md` | 既存の分類を使う |
| 活動記録 | `src/content/logs/<記事>/ja.md` | 日付属性は同種の記事を参照 |
| 告知 | `src/content/announcements/<告知>/ja.md` | GitHubで編集 |
| 原画像 | `public/images/<種類>/<記事>/filename.png` | `artists`、`songs`、`albums`。企画・記録には`projects`、`logs`も使用可 |
| サイト内添付 | `public/images/contributions/<ハッシュ>.png` | 自動命名。ハッシュを変更しない |
| ガイド文言 | `src/content/contribute/`、`src/lib/editorGuide.mjs` | 元言語を編集 |
| 本ガイド・開発文書 | `docs/` | 本ガイドからサイト内ページも生成 |
| ナビゲーション | `src/content/site/` | JSON。GitHubで編集 |

既存のパスは維持してください。一括移動を求める規則ではありません。新規名は英小文字・数字・ハイフンで、例は`kaf-live-2026-09-14-01.jpg`です。拡張子は実際の形式に合わせます。名前の変更だけでは形式は変わりません。同じ画像を言語ごとに重複登録しません。

元言語ファイルは`zh.md`、`ja.md`、`en.md`で、同じ記事は共通の`translationKey`を使います。実際の内容がある言語を提出し、未訳は後で補完します。繁体字`zh-tw`・`zh-hk`は簡体字から生成します。`dist/`、`.astro/`、`node_modules/`、`public/thumbnails/`、`.cache/`をコミットしないでください。

## GitHubで原本をアップロード

1. [サイトのリポジトリ](https://github.com/LinkTh1rsty/kamitsubaki-wiki-site)を開き、書き込み権限がなければForkします。
2. 最新の`main`から`content/kaf-images`などの投稿ブランチを作ります。既存PRがある場合はそのソースブランチを使います。
3. `public/images/artists/kaf/`などの保存先で **Add file → Upload files** を選び原本を指定します。新規フォルダーの場合は端末上で`kaf`フォルダーに原本を入れ、親の`public/images/artists/`からフォルダーごとアップロードします。確定前に全パスを確認します。
4. 投稿ブランチにコミットし、ファイルが開けること、綴り・大文字小文字・拡張子を確認します。Issue/PRコメントへの貼り付けは、このリポジトリへのアップロードとは異なります。
5. 同じブランチでMarkdownを編集し、下記のパスと出典・作者・使用許可を記入します。画像と本文を同じPRに含めます。
6. 元リポジトリの`main`へPRを作り、**Files changed**で画像とMarkdownを確認します。チェック・レビュー・マージ・デプロイ完了を待ちます。

GitHubのブラウザー経由は**1ファイル25 MiBまで**です。本サイトもPagesの静的ファイルサイズを検査します。より大きいファイルは管理者に相談してください。通常はPNG/JPEG/WebPを使い、SVG・アニメーション・その他の添付は用途と対応を確認します。[GitHub公式アップロード手順](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)

## パスの指定

| 場所 | 値 |
| --- | --- |
| リポジトリ | `public/images/artists/kaf/kaf-live-2026.jpg` |
| 記事プロパティのカバー画像 | `/images/artists/kaf/kaf-live-2026.jpg` |
| 画像ブロックのURL | `/images/artists/kaf/kaf-live-2026.jpg` |
| YAML | `image: "/images/artists/kaf/kaf-live-2026.jpg"` |
| Markdown | `![ステージ上の花譜](/images/artists/kaf/kaf-live-2026.jpg)` |

先頭の`public`だけを除き、`/images/`を残します。`/public/images/`、端末内パス、仮の`blob:` URL、GitHubの`/blob/ブランチ/`ファイル閲覧ページは使いません。外部画像は使用可能な、安定した画像直結HTTPS URLに限ります。

カバーは記事プロパティ、本文画像は「内容を挿入 → 画像」でURLと説明を記入します。既存画像はブロックのプロパティで調整します。パスの記入だけではファイルはアップロードされません。

## 未公開画像とエディター

- 画像がマージ・デプロイ済みなら`/images/...`を入力し、プレビューを確認して記事を提出します。
- 新画像と記事を同時提出する場合は、エディターで書いて完全なMarkdownをエクスポートし、原本と同じGitHubブランチ・PRに追加します。現行サイトのプレビューではデプロイ前の画像は表示できないことがあります。
- サイトの自動投稿は別のGitHubブランチから画像を取り込みません。先に画像を公開するか、エクスポートした本文と画像を同じPRにまとめてください。

## 差し替えと確認

キャッシュ対策として、差し替えは新しいファイル名と参照の更新を推奨します。移動・削除前にリポジトリ検索でカバー・本文・SEO・他言語の参照を探し、すべて修正します。

原本が開くこと、パスと大文字小文字、出典・作者・使用許可、同一PRまたは画像公開済みであること、チェック成功を確認します。デプロイ後は実際の記事と画像URLを開きます。第三者の画像はアップロードだけで本文用ライセンスの対象にはなりません。

既存のサムネイル処理は一覧表示用の別ファイルを生成することがありますが、リポジトリの原本は上書きしません。原本のアップロードとは別の処理です。
