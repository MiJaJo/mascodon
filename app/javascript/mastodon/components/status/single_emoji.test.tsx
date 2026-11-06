import { cleanup, render, screen, waitFor } from '@testing-library/react';

import type * as EmojiRender from '@/mastodon/features/emoji/render';
import type { EmojiState } from '@/mastodon/features/emoji/types';
import {
  customEmojiFactory,
  statusFactoryState,
  unicodeEmojiFactory,
} from '@/testing/factories';

import { EmojiHTML } from '../emoji/html';

import { StatusContent } from './content';

vi.mock('@/mastodon/features/emoji/mode', () => ({
  useEmojiAppState: () => ({
    currentLocale: 'en',
    mode: 'native',
    darkTheme: false,
    assetHost: '',
  }),
}));

vi.mock('@/mastodon/features/emoji/render', async (importOriginal) => {
  const actual = await importOriginal<typeof EmojiRender>();
  return {
    ...actual,
    loadEmojiDataToState: (state: EmojiState) =>
      Promise.resolve(
        state.type === 'unicode'
          ? {
              ...state,
              data: unicodeEmojiFactory({ unicode: '😀', hexcode: state.code }),
            }
          : state,
      ),
  };
});

vi.mock('@/mastodon/hooks/useObserver', () => ({
  useResizeObserver: () => ({ observe: vi.fn(), disconnect: vi.fn() }),
}));

vi.mock('./hooks', () => ({ useHandlersForStatus: () => ({}) }));

afterEach(cleanup);

describe('enlarged emoji rendering', () => {
  const emoji = customEmojiFactory({ shortcode: 'custom_emoji' });

  it('passes the emoji class without passing extraArgs as a CSS class', () => {
    render(
      <EmojiHTML
        htmlString='<p>:custom_emoji:</p>'
        extraEmojis={[emoji]}
        emojiClassName='mcd__singleEmoji'
        extraArgs={{ unexpected: true }}
      />,
    );

    const image = screen.getByRole('img', { name: ':custom_emoji:' });
    expect(image.classList.contains('mcd__singleEmoji')).toBe(true);
    expect(image.classList.contains('unexpected')).toBe(false);
  });

  it('enlarges a custom emoji and separates a mention from it', () => {
    const status = statusFactoryState({ emojis: [emoji] });
    const { container } = render(
      <StatusContent
        status={status}
        statusContent='<p><a class="mention" href="https://example.com/@foo">@foo</a> :custom_emoji:</p>'
      />,
    );

    expect(container.querySelector('a.mention + br')).not.toBeNull();
    expect(
      screen
        .getByRole('img', { name: ':custom_emoji:' })
        .classList.contains('mcd__singleEmoji'),
    ).toBe(true);
  });

  it('enlarges native Unicode emoji and leaves normal text unchanged', async () => {
    const status = statusFactoryState();
    const { container, rerender } = render(
      <StatusContent status={status} statusContent='<p>😀</p>' />,
    );

    await waitFor(() => {
      expect(container.querySelector('.mcd__singleEmoji')?.textContent).toBe(
        '😀',
      );
    });

    rerender(<StatusContent status={status} statusContent='<p>hello 😀</p>' />);
    await waitFor(() => {
      expect(screen.getByText('hello', { exact: false })).toBeTruthy();
      expect(container.querySelector('.mcd__singleEmoji')).toBeNull();
    });
  });
});
