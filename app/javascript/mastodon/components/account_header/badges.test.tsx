import { IntlProvider } from 'react-intl';

import { Map as ImmutableMap } from 'immutable';

import { cleanup, render, screen } from '@testing-library/react';

import { useAccount } from '@/mastodon/hooks/useAccount';
import type * as Store from '@/mastodon/store';
import { accountFactoryImmutable } from '@/testing/factories';

import { AccountBadges } from './badges';

vi.mock('@/mastodon/hooks/useAccount', () => ({ useAccount: vi.fn() }));
vi.mock('@/mastodon/store', async (importOriginal) => ({
  ...(await importOriginal<typeof Store>()),
  useAppDispatch: () => vi.fn(),
  useAppSelector: (
    selector: (state: {
      meta: ImmutableMap<string, string>;
      relationships: ImmutableMap<string, unknown>;
    }) => unknown,
  ) =>
    selector({
      meta: ImmutableMap({ domain: 'example.com' }),
      relationships: ImmutableMap({
        '1': { blocking: true, domain_blocking: false, muting: false },
      }),
    }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('AccountBadges', () => {
  it('renders role badges and relationship badges together', () => {
    vi.mocked(useAccount).mockReturnValue(
      accountFactoryImmutable({
        roles: [
          { id: '1', name: 'Owner', color: '#123456' },
          { id: '2', name: 'Moderator', color: '#abcdef' },
        ],
      }),
    );

    const { container } = render(
      <IntlProvider locale='en'>
        <AccountBadges accountId='1' />
      </IntlProvider>,
    );

    expect(screen.getByRole('img', { name: 'Owner' })).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Moderator' })).toBeTruthy();
    expect(
      container.querySelector('[data-account-role-id="1"]')?.textContent,
    ).toContain('Owner (example.com)');
    expect(screen.getByText('Blocked')).toBeTruthy();
  });

  it('renders no role badge for an account without roles', () => {
    vi.mocked(useAccount).mockReturnValue(accountFactoryImmutable());

    const { container } = render(
      <IntlProvider locale='en'>
        <AccountBadges accountId='1' />
      </IntlProvider>,
    );

    expect(container.querySelector('[data-account-role-id]')).toBeNull();
    expect(screen.getByText('Blocked')).toBeTruthy();
  });
});
