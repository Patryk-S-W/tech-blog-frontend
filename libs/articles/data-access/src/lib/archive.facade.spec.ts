import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AnnouncementDto, PagedResult } from '@blog/articles/entity';
import { AnnouncementsFacade } from './announcements.facade';

describe('article archive', () => {
  const article: AnnouncementDto = {
    id: 1, title: 'Article', image: '', text: 'Body', category: 'C# & .NET',
    duration: '5', button: 'Read', isPublished: true, publishedAt: null,
  };
  function page(number: number): PagedResult<AnnouncementDto> {
    return {
      items: [{ ...article, id: number }], totalCount: 25, page: number, pageSize: 10,
      totalPages: 3, hasPrevious: number > 1, hasNext: number < 3,
    };
  }
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] }));
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('requests fixed-size public pages with encoded category and preserves all metadata', async () => {
    const facade = TestBed.inject(AnnouncementsFacade);
    expect(facade.archivePage()).toBeNull();
    const pending = facade.loadArchive(2, article.category);
    expect(facade.archiveIsLoading()).toBe(true);
    const request = TestBed.inject(HttpTestingController).expectOne((req) =>
      req.url === '/api/v1/blog/announcements' && req.params.get('page') === '2');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('pageSize')).toBe('10');
    expect(request.request.params.get('category')).toBe(article.category);
    expect(request.request.urlWithParams).toContain('category=C%23%20%26%20.NET');
    expect(request.request.transferCache).toBe(false);
    request.flush(page(2));
    await pending;
    expect(facade.archivePage()).toEqual(page(2));
    expect(facade.archiveIsLoading()).toBe(false);
    expect(facade.archiveError()).toBeNull();
  });

  it.each([200, 500])('ignores an older page response with status %s', async (status) => {
    const facade = TestBed.inject(AnnouncementsFacade);
    const http = TestBed.inject(HttpTestingController);
    const older = facade.loadArchive(1);
    const newer = facade.loadArchive(2);
    const oldRequest = http.expectOne('/api/v1/blog/announcements?page=1&pageSize=10');
    const newRequest = http.expectOne('/api/v1/blog/announcements?page=2&pageSize=10');
    expect(newRequest.request.params.has('category')).toBe(false);
    newRequest.flush(page(2));
    await newer;
    oldRequest.flush(page(1), { status, statusText: status === 200 ? 'OK' : 'Server Error' });
    await older;
    expect(facade.archivePage()).toEqual(page(2));
    expect(facade.archiveError()).toBeNull();
    expect(facade.archiveIsLoading()).toBe(false);
  });

  it('preserves the latest failure against an older success and clears errors on retry', async () => {
    const facade = TestBed.inject(AnnouncementsFacade);
    const http = TestBed.inject(HttpTestingController);
    const older = facade.loadArchive(1);
    const newer = facade.loadArchive(2);
    const rejected = expect(newer).rejects.toThrow('Failed to load article archive');
    http.expectOne('/api/v1/blog/announcements?page=2&pageSize=10')
      .flush({ message: 'untrusted upstream detail' }, { status: 500, statusText: 'Server Error' });
    await rejected;
    http.expectOne('/api/v1/blog/announcements?page=1&pageSize=10').flush(page(1));
    await older;
    expect(facade.archivePage()).toBeNull();
    expect(facade.archiveError()).toBe('Failed to load article archive');
    expect(facade.archiveIsLoading()).toBe(false);
    const retry = facade.loadArchive(2);
    expect(facade.archiveError()).toBeNull();
    expect(facade.archiveIsLoading()).toBe(true);
    http.expectOne('/api/v1/blog/announcements?page=2&pageSize=10').flush(page(2));
    await retry;
    expect(facade.archivePage()).toEqual(page(2));
  });

  it('keeps archive loading and categories failure/retry independent', async () => {
    const facade = TestBed.inject(AnnouncementsFacade);
    const http = TestBed.inject(HttpTestingController);
    const archive = facade.loadArchive(1);
    const categories = facade.loadCategories();
    const rejected = expect(categories).rejects.toThrow('Failed to load article categories');
    const failed = http.expectOne('/api/v1/blog/categories');
    expect(failed.request.method).toBe('GET');
    expect(failed.request.transferCache).toBe(false);
    failed.flush({}, { status: 500, statusText: 'Server Error' });
    await rejected;
    expect(facade.archiveIsLoading()).toBe(true);
    expect(facade.archiveError()).toBeNull();
    http.expectOne('/api/v1/blog/announcements?page=1&pageSize=10').flush(page(1));
    await archive;
    expect(facade.archivePage()).toEqual(page(1));
    expect(facade.categoriesError()).toBe('Failed to load article categories');
    const retry = facade.loadCategories();
    expect(facade.categoriesError()).toBeNull();
    http.expectOne('/api/v1/blog/categories').flush([article.category, 'Hardware']);
    await retry;
    expect(facade.categories()).toEqual([article.category, 'Hardware']);
    expect(facade.archivePage()).toEqual(page(1));
  });

  it('ignores a late categories failure after a newer categories success', async () => {
    const facade = TestBed.inject(AnnouncementsFacade);
    const http = TestBed.inject(HttpTestingController);
    const older = facade.loadCategories();
    const oldRequest = http.expectOne('/api/v1/blog/categories');
    const newer = facade.loadCategories();
    http.expectOne('/api/v1/blog/categories').flush(['Tech']);
    await newer;
    oldRequest.flush({}, { status: 500, statusText: 'Server Error' });
    await older;
    expect(facade.categories()).toEqual(['Tech']);
    expect(facade.categoriesError()).toBeNull();
  });

  it('does not replace home, owner or public-detail state', async () => {
    const facade = TestBed.inject(AnnouncementsFacade);
    const http = TestBed.inject(HttpTestingController);
    const home = facade.loadPublishedAnnouncements();
    http.expectOne('/api/v1/blog/announcements').flush({ items: [article] });
    await home;
    const owner = facade.loadMyAnnouncements();
    http.expectOne('/api/v1/announcement').flush([{ ...article, id: 8 }]);
    await owner;
    const detail = facade.loadPublicArticleById(9);
    http.expectOne('/api/v1/blog/announcements/9').flush({ ...article, id: 9 });
    await detail;
    const archive = facade.loadArchive(2);
    http.expectOne('/api/v1/blog/announcements?page=2&pageSize=10').flush(page(2));
    await archive;
    expect(facade.announcements()).toEqual([article]);
    expect(facade.ownerAnnouncements()[0].id).toBe(8);
    expect(facade.publicArticle()?.id).toBe(9);
    expect(facade.publicArticleStatus()).toBe('loaded');
    expect(facade.isLoading()).toBe(false);
    expect(facade.error()).toBeNull();
  });
});
