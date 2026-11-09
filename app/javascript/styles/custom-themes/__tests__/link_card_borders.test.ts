// @vitest-environment node

import { compileString } from 'sass';

describe('custom theme link card borders', () => {
  it.each(['beige', 'blue', 'orange', 'pastel', 'pink', 'red', 'white'])(
    'keeps %s link card borders visible on timeline surfaces',
    (theme) => {
      const legacyBackground =
        theme === 'blue'
          ? '#fff'
          : `color.adjust(legacy.$ui-base-color, $lightness: ${theme === 'pastel' ? '23%' : '15%'}, $space: hsl)`;

      const { css } = compileString(
        `
        @use 'sass:color';
        @use 'app/javascript/styles/custom-themes/${theme}';
        @use 'app/javascript/styles/custom-themes/accent-theme' as accent;
        @use 'app/javascript/styles/custom-themes/legacy/${theme}' as legacy;

        @each $background in (
          #fff,
          ${legacyBackground},
          legacy.$ui-base-color,
          accent.accent-tone(#fff, 78%)
        ) {
          @if accent.contrast-ratio($background, accent.$light-link-card-border) < 3 {
            @error 'Light link card border has insufficient contrast against #{$background}';
          }
        }

        @each $background in (
          accent.accent-tone(#000, 82%),
          accent.accent-tone(#000, 89%)
        ) {
          @if accent.contrast-ratio($background, accent.$dark-link-card-border) < 3 {
            @error 'Dark link card border has insufficient contrast against #{$background}';
          }
        }

        .link-card-border-test-values {
          light: #{accent.$light-link-card-border};
          dark: #{accent.$dark-link-card-border};
        }
        `,
        { loadPaths: [process.cwd(), 'node_modules'] },
      );

      const values =
        /\.link-card-border-test-values\s*\{\s*light: ([^;]+);\s*dark: ([^;]+);/.exec(
          css,
        );
      expect(values).not.toBeNull();
      expect(css).toContain(`--color-link-card-border: ${values?.[1]};`);
      expect(css).toContain(`--color-link-card-border: ${values?.[2]};`);
    },
    30_000,
  );
});

describe('default theme link card borders', () => {
  it('uses a visible border on all default theme surfaces', () => {
    const { css } = compileString("@use 'app/javascript/styles/application';", {
      loadPaths: [process.cwd(), 'node_modules'],
    });
    const paletteColor = (name: string) => {
      const match = new RegExp(`--color-${name}: (#[\\da-fA-F]+);`).exec(css);
      if (!match?.[1]) {
        throw new Error(`Missing palette color: ${name}`);
      }
      return match[1];
    };
    const backgrounds = ['indigo', 'lime', 'pink', 'orange', 'cyan'];
    const lightForeground = paletteColor('grey-900');
    const darkForeground = paletteColor('grey-100');
    const contrasts = [
      [lightForeground, paletteColor('white')],
      ...backgrounds.flatMap((name) => [
        [lightForeground, paletteColor(`${name}-50`)],
        [darkForeground, paletteColor(`${name}-900`)],
        [darkForeground, paletteColor(`${name}-950`)],
      ]),
    ];

    expect(css).toContain(
      '--color-border-input: rgb(from var(--base-color-fg) r g b/70%);',
    );
    expect(css).toMatch(
      /\.status-card\s*\{[^}]*border: 1px solid var\(--color-link-card-border, var\(--color-border-input\)\);/,
    );

    compileString(
      `
      @use 'sass:color';
      @use 'app/javascript/styles/custom-themes/accent-theme' as accent;
      ${contrasts
        .map(
          ([foreground, background]) => `
            @if accent.contrast-ratio(color.mix(${foreground}, ${background}, 70%), ${background}) < 3 {
              @error 'Default link card border has insufficient contrast against ${background}';
            }
          `,
        )
        .join('\n')}
      `,
      { loadPaths: [process.cwd()] },
    );
  }, 30_000);
});
