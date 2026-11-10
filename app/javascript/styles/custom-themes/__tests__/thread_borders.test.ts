// @vitest-environment node

import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { compileString } from 'sass';

const emphasized = 'var(--color-border-emphasized, var(--color-border-input))';

describe('thread and post detail borders', () => {
  it('uses the visible border for the legacy thread and detail separators', () => {
    const { css } = compileString("@use 'app/javascript/styles/application';", {
      loadPaths: [process.cwd(), 'node_modules'],
    });

    expect(css).toContain(`--thread-line-color: ${emphasized};`);
    expect(css).toMatch(
      /\.status--first-in-thread\s*\{\s*border-top: 1px solid var\(--color-border-emphasized, var\(--color-border-input\)\);/,
    );
    expect(css).toMatch(
      /\.detailed-status\s*\{[^}]*border-top: 1px solid var\(--color-border-emphasized, var\(--color-border-input\)\);/,
    );
    expect(css).toMatch(
      /\.detailed-status__meta__line\s*\{[^}]*border-bottom: 1px solid var\(--color-border-emphasized, var\(--color-border-input\)\);/,
    );
    expect(css).toMatch(
      /\.detailed-status__action-bar\s*\{[^}]*border-top: 1px solid var\(--color-border-emphasized, var\(--color-border-input\)\);[^}]*border-bottom: 1px solid var\(--color-border-emphasized, var\(--color-border-input\)\);/,
    );
    expect(css).toMatch(
      /\.status\s*\{[^}]*border-bottom: 1px solid var\(--color-border-primary\);/,
    );
  });

  it('uses the visible border for redesigned thread lines and detail separators', () => {
    const { css } = compileString(
      `
      @use 'app/javascript/mastodon/components/status/prepend.module';
      @use 'app/javascript/mastodon/components/status/styles.module';
      @use 'app/javascript/mastodon/components/status/meta.module';
      @use 'app/javascript/mastodon/features/status/redesign.module';
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
      /\.replyIcon\s*\{[^}]*border-block-start: var\(--bw-thick\) solid var\(--color-border-emphasized, var\(--color-border-input\)\);[^}]*border-inline-start: var\(--bw-thick\) solid var\(--color-border-emphasized, var\(--color-border-input\)\);/,
    );
    expect(css).toMatch(
      /\.connectNextReply::after\s*\{[^}]*border-inline-start: var\(--bw-thick\) solid var\(--color-border-emphasized, var\(--color-border-input\)\);/,
    );
    expect(css).toMatch(
      /\.meta\s*\{[^}]*border-block-start: var\(--bw-default\) solid var\(--color-border-emphasized, var\(--color-border-input\)\);/,
    );
    expect(css).toMatch(
      /\.mainStatus\s*\{\s*border-bottom: var\(--bw-default\) solid var\(--color-border-emphasized, var\(--color-border-input\)\);/,
    );
    expect(css).toMatch(
      /\.thread\s*\{[^}]*border-block-end: var\(--bw-default\) solid var\(--color-border-emphasized, var\(--color-border-input\)\);/,
    );
    expect(css).toMatch(
      /\.thread > article\[data-connect-next=false\]\s*\{\s*border-block-end: var\(--bw-default\) solid var\(--color-border-emphasized, var\(--color-border-input\)\);/,
    );
    expect(css).toMatch(
      /\.variantFeed\s*\{\s*border-bottom: var\(--border-thin\);/,
    );
  });
});
