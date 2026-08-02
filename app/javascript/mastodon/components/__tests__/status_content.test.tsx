import { prepareSingleEmojiContent } from '../status_content';

describe('prepareSingleEmojiContent', () => {
  it('wraps a single emoji with the marker class', () => {
    const content = prepareSingleEmojiContent('<p>😀</p>');

    expect(content).toContain('<span class="mcd__singleEmoji">😀</span>');
  });

  it('inserts a line break before a single emoji after a mention', () => {
    const content = prepareSingleEmojiContent(
      '<p><a href="https://example.com/@foo" class="mention">@foo</a> 😀</p>',
    );

    expect(content).toContain(
      '<a href="https://example.com/@foo" class="mention">@foo</a><br><span class="mcd__singleEmoji">😀</span>',
    );
  });

  it('wraps a single custom emoji shortcode after a mention and line break', () => {
    const content = prepareSingleEmojiContent(
      '<p><a href="https://example.com/@foo" class="mention">@foo</a><br>:custom_emoji:</p>',
    );

    expect(content).toContain(
      '<a href="https://example.com/@foo" class="mention">@foo</a><br><span class="mcd__singleEmoji">:custom_emoji:</span>',
    );
  });
});
