# mascodon 独自変更台帳

## 用途と運用

この台帳は `mastodon-main` の取り込み後に、mascodon の独自変更の消失や動作不整合を確認するための基準である。対象範囲の依頼では、該当する各 ID を個別に確認し、結果を **確認済み / 修正済み / 未確認 / 意図的に変更** に分けて報告する。ファイルや定数の存在だけで動作確認済みとしない。未実施のテスト、実画面確認、既知のテスト不足は明記する。

- 基準: `tnb` の `650dc351c1`、取り込まれた上流 `v5.0.0-beta.1` の `08b05423b5`。調査対象は主に上流からのマージを除く `930aa9fee2..650dc351c1` の first-parent 履歴と、この時点の実装。後から追加された独自変更は、この基準との差分も調査する。
- 履歴確認例: `git log --first-parent --format='%h %ad %s' --date=short 930aa9fee2..HEAD`。マージ解決時の変更もあり得るので、マージを除いたコミット一覧だけで完結させず、上流との差分や現在の実装も確認する。
- 各 ID の「期待」は維持したい挙動、「実装」は調査の起点であり、ファイル名や実装方法そのものを固定する指示ではない。上流の同等機能を使える場合も、挙動と関連画面を確認する。
- 上流の仕様変更や安全性・互換性への影響で期待動作を維持できない場合、黙って変更せず報告・相談する。連合・API・既存設定・翻訳・両 UI に及ぶ影響を確認する。
- テストの存在は期待するすべての動作がテスト済みであることを意味しない。境界値や手動確認を含む不足は、対象変更の検証時に補う。
- 独自機能の追加・変更・廃止時は、同じ変更で ID、期待、実装、テスト、確認項目、履歴と状態を更新する。廃止は理由を残し、無言で項目を消さない。
- この台帳は調査時点で把握できたものの一覧であり、完全性を保証しない。特に旧ブランチ由来の機能で現行ブランチに再実装されていないものを、自動的に復活対象とはしない。追加候補は履歴・意図を確認する。

## 機能別チェック

### CUST-01: 旧テーマの移植と追加テーマ

- 状態: 有効。旧 `origin/main` の `light-blue`, `light-orange`, `light-pastel`, `light-pink`, `light-red`, `light-white` を現行テーマ構造へ移植。現在の ID は順に `blue`, `orange`, `pastel`, `pink`, `red`, `white`。旧ブランチは現行ブランチの直接の祖先ではない。
- 期待: 選択できるテーマと日本語表示名は、`blue` = くじら、`orange` = みかん、`pastel` = こんぺいとう、`pink` = さくらもち(かんさい)、`red` = もみじ、`white` = ゆきうさぎ、`beige` = らっかせい(ゆで)。`beige` は現行ブランチで新規追加。各テーマは旧デザイン由来のスタイルと現行 UI 用の色を持ち、ライト・ダーク双方を考慮する。
- 実装: `config/themes.yml`、`config/locales/ja.yml` の `themes`、`app/javascript/styles/custom-themes/` の各エントリー、`_accent-theme.scss`、`legacy/` 内の各テーマ。旧版の参照例: `git show origin/main:config/themes.yml`、`git show origin/main:app/javascript/styles/blue/variables.scss`。リモート参照がない場合は履歴 `027d8bfde6` なども参照する。
- 独自テーマのライト・ダーク表示では、投稿のリンクプレビュー枠を背景から区別しやすい色にする。標準・新 UI のリンクカードと動画プレビューを対象とする。標準テーマでもリンクプレビュー枠に入力欄用の境界色を使用する。
- 既存テスト: `spec/helpers/theme_helper_spec.rb` は7テーマの登録と、各テーマに独立した theme color 選択肢がないことを確認する。`app/javascript/styles/custom-themes/__tests__/link_card_borders.test.ts` はリンクプレビュー枠と主な背景色のコントラストを確認する。各画面の見た目は保証しない。
- 確認: 設定で7つを選択して保存・再読込し、ライト/ダーク、標準/新 UI、モバイル/デスクトップ、タイムライン・投稿・プロフィール・設定画面の文字、背景、ボタン、状態表示を確認する。旧デザインとの見た目の一致は別途実画面で確認する。旧 ID を保存したユーザーの移行・互換性は未検証であり、必要なら挙動を調査して相談する。
- 履歴: `07363169f1`, `027d8bfde6`, `2a0895360a`, `826ea57deb`, `88520a3325`。

### CUST-02: 未設定アバター

