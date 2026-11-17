import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MarkdownPipe } from '@blog/shared/ui';
import { AnnouncementsFacade, categorySlug, categoryTranslationKey } from '@blog/articles/data-access';
import { UiPreferencesService } from '@blog/shared/util';
import { filter, startWith } from 'rxjs';
import { DatePipe } from '@angular/common';
import { TranslocoModule } from '@ngneat/transloco';

@Component({
  selector: 'app-recent-articles',
  templateUrl: './recent-articles.component.html',
  styleUrls: ['./recent-articles.component.scss'],
  imports: [FormsModule, RouterLink, MarkdownPipe, DatePipe, TranslocoModule],
})
export class RecentArticlesComponent implements OnInit {
  readonly categoryTranslationKey = categoryTranslationKey;
  private readonly announcementsFacade = inject(AnnouncementsFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly preferences = inject(UiPreferencesService);
  private validQuery = false;
  private readonly categoriesReady = signal(false);
  private readonly waitingForCategory = signal(false);
  private lastRequestKey: string | undefined;
  readonly invalidCategory = signal(false);

  readonly archivePage = computed(() => this.waitingForCategory() || this.invalidCategory() ? null : this.announcementsFacade.archivePage());
  readonly isLoading = computed(() => !this.waitingForCategory() && !this.invalidCategory() && this.announcementsFacade.archiveIsLoading());
  readonly error = computed(() => this.waitingForCategory() || this.invalidCategory() ? null : this.announcementsFacade.archiveError());
  readonly categories = this.announcementsFacade.categories;
  readonly categoriesError = this.announcementsFacade.categoriesError;
  readonly selectedCategory = signal('');
  readonly currentPage = signal(1);
  readonly categoriesLoading = signal(false);

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        startWith(null),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.applyRoute());
    this.preferences.languageChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.validQuery) void this.loadPage(this.currentPage(), this.selectedCategory() || undefined);
    });
    void this.retryCategories();
  }

  onCategoryChange(category: string): void {
    if (category === this.selectedCategory()) return;
    void this.router.navigate(category ? ['/recent-articles', categorySlug(category)] : ['/recent-articles']).catch(() => {});
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
    if (this.isLoading() || !this.validQuery) return;
    this.lastRequestKey = undefined;
    void this.loadPage(this.currentPage(), this.selectedCategory() || undefined);
  }

  async retryCategories(): Promise<void> {
    if (this.categoriesLoading()) return;
    this.categoriesLoading.set(true);
    try {
      await this.announcementsFacade.loadCategories();
      if (this.destroyRef.destroyed) return;
      this.categoriesReady.set(true);
      this.applyRoute();
    } catch {
      // The facade exposes the category error independently from archive results.
    } finally {
      this.categoriesLoading.set(false);
    }
  }

  private applyRoute(): void {
    this.validQuery = false;
    const slug = this.route.snapshot.paramMap.get('categorySlug');
    this.waitingForCategory.set(!!slug && !this.categoriesReady());
    if (this.waitingForCategory()) {
      this.lastRequestKey = undefined;
      return;
    }
    const category = slug ? this.categories().find((name) => categorySlug(name) === slug) : '';
    this.invalidCategory.set(!!slug && category === undefined);
    this.selectedCategory.set(category ?? slug ?? '');
    if (this.invalidCategory()) {
      this.lastRequestKey = undefined;
      return;
    }
    const rawPage = this.route.snapshot.queryParamMap.get('page');
    const parsedPage = rawPage === null ? 1 : /^\d+$/.test(rawPage) ? Number(rawPage) : NaN;
    if (!Number.isSafeInteger(parsedPage) || parsedPage < 1 || parsedPage > MAX_PAGE) {
      this.currentPage.set(1);
      this.setPage(1, true);
      return;
    }
    this.currentPage.set(parsedPage);
    this.validQuery = true;
    void this.loadPage(parsedPage, category || undefined);
  }

  private async loadPage(page: number, category?: string): Promise<void> {
    const language = this.preferences.language();
    const requestKey = JSON.stringify([language, page, category]);
    if (requestKey === this.lastRequestKey) return;
    this.lastRequestKey = requestKey;
    try {
      await this.announcementsFacade.loadArchive(page, category);
    } catch {
      return;
    }
    if (requestKey !== this.lastRequestKey || language !== this.preferences.language() || this.currentPage() !== page || this.selectedCategory() !== (category ?? '')) return;
    const result = this.archivePage();
    if (result && page > Math.max(1, result.totalPages)) this.setPage(1, true);
  }

  private setPage(page: number, replaceUrl = false): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page > 1 ? page : null },
      replaceUrl,
    }).catch(() => {});
  }

  trackById(index: number, item: { id: number }): number {
    return item.id;
  }
}

const PAGE_SIZE = 10;
const MAX_PAGE = Math.floor(2_147_483_647 / PAGE_SIZE) + 1;
