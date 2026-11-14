import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AnnouncementsFacade } from './announcements.facade';
import { AnnouncementDto } from '@blog/articles/entity';

describe('public article detail', () => {
  const article: AnnouncementDto = { id: 1, title: 'Article', image: '', text: 'Body', category: 'Test', duration: '5', button: 'Read', isPublished: true, publishedAt: null };
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] }));
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('loads public detail and clears the previous article before the next request', async () => {
    const facade = TestBed.inject(AnnouncementsFacade);
    const http = TestBed.inject(HttpTestingController);
    expect(facade.publicArticleStatus()).toBe('idle');
    const first = facade.loadPublicArticleById(1);
    expect(facade.publicArticleStatus()).toBe('loading');
    const request = http.expectOne('/api/v1/blog/announcements/1');
    expect(request.request.method).toBe('GET');
    expect(request.request.transferCache).toBe(false);
    request.flush(article);
    await first;
    expect(facade.publicArticle()).toEqual(article);
    expect(facade.publicArticleStatus()).toBe('loaded');
    const second = facade.loadPublicArticleById(2);
    expect(facade.publicArticle()).toBeNull();
    expect(facade.publicArticleError()).toBeNull();
    http.expectOne('/api/v1/blog/announcements/2').flush({ ...article, id: 2 });
    await second;
    expect(facade.publicArticle()?.id).toBe(2);
    expect(facade.currentAnnouncement()).toBeNull();
    expect(facade.ownerAnnouncements()).toEqual([]);
    expect(facade.error()).toBeNull();
  });

  it('resolves a public 404 as not-found without a protected fallback', async () => {
    const facade = TestBed.inject(AnnouncementsFacade);
    const pending = facade.loadPublicArticleById(1);
    TestBed.inject(HttpTestingController).expectOne('/api/v1/blog/announcements/1')
      .flush({}, { status: 404, statusText: 'Not Found' });
    await expect(pending).resolves.toBeUndefined();
    expect(facade.publicArticle()).toBeNull();
    expect(facade.publicArticleStatus()).toBe('not-found');
    expect(facade.publicArticleError()).toBeNull();
  });

  it('rejects other failures with a safe message and clears that error on retry', async () => {
    const facade = TestBed.inject(AnnouncementsFacade);
    const http = TestBed.inject(HttpTestingController);
    const failed = facade.loadPublicArticleById(1);
    const rejected = expect(failed).rejects.toThrow('Failed to load article');
    http.expectOne('/api/v1/blog/announcements/1')
      .flush({ message: 'untrusted backend message' }, { status: 500, statusText: 'Server Error' });
    await rejected;
    expect(facade.publicArticleStatus()).toBe('error');
    expect(facade.publicArticleError()).toBe('Failed to load article');
    const retry = facade.loadPublicArticleById(2);
    expect(facade.publicArticleStatus()).toBe('loading');
    expect(facade.publicArticleError()).toBeNull();
    http.expectOne('/api/v1/blog/announcements/2').flush({ ...article, id: 2 });
    await retry;
    expect(facade.publicArticleStatus()).toBe('loaded');
  });

  it.each([200, 404, 500])('ignores an older response with status %s after the newer article loads', async (status) => {
    const facade = TestBed.inject(AnnouncementsFacade);
    const http = TestBed.inject(HttpTestingController);
    const older = facade.loadPublicArticleById(1);
    const newer = facade.loadPublicArticleById(2);
    const oldRequest = http.expectOne('/api/v1/blog/announcements/1');
    http.expectOne('/api/v1/blog/announcements/2').flush({ ...article, id: 2 });
    await newer;
    oldRequest.flush(article, { status, statusText: status === 200 ? 'OK' : 'Error' });
    await older;
    expect(facade.publicArticle()?.id).toBe(2);
    expect(facade.publicArticleStatus()).toBe('loaded');
    expect(facade.publicArticleError()).toBeNull();
  });

  it('does not let an older success overwrite a newer failure', async () => {
    const facade = TestBed.inject(AnnouncementsFacade);
    const http = TestBed.inject(HttpTestingController);
    const older = facade.loadPublicArticleById(1);
    const newer = facade.loadPublicArticleById(2);
    const rejected = expect(newer).rejects.toThrow('Failed to load article');
    http.expectOne('/api/v1/blog/announcements/2').flush({}, { status: 500, statusText: 'Server Error' });
    await rejected;
    http.expectOne('/api/v1/blog/announcements/1').flush(article);
    await older;
    expect(facade.publicArticle()).toBeNull();
    expect(facade.publicArticleStatus()).toBe('error');
    expect(facade.publicArticleError()).toBe('Failed to load article');
  });
});
