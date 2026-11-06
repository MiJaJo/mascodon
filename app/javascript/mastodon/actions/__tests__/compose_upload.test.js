import { configureStore } from '@reduxjs/toolkit';

import { reducerWithInitialState } from '@/mastodon/reducers';
import { defaultMiddleware } from '@/mastodon/store/store';

import { uploadCompose } from '../compose';

const { post } = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock('@/mastodon/api', () => ({ default: () => ({ post }) }));

function createStore() {
  return configureStore({
    reducer: reducerWithInitialState({
      server: {
        server: {
          item: {
            configuration: {
              statuses: { max_media_attachments: 16 },
              media_attachments: {},
            },
          },
        },
      },
    }),
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(defaultMiddleware),
  });
}

function files(count) {
  return Array.from({ length: count }, (_, i) =>
    new File(['image'], `${i}.png`, { type: 'image/png' }),
  );
}

afterEach(() => {
  post.mockReset();
});

describe('uploadCompose', () => {
  it('tracks every upload until each has succeeded or failed', async () => {
    const uploads = [];
    post.mockImplementation(() => new Promise((resolve, reject) => {
      uploads.push({ resolve, reject });
    }));
    const store = createStore();

    store.dispatch(uploadCompose(files(5)));
    expect(post).toHaveBeenCalledTimes(5);
    expect(store.getState().compose.get('pending_media_attachments')).toBe(5);
    expect(store.getState().compose.get('is_uploading')).toBe(true);

    for (let i = 0; i < 3; i++) {
      uploads[i].resolve({ status: 200, data: { id: String(i), type: 'image' } });
    }
    uploads[3].reject(new Error('upload failed'));
    await vi.waitFor(() => {
      expect(store.getState().compose.get('pending_media_attachments')).toBe(1);
    });
    expect(store.getState().compose.get('is_uploading')).toBe(true);
    expect(store.getState().compose.get('media_attachments').size).toBe(3);

    uploads[4].resolve({ status: 200, data: { id: '4', type: 'image' } });
    await vi.waitFor(() => {
      expect(store.getState().compose.get('pending_media_attachments')).toBe(0);
    });
    expect(store.getState().compose.get('is_uploading')).toBe(false);
    expect(store.getState().compose.get('media_attachments').size).toBe(4);
  });

  it('accepts 16 attachments and rejects more, including pending uploads', async () => {
    const uploads = [];
    post.mockImplementation(() => new Promise(resolve => uploads.push(resolve)));
    const store = createStore();

    store.dispatch(uploadCompose(files(16)));
    expect(post).toHaveBeenCalledTimes(16);
    expect(store.getState().compose.get('pending_media_attachments')).toBe(16);

    store.dispatch(uploadCompose(files(1)));
    expect(post).toHaveBeenCalledTimes(16);

    uploads.forEach((resolve, i) => {
      resolve({ status: 200, data: { id: String(i), type: 'image' } });
    });
    await vi.waitFor(() => {
      expect(store.getState().compose.get('media_attachments').size).toBe(16);
    });
    expect(store.getState().compose.get('pending_media_attachments')).toBe(0);

    store.dispatch(uploadCompose(files(1)));
    expect(post).toHaveBeenCalledTimes(16);
    expect(store.getState().alerts.length).toBeGreaterThan(0);
  });
});
