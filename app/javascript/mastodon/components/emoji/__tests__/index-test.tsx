import { textToEmojis } from '../index';

describe('textToEmojis', () => {
  it('passes an additional class name to an emoji component', () => {
    expect(textToEmojis('😀', 'mcd__singleEmoji')).toMatchObject([
      { props: { className: 'mcd__singleEmoji' } },
    ]);
  });
});
