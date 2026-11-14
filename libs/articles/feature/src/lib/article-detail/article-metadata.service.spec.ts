import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { DEFAULT_SITE_DESCRIPTION, DEFAULT_SITE_TITLE, PUBLIC_SITE_ORIGIN } from '@blog/shared/util';
import { ArticleMetadataService } from './article-metadata.service';

describe('ArticleMetadataService', () => {
  const article = {
    id: 7, title: 'Łódź & "code" <img src=x onerror=alert(1)>', image: '/images/post.png',
    text: '# Heading\n\nA **short** [summary](https://example.invalid).',
    category: 'Tech', duration: '5', button: 'Read', isPublished: true, publishedAt: '2026-11-11T12:00:00Z',
  };
  beforeEach(() => TestBed.configureTestingModule({ providers: [ArticleMetadataService] }));
  afterEach(() => TestBed.inject(ArticleMetadataService).reset());

  it('sets escaped head metadata and one stable public canonical URL', () => {
    const document = TestBed.inject(DOCUMENT);
    for (let i = 0; i < 2; i++) {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = 'https://example.invalid/old';
      document.head.appendChild(link);
    }
    TestBed.inject(ArticleMetadataService).apply(article);
    const meta = TestBed.inject(Meta);
    expect(TestBed.inject(Title).getTitle()).toBe(`${article.title} - ${DEFAULT_SITE_TITLE}`);
    expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`${PUBLIC_SITE_ORIGIN}/blog/7`);
    expect(meta.getTag('property="og:title"')?.content).toBe(article.title);
    expect(meta.getTag('property="og:url"')?.content).toBe(`${PUBLIC_SITE_ORIGIN}/blog/7`);
    expect(meta.getTag('property="og:image"')?.content).toBe(`${PUBLIC_SITE_ORIGIN}/images/post.png`);
    expect(meta.getTag('name="twitter:card"')?.content).toBe('summary_large_image');
    expect(meta.getTag('name="description"')?.content).toContain('short summary');
    expect(meta.getTag('property="article:published_time"')?.content).toBe('2026-11-11T12:00:00.000Z');
    expect(document.head.querySelector('img')).toBeNull();
  });

  it('clears previous metadata for failures and restores indexing only for a loaded article', () => {
    const service = TestBed.inject(ArticleMetadataService);
    const meta = TestBed.inject(Meta);
    service.apply(article);
    service.reset(true);
    expect(TestBed.inject(Title).getTitle()).toBe(DEFAULT_SITE_TITLE);
    expect(meta.getTag('name="description"')?.content).toBe(DEFAULT_SITE_DESCRIPTION);
    expect(meta.getTag('name="robots"')?.content).toBe('noindex, follow');
    expect(TestBed.inject(DOCUMENT).querySelector('link[rel="canonical"]')).toBeNull();
    expect(meta.getTag('property="og:title"')).toBeNull();
    service.apply({ ...article, id: 8, image: 'javascript:alert(1)', publishedAt: 'invalid' });
    expect(meta.getTag('name="robots"')?.content).toBe('index, follow');
    expect(meta.getTag('property="og:image"')).toBeNull();
    expect(meta.getTag('name="twitter:image"')).toBeNull();
    expect(meta.getTag('property="article:published_time"')).toBeNull();
    service.reset();
    expect(meta.getTag('name="robots"')).toBeNull();
  });
});
