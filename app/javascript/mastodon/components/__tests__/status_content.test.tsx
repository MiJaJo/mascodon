import {
  isSingleEmojiContent,
  isSingleEmojiOrMentionEmojiContent,
  prepareSingleEmojiContent,
} from '../status_content';

describe('isSingleEmojiContent', () => {
  it('recognizes a paragraph containing one Unicode emoji', () => {
    expect(isSingleEmojiContent('<p>😀</p>')).toBe(true);
  });

  it('recognizes a paragraph containing one custom emoji shortcode', () => {
    expect(isSingleEmojiContent('<p>:custom_emoji:</p>')).toBe(true);
  });

  it.each(['<p>text 😀</p>', '<p>😀 😀</p>', '<p>😀</p><p>text</p>'])(
    'does not recognize non-emoji-only content: %s',
    (content) => {
      expect(isSingleEmojiContent(content)).toBe(false);
    },
  );
});

describe('prepareSingleEmojiContent', () => {
  const content =
    '<p><a href="https://example.com/@foo" class="mention">@foo@example.com</a> 😀</p>';

  it('recognizes a mention followed by one emoji', () => {
    expect(isSingleEmojiOrMentionEmojiContent(content)).toBe(true);
  });

  it('inserts a line break before the emoji', () => {
    expect(prepareSingleEmojiContent(content)).toBe(
      '<p><a href="https://example.com/@foo" class="mention">@foo@example.com</a><br>😀</p>',
    );
  });

  it('handles a mention nested in an h-card', () => {
    const nestedContent =
      '<p><span class="h-card"><a href="https://example.com/@foo" class="mention">@foo@example.com</a></span> :custom_emoji:</p>';

    expect(prepareSingleEmojiContent(nestedContent)).toBe(
      '<p><span class="h-card"><a href="https://example.com/@foo" class="mention">@foo@example.com</a></span><br>:custom_emoji:</p>',
    );
  });

  it.each([
    '<p><a href="https://example.com/@foo" class="mention">@foo</a> text 😀</p>',
    '<p><a href="https://example.com/@foo" class="mention">@foo</a> 😀 😀</p>',
    '<p><a href="https://example.com/@foo" class="mention">@foo</a><a href="https://example.com/@bar" class="mention">@bar</a> 😀</p>',
  ])('does not recognize other mention content: %s', (otherContent) => {
    expect(isSingleEmojiOrMentionEmojiContent(otherContent)).toBe(false);
    expect(prepareSingleEmojiContent(otherContent)).toBe(otherContent);
  });
});
