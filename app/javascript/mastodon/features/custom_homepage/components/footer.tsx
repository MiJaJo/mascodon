import { useEffect } from 'react';

import { FormattedMessage } from 'react-intl';

import { Link } from 'react-router-dom';

import { fetchServer } from 'mastodon/actions/server';
import { useAppDispatch, useAppSelector } from 'mastodon/store';
import { getContactHref } from 'mastodon/utils/contact_link';

import classes from '../styles.module.scss';

export const Footer = () => {
  const dispatch = useAppDispatch();
  const server = useAppSelector((state) => state.server.server);
  const email = server.item?.contact.email ?? '';
  const href = getContactHref(email);

  useEffect(() => {
    void dispatch(fetchServer());
  }, [dispatch]);

  return (
    <footer className={classes.minimalFooter}>
      <div className={classes.contact}>
        <FormattedMessage
          id='custom_homepage.contact'
          defaultMessage='Contact:'
        />
        {email ? <a href={href}>{email}</a> : null}
      </div>

      <Link to='/privacy-policy' rel='privacy-policy'>
        <FormattedMessage
          id='footer.privacy_policy'
          defaultMessage='Privacy policy'
        />
      </Link>
    </footer>
  );
};
