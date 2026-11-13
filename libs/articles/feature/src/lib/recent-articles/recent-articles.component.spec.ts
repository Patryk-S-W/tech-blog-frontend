import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AnnouncementsFacade } from '@blog/articles/data-access';
import { AnnouncementDto } from '@blog/articles/entity';
import { RecentArticlesComponent } from './recent-articles.component';

interface ArchivePage {
  items: AnnouncementDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

describe('RecentArticlesComponent', () => {
  let fixture: ComponentFixture<RecentArticlesComponent>;
  let routeParams: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let router: Router;
  let navigate: jest.SpyInstance;
  let facade: {
    archivePage: ReturnType<typeof signal<ArchivePage | null>>;
    archiveIsLoading: ReturnType<typeof signal<boolean>>;
    archiveError: ReturnType<typeof signal<string | null>>;
    categories: ReturnType<typeof signal<string[]>>;
    categoriesError: ReturnType<typeof signal<string | null>>;
    loadArchive: jest.Mock<Promise<void>, [number, string?]>;
    loadCategories: jest.Mock<Promise<void>, []>;
  };

  const article: AnnouncementDto = {
    id: 7,
    title: 'Archive article',
    image: '',
    text: 'Article body',
    category: 'AI',
    duration: '5 min',
    button: 'Read',
    publishedAt: '2026-11-11T12:00:00Z',
  };

  beforeEach(async () => {
    facade = {
      archivePage: signal<ArchivePage | null>(null),
      archiveIsLoading: signal(false),
      archiveError: signal<string | null>(null),
      categories: signal<string[]>(['AI', 'Hardware']),
      categoriesError: signal<string | null>(null),
      loadArchive: jest.fn(async (page: number) => {
        facade.archivePage.set({
          items: [],
          totalCount: 0,
          page,
          pageSize: 10,
          totalPages: 4,
          hasPrevious: page > 1,
          hasNext: page < 4,
        });
      }),
      loadCategories: jest.fn().mockResolvedValue(undefined),
    };
    routeParams = new BehaviorSubject(convertToParamMap({}));
    await TestBed.configureTestingModule({
      imports: [RecentArticlesComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { queryParamMap: routeParams.asObservable() } },
        { provide: AnnouncementsFacade, useValue: facade },
      ],
    }).compileComponents();
  });

  function render(query: Record<string, string> = {}): void {
    routeParams.next(convertToParamMap(query));
    fixture = TestBed.createComponent(RecentArticlesComponent);
    router = TestBed.inject(Router);
    navigate = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  }

  it('restores query filters, pages from API flags, and responds to browser back changes', async () => {
    render({ page: '2', category: 'AI' });
    await fixture.whenStable();
    expect(facade.loadArchive).toHaveBeenCalledWith(2, 'AI');

    fixture.componentInstance.nextPage();
    expect(navigate).toHaveBeenLastCalledWith([], expect.objectContaining({
      queryParams: { page: 3 },
      queryParamsHandling: 'merge',
    }));
    routeParams.next(convertToParamMap({ page: '3', category: 'AI' }));
    await fixture.whenStable();
    expect(facade.loadArchive).toHaveBeenLastCalledWith(3, 'AI');

    fixture.componentInstance.onCategoryChange('Hardware');
    expect(navigate).toHaveBeenLastCalledWith([], expect.objectContaining({
      queryParams: { category: 'Hardware', page: null },
      queryParamsHandling: 'merge',
    }));
    routeParams.next(convertToParamMap({ category: 'AI' }));
    await fixture.whenStable();
    expect(facade.loadArchive).toHaveBeenLastCalledWith(1, 'AI');
  });

  it('keeps known and unknown bookmarked categories selected as options load asynchronously', async () => {
    facade.categories.set([]);
    facade.loadCategories.mockImplementationOnce(async () => {
      await Promise.resolve();
      facade.categories.set(['AI', 'Hardware']);
    });
    render({ category: 'AI' });
    await facade.loadCategories.mock.results[0].value;
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#article-category').value).toBe('AI');

    routeParams.next(convertToParamMap({ category: 'Legacy category' }));
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(facade.loadArchive).toHaveBeenLastCalledWith(1, 'Legacy category');
    expect(fixture.nativeElement.querySelector('#article-category').value).toBe('Legacy category');
  });

  it('normalizes invalid and unsafe page query values before loading', () => {
    render({ page: '99999999999999999999', category: 'AI' });
    expect(facade.loadArchive).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith([], expect.objectContaining({
      queryParams: { page: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    }));
  });

  it('renders an explicit empty state from the paginated response', () => {
    render();
    facade.archivePage.set({
      items: [], totalCount: 0, page: 1, pageSize: 10, totalPages: 0,
      hasPrevious: false, hasNext: false,
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No articles found.');
  });

  it('retries archive errors and respects page boundaries while pending', async () => {
    facade.archiveError.set('Failed to load articles');
    facade.loadArchive.mockImplementationOnce(async () => {
      facade.archiveIsLoading.set(true);
      await Promise.resolve();
      facade.archiveError.set('Failed to load articles');
      facade.archiveIsLoading.set(false);
      throw new Error('offline');
    });
    render({ page: '4' });
    await expect(facade.loadArchive.mock.results[0].value).rejects.toThrow('offline');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Failed to load articles');
    expect(fixture.nativeElement.querySelector('button').textContent).toContain('Retry');

    fixture.componentInstance.retryArchive();
    await facade.loadArchive.mock.results[1].value;
    await fixture.whenStable();
    facade.archivePage.set({
      items: [], totalCount: 40, page: 4, pageSize: 10, totalPages: 4,
      hasPrevious: true, hasNext: false,
    });
    facade.archiveIsLoading.set(true);
    fixture.detectChanges();
    fixture.componentInstance.nextPage();
    fixture.componentInstance.retryArchive();
    expect(facade.loadArchive).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.querySelector('.archive-pagination button:last-child').disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('.archive-pagination button:first-child').disabled).toBe(true);
    facade.archiveIsLoading.set(false);
    fixture.componentInstance.previousPage();
    expect(navigate).toHaveBeenCalledWith([], expect.objectContaining({ queryParams: { page: 3 } }));
  });

  it('keeps archive cards usable when category loading fails and can retry categories', async () => {
    facade.loadCategories.mockImplementationOnce(async () => {
      await Promise.resolve();
      facade.categoriesError.set('Failed to load categories');
      throw new Error('offline');
    });
    render();
    await expect(facade.loadCategories.mock.results[0].value).rejects.toThrow('offline');
    await fixture.whenStable();
    facade.archivePage.set({
      items: [article], totalCount: 1, page: 1, pageSize: 10, totalPages: 1,
      hasPrevious: false, hasNext: false,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Archive article');
    expect(fixture.nativeElement.textContent).toContain("Couldn't load categories.");
    expect(fixture.nativeElement.textContent).toContain('Retry categories');
    expect(fixture.nativeElement.querySelector('a[href="/blog/7"]')).not.toBeNull();
    await fixture.componentInstance.retryCategories();
    expect(facade.loadCategories).toHaveBeenCalledTimes(2);
  });
});