- 状態: 有効。
- 期待: アバター未設定時の共通初期画像をマールにする。登録時に各アカウントへ画像を保存する機能ではない。
- 実装: `public/avatars/original/missing.png`。基準時の Git blob は `5ffcb796300a1dd71e9dfa04c3faa054b2e2a19f`。
- 確認: 新規登録ユーザーと既存のアバター未設定ユーザーで初期画像を表示し、独自アバター設定済みユーザーは影響を受けないことを確認する。静的アセット配信や CDN のキャッシュにも注意する。専用テストは未確認。
- 履歴: `7c2bbf1266`。

### CUST-03: プロフィール・投票の上限

- 状態: 有効。
- 期待: ローカルアカウントのプロフィール項目は最大10、表示名は最大50文字、投票の選択肢は最大10。既存の検証条件・文字数の数え方や、リモート由来データの扱いは別途確認する。
- 実装: `app/models/account.rb` の `DEFAULT_FIELDS_SIZE`, `DISPLAY_NAME_LENGTH_LIMIT`、`app/validators/poll_options_validator.rb` の `MAX_OPTIONS`。`app/serializers/rest/instance_serializer.rb` と `app/serializers/rest/v1/instance_serializer.rb` の instance 設定値、対応するプロフィール編集・投票作成 UI。
- 既存テスト: `spec/models/account_spec.rb`、`spec/models/account/fields_spec.rb`、`spec/validators/poll_options_validator_spec.rb`、`spec/requests/api/v2/instance_spec.rb`。定数を参照・スタブするテストだけでは、独自の数値を固定できない。
- 確認: 10/11項目、50/51文字、10/11選択肢の受理・拒否をサーバーと UI で確認し、API が実際の上限を返すことを確認する。文字種やローカル/リモートの扱いは既存バリデーションに合わせる。正確な数値の境界テストは要確認。
- 履歴: `374f545658`。

### CUST-04: 添付数と複数アップロード

- 状態: 有効。
- 期待: 投稿の添付上限は16。新規投稿・編集・連合受信・API 設定・投稿画面で整合させ、5〜16件のプレビューを表示する。複数アップロードの保留数をファイル単位で追跡し、成功・失敗後に残数を正しく更新する。
- 実装: `app/models/status.rb` の `MEDIA_ATTACHMENTS_LIMIT`、`app/models/status_edit.rb`、`app/services/post_status_service.rb`、`app/services/update_status_service.rb`、`app/lib/activitypub/activity/create.rb`、`app/services/activitypub/process_status_update_service.rb`、instance serializers、`app/javascript/mastodon/actions/compose.js`、`app/javascript/mastodon/reducers/compose.js`、`app/javascript/mastodon/features/compose/components/attachments.tsx` とそのスタイル。
- 既存テスト: `spec/lib/activitypub/activity/create_spec.rb` の5件受信、`app/javascript/mastodon/actions/__tests__/compose_upload.test.js`、`app/javascript/mastodon/features/compose/components/attachments.test.tsx`。これらだけでは16/17件の全経路を保証しない。
- 確認: 新規・編集・リモート受信で4/5/16/17件を確認し、API が16を返すこと、アップロード中・一部失敗時・再試行時の保留数、プレビュー、投稿可否を確認する。連合先の制限にも注意する。
- 履歴: `374f545658`, `d5fb02edc8`, `86f2725157`。

### CUST-05: 画像サイズとギャラリー表示

- 状態: 有効。
- 期待: 画像上限の設定値は `32.megabytes`。画像をギャラリー枠に収めて表示し、5件以上でも表示できるよう調整する。動画上限はこの変更の対象ではない。
- 実装: `app/models/media_attachment.rb` の `IMAGE_LIMIT` とサイズ検証、instance serializers、`app/javascript/mastodon/components/media_gallery.jsx`、`app/javascript/styles/mastodon/components.scss`。
- 確認: API の `image_size_limit` とクライアントの制限表示を確認する。サーバーの検証は `less_than` なので、32 MiB 未満・ちょうど32 MiB・超過を区別して検証し、フロントと不整合があれば報告する。縦長・横長・複数画像、4/5/16件、NSFW やプレビュー表示を実画面で確認する。上限値と見た目を固定する専用テストは未確認。
- 履歴: `b3724b574b`, `d5fb02edc8`, `18f043dcaa`。

### CUST-06: 投稿内カスタム絵文字の空白

