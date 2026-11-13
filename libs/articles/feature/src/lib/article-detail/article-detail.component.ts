import { DatePipe } from '@angular/common';
import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AnnouncementsFacade } from '@blog/articles/data-access';
import { SSR_RESPONSE_STATUS } from '@blog/shared/util';
import { MarkdownPipe } from '@blog/shared/ui';
import { ArticleMetadataService } from './article-metadata.service';

@Component({
  selector: 'app-article-detail',
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.scss'],
  imports: [DatePipe, RouterLink, MarkdownPipe],
  providers: [ArticleMetadataService],
})
export class ArticleDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly facade = inject(AnnouncementsFacade);
  private readonly responseStatus = inject(SSR_RESPONSE_STATUS);
  private readonly metadata = inject(ArticleMetadataService);
  private articleId: number | null = null;

  readonly article = this.facade.publicArticle;
  readonly status = this.facade.publicArticleStatus;
  readonly error = this.facade.publicArticleError;
  readonly invalidId = signal(false);

  constructor() {
    effect(() => {
      const status = this.status();
      const article = this.article();
      if (!this.invalidId() && status === 'loaded' && article) this.metadata.apply(article);
      else this.metadata.reset(this.invalidId() || status === 'not-found' || status === 'error');
    });
    this.destroyRef.onDestroy(() => this.metadata.reset());
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const rawId = params.get('id');
      const id = rawId !== null && /^[1-9]\d*$/.test(rawId) ? Number(rawId) : NaN;
      this.invalidId.set(!Number.isSafeInteger(id) || id <= 0);
      if (this.invalidId()) {
        this.articleId = null;
        if (this.responseStatus) this.responseStatus.statusCode = 404;
        return;
      }
      this.articleId = id;
      void this.loadArticle(id);
    });
  }

  retry(): void {
    if (this.articleId !== null) void this.loadArticle(this.articleId);
  }

  private async loadArticle(id: number): Promise<void> {
    try {
      await this.facade.loadPublicArticleById(id);
    } catch {
      // The facade owns the current request state, including stale-request suppression.
    }
    this.updateResponseStatus();
  }

  private updateResponseStatus(): void {
    if (this.invalidId() || !this.responseStatus) return;
    const status = this.status();
    if (status === 'not-found') this.responseStatus.statusCode = 404;
    else if (status === 'error') this.responseStatus.statusCode = 500;
    else if (status === 'loaded') this.responseStatus.statusCode = 200;
  }
}
