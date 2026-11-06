import PropTypes from 'prop-types';

import { IntlProvider } from 'react-intl';

import { cleanup, render, screen } from '@testing-library/react';

import About from '../index';

vi.mock('react-redux', () => ({
  connect: () => (Component) => Component,
}));
vi.mock('@unhead/react/helmet', () => ({ Helmet: () => null }));
vi.mock('mastodon/actions/server', () => ({
  fetchServer: () => ({ type: 'fetchServer' }),
  fetchExtendedDescription: () => ({ type: 'fetchExtendedDescription' }),
  fetchDomainBlocks: () => ({ type: 'fetchDomainBlocks' }),
}));
vi.mock('mastodon/components/account', () => ({ Account: () => null }));
vi.mock('@/mastodon/components/column', () => ({
  Column: Object.assign(({ children }) => <div>{children}</div>, {
    propTypes: { children: PropTypes.node },
  }),
}));
vi.mock('@/mastodon/components/column_header', () => ({
  ColumnHeader: () => null,
}));
vi.mock('mastodon/components/navigation_focus_target', () => ({
  NavigationFocusTarget: Object.assign(({ children }) => <h1>{children}</h1>, {
    propTypes: { children: PropTypes.node },
  }),
}));
vi.mock('mastodon/components/server_hero_image', () => ({
  ServerHeroImage: () => null,
}));
vi.mock('mastodon/features/ui/components/link_footer', () => ({
  LinkFooter: () => null,
}));
vi.mock('../components/rules', () => ({ RulesSection: () => null }));
vi.mock('@/mastodon/utils/environment', () => ({
  isRedesignEnabled: () => false,
}));

afterEach(cleanup);

function renderAbout(contact, isLoading = false) {
  return render(
    <IntlProvider locale='en'>
      <About
        server={{
          isLoading,
          item: contact ? { contact: { email: contact }, thumbnail: {} } : undefined,
        }}
        extendedDescription={{ isLoading: false }}
        domainBlocks={{ isLoading: false, isAvailable: false, items: [] }}
        dispatch={vi.fn()}
      />
    </IntlProvider>,
  );
}

describe('About', () => {
  it.each([
    ['admin@example.com', 'mailto:admin@example.com'],
    ['https://example.com/contact', 'https://example.com/contact'],
    ['example.com/contact', 'https://example.com/contact'],
  ])('renders the contact link for %s', (contact, href) => {
    renderAbout(contact);

    expect(screen.getByText(contact).getAttribute('href')).toBe(href);
    expect(screen.getByText('Contact:')).toBeTruthy();
  });

  it.each([true, false])(
    'renders without a contact while loading is %s',
    (isLoading) => {
      renderAbout(undefined, isLoading);

      expect(screen.getByText('Contact:')).toBeTruthy();
      expect(document.querySelector('.about__mail[href^="mailto:"]')).toBeNull();
    },
  );
});
