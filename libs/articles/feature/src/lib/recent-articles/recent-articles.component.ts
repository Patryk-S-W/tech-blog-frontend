import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MarkdownPipe } from '@blog/shared/ui';
import { AnnouncementsFacade } from '@blog/articles/data-access';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-recent-articles',
  templateUrl: './recent-articles.component.html',
  styleUrls: ['./recent-articles.component.scss'],
  imports: [FormsModule, RouterLink, MarkdownPipe, DatePipe],
})
export class RecentArticlesComponent implements OnInit {
  private readonly announcementsFacade = inject(AnnouncementsFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly archivePage = this.announcementsFacade.archivePage;
  readonly isLoading = this.announcementsFacade.archiveIsLoading;
  readonly error = this.announcementsFacade.archiveError;
  readonly categories = this.announcementsFacade.categories;
  readonly categoriesError = this.announcementsFacade.categoriesError;
  readonly selectedCategory = signal('');
  readonly currentPage = signal(1);
  readonly categoriesLoading = signal(false);

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => this.applyQuery(params.get('page'), params.get('category')));
    void this.retryCategories();
  }

  onCategoryChange(category: string): void {
    if (category === this.selectedCategory()) return;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: category || null, page: null },
      queryParamsHandling: 'merge',
    }).catch(() => {});
  }

  previousPage(): void {
    if (this.isLoading() || !this.archivePage()?.hasPrevious) return;
    this.setPage(this.currentPage() - 1);
  }

  nextPage(): void {
    if (this.isLoading() || !this.archivePage()?.hasNext) return;
    this.setPage(this.currentPage() + 1);
  }

  retryArchive(): void {
    if (this.isLoading()) return;
    void this.loadPage(this.currentPage(), this.selectedCategory() || undefined);
  }

  async retryCategories(): Promise<void> {
    if (this.categoriesLoading()) return;
    this.categoriesLoading.set(true);
    try {
      await this.announcementsFacade.loadCategories();
    } catch {
      // The facade exposes the category error independently from archive results.
    } finally {
      this.categoriesLoading.set(false);
    }
  }

  private applyQuery(rawPage: string | null, category: string | null): void {
    this.selectedCategory.set(category ?? '');
    const parsedPage = rawPage === null ? 1 : /^\d+$/.test(rawPage) ? Number(rawPage) : NaN;
    if (!Number.isSafeInteger(parsedPage) || parsedPage < 1 || parsedPage > MAX_PAGE) {
      this.currentPage.set(1);
      this.setPage(1, true);
      return;
    }
    this.currentPage.set(parsedPage);
    void this.loadPage(parsedPage, category || undefined);
  }

  private async loadPage(page: number, category?: string): Promise<void> {
    try {
      await this.announcementsFacade.loadArchive(page, category);
    } catch {
      return;
    }
    if (this.currentPage() !== page || this.selectedCategory() !== (category ?? '')) return;
    const result = this.archivePage();
    if (result && page > Math.max(1, result.totalPages)) this.setPage(1, true);
  }

  private setPage(page: number, replaceUrl = false): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page > 1 ? page : null },
      queryParamsHandling: 'merge',
      replaceUrl,
    }).catch(() => {});
  }

  trackById(index: number, item: { id: number }): number {
    return item.id;
  }
}

const PAGE_SIZE = 10;
const MAX_PAGE = Math.floor(2_147_483_647 / PAGE_SIZE) + 1;
