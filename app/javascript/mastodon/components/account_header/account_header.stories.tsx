import { IntlProvider } from 'react-intl';

import type { Meta, StoryObj } from '@storybook/react-vite';

import messages from '@/mastodon/locales/ja.json';
import {
  accountFactoryImmutable,
  relationshipsFactoryAPI,
} from '@/testing/factories';

import { AccountHeader } from './index';

const meta = {
  title: 'Components/AccountHeader',
  component: AccountHeader,
  args: { accountId: '1' },
  parameters: {
    layout: 'fullscreen',
    state: {
      accounts: {
        '1': accountFactoryImmutable({
          acct: 'alice@remote.example',
          username: 'alice',
          display_name: 'アリス',
          url: 'https://remote.example/@alice',
          uri: 'https://remote.example/users/alice',
          header: '/headers/original/missing.png',
          header_static: '/headers/original/missing.png',
          followers_count: 159,
          following_count: 125,
          statuses_count: 10000,
          note: '<p>リモートサーバーのプロフィールです。</p>',
          fields: [
            {
              name: 'ウェブサイト',
              value: 'https://example.com',
              verified_at: null,
            },
          ],
        }),
      },
      relationships: {
        '1': relationshipsFactoryAPI({ following: true }),
      },
    },
  },
  decorators: [
    (Story) => (
      <IntlProvider locale='ja' messages={messages}>
        <div
          style={{
            width: '100%',
            maxWidth: 560,
            background: '#f5d6c6',
            borderRadius: 12,
            containerType: 'inline-size',
            overflow: 'hidden',
          }}
        >
          <Story />
        </div>
      </IntlProvider>
    ),
  ],
} satisfies Meta<typeof AccountHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const RemoteProfile: Story = {};

export const LocalProfile: Story = {
  parameters: {
    state: {
      accounts: {
        '1': accountFactoryImmutable({ acct: 'alice', username: 'alice' }),
      },
    },
  },
};

export const HiddenProfile: Story = {
  parameters: {
    state: {
      accounts: {
        '1': accountFactoryImmutable({
          acct: 'alice@remote.example',
          username: 'alice',
          url: 'https://remote.example/@alice',
        }).set('hidden', true),
      },
      relationships: {
        '1': relationshipsFactoryAPI({ following: false }),
      },
    },
  },
};

export const SuspendedProfile: Story = {
  parameters: {
    state: {
      accounts: {
        '1': accountFactoryImmutable({
          acct: 'alice@remote.example',
          username: 'alice',
          url: 'https://remote.example/@alice',
          suspended: true,
        }),
      },
    },
  },
};
