# frozen_string_literal: true

class StatusesIndex < Chewy::Index
  include DatetimeClampingConcern

  settings index: index_preset(refresh_interval: '30s', number_of_shards: 5), analysis: {
    filter: {
      english_stop: {
        type: 'stop',
        stopwords: '_english_',
      },

      english_stemmer: {
        type: 'stemmer',
        language: 'english',
      },

      english_possessive_stemmer: {
        type: 'stemmer',
        language: 'possessive_english',
      },

      my_posfilter: {
        type: 'sudachi_part_of_speech',
        stoptags: [
          '助詞',
          '助動詞',
          '補助記号,句点',
          '補助記号,読点',
        ],
      },
    },
    analyzer: {
      content: {
        tokenizer: 'sudachi_tokenizer',
        filter: %w(
          english_possessive_stemmer
          lowercase
          asciifolding
          cjk_width
          english_stop
          english_stemmer
          my_posfilter
          sudachi_normalizedform
        ),
      },
      hashtag: {
        tokenizer: 'keyword',
        filter: %w(
          word_delimiter_graph
          lowercase
          asciifolding
          cjk_width
        ),
      },
    },
    tokenizer: {
      sudachi_tokenizer: {
        resources_path: '/etc/elasticsearch/sudachi',
        split_mode: 'A',
        type: 'sudachi_tokenizer',
        discard_punctuation: 'true',
      },
    },
  }

  index_scope ::Status.unscoped.kept.without_reblogs.includes(:media_attachments, :local_mentioned, :local_favorited, :local_reblogged, :local_bookmarked, :tags, preview_cards_status: :preview_card, preloadable_poll: :local_voters), delete_if: ->(status) { status.searchable_by.empty? }

  root date_detection: false do
    field(:id, type: 'long')
    field(:account_id, type: 'long')
    field(:text, type: 'text', analyzer: 'content', value: ->(status) { status.searchable_text }) { field(:stemmed, type: 'text', analyzer: 'content') }
    field(:tags, type: 'text', analyzer: 'hashtag',  value: ->(status) { status.tags.map(&:display_name) })
    field(:searchable_by, type: 'long', value: ->(status) { status.searchable_by })
    field(:language, type: 'keyword')
    field(:properties, type: 'keyword', value: ->(status) { status.searchable_properties })
    field(:created_at, type: 'date', value: ->(status) { clamp_date(status.created_at) })
  end
end
