// @vitest-environment node

import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { compileString } from 'sass';

describe('hashtag borders', () => {
  it('uses the visible border for legacy timeline hashtags', () => {
    const { css } = compileString("@use 'app/javascript/styles/application';", {
      loadPaths: [process.cwd(), 'node_modules'],
    });

    expect(css).toMatch(
      /\.hashtag-bar a\s*\{[^}]*border: 1px solid var\(--color-border-emphasized, var\(--color-border-input\)\);/,
    );
  });

  it('uses the visible border for redesigned timeline and profile hashtags', () => {
    const { css } = compileString(
      `
      @use 'app/javascript/mastodon/components/status/styles.module';
      @use 'app/javascript/mastodon/features/account_timeline/styles.module' as timeline;
      `,
      {
        loadPaths: [process.cwd()],
        importers: [
          {
            findFileUrl(url) {
              return url.startsWith('@/')
                ? pathToFileURL(resolve('app/javascript', url.slice(2)))
                : null;
            },
          },
        ],
      },
    );

    expect(css).toMatch(
      /\.hashtagsWrapper button\s*\{\s*border: 1px solid var\(--color-border-emphasized, var\(--color-border-input\)\);/,
    );
    expect(css).toMatch(
      /\.tagsWrapper button:not\(:hover, :focus\)\s*\{\s*border-color: var\(--color-border-emphasized, var\(--color-border-input\)\);/,
    );
  });
});
