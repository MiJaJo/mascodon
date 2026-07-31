# Copilot instructions for Mastodon (local fork: mascodon)

このファイルは、このリポジトリで Copilot が作業するときの基本方針です。Mastodon のローカル fork であり、Ruby on Rails と React/TypeScript の両方を扱うため、サーバー側とフロントエンド側の責務を混ぜず、既存実装の流れに合わせて変更してください。

- 全体像
  - サーバー側は Ruby on Rails で API と server-rendered page を提供します。
  - フロントエンドは app/javascript/mastodon 以下の React/TypeScript で構成されています。
  - streaming/ には Node ベースのストリーミングサービスがあります。
  - 主要な設定は config/、bin/、package.json にあります。

- 変更先の主な場所
  - Rails 側: app/controllers、app/models、app/serializers、app/presenters、app/services、app/workers
  - フロントエンド: app/javascript/mastodon/features、app/javascript/mastodon/components
  - ルーティング・設定: config/、config/routes.rb、vite.config.mts
  - DB 変更: db/migrate、db/schema.rb

- 実装時の基本方針
  - 既存コードの構造・命名・責務分離に合わせて実装してください。
  - 変更は最小限にし、関連するテストも合わせて更新してください。
  - API のレスポンスや公開インターフェースに影響する場合は serializers/presenters を確認してください。
  - UI の文言を追加・変更した場合は i18n/locales も更新してください。
  - ActivityPub や配信系の変更は影響範囲が広いため、慎重に扱ってください。

- よく使うコマンド
  - 開発環境起動: bin/dev
  - フロントエンドのみ起動: yarn dev
  - i18n 抽出: yarn i18n:extract
  - セットアップ: bin/setup

- テスト・検証
  - Ruby テスト: bin/rspec spec/...
  - フロントエンドの静的チェック: yarn lint
  - 型チェック: yarn typecheck
  - JS テスト: yarn test:js

- 重要な前提
  - Node.js 22 以上、Yarn 4 を前提としています。
  - public API や DB スキーマを変更する場合は migration とテスト追加を忘れないでください。
  - まず対象の既存実装を確認し、その流れに合わせて変更してください。
