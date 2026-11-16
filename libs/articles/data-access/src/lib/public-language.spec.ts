import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AnnouncementDto } from '@blog/articles/entity';
import { API_URL, INITIAL_UI_LANGUAGE, UiPreferencesService } from '@blog/shared/util';
import { AnnouncementsFacade } from './announcements.facade';
import { AnnouncementService } from './services/announcement.service';

describe('public article language isolation', () => {
  const article: AnnouncementDto = {
    id: 1, title: 'Polski', text: 'Tekst', image: '', category: 'Tech', duration: '5', button: 'Czytaj',
    isPublished: true, publishedAt: null,
  };
  const page = (item: AnnouncementDto) => ({
    items: [item], page: 2, pageSize: 10, totalCount: 1, totalPages: 1, hasPrevious: true, hasNext: false,
  });
  beforeEach(() => TestBed.configureTestingModule({ providers: [
    provideHttpClient(), provideHttpClientTesting(), { provide: INITIAL_UI_LANGUAGE, useValue: 'pl' },
  ] }));
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it.each(['home', 'archive', 'detail'] as const)('rejects old-locale %s responses and clears visible public data', async (view) => {
    const facade = TestBed.inject(AnnouncementsFacade);
    const preferences = TestBed.inject(UiPreferencesService);
    const http = TestBed.inject(HttpTestingController);
    const load = () => view === 'home' ? facade.loadPublishedAnnouncements()
      : view === 'archive' ? facade.loadArchive(2, 'Tech') : facade.loadPublicArticleById(1);
    const payload = (item: AnnouncementDto) => view === 'detail' ? item : view === 'home' ? { items: [item] } : page(item);
    const older = load();
    const oldRequest = http.expectOne((request) => request.params.get('language') === 'pl');
    preferences.setLanguage('en');
    expect(facade.announcements()).toEqual([]);
    expect(facade.archivePage()).toBeNull();
    expect(facade.publicArticle()).toBeNull();
    const newer = load();
    const next = http.expectOne((request) => request.params.get('language') === 'en');
    if (view === 'archive') {
      expect(next.request.params.get('page')).toBe('2');
      expect(next.request.params.get('category')).toBe('Tech');
    }
    const english = { ...article, title: 'English', text: 'Body', button: 'Read' };
    next.flush(payload(english));
    await newer;
    oldRequest.flush(payload(article));
    await older;
    expect(view === 'home' ? facade.announcements()[0] : view === 'archive' ? facade.archivePage()?.items[0] : facade.publicArticle()).toEqual(english);
  });

  it('ignores the first Polish home request after a PL→EN→PL round trip', async () => {
    const facade = TestBed.inject(AnnouncementsFacade);
    const preferences = TestBed.inject(UiPreferencesService);
    const http = TestBed.inject(HttpTestingController);
    const first = facade.loadPublishedAnnouncements();
    const stale = http.expectOne((request) => request.params.get('language') === 'pl');
    preferences.setLanguage('en');
    preferences.setLanguage('pl');
    const latest = facade.loadPublishedAnnouncements();
    http.expectOne((request) => request.params.get('language') === 'pl').flush({ items: [{ ...article, title: 'Newest' }] });
    await latest;
    stale.flush({}, { status: 500, statusText: 'Error' });
    await first;
    expect(facade.announcements()[0].title).toBe('Newest');
    expect(facade.error()).toBeNull();
  });

  it('does not clear private owner data when the public language changes', async () => {
    const facade = TestBed.inject(AnnouncementsFacade);
    const pending = facade.loadMyAnnouncements();
    TestBed.inject(HttpTestingController).expectOne('/api/v1/announcement').flush([article]);
    await pending;
    TestBed.inject(UiPreferencesService).setLanguage('en');
    expect(facade.ownerAnnouncements()).toEqual([article]);
  });

  it('keeps shared category labels and accepts an in-flight category response across language changes', async () => {
    const facade = TestBed.inject(AnnouncementsFacade);
    const pending = facade.loadCategories();
    const request = TestBed.inject(HttpTestingController).expectOne('/api/v1/blog/categories?language=pl');
    TestBed.inject(UiPreferencesService).setLanguage('en');
    request.flush(['AI', 'Hardware']);
    await pending;
    expect(facade.categories()).toEqual(['AI', 'Hardware']);
  });

  it('uses the explicit SSR language with the internal API origin, not a browser URL', () => {
    TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });
    TestBed.overrideProvider(INITIAL_UI_LANGUAGE, { useValue: 'en' });
    TestBed.overrideProvider(API_URL, { useValue: 'http://127.0.0.1:18080' });
    TestBed.inject(AnnouncementService).getPublishedAnnouncementById(1).subscribe();
    TestBed.inject(HttpTestingController).expectOne('http://127.0.0.1:18080/api/v1/blog/announcements/1?language=en').flush(article);
  });
});
