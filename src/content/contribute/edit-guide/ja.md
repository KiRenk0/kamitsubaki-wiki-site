---
locale: ja
translationKey: edit-guide
eyebrow: CONTRIBUTOR GUIDE
title: はじめての投稿でも、大丈夫。
intro: |
  コードも Git も、先に覚える必要はありません。現在の経験に合うルートを選べば、**GitHub アカウントの作成**から Wiki の編集、そして **Pull Request の送信**まで順番に案内します。

  間違えても、すぐに公開サイトが壊れることはありません。Pull Request は「変更を確認してください」という依頼で、反映前にメンテナーが確認します。
primaryAction: 自分に合うルートを選ぶ
journeyLabel: 1回の投稿は3段階
journeySteps:
  - アカウント準備
  - 内容を編集
  - PRを送信
back: ホームへ戻る
targetLabel: 今回の対象ファイル
targetIntro: |
  記事ページから来た場合、ここに実際に変更するファイルが表示されます。違う場合は記事へ戻り、「ソースを編集」から入り直してください。
invalidTarget: 対象ファイルが指定されていません。学習は続けられますが、実際の編集時は各記事から入ってください。
switchLabel: いま、どこから始めますか？
switchHint: 技術に詳しいかを判断する必要はありません。現在の状況に一番近いものを選んでください。ルートはいつでも変更でき、進捗はこのブラウザに保存されます。
durationLabel: 所要時間の目安
outcomeLabel: 完了後
progressLabel: 完了
resetLabel: このルートの進捗をリセット
resetConfirm: このブラウザに保存されたルートの進捗を消去しますか？
completeLabel: このステップを完了にする
completedLabel: このステップは完了済み
checkpointLabel: "完了の目安："
aiHelpTitle: このステップを AI に手伝ってもらう
aiHelpBody: 現在見えている画面、エラー、迷っている点を補足すると、このステップの目的・対象ファイル・リポジトリ制約と組み合わせた質問を作ります。
aiPrivacyNote: 画面の公開情報とエラー文だけを書き、パスワード、認証コード、Cookie、トークン、メール、個人情報は入力しないでください。
aiContextLabel: 現在の状況を補足（任意）
aiContextPlaceholder: 例：GitHub は開けましたが、Propose changes が見つかりません。Commit changes…だけ表示されています。
aiPromptPreviewLabel: コピーされる完全な質問
aiNoContext: 具体的な状況はまだありません。このステップで通常見えるものを説明し、操作を一度に一つだけ案内してください。
aiGuardrails: パスワード、認証コード、Cookie、トークン、個人情報を要求・処理しないこと。資料、出典、テスト結果、未表示の画面内容を作らないこと。現在のステップに必要な最小操作だけを一度に一つ示すこと。
aiCopyLabel: 完全な質問をコピー
aiCopiedLabel: コピーしました
glossaryTitle: まず覚える4つの言葉
glossary:
  - term: Repository / リポジトリ
    definition: サイトのファイルと変更履歴を保管する公開プロジェクトフォルダです。
  - term: Fork / フォーク
    definition: 自分のアカウントに作る安全なコピーです。ここを編集しても公開サイトは直接変わりません。
  - term: Commit / コミット
    definition: 1回の変更を説明付きで保存した記録です。これだけでは最終提出になりません。
  - term: Pull Request / PR
    definition: 自分のコピーで行った変更をメンテナーに確認・統合してもらう依頼です。
