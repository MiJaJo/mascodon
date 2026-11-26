# Copilot instructions for Mastodon (local fork: mascodon)

このファイルは、このリポジトリで Copilot が作業するときの基本方針です。Mastodon のローカル fork であり、Ruby on Rails と React/TypeScript の両方を扱うため、サーバー側とフロントエンド側の責務を混ぜず、既存実装の流れに合わせて変更してください。

- 全体像
  - サーバー側は Rails 8.1 と Ruby で API と server-rendered page を提供します。
  - フロントエンドは app/javascript/mastodon 以下の React/TypeScript と既存の JavaScript で構成されています。
  - streaming/ には Node.js ベースのストリーミングサービスがあります。
  - 主要な設定は config/、bin/、package.json にあります。

- 変更先の主な場所
  - Rails 側: app/controllers、app/models、app/serializers、app/presenters、app/services、app/workers
  - フロントエンド: app/javascript/mastodon/features、app/javascript/mastodon/components
  - ルーティング・設定: config/、config/routes.rb、vite.config.mts
  - DB 変更: db/migrate または db/post_migrate。db/schema.rb は migration 適用後の生成物として更新します。

- 実装時の基本方針
  - 既存コードの構造・命名・責務分離に合わせて実装してください。
  - 変更は最小限にし、関連するテストも合わせて更新してください。
  - API のレスポンスや公開インターフェースに影響する場合は serializers/presenters を確認してください。
  - UI の文言を追加・変更した場合は、フロントエンドでは app/javascript/mastodon/locales/en.json、Rails では config/locales/ 以下の該当ファイルを確認し、必要なら yarn i18n:extract で英語メッセージを更新してください。
  - ActivityPub や配信系の変更は影響範囲が広いため、慎重に扱ってください。
  - 独自機能の変更や上流マージ後は、リポジトリmemoryのmascodon独自仕様を確認してください。
  - ファイルや定数の存在だけで動作確認済みとせず、関連テストと実画面確認を行ってください。
  - 未実施のテスト、実画面確認、既知のテスト不足は明記してください。
  - 検証結果は確認済み / 修正済み / 未確認 / 意図的に変更のいずれかで報告し、結果を推測で成功扱いにしないでください。
  - 上流の仕様変更で独自仕様を維持できない場合は、黙って置換せず影響と選択肢を報告して相談してください。

- よく使うコマンド
  - 開発環境起動: bin/dev
  - フロントエンドのみ起動: yarn dev
  - i18n 抽出: yarn i18n:extract
  - セットアップ: bin/setup

- テスト・検証
  - Ruby テスト: RAILS_ENV=test bin/rspec spec/...
  - Ruby/HAML の静的チェック: bin/rubocop、bin/haml-lint
  - フロントエンドの lint: yarn lint:js、yarn lint:css
  - 型チェック: yarn typecheck
  - フロントエンドテスト: yarn test:js run
  - フォーマット確認: yarn format:check
  - 変更範囲に応じて対象ファイルや対象テストを指定し、必要な場合だけ全体検証へ広げてください。

- 重要な前提
  - .ruby-version の Ruby 4.0.10、Node.js 24 以上、Yarn 4 を前提としています。
  - public API や DB スキーマを変更する場合は migration とテスト追加を忘れないでください。
  - まず対象の既存実装を確認し、その流れに合わせて変更してください。
