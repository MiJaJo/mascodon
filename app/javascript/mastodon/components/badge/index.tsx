import type { FC, ReactNode } from 'react';

import { FormattedMessage, useIntl } from 'react-intl';

import classNames from 'classnames';

import AdminIcon from '@/images/icons/icon_admin.svg?react';
import ClockIcon from '@/images/icons/icon_clock.svg?react';
import FollowerIcon from '@/images/icons/icon_follower.svg?react';
import IconVerified from '@/images/icons/icon_verified.svg?react';
import type { AccountRoleShape } from '@/mastodon/models/account';
import type { OnAttributeHandler } from '@/mastodon/utils/html';
import BlockIcon from '@/material-icons/400-24px/block.svg?react';
import GroupsIcon from '@/material-icons/400-24px/group.svg?react';
import PersonIcon from '@/material-icons/400-24px/person.svg?react';
import SmartToyIcon from '@/material-icons/400-24px/smart_toy.svg?react';
import VolumeOffIcon from '@/material-icons/400-24px/volume_off.svg?react';

import { EmojiHTML } from '../emoji/html';
import { Icon } from '../icon';

import classes from './styles.module.scss';

interface BadgeProps extends React.ComponentPropsWithoutRef<'div'> {
  label: ReactNode;
  icon?: ReactNode;
  domain?: ReactNode;
  roleId?: string;
  variant?:
    | 'default'
    | 'subtle'
    | 'inverted'
    | 'success'
    | 'warning'
    | 'danger';
}

type PresetBadgeProps = Omit<
  BadgeProps,
  'label' | 'icon' | 'domain' | 'roleId'
>;

export const Badge: FC<BadgeProps> = ({
  icon = <PersonIcon />,
  variant = 'default',
  label,
  className,
  domain,
  roleId,
  ...otherProps
}) => (
  <div
    {...otherProps}
    className={classNames(
      classes.badge,
      !icon && classes.badgeWithoutIcon,
      classes[variant],
      className,
    )}
    data-account-role-id={roleId}
  >
    {icon}
    <span className={classes.content}>
      {label}
      {domain && <span className={classes.domain}> {domain}</span>}
    </span>
  </div>
);

export const AdminBadge: FC<Partial<BadgeProps>> = ({ label, ...props }) => (
  <Badge
    icon={<AdminIcon />}
    label={
      label ?? (
        <FormattedMessage id='account.badges.admin' defaultMessage='Admin' />
      )
    }
    {...props}
  />
);

export const GroupBadge: FC<Partial<BadgeProps>> = ({ label, ...props }) => (
  <Badge
    icon={<GroupsIcon />}
    label={
      label ?? (
        <FormattedMessage id='account.badges.group' defaultMessage='Group' />
      )
    }
    {...props}
  />
);

export const AutomatedBadge: FC<PresetBadgeProps> = (props) => (
  <Badge
    icon={<SmartToyIcon />}
    label={
      <FormattedMessage id='account.badges.bot' defaultMessage='Automated' />
    }
    {...props}
  />
);

export const FollowsYouBadge: FC<PresetBadgeProps> = (props) => (
  <Badge
    icon={<FollowerIcon />}
    label={
      <FormattedMessage id='account.follows_you' defaultMessage='Follows you' />
    }
    {...props}
  />
);

export const PendingBadge: FC<PresetBadgeProps> = (props) => (
  <Badge
    variant='warning'
    icon={<ClockIcon />}
    label={<FormattedMessage id='account.pending' defaultMessage='Pending' />}
    {...props}
  />
);

export const MutedBadge: FC<
  Partial<BadgeProps> & { expiresAt?: string | null }
> = ({ expiresAt, label, ...props }) => {
  // Format the date, only showing the year if it's different from the current year.
  const intl = useIntl();
  let formattedDate: string | null = null;
  if (expiresAt) {
    const expiresDate = new Date(expiresAt);
    const isCurrentYear =
      expiresDate.getFullYear() === new Date().getFullYear();
    formattedDate = intl.formatDate(expiresDate, {
      month: 'numeric',
      day: 'numeric',
      ...(isCurrentYear ? {} : { year: 'numeric' }),
    });
  }
  return (
    <Badge
      icon={<VolumeOffIcon />}
      variant='inverted'
      label={
        label ??
        (formattedDate ? (
          <FormattedMessage
            id='account.badges.muted_until'
            defaultMessage='Muted until {until}'
            values={{
              until: formattedDate,
            }}
          />
        ) : (
          <FormattedMessage id='account.badges.muted' defaultMessage='Muted' />
        ))
      }
      {...props}
    />
  );
};

export const BlockedBadge: FC<Partial<BadgeProps>> = ({ label, ...props }) => (
  <Badge
    icon={<BlockIcon />}
    variant='danger'
    label={
      label ?? (
        <FormattedMessage
          id='account.badges.blocked'
          defaultMessage='Blocked'
        />
      )
    }
    {...props}
  />
);

const onAttribute: OnAttributeHandler = (name, value, tagName) => {
  if (name === 'rel' && tagName === 'a') {
    if (value === 'me') {
      return null;
    }
    return [
      name,
      value
        .split(' ')
        .filter((x) => x !== 'me')
        .join(' '),
    ];
  }
  return undefined;
};

export const VerifiedBadge: React.FC<{ link: string; className?: string }> = ({
  link,
  className,
}) => (
  <Badge
    variant='success'
    icon={<Icon id='verified' icon={IconVerified} noFill />}
    label={<EmojiHTML as='span' htmlString={link} onAttribute={onAttribute} />}
    className={className}
  />
);

export const RoleBadge: React.FC<{ role: AccountRoleShape }> = ({ role }) => (
  <svg
    aria-label={role.name}
    className='role-badge'
    role='img'
    viewBox='0 0 24 24'
  >
    <path
      d='M 14.626 6.269 L 14.626 15.884 L 9.193 15.884 L 9.193 6.269 L 14.626 6.269 Z'
      fill='#FFF'
      transform='matrix(0.707107, 0.707107, -0.707107, 0.707107, 11.32048, -5.177056)'
    />
    <path
      d='M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z'
      fill='currentColor'
      style={{ color: role.color }}
    />
  </svg>
);
