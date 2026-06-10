---
locale: ja
translationKey: edit-guide
eyebrow: CONTRIBUTOR ONBOARDING
title: 編集前の完全ガイド
intro: |
  このページは、現在のリポジトリ運用に合わせて整理された完全な入門ガイドです。

  下では2つのバージョンを自由に切り替えられます。

  - **完全初心者版**：初めての人向けに、かなり細かく手順を案内
  - **コーディング経験あり版**：Git / PR / CI に慣れている人向けの短い導線

  どちらを選んでも、最後は現在のファイルの GitHub 編集画面へ進めます。
back: ホームへ戻る
targetLabel: これから編集する対象
targetIntro: |
  まず、下に表示されているパスが本当に今回編集したいソースファイルか確認してください。

  間違っている場合はここで止めて、対象 Wiki 記事に戻り、もう一度「ソースを編集」から入り直してください。最初にファイルを取り違えるのが一番危険です。
invalidTarget: 有効な編集対象が見つかりません。各 Wiki 記事の「ソースを編集」ボタンから入ってください。
switchLabel: ガイドのバージョンを選ぶ
variants:
  - key: beginner
    label: 完全初心者版
    description: |
      このリポジトリへの初参加、GitHub のWeb編集が初めて、Markdown / PR / CI にまだ慣れていない人向けです。より丁寧に順を追って説明します。
    sections:
      - title: "Step 1: まず、いま編集しようとしているファイルを確認する"
        body: |
          このページ上部に表示されるパスが、今回編集する実際のリポジトリ内ファイルです。

          まずはそのパスを見て、どの種類の内容か判断してください。

          - `src/content/artists/...`：アーティスト、クリエイター、ユニットなどの記事
          - `src/content/projects/...`：企画、派生計画、プロジェクト関連
          - `src/content/logs/...`：観測記録、ニュース、時系列更新
          - `src/content/site/...`：トップページ文言、ナビ、フッター、区画見出し
          - `src/content/contribute/...`：このガイド自体

          文言修正、情報追加、画像更新、メタデータ整理なら、基本的には**コンテンツ編集**であり、`src/content/` の中だけで完結します。
      - title: "Step 2: このリポジトリは内容と実装が分離されている"
        body: |
          初めての人にとって一番大切なルールは次の1つです。

          > **ほとんどの Wiki 編集は、ページコードではなくコンテンツファイルを編集する。**

          つまり最初に考えるべきなのは「どのコンポーネントを直すか」ではなく、「この内容はどのファイルに入るか」です。

          よく使う構造は次の通りです。

          ```text
          src/content/artists/<category>/<entry>/<locale>.md
          src/content/projects/<category>/<project>/<locale>.md
          src/content/logs/<year>/<record>/<locale>.md
          ```
      - title: "Step 3: ファイル先頭のメタデータを読めるようになる"
        body: |
          各記事ファイルは **frontmatter** と **本文** の2つで構成されています。

          frontmatter は先頭の `---` と `---` に挟まれた部分で、構造化情報を書きます。本文は2つ目の `---` の後にある百科テキストです。

          ```yaml
          ---
          locale: "ja"
          translationKey: "kaf"
          name: "花譜"
          romanizedName: "KAF"
          statusLabel: "STATUS"
          status: "ACTIVE"
          image: "https://example.com/image.jpg"
          ---
          ```

          最初に覚えておきたい主要項目は以下です。

          - `locale`
          - `translationKey`
          - `name`
          - `romanizedName`
          - `statusLabel` と `status`
          - `image`

          > `translationKey` は3言語ファイルで一致していなければいけません。

          アーティスト記事では `theme` も使えます。これは記事ページのテーマ色と、情報欄の配色パネルに反映されます。

          ```yaml
          theme:
            name: "KAF Bloom"
            accentColor: "#F29AC2"
            mutedColor: "#E63145"
            surfaceColor: "#111321"
            highlightColor: "#FFF6FA"
            palette:
              - label: "花譜ピンク"
                value: "#F29AC2"
              - label: "赤い花"
                value: "#E63145"
          ```

          テーマ色は感覚だけで決めないでください。公式アーティストページ、公式キービジュアル、公式アルバムカバー、キャラクター資料を優先し、最も識別しやすい色を `accentColor` に、読みやすい濃色背景を `surfaceColor` に入れます。
      - title: "Step 4: 新規追加では3言語を意識する"
        body: |
          このサイトは中・日・英の3ルートを持っています。

          ```text
          /zh/  中国語、既定言語
          /ja/  日本語
          /en/  英語
          ```

          そのため、新しい翻訳対象記事を作るときは、最初から次の形をおすすめします。

          - `zh.md`
          - `ja.md`
          - `en.md`

          本文がまだ完成していなくても、構造だけは最初から揃えておく方が安全です。
      - title: "Step 5: 本文は Markdown として読みやすく書く"
        body: |
          本文は通常の Markdown です。次のような表現を使えます。

          - 段落
          - 箇条書き
          - 太字
          - 引用
          - 行内コードとコードブロック
          - 表
          - リンク

          迷ったら、まず変動しにくい情報から書いてください。

          1. 基本プロフィール
          2. デビュー時期や所属先
          3. 公式リンクや出典
          4. その後に説明段落を増やす

          避けるべきこと：

          - `dist/`、`.astro/`、`node_modules/` を編集する
          - 長い百科本文を実装ファイルへ戻す
          - 空欄埋めのためのダミー本文を書く
      - title: "Step 6: GitHub に移動した後の操作"
        body: |
          このページ下部の入口を押すと、通常は現在のファイルの GitHub Web エディタが開きます。

          そこでの基本手順は次の通りです。

          1. 表示されているファイルパスがこのページと一致しているか確認する
          2. frontmatter または本文を修正する
          3. 画面下部のコミット欄まで進む
          4. 短く明確なコミットメッセージを書く

          GitHub が保存方法を聞いてきたら：

          - すでに自分のブランチにいる：そのまま現在のブランチへコミット
          - 自分のブランチでない：**Create a new branch for this commit and start a pull request** を選ぶ
      - title: "Step 7: 提出後は PR と CI の流れになる"
        body: |
          このリポジトリは GitHub Pull Request ワークフローで運用されています。

          1回の通常フローは次のようになります。

          1. GitHub でファイルを編集する
          2. 自分のブランチへコミットする
          3. Pull Request を作る
          4. CI を待つ
          5. review や CI の結果に応じて修正する

          CI が失敗しても、新しい PR を作り直す必要はありません。**同じブランチで修正を続ければ大丈夫です。**
      - title: "Step 8: よくある失敗を先に知っておく"
        body: |
          ありがちな失敗は次の通りです。

          - 間違ったファイルを編集する
          - 3言語のうち1つを作り忘れる
          - `translationKey` が言語ごとにずれる
          - コンテンツ編集と実装変更を混ぜる
          - 生成物をコミットする
          - 本文の代わりにダミーテキストを書く
    finalTitle: 現在のソースファイルを編集する
    finalBody: |
      ここまで読めたなら、次へ進んで大丈夫です。

      下の2つの入口は役割が分かれています。

      - **まだルールを再確認したい**：完全な貢献ガイドを見る
      - **このファイルをそのまま編集したい**：現在のソースファイルの GitHub 編集画面を開く

      その後は次の流れで進みます。

      1. ファイルを編集する
      2. 自分のブランチへコミットする
      3. Pull Request を作る
      4. CI を待つ
      5. review や CI の指摘を同じブランチで修正する
    finalLinkLabel: GitHub でソースを編集する
  - key: experienced
    label: コーディング経験あり版
    description: |
      Git / GitHub / PR / CI に慣れていて、このリポジトリの内容モデルと最短導線だけ知りたい人向けです。
    sections:
      - title: 対象ファイルを起点に考える
        body: |
          このページで最も重要なのは、上に出ている target path です。

          このリポジトリでは「あるページを編集する」というより、具体的な `src/content/...` ファイルを編集します。内容が一次データです。

          ざっくり分類：

          - `src/content/artists/...`：DATABASE 項目
          - `src/content/projects/...`：PROTOCOLS カードとプロジェクトページ
          - `src/content/logs/...`：LOG 記録
          - `src/content/site/...`：トップページとサイト chrome 文言
      - title: 現在の主要制約
        body: |
          現在の主要制約は次の4つです。

          1. 内容と実装が分離されている
          2. 3言語運用
          3. ホーム各区画はできるだけディレクトリ構造から自動描画
          4. metadata は自動生成寄りだが `seo.*` で明示上書き可

          つまり、内容編集時は次を優先して見るのが自然です。

          - ディレクトリ配置
          - `translationKey`
          - schema に通る frontmatter
          - 自動カテゴリ/自動表示への影響
      - title: ディレクトリモデル
        body: |
          主なモデル：

          ```text
          src/content/artists/<category>/<entry>/<locale>.md
          src/content/projects/<category>/<project>/<locale>.md
          src/content/logs/<year>/<record>/<locale>.md
          ```

          よくある操作：

          - カテゴリ追加：第一層フォルダ追加
          - 項目追加：第二層フォルダ + 多言語 md
          - 並び調整：`categoryOrder` / `itemOrder`
          - 表示名調整：`categoryTitle` / `categorySubtitle`
          - SEO 明示上書き：`seo.title` / `seo.description` / `seo.image`
      - title: frontmatter で特に見る項目
        body: |
          毎回すべて書く必要はありませんが、以下は重要です。

          - `locale`
          - `translationKey`
          - `name`
          - `romanizedName`
          - `image`
          - `statusLabel` / `status`
          - `categoryTitle` / `categorySubtitle`
          - `categoryOrder` / `itemOrder`
          - `theme.*`
          - `seo.*`

          多言語項目なら：

          - `translationKey` は一致させる
          - 3言語ファイルはできるだけ揃える
          - 本文の完成度差はあっても構造は揃える
          - `theme` の色値は3言語で揃え、`palette.label` だけ各言語に合わせる
      - title: GitHub Web 編集の最短安全導線
        body: |
          最短ルートは次の通りです。

          1. 現在のファイルの GitHub editor を開く
          2. frontmatter / Markdown 本文を編集
          3. 自分のブランチへコミット
          4. PR を作る
          5. CI を回す

          GitHub がブランチ戦略を聞いてきたら：

          - すでに自分のブランチなら直接コミット
          - そうでなければ新規ブランチで PR 開始
      - title: "CI の見方と失敗パターン"
        body: |
          頭に入れておくべき3本はこれです。

          ```bash
          pnpm test
          pnpm check
          pnpm build
          ```

          おおまかには：

          - 内容構造 / i18n 前提
          - Astro / collection schema
          - 静的 build 完整性

          典型的な失敗源：

          - YAML/frontmatter のインデントエラー
          - `translationKey` や locale 値の不整合
          - 自動描画前提とディレクトリ構造が噛み合わない
          - 内容変更と実装変更の混在
    finalTitle: 直接現在のファイルを編集する
    finalBody: |
      このリポジトリの内容モデルと PR 導線を理解しているなら、ここから GitHub へ直行して大丈夫です。

      おすすめの流れ：

      1. 現在のファイルを編集
      2. 自分のブランチへコミット
      3. Pull Request を作成
      4. CI を確認
      5. 必要なら同じブランチで修正継続
    finalLinkLabel: 現在のファイルを GitHub で開く
docs: 完全な貢献ガイドを見る
docsPath: docs/contributing.ja.md
---

<!-- guide content is configured through frontmatter; keep a non-empty body so Astro always indexes this file -->
