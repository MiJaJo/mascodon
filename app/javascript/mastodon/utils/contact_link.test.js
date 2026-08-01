import { describe, expect, it } from 'vitest';

import { getContactHref } from './contact_link';

describe('getContactHref', () => {
  it('returns a mailto link for email addresses', () => {
    expect(getContactHref('admin@example.com')).toBe('mailto:admin@example.com');
  });

  it('returns a URL as-is for external links', () => {
    expect(getContactHref('https://forms.gle/abc123')).toBe('https://forms.gle/abc123');
  });

  it('adds https:// for bare domains', () => {
    expect(getContactHref('docs.google.com/forms/viewform?usp=sf_link')).toBe('https://docs.google.com/forms/viewform?usp=sf_link');
  });
});
