import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { AnnouncementDto } from '@blog/articles/entity';
import {
  DEFAULT_SITE_DESCRIPTION, DEFAULT_SITE_TITLE, markdownSummary,
  publicArticleUrl, publicImageUrl, publishedDate,
} from '@blog/shared/util';

@Injectable()
export class ArticleMetadataService {
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  reset(noindex = false): void {
    this.title.setTitle(DEFAULT_SITE_TITLE);
    this.meta.updateTag({ name: 'description', content: DEFAULT_SITE_DESCRIPTION });
    this.document.querySelectorAll('link[rel="canonical"]').forEach((link) => link.remove());
    for (const selector of [
      'name="robots"', 'property="og:type"', 'property="og:site_name"',
      'property="og:title"', 'property="og:description"', 'property="og:url"',
      'property="og:image"', 'property="article:published_time"',
      'name="twitter:card"', 'name="twitter:title"', 'name="twitter:description"', 'name="twitter:image"',
    ]) {
      this.meta.getTags(selector).forEach((tag) => this.meta.removeTagElement(tag));
    }
    if (noindex) this.meta.addTag({ name: 'robots', content: 'noindex, follow' });
  }

  apply(article: AnnouncementDto): void {
    this.reset();
    const description = markdownSummary(article.text) || DEFAULT_SITE_DESCRIPTION;
    const url = publicArticleUrl(article.id);
    const image = publicImageUrl(article.image);
    const published = publishedDate(article.publishedAt);
    this.title.setTitle(`${article.title} - ${DEFAULT_SITE_TITLE}`);
    this.meta.updateTag({ name: 'description', content: description });
    const canonical = this.document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = url;
    this.document.head.appendChild(canonical);
    this.meta.addTags([
      { name: 'robots', content: 'index, follow' },
      { property: 'og:type', content: 'article' },
      { property: 'og:site_name', content: DEFAULT_SITE_TITLE },
      { property: 'og:title', content: article.title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' },
      { name: 'twitter:title', content: article.title },
      { name: 'twitter:description', content: description },
    ]);
    if (image) this.meta.addTags([{ property: 'og:image', content: image }, { name: 'twitter:image', content: image }]);
    if (published) this.meta.addTag({ property: 'article:published_time', content: published });
  }
}
