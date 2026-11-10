import { IntlProvider } from 'react-intl';

import { cleanup, render, screen } from '@testing-library/react';

import messages from '@/mastodon/locales/ja.json';
import { accountFactoryImmutable } from '@/testing/factories';

import { RemoteProfileNotice } from './remote_notice';

afterEach(cleanup);

describe('RemoteProfileNotice', () => {
  const remoteAccount = accountFactoryImmutable({
    acct: 'alice@remote.example',
    url: 'https://remote.example/@alice',
  });

  it('links the Japanese notice to the remote profile', () => {
    render(
      <IntlProvider locale='ja' messages={messages}>
        <RemoteProfileNotice account={remoteAccount} />
      </IntlProvider>,
    );

    const link = screen.getByRole('link', {
      name: 'リモートユーザーの情報は、最新ではないことがあります。ここをクリックすると、リモートの最新情報を確認できます。',
    });
    expect(link.getAttribute('href')).toBe('https://remote.example/@alice');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('does not display a notice for a local account', () => {
    const { container } = render(
      <IntlProvider locale='en'>
        <RemoteProfileNotice account={accountFactoryImmutable()} />
      </IntlProvider>,
    );
    expect(container.firstChild).toBeNull();
  });

  it('accepts an HTTP profile URL', () => {
    render(
      <IntlProvider locale='en'>
        <RemoteProfileNotice
          account={remoteAccount.set('url', 'http://remote.example/@alice')}
        />
      </IntlProvider>,
    );
    expect(screen.getByRole('link').getAttribute('href')).toBe(
      'http://remote.example/@alice',
    );
  });

  it('does not display a notice for a suspended account', () => {
    const { container } = render(
      <IntlProvider locale='en'>
        <RemoteProfileNotice account={remoteAccount.set('suspended', true)} />
      </IntlProvider>,
    );
    expect(container.firstChild).toBeNull();
  });

  it.each(['', 'javascript:alert(1)', '/@alice', 'https://'])(
    'shows a non-clickable notice for an invalid profile URL: %s',
    (url) => {
      render(
        <IntlProvider locale='en'>
          <RemoteProfileNotice account={remoteAccount.set('url', url)} />
        </IntlProvider>,
      );
      expect(screen.queryByRole('link')).toBeNull();
      expect(
        screen.getByText(
          'Information about remote users may not be up to date.',
        ),
      ).toBeTruthy();
    },
  );
});
