# Copilot instructions for Mastodon (local fork: mascodon)

This file gives concise, repo-specific guidance to an AI coding assistant so it can be immediately productive.

- **Big picture**: This is a Ruby on Rails application that provides the REST API and server-rendered pages; a separate Node-based streaming service lives in `streaming/`; the frontend UI is React/TypeScript under `app/javascript/` and built with Vite/Storybook.

- **Key components & locations**:
  - Rails app: `app/` (controllers, models, serializers, services, presenters, workers)
  - Frontend: `app/javascript/mastodon` (features/components), `package.json`, `vite.config.mts`
  - Streaming service: `streaming/` (Node runtime, `streaming/index.js`)
  - Dev scripts: `bin/` (convenience scripts: `bin/dev`, `bin/setup`, `bin/rspec`, `bin/rails`, `bin/vite`)
  - Config: `config/` (environment and routes); `Procfile` / `Procfile.dev` (process layout)

- **Developer workflows (concrete commands)**:
  - Full setup (local): `RAILS_ENV=development bin/setup` then `bin/dev` to start services via `overmind`/`foreman`.
  - Docker dev: see `docs/DEVELOPMENT.md` — example:
    `docker compose -f .devcontainer/compose.yaml up -d && docker compose -f .devcontainer/compose.yaml exec app bin/setup && docker compose -f .devcontainer/compose.yaml exec app bin/dev`
  - Frontend only: `yarn dev` (runs `vite dev`), or `yarn build:development` / `yarn build:production`.
  - JS tests/lint/typecheck: `yarn test:js`, `yarn lint`, `yarn typecheck` (see `package.json` scripts).
  - Ruby tests: run via the `bin/rspec` helper or `bundle exec rspec spec/...`.

- **Project conventions & patterns** (important for code changes):
  - Strong separation: server (Rails) owns persistence and federated logic; frontend focuses on UI state and uses Redux patterns under `app/javascript/mastodon`.
  - Background jobs use Sidekiq; worker classes live in `app/workers` and are queued from controllers/services.
  - Serializers and presenters are used to shape API responses (`app/serializers`, `app/presenters`). Modify these when changing API surface.
  - Features are organized under `app/javascript/mastodon/features/*` — prefer adding components/features there rather than global JS roots.
  - i18n uses `formatjs`; locale extraction happens with `yarn i18n:extract` (see `package.json`).

- **Testing and CI cues**:
  - JS unit tests use Vitest (`yarn test:js`), Storybook driven tests are available; visual tests use Chromatic.
  - Ruby tests are RSpec-based; maintainers expect green RSpec and JS lint/typecheck before merging.

- **Formatting & linters**:
  - JS: `eslint`, `prettier`, `stylelint` (scripts: `yarn lint`, `yarn format`).
  - Ruby: `rubocop`, `brakeman` and `bundler-audit` available in `bin/`.
  - Husky + lint-staged are used for pre-commit hooks (check `package.json`).

- **Integration/Infra notes**:
  - Database: PostgreSQL (schema in `db/schema.rb`).
  - Caching/queue: Redis + Sidekiq (see `config/sidekiq.yml`).
  - External integrations: ActivityPub federation code is spread across models/services; be careful when changing serialization or delivery logic.

- **When changing public APIs or migrations**:
  - Update `app/serializers` and API docs if adding/removing fields.
  - Add a schema migration under `db/migrate` and run `bin/rails db:migrate` in dev; ensure RSpec covers persistence changes.

- **Files to inspect first when summoned for a task**:
  - `config/application.rb`, `config/routes.rb`, `Gemfile`, `package.json`
  - `app/controllers/`, `app/models/`, `app/serializers/`, `app/services/`, `app/javascript/mastodon/features/`
  - `streaming/index.js` and `bin/dev`

If anything here is unclear or you want additional examples (small PR templates, common refactoring patterns, or test commands to run locally), tell me which part to expand.
