import { IntlProvider } from 'react-intl';

import { MemoryRouter } from 'react-router-dom';

import { cleanup, render, screen } from '@testing-library/react';

import { StatusRedesignHeader } from '@/mastodon/components/status/header';
import {
  accountFactoryImmutable,
  accountFactoryState,
} from '@/testing/factories';

import { DisplayName } from './index';

vi.mock('@/mastodon/hooks/useAccount', () => ({ useAccount: () => undefined }));
vi.mock('@/mastodon/hooks/useAccountId', () => ({
  useCurrentAccountId: () => null,
}));

afterEach(cleanup);

const roles = [
  { id: '1', name: 'Owner', color: '#123456' },
  { id: '2', name: 'Moderator', color: '#abcdef' },
];

describe('timeline role badges', () => {
  it.each([
    ['plain', accountFactoryState({ roles })],
    ['immutable', accountFactoryImmutable({ roles })],
  ])(
    'renders badges for a %s account in the classic display name',
    (_, account) => {
      render(
        <IntlProvider locale='en'>
          <DisplayName account={account} />
        </IntlProvider>,
      );

      expect(screen.getByRole('img', { name: 'Owner' })).toBeTruthy();
      expect(screen.getByRole('img', { name: 'Moderator' })).toBeTruthy();
      expect(
        screen
          .getByRole('img', { name: 'Owner' })
          .querySelectorAll('path')[1]
          ?.getAttribute('style'),
      ).toContain('rgb(18, 52, 86)');
    },
  );

  it('does not render badges when suppressed or when roles are absent', () => {
    const { rerender } = render(
      <IntlProvider locale='en'>
        <DisplayName
          account={accountFactoryImmutable({ roles })}
          showRoles={false}
        />
      </IntlProvider>,
    );
    expect(screen.queryByRole('img', { name: 'Owner' })).toBeNull();

    rerender(
      <IntlProvider locale='en'>
        <DisplayName account={accountFactoryImmutable()} />
      </IntlProvider>,
    );
    expect(screen.queryByRole('img', { name: 'Owner' })).toBeNull();
  });

  it('renders the author badges next to the handle in the redesigned header', () => {
    const account = { ...accountFactoryState({ roles }), acct: 'testuser' };
    const { rerender } = render(
      <IntlProvider locale='en'>
        <MemoryRouter>
          <StatusRedesignHeader
            status={{
              id: '123',
              account,
              created_at: '2023-01-01T00:00:00.000Z',
              visibility: 'public',
              mentions: [],
            }}
          />
        </MemoryRouter>
      </IntlProvider>,
    );

    expect(
      screen.getByRole('img', { name: 'Owner' }).closest('a')?.textContent,
    ).toContain('@testuser');
    expect(screen.getByRole('img', { name: 'Moderator' })).toBeTruthy();

    rerender(
      <IntlProvider locale='en'>
        <MemoryRouter>
          <StatusRedesignHeader
            status={{
              id: '123',
              account: { ...account, roles: [] },
              created_at: '2023-01-01T00:00:00.000Z',
              visibility: 'public',
              mentions: [],
            }}
          />
        </MemoryRouter>
      </IntlProvider>,
    );
    expect(screen.queryByRole('img', { name: 'Owner' })).toBeNull();
    expect(screen.getByText('@testuser')).toBeTruthy();
  });
});
