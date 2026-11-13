import type { Response as ExpressResponse } from 'express';
import { PUBLIC_SITE_ORIGIN } from '@blog/shared/util';
import { loadPublishedFeedArticles, robotsText, rssXml, sendPublicFeed, sitemapXml } from './public-feeds';

describe('public SEO feeds', () => {
  const origin = 'http://127.0.0.1:18080';
  const article = { id: 7, title: 'Łódź & "quotes" <tag>\'apostrophe', text: '**Plain** & "safe" content', publishedAt: '2026-11-11T12:00:00Z' };
  let originalFetch: PropertyDescriptor | undefined;
  let request: jest.Mock;
  beforeEach(() => {
    originalFetch = Object.getOwnPropertyDescriptor(globalThis, 'fetch');
    request = jest.fn();
    Object.defineProperty(globalThis, 'fetch', { configurable: true, writable: true, value: request });
  });
  afterEach(() => {
    if (originalFetch) Object.defineProperty(globalThis, 'fetch', originalFetch);
    else Reflect.deleteProperty(globalThis, 'fetch');
  });

  function page(items: unknown[], totalCount = items.length, number = 1) {
    const totalPages = Math.ceil(totalCount / 100);
    return { items, totalCount, page: number, pageSize: 100, totalPages, hasPrevious: number > 1, hasNext: number < totalPages };
  }
  function respond(data: unknown): void {
    request.mockResolvedValueOnce({ ok: true, json: async () => data });
  }

  it('collects all public metadata pages, deduplicates IDs and excludes explicit unpublished items', async () => {
    const items = Array.from({ length: 100 }, (_, index) => ({ ...article, id: index + 1 }));
    respond(page(items, 102));
    respond(page([{ ...article, id: 100, title: 'Duplicate' }, { ...article, id: 101, isPublished: false }], 102, 2));
    const articles = await loadPublishedFeedArticles(origin);
    expect(articles).toHaveLength(100);
    expect(articles.find((item) => item.id === 100)?.title).toBe(article.title);
    expect(articles.some((item) => item.id === 101)).toBe(false);
    expect(request).toHaveBeenCalledTimes(2);
    expect(request.mock.calls.map(([url]) => url)).toEqual([
      `${origin}/api/v1/blog/announcements?page=1&pageSize=100`,
      `${origin}/api/v1/blog/announcements?page=2&pageSize=100`,
    ]);
    expect(request.mock.calls[0][1]).toMatchObject({ redirect: 'error', headers: { Accept: 'application/json' } });
    expect(request.mock.calls[0][1].signal).toBeDefined();
  });

  it('handles an empty public archive without extra requests', async () => {
    respond(page([]));
    await expect(loadPublishedFeedArticles(origin)).resolves.toEqual([]);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it.each([
    null,
    { ...page([article]), page: 2 },
    { ...page([article]), pageSize: 50 },
    { ...page([article]), totalPages: 2 },
    { ...page([article]), totalCount: -1 },
    { ...page([article]), hasNext: true },
    { ...page([article]), items: [] },
    { ...page([article]), items: [{ ...article, id: 0 }] },
    { ...page([article]), totalCount: 50_000, totalPages: 500 },
  ])('rejects malformed or unbounded page responses', async (response) => {
    respond(response);
    await expect(loadPublishedFeedArticles(origin)).rejects.toThrow(/Invalid public feed/);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('rejects changing page metadata rather than returning a partial feed', async () => {
    respond(page(Array.from({ length: 100 }, (_, index) => ({ ...article, id: index + 1 })), 101));
    respond(page([article], 102, 2));
    await expect(loadPublishedFeedArticles(origin)).rejects.toThrow('Invalid public feed page');
  });

  it('escapes XML text and uses stable public GUIDs without invented dates or admin URLs', () => {
    const items = [article, { ...article, id: 8, publishedAt: '2026-02-30T12:00:00Z' }];
    const rss = rssXml(items);
    const sitemap = sitemapXml(items);
    for (const body of [rss, sitemap]) {
      expect(new DOMParser().parseFromString(body, 'application/xml').querySelector('parsererror')).toBeNull();
      expect(body).not.toContain(origin);
      expect(body).toContain(`${PUBLIC_SITE_ORIGIN}/blog/7`);
      expect(body).not.toMatch(/\/admin|\/login/);
    }
    expect(rss).toContain('Łódź &amp; &quot;quotes&quot; &lt;tag&gt;&apos;apostrophe');
    expect(rss).toContain('<guid isPermaLink="true">https://patryksadowski.pl/blog/7</guid>');
    expect(rss.match(/<pubDate>/g)).toHaveLength(1);
    expect(sitemap.match(/<lastmod>/g)).toHaveLength(1);
    expect(rssXml([{ ...article, publishedAt: null }])).not.toContain('<pubDate>');
    expect(rssXml([{ ...article, title: `Text${String.fromCharCode(0)}🧪` }])).toContain('<title>Text🧪</title>');
  });

  it('returns a controlled 502 without partial XML or upstream addresses when a later page fails', async () => {
    respond(page(Array.from({ length: 100 }, (_, index) => ({ ...article, id: index + 1 })), 101));
    request.mockRejectedValueOnce(new Error(`Unavailable ${origin}`));
    const response = {
      set: jest.fn().mockReturnThis(), status: jest.fn().mockReturnThis(),
      type: jest.fn().mockReturnThis(), send: jest.fn().mockReturnThis(),
    };
    await sendPublicFeed(response as unknown as ExpressResponse, origin, 'rss');
    expect(response.status).toHaveBeenCalledWith(502);
    expect(response.type).toHaveBeenCalledWith('text/plain');
    expect(response.send).toHaveBeenCalledTimes(1);
    expect(response.send).toHaveBeenCalledWith('Public feeds are temporarily unavailable');
    expect(response.send.mock.calls[0][0]).not.toContain(origin);
  });

  it('treats non-success upstream responses as errors', async () => {
    request.mockResolvedValueOnce({ ok: false });
    await expect(loadPublishedFeedArticles(origin)).rejects.toThrow('Public feed source unavailable');
  });

  it('serves successful XML with safe headers', async () => {
    respond(page([article]));
    const response = {
      set: jest.fn().mockReturnThis(), status: jest.fn().mockReturnThis(),
      type: jest.fn().mockReturnThis(), send: jest.fn().mockReturnThis(),
    };
    await sendPublicFeed(response as unknown as ExpressResponse, origin, 'sitemap');
    expect(response.set).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
    expect(response.type).toHaveBeenCalledWith('application/xml');
    expect(response.send).toHaveBeenCalledWith(expect.stringContaining('<urlset'));
    expect(response.status).not.toHaveBeenCalled();
  });

  it('publishes only canonical public links in robots.txt', () => {
    expect(robotsText()).toBe(`User-agent: *\nDisallow: /admin\nDisallow: /login\nSitemap: ${PUBLIC_SITE_ORIGIN}/sitemap.xml\n`);
    expect(robotsText()).not.toContain(origin);
  });
});
