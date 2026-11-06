import { RoleBadge } from '../badge';

import type { DisplayNameProps } from './index';

export const RoleBadges: React.FC<Pick<DisplayNameProps, 'account'>> = ({
  account,
}) => {
  const roles = account?.roles;
  if (
    !roles ||
    (Array.isArray(roles) ? roles.length === 0 : roles.size === 0)
  ) {
    return null;
  }

  return (
    <span className='display-name__role-badges'>
      {roles.map((role) => (
        <RoleBadge key={role.id} role={role} />
      ))}
    </span>
  );
};
