import { IntlProvider } from 'react-intl';

import { MemoryRouter } from 'react-router-dom';

import { configureStore } from '@reduxjs/toolkit';
import { cleanup, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

import { reducerWithInitialState } from '@/mastodon/reducers';
import { defaultMiddleware } from '@/mastodon/store/store';
import { customEmojiFactory, statusFactoryImmutable } from '@/testing/factories';

import StatusContent from '../content';

vi.mock('@/mastodon/features/emoji/mode', () => ({
  useEmojiAppState: () => ({
    currentLocale: 'en',
    mode: 'native',
    darkTheme: false,
    assetHost: '',
  }),
}));

afterEach(cleanup);

beforeAll(() => {
  Object.defineProperty(HTMLAnchorElement.prototype, 'innerText', {
    configurable: true,
    get() { return this.textContent; },
  });
});

afterAll(() => {
  delete HTMLAnchorElement.prototype.innerText;
});

it('renders enlarged emoji and normal content in the classic status', () => {
  const store = configureStore({
    reducer: reducerWithInitialState(),
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(defaultMiddleware),
  });
  const emoji = customEmojiFactory({ shortcode: 'custom_emoji' });
  const status = statusFactoryImmutable({ emojis: [emoji] });
  const { container, rerender } = render(
    <Provider store={store}>
      <IntlProvider locale='en'>
        <MemoryRouter>
          <StatusContent status={status} statusContent='<p>:custom_emoji:</p>' />
        </MemoryRouter>
      </IntlProvider>
    </Provider>,
  );

  expect(screen.getByRole('img', { name: ':custom_emoji:' }).classList.contains('mcd__singleEmoji')).toBe(true);

  rerender(
    <Provider store={store}>
      <IntlProvider locale='en'>
        <MemoryRouter>
          <StatusContent status={status} statusContent='<p>hello :custom_emoji:</p>' />
        </MemoryRouter>
      </IntlProvider>
    </Provider>,
  );
  expect(container.querySelector('.mcd__singleEmoji')).toBeNull();
  expect(screen.getByText('hello', { exact: false })).toBeTruthy();

  rerender(
    <Provider store={store}>
      <IntlProvider locale='en'>
        <MemoryRouter>
          <StatusContent
            status={status}
            statusContent='<p><a class="mention" href="https://example.com/@foo">@foo</a> :custom_emoji:</p>'
          />
        </MemoryRouter>
      </IntlProvider>
    </Provider>,
  );
  expect(container.querySelector('a.mention + br')).not.toBeNull();
  expect(screen.getByRole('img', { name: ':custom_emoji:' }).classList.contains('mcd__singleEmoji')).toBe(true);
});
