import { configureStore } from '@reduxjs/toolkit';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';

import { cleanup, render } from '@testing-library/react';

import { reducerWithInitialState } from '@/mastodon/reducers';
import { defaultMiddleware } from '@/mastodon/store/store';
import { imageAttachmentFactoryAPI } from '@/testing/factories';

import { ComposeAttachments } from './attachments';
import classes from './attachments.module.scss';

vi.mock('./upload', () => ({
  ComposeUpload: ({ id, className }: { id?: string; className?: string }) => (
    <div className={className} data-id={id} />
  ),
}));

afterEach(cleanup);

describe('ComposeAttachments', () => {
  it.each([2, 3, 4, 5, 16])('renders all %i uploaded previews', (count) => {
    const store = configureStore({
      reducer: reducerWithInitialState({
        compose: {
          media_attachments: fromJS(
            Array.from({ length: count }, (_, i) =>
              imageAttachmentFactoryAPI({ id: String(i) }),
            ),
          ),
        },
      }),
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware(defaultMiddleware),
    });
    const { container } = render(
      <Provider store={store}>
        <ComposeAttachments />
      </Provider>,
    );
    const grid = container.querySelector(`[data-number="${count}"]`);

    expect(grid?.children.length).toBe(count);
    expect(grid?.classList.contains(classes.mediaGridExtended ?? '')).toBe(
      count > 4,
    );
  });

  it('includes pending uploads in the extended grid', () => {
    const store = configureStore({
      reducer: reducerWithInitialState({
        compose: {
          media_attachments: fromJS(
            Array.from({ length: 4 }, (_, i) =>
              imageAttachmentFactoryAPI({ id: String(i) }),
            ),
          ),
          pending_media_attachments: 1,
        },
      }),
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware(defaultMiddleware),
    });
    const { container } = render(
      <Provider store={store}>
        <ComposeAttachments />
      </Provider>,
    );
    const grid = container.querySelector('[data-number="5"]');

    expect(grid?.children.length).toBe(5);
    expect(grid?.classList.contains(classes.mediaGridExtended ?? '')).toBe(
      true,
    );
  });
});