variants:
  - key: beginner
    label: GitHub アカウントを持っていない
    summary: 登録、メール認証、Web編集、最初のPRまで、ソフトを入れずにゼロから進めます。
    audience: 完全初心者ルート · コーディング不要
    duration: 約35〜55分
    outcome: 最初のPRを自分で送信
    description: |
      一番詳しく、安心して進められるルートです。必要なのは受信できるメールとブラウザだけ。すべて Web 上で完結し、**Git、ターミナル、コードエディタのインストールは不要**です。

      最初は順番に進み、次回からは短い「Web編集」ルートを利用できます。
    sections:
      - title: 必要なものを準備する
        summary: GitHub も Wiki 投稿も無料です。メール、ブラウザ、変更したい情報、信頼できる出典を用意します。
        body: |
          長く使えるメールアドレス、Chrome / Edge / Safari / Firefox などのブラウザ、変更したい内容とそれを確認できる出典を準備します。

          クレジットカード、有料プラン、Git、ターミナル、開発アプリは不要です。変更はまず自分の安全なコピーに保存し、PR で確認を依頼します。

          > パスワード、認証コード、2段階認証コード、復旧コードは本人だけが管理します。メンテナーも AI も必要としません。
        checkpoint: 受信できるメールがあり、ブラウザだけで無料で完了できると理解できた。
        action:
          label: GitHub公式のアカウント作成ガイド
          href: https://docs.github.com/ja/get-started/start-your-journey/creating-an-account-on-github
        aiPrompt: |
          ファン Wiki に初めて投稿します。GitHub はまったく分かりません。Repository、Fork、Commit、Pull Request を非常にやさしい日本語で説明し、PR では公開サイトをすぐ壊せない理由も教えてください。プログラミング経験を前提にせず、パスワードや認証コードを求めないでください。
      - title: 無料の GitHub 個人アカウントを作る
        summary: 画面に従って登録し、公開されるユーザー名を決め、メール認証を完了します。
        body: |
          1. 下の GitHub 登録ページを開きます。
          2. メール、または GitHub が表示する Google / Apple ログインで登録します。
          3. 投稿記録の横に公開されてもよいユーザー名を決めます。
          4. 他サイトと異なる強いパスワードを作り、安全に保管します。
          5. GitHub が求める確認を完了します。

          プランを聞かれたら無料の個人アカウントで十分です。登録後、GitHub から届くメールのリンクを開いて認証してください。未認証だと Fork や PR などが制限されます。

          メールが届かない場合は迷惑メールを確認し、右上のアイコン → `Settings` → `Emails` → `Resend verification email` を使います。
        checkpoint: GitHub にログインでき、Settings → Emails で主要メールが認証済みになっている。
        action:
          label: GitHub登録ページを開く
          href: https://github.com/signup
        aiPrompt: |
          GitHub の無料個人アカウントを作っています。現在の登録画面で一般的に必要な項目を一つずつ説明し、何が公開情報になるか教えてください。パスワードやメール認証コード、2段階認証コード、復旧コードを作成・収集・要求しないでください。
      - title: 4つの言葉で流れを理解する
        summary: Gitを学ぶ必要はありません。「リポジトリ → Fork → Commit → PR」だけ覚えます。
        body: |
          編集部への原稿投稿にたとえると、リポジトリは共有の原稿庫、Fork は自分用の作業コピー、Commit は1回の保存記録、PR は編集部へ戻して確認を頼む提出です。

          PR は公開サイトへの直接編集ではありません。修正依頼は失敗ではなく、共同編集の普通のやり取りです。

          **Checks / CI** は自動確認です。緑は通過、赤は具体的な修正点がある状態です。
        checkpoint: Commit は保存、PR はメンテナーへの確認依頼だと自分の言葉で説明できる。
        aiPrompt: |
          Repository、Fork、Branch、Commit、Pull Request、Checks/CI を「編集部への原稿投稿」にたとえて、非技術者向けに説明してください。最後に編集から統合までの文字だけの流れ図を作ってください。
      - title: 対象ファイルと言語、出典を確認する
        summary: 間違った記事を編集しないよう、パスとロケール、根拠を先に確認します。
        body: |
          上部の対象は `src/content/` で始まる必要があります。

          ```text
          src/content/artists/vwp/kaf/ja.md
          ```

          `zh.md` は中国語、`ja.md` は日本語、`en.md` は英語です。`artists/` はアーティスト、`songs/` は楽曲、`albums/` はアルバム、`projects/` は企画、`logs/` は記録、`site/` はサイト共通文言です。

          新しい事実には追跡可能な出典を用意します。公式サイト・公式告知を優先し、AI 出力、噂、確認できないファン投稿を事実の根拠にはしません。
        checkpoint: 対象とロケールが正しく、新しい情報を支える信頼できる出典がある。
        aiPrompt: |
          KAMITSUBAKI FAN WIKI の {{TARGET_PATH}} を編集します。このパスの内容種別と言語、変更すべき場所が frontmatter か本文かを説明してください。人物情報を作らず、出典が不足なら公式情報を探すよう明示してください。dist、.astro、node_modules や無関係なコードは変更しないでください。
      - title: GitHub の Web エディタを開く
        summary: 最後の編集ボタンから進みます。ログインや自動 Fork の確認が出ても正常です。
        body: |
          このルート末尾の編集ボタンを使います。書き込み権限がない場合、GitHub は **Fork this repository** を表示するか、変更提案時に自動で Fork を作ります。

          ファイルパスを再確認してください。ボタン表記は変わることがありますが、流れは次の通りです。

          ```text
          ファイル → Edit → Preview → Commit / Propose changes → Pull Request
          ```

          編集ボタンが使えない場合は、ログインとメール認証を確認し、Wiki 記事から入り直します。
        checkpoint: GitHub の編集欄が見え、そのパスが本ページ上部と完全に一致している。
        action:
          label: GitHub公式のWeb編集ガイド
          href: https://docs.github.com/ja/repositories/working-with-files/managing-files/editing-files
        aiPrompt: |
          他の人の公開 GitHub リポジトリで {{TARGET_PATH}} を Web 編集しています。私が説明する画面の文字から、次に押すボタンを一度に一つだけ教えてください。自動 Fork は正常です。パスワード、認証コード、Cookie、トークン、完全なアカウント情報を求めないでください。
      - title: frontmatter と本文を安全に編集する
        summary: 多くの投稿は文章修正です。ファイル先頭の構造を保ち、不明な項目は削除しません。
        body: |
          Markdown ファイルは、`---` で囲まれた frontmatter と、その後の本文に分かれます。両方の `---`、既存キー、引用符、インデントを維持してください。

          `locale` はファイル名と一致し、同じ記事の多言語ファイルは同じ `translationKey` を使います。YAML の字下げは Tab ではなく空白です。

          必要な箇所だけ変更し、新しい事実には出典を付けます。仮文、推測、AI が作った事実、パスワード、トークン、個人情報は追加しません。
        checkpoint: 変更範囲が明確で構造が残り、事実には出典があり、秘密情報が含まれていない。
        aiPrompt: |
          慎重な Markdown 編集者として、{{TARGET_PATH}} の断片と信頼できる出典を確認してください。出典が直接支える箇所だけ変更し、YAML のキー、インデント、--- を維持し、事実や仮文を作らず、無関係な段落を変えないでください。根拠不足なら編集を止めて不足を説明してください。
      - title: 差分を確認して Commit する
        summary: Preview / Changes を見て、変更内容を表す短い説明で保存します。
        body: |
          緑は追加、赤は削除を示すことが一般的です。誤削除、壊れた `---`、言語違い、不自然なインデント、リンク・日付・固有名詞を確認します。

          **Commit changes...** を押し、`docs: 花譜記事の活動日を修正` のような説明を書きます。外部投稿者には **Propose changes** と表示されることがあります。

          Commit は Fork/ブランチへの保存で、PR はまだ完了していません。次の画面も続けてください。
        checkpoint: 差分は意図した内容だけで、Commit message が変更を正確に表している。
        aiPrompt: |
          {{TARGET_PATH}} の GitHub diff を確認してください。誤削除、YAML、言語、根拠のない事実、個人情報を検査し、短い日本語の Commit message を3案ください。貼っていない内容は推測しないでください。
      - title: 最初の Pull Request を作る
        summary: 元リポジトリの main を対象にし、タイトル・変更・出典・言語を書いて送信します。
        body: |
          base repository が `LinkTh1rsty/kamitsubaki-wiki-site`、base branch が `main`、head/compare が自分の Fork とブランチであることを確認します。

          PR には変更内容、資料出典、言語と範囲を書きます。通常の内容修正は Draft にする必要はありません。**Create pull request** を押し、番号付き PR ページが表示されたら提出完了です。
        checkpoint: 番号付きの Pull Request ページにタイトル、説明、Commits、変更ファイルが表示されている。
        action:
          label: GitHub公式のFork PRガイド
          href: https://docs.github.com/ja/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork
        aiPrompt: |
          {{TARGET_PATH}} の KAMITSUBAKI FAN WIKI Pull Request を作ります。私が実際の変更と出典を渡すので、短いタイトルと「変更内容 / 資料出典 / 言語と範囲」を含む Markdown 説明、提出前チェックを作ってください。変更や出典を作らないでください。
      - title: Checks とレビューに対応する
        summary: 自動チェックを待ち、赤なら Details を開き、同じ PR で修正を続けます。
        body: |
          黄・灰は実行中、緑は通過、赤は失敗です。**Details** を開き、最初の具体的エラーから確認します。YAML の字下げ、必須項目、locale、Markdown 構造が代表的な原因です。

          同じ Fork / ブランチを編集して Commit すれば、既存 PR に自動追加されます。CI 修正のために新しい PR は作りません。レビューコメントを修正したら、短く返信してください。
        checkpoint: 現在の状態を理解し、失敗やコメントがあれば具体的な修正箇所を見つけた。
        aiPrompt: |
          {{TARGET_PATH}} の PR にチェック失敗またはレビューコメントがあります。公開されているエラー文を貼るので、やさしい日本語で意味と最小修正を説明し、同じブランチと PR を更新するよう案内してください。秘密情報を求めないでください。
      - title: 投稿を完了し、結果を確認する
        summary: PR を送れば中核作業は完了です。通知を確認し、Merged または Closed まで追跡します。
        body: |
          **Open** は確認中、**Merged** は統合済み、**Closed** は未統合で終了です。レビューには時間がかかることがあります。待っているだけなら PR を閉じる必要はありません。

          修正が必要なら同じブランチを更新します。1か所の誤字や正確な日付、信頼できる出典の追加も大切な貢献です。
        checkpoint: PR が送信され、状態の見方と次に確認する場所が分かる。
        aiPrompt: |
          私が説明する GitHub PR の状態が Open、Merged、Closed のどれかを説明し、必要な次の操作だけを初心者向け日本語で教えてください。認証情報を求めないでください。
    finalTitle: あなたの投稿をメンテナーへ送る
    finalBody: |
      最後に、対象ファイル、検証可能な内容、出典、仮文・推測・個人情報がないことを確認します。その後は **Edit → Preview → Commit / Propose changes → Create pull request** の順です。困った場所では各ステップの AI 用質問を使えます。
    finalLinkLabel: GitHubで現在のファイルを編集する
  - key: web
    label: アカウントがあり、Webだけで編集したい
    summary: ブラウザで既存ファイルを編集し、Commit、PR、追加修正まで行います。
    audience: Web編集ルート · インストール不要
    duration: 約15〜30分
    outcome: Web方式のPRを1件提出
    description: |
      認証済み GitHub アカウントにログインでき、ローカルツールを使わず安全に投稿したい人向けです。対象確認、Web エディタ、Fork、PR、Checks と追加修正に集中します。
    sections:
      - title: アカウント・対象・範囲を確認する
        summary: ログインとメール認証、対象パスとロケールを確認します。
        body: |
          対象は `src/content/` から始まり、正しい言語ファイルである必要があります。1つの PR は1つの目的に絞り、新しい事実には追跡可能な公式・信頼できる出典を付けます。AI は校正に使えても出典にはなりません。
        checkpoint: アカウントと対象が正しく、PRの目的を一文で説明できる。
        aiPrompt: |
          {{TARGET_PATH}} の小さな Wiki 修正の範囲を整理してください。問題と出典を説明するので、この PR に含める箇所と、混ぜない方がよい無関係な整理を分けてください。事実を作らないでください。
      - title: Webで編集し、差分を確認する
        summary: 必要なら自動 Fork を受け入れ、frontmatter を保って最小変更を行います。
        body: |
          最後の入口からファイルを開きます。Fork の確認が出たら続行します。YAML の `---`、キー、引用符、インデントを保ち、Preview / Changes の赤と緑が意図した変更だけか確認してください。
        checkpoint: 差分が必要な内容だけで、YAML と Markdown の構造が維持されている。
        action:
          label: GitHub公式Web編集ガイド
          href: https://docs.github.com/ja/repositories/working-with-files/managing-files/editing-files
        aiPrompt: |
          {{TARGET_PATH}} の Markdown diff を確認し、YAML、誤削除、言語、出典、プライバシーを検査してください。最小限の必要修正だけ提案してください。
      - title: Commitして変更を提案する
        summary: 何を変えたか分かる説明で、自分のFork/ブランチに保存します。
        body: |
          **Commit changes...** で `docs: 花譜記事の開催日を修正` のような短い説明を書きます。**Propose changes** が表示されても正常です。upstream の `main` へ直接書き込まず、自動作成された Fork / ブランチを利用します。
        checkpoint: Commit が自分の Fork / ブランチに保存され、比較または PR 画面に進んだ。
        aiPrompt: |
          {{TARGET_PATH}} の実際の変更説明から、`docs: ...` 形式の短い Commit message を5案ください。範囲を誇張しないでください。
      - title: Pull Requestを作成する
        summary: baseは元のmain、headは自分のFork。変更・出典・言語・範囲を書きます。
        body: |
          base を `LinkTh1rsty/kamitsubaki-wiki-site:main`、head を自分の Fork / ブランチにします。変更内容、出典、言語・範囲を書き、**Create pull request** を押します。番号付き PR ページが成功の目印です。
        checkpoint: 番号付きPRページに想定したタイトル、説明、Commits、Files changedがある。
        action:
          label: GitHub公式Fork PRガイド
          href: https://docs.github.com/ja/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork
        aiPrompt: |
          {{TARGET_PATH}} のPRタイトルとMarkdown説明を、私が示す実際の変更・出典だけで作ってください。「変更内容 / 資料出典 / 言語と範囲」を含め、根拠を作らないでください。
      - title: Checksとレビューを処理する
        summary: 赤ならDetailsを開き、同じブランチとPRで修正します。
        body: |
          自動チェックを待ち、失敗時は最初の具体的エラーから修正します。同じ Fork / ブランチへの追加 Commit は既存 PR に自動反映されます。CI 修正用の重複 PR は不要です。
        checkpoint: Checksが通過したか、同じPRで具体的な問題を修正できた。
        aiPrompt: |
          {{TARGET_PATH}} の公開されたActionsエラーまたはレビューコメントを説明し、最小修正を示してください。不足情報は推測せず、同じPRを更新するよう案内してください。
      - title: 既存PRを更新または終了する
        summary: 追加Commitは元PRに入ります。本当に中止する場合だけ閉じます。
        body: |
          同じブランチを編集して修正を追加し、対応内容を返信します。待機中という理由だけで閉じる必要はありません。**Open / Merged / Closed** の意味を確認してください。
        checkpoint: 元PRの更新方法と、Open・Merged・Closedの違いが分かる。
        aiPrompt: |
          開いているPRに追加修正します。私が説明する画面から同じForkとブランチを確認し、新しいCommitを元PRへ追加する手順を教えてください。重複PRは勧めないでください。
    finalTitle: 一度確認してから送信する
    finalBody: |
      パス、差分、出典、プライバシーを確認し、**Edit → Preview → Propose changes → Create pull request → Checks / review** と進みます。
    finalLinkLabel: GitHub Webエディタを開く
  - key: new-entry
    label: 完全な新規記事を追加したい
    summary: 内容種別を決め、ディレクトリと3言語ファイルを作り、構造・出典・検証を揃えてPRを送ります。
    audience: 新規記事ルート · Web / ローカル対応
    duration: 約35〜70分
    outcome: 3言語の新規記事PR
    entryMode: repository
    description: |
      既存ファイルの修正ではなく、アーティスト・楽曲・アルバム・企画・タイムライン記録を新しく追加する人向けです。新規記事はディレクトリと複数ファイルを同時に扱うため、同種の既存記事を参考に進めます。
    sections:
      - title: 記事種別と収録範囲を決める
        summary: artists、songs、albums、projects、logs のどれかを選び、独立記事にする理由を確認します。
        body: |
          `artists/` はアーティスト・クリエイター・ユニット、`songs/` はアーティストと曲種ごとの楽曲、`albums/` はアーティストごとのアルバム・EP・公式リリース、`projects/` は企画・世界観・展示、`logs/` は日付のあるニュースや活動記録です。

          明確な対象名と信頼できる公開出典が必要です。既存記事に1項目を追加するだけなら、新規記事ではなく既存ファイルを編集します。
        checkpoint: collectionと独立記事にする理由を説明できる。
        aiPrompt: |
          【目的】追加したい内容が artists / songs / albums / projects / logs のどれに属し、独立記事にすべきか判断する。
          【内容ルート】{{REPO_CONTENT_ROOT}}
          【現在の状況】{{USER_CONTEXT}}
          【制約】提供された対象と出典だけで判断し、事実や規約を作らない。
          【出力】推奨collection、理由、既存記事修正との比較、準備資料。
      - title: ディレクトリ名とtranslationKeyを決める
        summary: 小文字英数字とハイフンの安定したslugを使い、3言語で同じtranslationKeyを共有します。
        body: |
          例：`src/content/artists/vwp/new-artist/`、`src/content/songs/kaf/originals/new-song/`、`src/content/albums/kaf/new-album/`、`src/content/projects/arg/new-project/`、`src/content/logs/2026/2026-07-12-new-event/`。

          slugとtranslationKeyは表示言語が変わっても変更しません。既存ディレクトリと重複しないか検索してください。
        checkpoint: slugとtranslationKeyが安定し、既存項目と重複していない。
        aiPrompt: |
          【目的】新規記事のslugとtranslationKeyを設計する。
          【現在の状況】{{USER_CONTEXT}}
          【制約】slugは小文字英数字とハイフンのみ。translationKeyはzh/ja/en共通。公式英語名を推測しない。
          【出力】候補3案、推奨案、重複確認項目。
      - title: ディレクトリと3言語ファイルを作る
        summary: 同じ記事ディレクトリにzh.md、ja.md、en.mdを作成します。
        body: |
          ```text
          <entry>/zh.md
          <entry>/ja.md
          <entry>/en.md
          ```

          Webでは正しいcollectionで **Add file → Create new file** を使い、`new-artist/zh.md` のように `/` を含む名前でディレクトリも作れます。本文未完成なら空欄にできますが、仮文は入れません。
        checkpoint: 3ファイルが同じ正しいディレクトリにあり、余計な階層がない。
        action:
          label: GitHub公式の新規ファイル作成ガイド
          href: https://docs.github.com/ja/repositories/working-with-files/managing-files/creating-new-files
        aiPrompt: |
          【目的】新規記事のディレクトリとzh.md / ja.md / en.md骨格を作る。
          【内容ルート】{{REPO_CONTENT_ROOT}}
          【現在の状況】{{USER_CONTEXT}}
          【制約】既存階層に従い、3言語を同一ディレクトリに置き、仮の事実を書かない。
          【出力】最終ディレクトリツリー、Web操作、各ファイルの最小構造。
      - title: collectionに合うfrontmatterを書く
        summary: content.config.tsと同種の既存ファイルを基準に、必要な項目だけ書きます。
        body: |
          Artists、Songs、Albums、Projects、Logs は必須項目が異なります。`locale` は各ファイルに合わせ、`translationKey` は3言語で完全一致させます。楽曲には `artist` と `artistId` が必要で、アルバムの `songId` はリンク先の楽曲記事が存在する場合だけ設定します。

          不明な `theme`、`seo`、画像、順序値を見た目のために作らないでください。実際の必須項目は `src/content.config.ts` を確認します。
        checkpoint: 3言語のfrontmatterがschemaに合い、localeとtranslationKeyが正しい。
        aiPrompt: |
          【目的】提供するcontent.config.tsと既存記事に基づき、最小の有効な3言語frontmatterを作る。
          【現在の状況】{{USER_CONTEXT}}
          【制約】不足情報は確認事項として残し、値を作らない。translationKeyを統一する。
          【出力】zh/ja/en frontmatter、項目の根拠、未確認事項。
      - title: 本文と3言語内容を書く
        summary: 出典から事実を整理してから翻訳し、構造を揃えます。
        body: |
          まず出典ごとの事実を整理し、最も情報の多い言語を完成させてから他言語へ翻訳します。名前、日付、作品名、リンクを再確認してください。

          AIは翻訳・校正に使えますが出典にはなりません。不明な公式用語は原文を維持します。
        checkpoint: 3言語の構造が近く、仮文や出典のない事実がない。
        aiPrompt: |
          【目的】信頼できる出典から新規記事の3言語Markdownを整理する。
          【資料と状況】{{USER_CONTEXT}}
          【制約】出典が直接支える事実だけを書く。AIを出典にしない。不明な固有名詞は原文を残す。
          【出力】事実—出典対応、zh/ja/en本文、未確認内容。
      - title: 出典・リンク・画像の権利を確認する
        summary: 重要な事実を追跡可能にし、非公開・有料・出所不明の画像を使いません。
        body: |
          公式サイト、公式告知、公式投稿、正式なインタビューを優先します。画像には公開された公式ソースを使い、有料コンテンツのスクリーンショット、流出素材、私的写真、出所不明の転載を追加しません。
        checkpoint: 主要事実に出典があり、リンクが有効で、画像に明らかな権利・プライバシー問題がない。
        aiPrompt: |
          【目的】新規記事の出典、リンク、画像リスクを確認する。
          【現在の状況】{{USER_CONTEXT}}
          【制約】AI出力を出典にせず、有料・流出・私的・不明転載画像を認めない。
          【出力】事実—出典表、弱い出典、画像リスク、必須修正。
      - title: 多言語とビルドを検証する
        summary: locale、translationKey、schema、リンクを確認し、可能ならCIと同じコマンドを実行します。
        body: |
          ```bash
          pnpm test
          pnpm check
          pnpm build
          ```

          Webだけで投稿する場合はPR後のCIを確認し、同じブランチで修正します。生成物や秘密情報を含めないでください。
        checkpoint: 手動確認済みで、ローカル検証が通るかCIの確認方法が分かる。
        aiPrompt: |
          【目的】新規記事のディレクトリ、3言語、frontmatter、本文、出典を提出前に監査する。
          【現在の状況】{{USER_CONTEXT}}
          【制約】未実行のテストを通過したと言わない。
          【出力】提出阻止 / 推奨修正 / 通過に分けた結果と最小修正順。
      - title: 新規記事PRを送る
        summary: この1記事だけを含め、言語・出典・画像・検証を説明します。
        body: |
          PRには記事種別とパス、3言語の完成度、出典、画像ソース、実行した検証、未確認事項を書きます。無関係な整形や他記事の変更を混ぜません。CI/review修正は同じブランチで続けます。
        checkpoint: PRが新規記事関連ファイルだけを含み、メンテナーが直接レビューできる。
        aiPrompt: |
          【目的】新規Wiki記事のCommit messageとPR説明を作る。
          【現在の状況】{{USER_CONTEXT}}
          【制約】実際のファイル、出典、検証結果だけを使い、翻訳・テスト・画像権利を作らない。
          【出力】Commit、PRタイトル、Summary / Files / Locales / Sources / Image / Validation / Open questions本文。
    finalTitle: 内容ディレクトリから新規記事を始める
    finalBody: |
      `src/content/` で正しいcollectionと分類を選び、記事ディレクトリと3言語ファイルを作成します。schema、出典、画像、検証を確認してからPRを送ってください。
    finalLinkLabel: GitHubの内容ディレクトリを開く
  - key: experienced
    label: Git / GitHub に慣れている
    summary: リポジトリ構造、多言語制約、検証コマンド、Fork PR 戦略だけを確認します。
    audience: 開発者ルート · リポジトリ制約
    duration: 約10〜20分
    outcome: 規約に沿ったPR
    description: |
      fork / branch / commit / PR / CI に慣れている人向けです。Web、GitHub Desktop、ローカル Git のいずれでも構いません。Astro の内容モデルとレビュー要件に絞ります。
    sections:
      - title: 内容モデルを確認する
        summary: Content Collections が一次データで、ページはディレクトリ構造から生成されます。
        body: |
          ```text
          src/content/artists/<category>/<entry>/<locale>.md
          src/content/songs/<artistId>/<category>/<songId>/<locale>.md
          src/content/albums/<artistId>/<albumId>/<locale>.md
          src/content/projects/<category>/<project>/<locale>.md
          src/content/logs/<year>/<record>/<locale>.md
          src/content/site/<locale>.json
          ```

          内容 PR に `dist/`、`.astro/`、`node_modules/`、コンポーネントへの記事本文ハードコードを含めません。
        checkpoint: 内容変更か実装変更かを分類し、対象が対応collectionのパスに合っている。
        aiPrompt: |
          {{TARGET_PATH}} が artists/songs/albums/projects/logs/site の内容モデルに合うか確認し、想定される表示影響を説明してください。未提供コードを推測しないでください。
      - title: schemaと多言語制約を守る
        summary: content.config.tsがfrontmatterを検証し、多言語記事はtranslationKeyと構造を共有します。
        body: |
          `locale` は `zh | ja | en`。同一記事は安定した `translationKey` を共有します。Artists、Songs、Albums、Projects、Logs はそれぞれ異なる schema を使います。新規記事は `zh.md`、`ja.md`、`en.md` を優先し、本文未完成なら空欄にできますが仮文は入れません。

          `theme.*` の色値は言語間で揃え、palette label のみ翻訳します。`seo.*` は自動 metadata を明示上書きするときだけ使います。
        checkpoint: frontmatterがcollection schemaを満たし、locale/translationKeyが他言語ファイルと一致する。
        aiPrompt: |
          Astro Content Collections のレビュー担当として、提供する content.config.ts に基づき {{TARGET_PATH}} の frontmatter を検証し、必須・型・enum・i18nの問題を列挙してください。既定値を作らないでください。
      - title: Web、Desktop、ローカルGitを選ぶ
        summary: 単一ファイルはWebでもよく、複数ファイルや新規記事はtopic branchを推奨します。
        body: |
          外部投稿者は upstream `LinkTh1rsty/kamitsubaki-wiki-site:main` を、個人 fork の topic branch から対象にします。

          ```bash
          git switch main
          git pull --ff-only upstream main
          git switch -c docs/update-kaf
          # edit content
          git add src/content/...
          git commit -m "docs: update KAF entry"
          git push -u origin docs/update-kaf
          ```

          生成物、ローカル設定、無関係な整形を混ぜません。画像追加前に権利・公開出典・media方針を確認します。
        checkpoint: branchが最新upstream/mainを基にし、staged diffが関連ファイルだけになっている。
        aiPrompt: |
          {{TARGET_PATH}} を中心とする内容PRの git status と git diff --stat を確認し、無関係ファイルを指摘してください。reset --hard や未確認の作業削除は勧めないでください。
      - title: CIと同じ検証を実行する
        summary: test、Astro check、buildを実行し、最初の根本エラーから修正します。
        body: |
          ```bash
          pnpm test
          pnpm check
          pnpm build
          ```

          `check` はcollection schemaとAstro/TypeScript、`build` は静的ルートと描画を検証します。
        checkpoint: 3コマンドが通過、またはローカル検証できない客観的理由をPRに明記した。
        aiPrompt: |
          pnpm test/check/build の出力を貼ります。最初の根本原因を特定し、schemaエラーと実装エラーを分け、最小修正を提案してください。未表示ファイルを作らないでください。
      - title: レビューしやすいPRを書く
        summary: 範囲、出典、言語、実行した検証、リスクを明確にします。
        body: |
          変更概要、動機、事実に対応する出典、言語・ファイル範囲、実際に実行した検証、視覚変更時のみスクリーンショットを含めます。単一目的で確認しやすい diff にします。
        checkpoint: base/headが正しく、全ファイルを開かなくても説明から範囲と根拠が分かる。
        aiPrompt: |
          実際のdiff、出典、検証結果だけを使い、{{TARGET_PATH}} の短いPRタイトルとSummary / Sources / Locales・Scope / Validationを含むMarkdownを作ってください。テストや出典を作らないでください。
      - title: 同じブランチでレビューを完了する
        summary: CI・レビュー修正をhead branchへ追加し、会話の履歴を保ちます。
        body: |
          新しい Commit は PR を自動更新します。レビュー中の重複 PR や履歴書き換えは、メンテナーから指示がない限り避けます。内容競合はマーカー削除だけでなく事実と他言語も再確認します。
        checkpoint: CIが通り、コメントに対応し、最終diffが単一目的で生成物を含まない。
        aiPrompt: |
          PRレビューコメントとdiffを、必須修正・確認質問・任意提案に分類し、同じブランチでの最小対応順を示してください。破壊的Gitコマンドは避けてください。
    finalTitle: 現在のリポジトリ規約で提出する
    finalBody: |
      collection pathとschema、多言語方針、追跡可能な出典、単一目的のdiff、`pnpm test`・`pnpm check`・`pnpm build` を最終確認します。
    finalLinkLabel: 現在のファイルを直接開く
docs: 完全な貢献ガイドを見る
docsPath: docs/contributing.ja.md
---

<!-- guide content is configured through frontmatter; keep a non-empty body so Astro always indexes this file -->