- 状態: 有効。
- 期待: 新規投稿処理で、`:shortcode:` の直前・直後の半角スペースをゼロ幅スペース U+200B に置換する。本文と CW に適用し、無関係な空白は変えない。現在の処理はショートコード形状に基づくもので、実在するカスタム絵文字かどうかの確認はしていない。
- 実装: `app/services/post_status_service.rb` の `normalize_custom_emoji_spacing` と呼び出し元。
- 既存テスト: `spec/services/post_status_service_spec.rb` の本文1例。
- 確認: 本文・CW、前後・連続するスペース、絵文字以外の文字列、連合・保存結果を確認する。編集時など新規投稿以外への適用は現状保証していないため、範囲変更は意図を確認する。
- 履歴: `ec3e5bf5bc`, `e90ee9b6a1`。

### CUST-07: 単独絵文字の拡大

- 状態: 有効。
- 期待: 本文が絵文字1つのみ、またはメンション1つと絵文字1つの場合に絵文字を拡大表示する。メンション付きは絵文字の前で改行する。Unicode 絵文字とカスタム絵文字を扱い、複数絵文字や通常の文章は拡大しない。表示に関わる前後の空白・ゼロ幅文字も考慮する。
- 実装: `app/javascript/mastodon/components/status/single_emoji.ts`、`status/content.tsx`、`status/legacy/content.jsx`、`components/emoji/`、`status/content.module.scss`、`app/javascript/styles/mastodon/components.scss`。
- 既存テスト: `app/javascript/mastodon/components/__tests__/status_content.test.tsx`、`components/status/single_emoji.test.tsx`、`components/status/legacy/__tests__/content.test.jsx`、`components/emoji/__tests__/index-test.tsx`。
- 確認: 標準 UI と新 UI、カスタム/Unicode、複合 Unicode、メンション付き、通常の本文、翻訳表示で確認する。スタイルや絵文字ロード前後の挙動も確認する。
- 履歴: `ff9ce49420`, `cfbb381c12`, `d41238329d`, `86f2725157`。

### CUST-08: ロールバッジとポップアッププロフィール

- 状態: 有効。
- 期待: ロールを持つアカウントに、ロール名と色を反映したチェックマーク型バッジを表示する。表示名、投稿の新 UI ヘッダー、プロフィール、ホバーカードで整合させる。ホバーカードでは表示名横の重複表示を避け、アカウントのバッジを表示する。複数ロール、ロールなし、bot・ブロックなど既存バッジを維持する。これはロール表示であり、本人確認の認証処理を追加するものではない。
- 実装: `app/javascript/mastodon/components/badge/index.tsx`、`account_header/badges.tsx`、`display_name/role_badges.tsx`、`display_name/default.tsx`、`status/header.tsx`、`hover_card_account.tsx`、`app/javascript/styles/mastodon/components.scss`。
- 既存テスト: `app/javascript/mastodon/components/account_header/badges.test.tsx`、`components/display_name/role_badges.test.tsx`。
- 確認: ローカル/リモート、複数ロール、ロールなし、両 UI、ホバーカード、アクセシビリティ上の名前、他のバッジとの併存を確認する。
- 履歴: `7514c47660`, `969b90dcfc`, `079a8e0083`, `91fb6adafc`, `86f2725157`。

### CUST-09: 画像代替テキストの日本語 OCR

- 状態: 有効。
- 期待: 代替テキスト入力画面の OCR が日本語と英語を使う。言語データをアセットとして配信する。
- 実装: `app/javascript/mastodon/features/alt_text_modal/index.tsx` の `createWorker('jpn+eng', ...)`、`public/ocr/lang-data/jpn.traineddata.gz`、既存英語データと worker/core のアセット配信。
- 確認: 日本語・英語・混在画像を OCR にかけ、言語データの取得成功、結果の代替テキストへの反映、読み込み失敗時の表示を確認する。自動テストは未確認。アセットホストや配置変更に注意する。
- 履歴: `d2ee7da5e9`。

### CUST-10: リモート画像の任意再圧縮

- 状態: 設定依存。リモート PNG・WebP の追加再圧縮は既定では無効。
- 期待: `RECOMPRESS_REMOTE_PNG=true` でリモートの非アニメーション PNG、`RECOMPRESS_REMOTE_WEBP=true` でリモートのロスレス非アニメーション WebP を再エンコード対象にする。アニメーションや非可逆 WebP をこの追加条件で再圧縮しない。既存のリサイズ・形式変換など、別の理由による処理は別途存在する。PNG 圧縮レベルは `PNG_COMPRESSION_LEVEL`（既定6、0〜9）、ロスレス WebP effort は `WEBP_LOSSLESS_EFFORT`（既定4、0〜6）。
- 実装: `lib/paperclip/vips_lazy_thumbnail.rb`、`.env.production.sample`。libvips 利用経路が対象。
- 確認: フラグのオン/オフ、ローカル/リモート、PNG/APNG、ロスレス/非可逆/アニメーション WebP を画像データ付きで確認し、画素・アルファ・アニメーションの保持を検証する。ファイルサイズ削減は入力に依存する。専用自動テストは未確認。
- 履歴: `1f8fe8d8b1`。

