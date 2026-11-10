import { FormattedMessage } from 'react-intl';

import type { Account } from '@/mastodon/models/account';

import classes from './styles.module.scss';

export const RemoteProfileNotice: React.FC<{ account: Account }> = ({
  account,
}) => {
  if (!account.acct.includes('@') || account.suspended) {
    return null;
  }

  const url = URL.canParse(account.url) ? new URL(account.url) : null;
  const isHttpUrl = url?.protocol === 'https:' || url?.protocol === 'http:';

  if (!isHttpUrl) {
    return (
      <div className={classes.remoteNotice}>
        <FormattedMessage
          id='account.remote_profile_unavailable'
          defaultMessage='Information about remote users may not be up to date.'
        />
      </div>
    );
  }

  return (
    <a
      className={classes.remoteNotice}
      href={account.url}
      target='_blank'
      rel='noopener noreferrer'
    >
      <FormattedMessage
        id='account.remote_profile_notice'
        defaultMessage='Information about remote users may not be up to date. Click here to see the latest information on their server.'
      />
    </a>
  );
};
