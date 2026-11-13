import { markdownSummary, publicArticleUrl, publicImageUrl, publishedDate, PUBLIC_SITE_ORIGIN } from './site-metadata';

describe('public metadata values', () => {
  it('extracts short plain text without Markdown destinations, images or HTML blocks', () => {
    const summary = markdownSummary('# Hello **world**\n\nA [safe link](https://example.invalid) ![image](javascript:alert(1))\n\n<script>hidden()</script>');
    expect(summary).toContain('Hello world');
    expect(summary).toContain('A safe link');
    expect(summary).not.toMatch(/https:|javascript:|<|>|hidden/);
    expect([...markdownSummary('🧪'.repeat(200))]).toHaveLength(160);
  });

  it('uses a stable numeric permalink and resolves relative images against the public origin', () => {
    expect(publicArticleUrl(7)).toBe(`${PUBLIC_SITE_ORIGIN}/blog/7`);
    expect(publicImageUrl('/images/post.png')).toBe(`${PUBLIC_SITE_ORIGIN}/images/post.png`);
    expect(publicImageUrl('https://example.invalid/image.png')).toBe('https://example.invalid/image.png');
  });

  it.each(['', 'javascript:alert(1)', 'data:image/svg+xml,<svg/>', 'http://[invalid'])('rejects unsafe or invalid image URL %s', (url) => {
    expect(publicImageUrl(url)).toBeNull();
  });

  it.each([null, undefined, '', 'not-a-date', '11', '2026-02-30T12:00:00Z'])('omits unknown or invalid publication dates %s', (date) => {
    expect(publishedDate(date)).toBeNull();
  });

  it('preserves genuine publication timestamps', () => {
    expect(publishedDate('2026-11-11T12:00:00Z')).toBe('2026-11-11T12:00:00.000Z');
  });
});
