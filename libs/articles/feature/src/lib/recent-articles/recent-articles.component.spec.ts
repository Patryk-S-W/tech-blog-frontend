import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, NavigationEnd, provideRouter, Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { AnnouncementsFacade } from '@blog/articles/data-access';
import { AnnouncementDto, PagedResult } from '@blog/articles/entity';
import { RecentArticlesComponent } from './recent-articles.component';
import { INITIAL_UI_LANGUAGE, LANGUAGE_STORAGE_KEY, UiPreferencesService } from '@blog/shared/util';
import { TranslocoTestingModule } from '@ngneat/transloco';

describe('RecentArticlesComponent', () => {
  let fixture: ComponentFixture<RecentArticlesComponent>;
  let route: {
    snapshot: { paramMap: ReturnType<typeof convertToParamMap>; queryParamMap: ReturnType<typeof convertToParamMap> };
    paramMap: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
    queryParamMap: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  };
  let events: Subject<NavigationEnd>;
  let navigate: jest.SpyInstance;
  let facade: {
    archivePage: ReturnType<typeof signal<PagedResult<AnnouncementDto> | null>>;
    archiveIsLoading: ReturnType<typeof signal<boolean>>;
    archiveError: ReturnType<typeof signal<string | null>>;
    categories: ReturnType<typeof signal<string[]>>;
    categoriesError: ReturnType<typeof signal<string | null>>;
    loadArchive: jest.Mock<Promise<void>, [number, string?]>;
    loadCategories: jest.Mock<Promise<void>, []>;
  };
  const article: AnnouncementDto = {
    id: 7, title: 'Archive article', image: '', text: 'Article body', category: 'AI',
    duration: '5 min', button: 'Read', isPublished: true, publishedAt: '2026-11-11T12:00:00Z',
  };
  function page(number: number, items: AnnouncementDto[] = []): PagedResult<AnnouncementDto> {
    return { items, totalCount: 40, page: number, pageSize: 10, totalPages: 4, hasPrevious: number > 1, hasNext: number < 4 };
  }

  beforeEach(async () => {
    localStorage.removeItem(LANGUAGE_STORAGE_KEY);
    events = new Subject<NavigationEnd>();
    route = {
      snapshot: { paramMap: convertToParamMap({}), queryParamMap: convertToParamMap({}) },
      paramMap: new BehaviorSubject(convertToParamMap({})),
      queryParamMap: new BehaviorSubject(convertToParamMap({})),
    };
    facade = {
      archivePage: signal<PagedResult<AnnouncementDto> | null>(null), archiveIsLoading: signal(false),
      archiveError: signal<string | null>(null), categories: signal(['AI', 'Hardware', 'Bezpieczeństwo']),
      categoriesError: signal<string | null>(null),
      loadArchive: jest.fn(async (number: number) => {
        facade.archiveError.set(null);
        facade.archivePage.set(page(number));
      }),
      loadCategories: jest.fn().mockResolvedValue(undefined),
    };
    await TestBed.configureTestingModule({
      imports: [RecentArticlesComponent, TranslocoTestingModule.forRoot({
        langs: { en: { articles: {
          archiveTitle: 'Articles', category: 'Category', allCategories: 'All categories',
          notFound: 'No articles found.', retry: 'Retry', retryCategories: 'Retry categories',
          archiveError: "Couldn't load articles. Please try again.", categoriesError: "Couldn't load categories.",
          loading: 'Loading', pagesLabel: 'Pages', previous: 'Previous', next: 'Next', pageLabel: 'Page', of: 'of', count: '{{ count }} articles',
        }, categories: { ai: 'AI', hardware: 'Hardware', bezpieczenstwo: 'Security' } }, pl: {} },
        translocoConfig: { availableLangs: ['pl', 'en'], defaultLang: 'en' }, preloadLangs: true,
      })],
      providers: [provideRouter([]),
        { provide: ActivatedRoute, useValue: route }, { provide: AnnouncementsFacade, useValue: facade },
        { provide: INITIAL_UI_LANGUAGE, useValue: 'pl' }],
    }).compileComponents();
    const router = TestBed.inject(Router);
    jest.spyOn(router, 'events', 'get').mockReturnValue(events);
    navigate = jest.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  function setRoute(slug?: string, query: Record<string, string> = {}): void {
    route.snapshot = { paramMap: convertToParamMap(slug ? { categorySlug: slug } : {}), queryParamMap: convertToParamMap(query) };
    route.paramMap.next(route.snapshot.paramMap);
    route.queryParamMap.next(route.snapshot.queryParamMap);
  }
  function render(slug?: string, query: Record<string, string> = {}): void {
    setRoute(slug, query);
    fixture = TestBed.createComponent(RecentArticlesComponent);
    fixture.detectChanges();
  }
  async function go(slug?: string, query: Record<string, string> = {}): Promise<void> {
    setRoute(slug, query);
    const url = '/recent-articles' + (slug ? '/' + slug : '');
    events.next(new NavigationEnd(1, url, url));
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it.each([['hardware', 'Hardware'], ['bezpieczenstwo', 'Bezpieczeństwo']])('maps /%s to the exact API label after catalog loading', async (slug, label) => {
    let resolve!: () => void;
    facade.categories.set([]);
    facade.loadCategories.mockImplementationOnce(() => new Promise<void>((done) => { resolve = done; }));
    render(slug);
    expect(facade.loadArchive).not.toHaveBeenCalled();
    facade.categories.set(['Hardware', 'Bezpieczeństwo']);
    resolve();
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(facade.loadArchive).toHaveBeenCalledTimes(1);
    expect(facade.loadArchive).toHaveBeenCalledWith(1, label);
    expect(fixture.nativeElement.querySelector('#article-category').value).toBe(label);
  });

  it('restores path filters, paginates on that path, and responds to back navigation', async () => {
    render('hardware', { page: '2' });
    await fixture.whenStable();
    expect(facade.loadArchive).toHaveBeenCalledWith(2, 'Hardware');
    fixture.componentInstance.nextPage();
    expect(navigate).toHaveBeenLastCalledWith([], { relativeTo: route, queryParams: { page: 3 }, replaceUrl: false });
    await go('hardware', { page: '3' });
    expect(facade.loadArchive).toHaveBeenLastCalledWith(3, 'Hardware');
    fixture.componentInstance.previousPage();
    expect(navigate).toHaveBeenLastCalledWith([], { relativeTo: route, queryParams: { page: 2 }, replaceUrl: false });
    fixture.componentInstance.onCategoryChange('Bezpieczeństwo');
    expect(navigate).toHaveBeenLastCalledWith(['/recent-articles', 'bezpieczenstwo']);
    await go('bezpieczenstwo');
    expect(facade.loadArchive).toHaveBeenLastCalledWith(1, 'Bezpieczeństwo');
    await go('hardware', { page: '2' });
    expect(facade.loadArchive).toHaveBeenLastCalledWith(2, 'Hardware');
    fixture.componentInstance.onCategoryChange('');
    expect(navigate).toHaveBeenLastCalledWith(['/recent-articles']);
  });

  it('refetches in place for language changes but ignores duplicate and unrelated-query navigation', async () => {
    render('hardware', { page: '2' });
    await fixture.whenStable();
    const preferences = TestBed.inject(UiPreferencesService);
    preferences.setLanguage('en');
    await go('hardware', { page: '2', lang: 'en' });
    await go('hardware', { page: '2' });
    expect(facade.loadArchive).toHaveBeenCalledTimes(2);
    expect(facade.loadArchive).toHaveBeenLastCalledWith(2, 'Hardware');
    expect(facade.loadCategories).toHaveBeenCalledTimes(1);
    expect(navigate).not.toHaveBeenCalled();
    fixture.destroy();
    preferences.setLanguage('pl');
    expect(facade.loadArchive).toHaveBeenCalledTimes(2);
  });

  it.each(['not-a-page', '0', '99999999999999999999', '214748366'])('normalizes invalid page %s without loading it on language changes', async (value) => {
    render('hardware', { page: value });
    await fixture.whenStable();
    TestBed.inject(UiPreferencesService).setLanguage('en');
    expect(facade.loadArchive).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith([], { relativeTo: route, queryParams: { page: null }, replaceUrl: true });
    await go('hardware');
    expect(facade.loadArchive).toHaveBeenLastCalledWith(1, 'Hardware');
  });

  it('shows an honest empty state for unknown slugs rather than requesting all articles', async () => {
    render('unknown-category');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(facade.loadArchive).not.toHaveBeenCalled();
    expect(fixture.componentInstance.invalidCategory()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('No articles found.');
    await go();
    expect(facade.loadArchive).toHaveBeenCalledWith(1, undefined);
  });

  it('renders an explicit empty paginated response', async () => {
    render();
    await fixture.whenStable();
    facade.archivePage.set({ ...page(1), totalCount: 0, totalPages: 0, hasNext: false });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No articles found.');
  });

  it('retries archive failures, renders recovered cards, and respects pending page boundaries', async () => {
    facade.loadArchive.mockImplementationOnce(async () => {
      facade.archiveError.set('Failed to load articles');
      throw new Error('offline');
    });
    render(undefined, { page: '4' });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Couldn't load articles. Please try again.");
    fixture.componentInstance.retryArchive();
    await fixture.whenStable();
    facade.archivePage.set(page(4, [article]));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Archive article');
    expect(fixture.nativeElement.querySelector('a[href="/blog/7"]')).not.toBeNull();
    facade.archiveIsLoading.set(true);
    fixture.detectChanges();
    fixture.componentInstance.nextPage();
    fixture.componentInstance.previousPage();
    fixture.componentInstance.retryArchive();
    expect(facade.loadArchive).toHaveBeenCalledTimes(2);
    expect(navigate).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.archive-pagination button:last-child').disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('.archive-pagination button:first-child').disabled).toBe(true);
    facade.archiveIsLoading.set(false);
    fixture.componentInstance.previousPage();
    expect(navigate).toHaveBeenCalledWith([], expect.objectContaining({ queryParams: { page: 3 } }));
  });

  it.each([undefined, 'hardware'])('keeps catalog failures independent from the archive at slug %s and retries mapping safely', async (slug) => {
    facade.loadCategories.mockImplementationOnce(async () => {
      facade.categoriesError.set('Failed to load categories');
      throw new Error('offline');
    });
    render(slug);
    await fixture.whenStable();
    if (slug) {
      expect(facade.loadArchive).not.toHaveBeenCalled();
    } else {
      expect(facade.loadArchive).toHaveBeenCalledWith(1, undefined);
      facade.archivePage.set(page(1, [article]));
    }
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Couldn't load categories.");
    expect(fixture.nativeElement.textContent).toContain('Retry categories');
    expect(fixture.nativeElement.textContent.includes('Archive article')).toBe(!slug);
    await fixture.componentInstance.retryCategories();
    expect(facade.loadCategories).toHaveBeenCalledTimes(2);
    expect(facade.loadArchive).toHaveBeenCalledTimes(1);
    expect(facade.loadArchive).toHaveBeenLastCalledWith(1, slug ? 'Hardware' : undefined);
  });
});
