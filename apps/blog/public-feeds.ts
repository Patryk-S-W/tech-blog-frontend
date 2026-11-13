import type { Express, Response } from 'express';
import {
  DEFAULT_SITE_DESCRIPTION, DEFAULT_SITE_TITLE, PUBLIC_SITE_ORIGIN,
  markdownSummary, publicArticleUrl, publishedDate,
} from '@blog/shared/util';

interface FeedArticle {
  id: number;
  title: string;
  text: string;
  publishedAt?: string | null;
}

const STATIC_PUBLIC_PATHS = ['', '/about-me', '/projects', '/recent-articles', '/hardware', '/ai'];

function xml(value: string): string {
  const valid = [...value].filter((character) => {
    const code = character.codePointAt(0)!;
    return code === 9 || code === 10 || code === 13 ||
      (code >= 0x20 && code <= 0xd7ff) || (code >= 0xe000 && code <= 0xfffd) || code >= 0x10000;
  }).join('');
  const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };
  return valid.replace(/[&<>"']/g, (character) => entities[character]);
}

export function sitemapXml(articles: FeedArticle[]): string {
  const urls = STATIC_PUBLIC_PATHS.map((path) => `<url><loc>${xml(`${PUBLIC_SITE_ORIGIN}${path || '/'}`)}</loc></url>`);
  for (const article of articles) {
    const date = publishedDate(article.publishedAt);
    urls.push(`<url><loc>${xml(publicArticleUrl(article.id))}</loc>${date ? `<lastmod>${xml(date)}</lastmod>` : ''}</url>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`;
}

export function rssXml(articles: FeedArticle[]): string {
  const items = articles.map((article) => {
    const url = xml(publicArticleUrl(article.id));
    const date = publishedDate(article.publishedAt);
    return `<item><title>${xml(article.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><description>${xml(markdownSummary(article.text))}</description>${date ? `<pubDate>${xml(new Date(date).toUTCString())}</pubDate>` : ''}</item>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${xml(DEFAULT_SITE_TITLE)}</title><link>${PUBLIC_SITE_ORIGIN}/</link><description>${xml(DEFAULT_SITE_DESCRIPTION)}</description>${items.join('')}</channel></rss>`;
}

export function robotsText(): string {
  return `User-agent: *\nDisallow: /admin\nDisallow: /login\nSitemap: ${PUBLIC_SITE_ORIGIN}/sitemap.xml\n`;
}

export async function loadPublishedFeedArticles(apiOrigin: string): Promise<FeedArticle[]> {
  const signal = AbortSignal.timeout(10_000);
  const articles = new Map<number, FeedArticle>();
  let totalPages = 1;
  let totalCount: number | undefined;
  // shortcut: reject archives needing a sitemap index; add an index before exceeding 50,000 total URLs.
  for (let page = 1; page <= totalPages; page++) {
    const response = await fetch(`${apiOrigin}/api/v1/blog/announcements?page=${page}&pageSize=100`, {
      signal, redirect: 'error', headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error('Public feed source unavailable');
    const result: unknown = await response.json();
    if (!result || typeof result !== 'object') throw new Error('Invalid public feed page');
    const data = result as Record<string, unknown>;
    if (!Array.isArray(data.items) || !Number.isSafeInteger(data.totalCount) || (data.totalCount as number) < 0 ||
      (data.totalCount as number) > 50_000 - STATIC_PUBLIC_PATHS.length ||
      data.page !== page || data.pageSize !== 100 || !Number.isSafeInteger(data.totalPages) ||
      (data.totalPages as number) < 0 || (data.totalPages as number) > 500 ||
      data.totalPages !== Math.ceil((data.totalCount as number) / 100) ||
      data.hasPrevious !== (page > 1) || data.hasNext !== (page < (data.totalPages as number)) ||
      data.items.length !== Math.min(100, Math.max(0, (data.totalCount as number) - (page - 1) * 100)) ||
      (totalCount !== undefined && (data.totalCount !== totalCount || data.totalPages !== totalPages))) {
      throw new Error('Invalid public feed page');
    }
    totalCount = data.totalCount as number;
    totalPages = data.totalPages as number;
    for (const value of data.items) {
      if (!value || typeof value !== 'object') throw new Error('Invalid public feed article');
      const item = value as Record<string, unknown>;
      if (item.isPublished === false) continue;
      if (!Number.isSafeInteger(item.id) || (item.id as number) <= 0 || typeof item.title !== 'string' ||
        typeof item.text !== 'string' || (item.publishedAt !== undefined && item.publishedAt !== null && typeof item.publishedAt !== 'string')) {
        throw new Error('Invalid public feed article');
      }
      const article: FeedArticle = {
        id: item.id as number, title: item.title, text: item.text,
        publishedAt: item.publishedAt as string | null | undefined,
      };
      if (!articles.has(article.id)) articles.set(article.id, article);
    }
  }
  return [...articles.values()];
}

export async function sendPublicFeed(response: Response, apiOrigin: string, format: 'sitemap' | 'rss'): Promise<void> {
  response.set('X-Content-Type-Options', 'nosniff');
  try {
    const articles = await loadPublishedFeedArticles(apiOrigin);
    response.type(format === 'sitemap' ? 'application/xml' : 'application/rss+xml')
      .send(format === 'sitemap' ? sitemapXml(articles) : rssXml(articles));
  } catch {
    response.status(502).type('text/plain').send('Public feeds are temporarily unavailable');
  }
}

export function registerPublicFeeds(server: Express, apiOrigin: string): void {
  server.get('/robots.txt', (_request, response) => { response.set('X-Content-Type-Options', 'nosniff').type('text/plain').send(robotsText()); });
  server.get('/sitemap.xml', async (_request, response) => { await sendPublicFeed(response, apiOrigin, 'sitemap'); });
  server.get('/rss.xml', async (_request, response) => { await sendPublicFeed(response, apiOrigin, 'rss'); });
}