### CUST-11: サーバー連絡先リンク

- 状態: 有効。
- 期待: About とカスタムホームページの連絡先について、メールアドレスは `mailto:`、スキームなしドメインは `https://` を付け、スキーム付き値はそのまま使う。空欄はリンクを出さない。
- 実装: `app/javascript/mastodon/utils/contact_link.js`、`app/javascript/mastodon/features/about/index.jsx`、`app/javascript/mastodon/features/custom_homepage/components/footer.tsx`。
- 既存テスト: `app/javascript/mastodon/utils/contact_link.test.js`、`app/javascript/mastodon/features/about/__tests__/index.test.jsx`。
- 確認: 両画面でメール、完全 URL、ドメイン、未設定を確認する。保存可能な値やリンクの安全性は上流の入力・表示仕様変更時に再確認する。
- 履歴: `cba05cb036`, `86f2725157`。

### CUST-12: 日本語表示・日付

- 状態: 有効。
- 期待: 独自に補完・修正した日本語訳を維持し、日本語の日付・時刻書式では月日をゼロ埋めしない。フロントエンドの日付表示も月日を数値で表示するよう調整されている。ただし翻訳ファイル内の全差分が独自仕様とは限らない。
- 実装: `config/locales/ja.yml` の `date.formats`・`time.formats`、`config/locales/devise.ja.yml`、`config/locales/doorkeeper.ja.yml`、`config/locales/simple_form.ja.yml`、`app/javascript/mastodon/locales/ja.json`、`app/javascript/mastodon/utils/time.ts`、`app/javascript/mastodon/components/relative_timestamp/index.tsx` など。日付変更の全対象は `git show --stat 8f96dbf1fc` を参照する。
- 確認: 翻訳キーの追加・削除・上流更新を照合し、欠落や英語へのフォールバックを確認する。投稿時刻、プロフィール、通知、告知、規約などで日本語・その他のロケールの表示を確認する。個々の翻訳と日付書式の網羅的テストは未確認。
- 履歴: `59fe8cf789`, `84d390450d`, `8aaf89ce3c`, `1ab7630722`, `8f96dbf1fc`, `c71b49abef`, `9c6c345772`, `650dc351c1`。

## 運用・開発上の関連変更

### OPS-01: Dev Container

- 状態: 有効。`.devcontainer/devcontainer.json` の作業ディレクトリは `/workspaces/mastodon`。`.devcontainer/Dockerfile` は `.ruby-version` と一致する Ruby のバージョン・URL・チェックサムでインストールし、不一致ならビルドを失敗させる。手順は `docs/DEVELOPMENT.md`。
- 確認: 上流の Ruby 更新時に `.ruby-version` と Dockerfile のバージョン・URL・チェックサムを同時に見直し、コンテナーを再ビルドする。固定 workspace path の必要性も環境変更時に確認する。
- 履歴: `90c33ce052`, `a9354d9462`。

## 検証の実施

マージ後、影響範囲に応じて既存の関連テストを選んで実行する。例えば以下は主な対象であり、上記の手動・境界値確認の代わりにはならない。

```sh
bin/rspec spec/helpers/theme_helper_spec.rb spec/models/account_spec.rb spec/models/account/fields_spec.rb spec/validators/poll_options_validator_spec.rb spec/requests/api/v2/instance_spec.rb spec/lib/activitypub/activity/create_spec.rb spec/services/post_status_service_spec.rb
yarn test:js run app/javascript/mastodon/actions/__tests__/compose_upload.test.js app/javascript/mastodon/features/compose/components/attachments.test.tsx app/javascript/mastodon/components/__tests__/status_content.test.tsx app/javascript/mastodon/components/status/single_emoji.test.tsx app/javascript/mastodon/components/status/legacy/__tests__/content.test.jsx app/javascript/mastodon/components/emoji/__tests__/index-test.tsx app/javascript/mastodon/components/account_header/badges.test.tsx app/javascript/mastodon/components/display_name/role_badges.test.tsx app/javascript/mastodon/utils/contact_link.test.js app/javascript/mastodon/features/about/__tests__/index.test.jsx
```

フロントエンドを変更した場合は必要に応じて `yarn typecheck`、関連 lint とビルドも実施する。実行不能な環境では理由と未確認項目を報告し、テストが通ったと推測しない。
