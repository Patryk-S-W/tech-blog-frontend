import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { Subject } from 'rxjs';
import { AnnouncementsFacade } from '@blog/articles/data-access';
import { AnnouncementDto } from '@blog/articles/entity';
import { SSR_RESPONSE_STATUS } from '@blog/shared/util';
import { ArticleDetailComponent } from './article-detail.component';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { DEFAULT_SITE_TITLE, PUBLIC_SITE_ORIGIN } from '@blog/shared/util';

describe('ArticleDetailComponent', () => {
  let fixture: ComponentFixture<ArticleDetailComponent>;
  let routeParams: Subject<ReturnType<typeof convertToParamMap>>;
  let responseStatus: { statusCode: number };
  let facade: {
    publicArticle: ReturnType<typeof signal<AnnouncementDto | null>>;
    publicArticleStatus: ReturnType<typeof signal<'idle' | 'loading' | 'loaded' | 'not-found' | 'error'>>;
    publicArticleError: ReturnType<typeof signal<string | null>>;
    loadPublicArticleById: jest.Mock<Promise<void>, [number]>;
  };
  const article: AnnouncementDto = {
    id: 12,
    title: 'A post',
    image: '',
    text: 'Body text',
    category: 'Tech',
    duration: '5 min',
    button: 'Read',
    isPublished: true,
    publishedAt: '2026-11-11T12:00:00Z',
  };

  beforeEach(async () => {
    routeParams = new Subject();
    responseStatus = { statusCode: 200 };
    facade = {
      publicArticle: signal(null),
      publicArticleStatus: signal('idle'),
      publicArticleError: signal(null),
      loadPublicArticleById: jest.fn().mockResolvedValue(undefined),
    };
    await TestBed.configureTestingModule({
      imports: [ArticleDetailComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: routeParams.asObservable() } },
        { provide: AnnouncementsFacade, useValue: facade },
        { provide: SSR_RESPONSE_STATUS, useValue: responseStatus },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ArticleDetailComponent);
  });

  function navigate(id: string): void {
    routeParams.next(convertToParamMap({ id }));
    fixture.detectChanges();
  }

  it('loads and renders a public article', async () => {
    facade.loadPublicArticleById.mockImplementation(async () => {
      facade.publicArticle.set(article);
      facade.publicArticleStatus.set('loaded');
    });
    navigate('12');
    await expect(facade.loadPublicArticleById.mock.results[0].value).resolves.toBeUndefined();
    fixture.detectChanges();
    expect(facade.loadPublicArticleById).toHaveBeenCalledWith(12);
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('A post');
    expect(fixture.nativeElement.querySelector('.article-body').textContent).toContain('Body text');
    expect(TestBed.inject(Title).getTitle()).toBe(`A post - ${DEFAULT_SITE_TITLE}`);
    expect(TestBed.inject(DOCUMENT).querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`${PUBLIC_SITE_ORIGIN}/blog/12`);
    expect(TestBed.inject(Meta).getTag('name="robots"')?.content).toBe('index, follow');
  });

  it('shows loading state', () => {
    facade.publicArticleStatus.set('loading');
    navigate('12');
    expect(fixture.nativeElement.querySelector('[role="status"]')).not.toBeNull();
  });

  it('shows not found for a completed 404', async () => {
    facade.loadPublicArticleById.mockImplementation(async () => {
      facade.publicArticleStatus.set('not-found');
    });
    navigate('404');
    await expect(facade.loadPublicArticleById.mock.results[0].value).resolves.toBeUndefined();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Article not found');
    expect(fixture.nativeElement.querySelector('a[routerLink="/recent-articles"]')).not.toBeNull();
    expect(responseStatus.statusCode).toBe(404);
    expect(TestBed.inject(Meta).getTag('name="robots"')?.content).toBe('noindex, follow');
  });

  it('offers retry after a request failure', async () => {
    facade.loadPublicArticleById.mockImplementationOnce(async () => {
      facade.publicArticleStatus.set('error');
      facade.publicArticleError.set('Please try again.');
      throw new Error('offline');
    });
    navigate('12');
    await expect(facade.loadPublicArticleById.mock.results[0].value).rejects.toThrow('offline');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button').textContent).toContain('Retry');
    expect(responseStatus.statusCode).toBe(500);
    expect(TestBed.inject(Meta).getTag('name="robots"')?.content).toBe('noindex, follow');
    fixture.componentInstance.retry();
    expect(facade.loadPublicArticleById).toHaveBeenCalledTimes(2);
    await expect(facade.loadPublicArticleById.mock.results[1].value).resolves.toBeUndefined();
  });

  it('renders invalid IDs as not found without a request', () => {
    navigate('0');
    expect(fixture.nativeElement.textContent).toContain('Article not found');
    expect(facade.loadPublicArticleById).not.toHaveBeenCalled();
    expect(responseStatus.statusCode).toBe(404);
  });

  it('does not apply an old request result to a locally invalid route', async () => {
    let rejectRequest!: (reason: Error) => void;
    facade.loadPublicArticleById.mockReturnValueOnce(new Promise((_, reject) => {
      rejectRequest = reject;
    }));
    navigate('12');
    navigate('0');
    rejectRequest(new Error('stale failure'));
    await expect(facade.loadPublicArticleById.mock.results[0].value).rejects.toThrow('stale failure');
    expect(fixture.nativeElement.textContent).toContain('Article not found');
    expect(responseStatus.statusCode).toBe(404);
  });

  it('keeps Markdown HTML under Angular sanitization', async () => {
    facade.loadPublicArticleById.mockImplementation(async () => {
      facade.publicArticle.set({ ...article, text: '<img src="x" onerror="alert(1)">' });
      facade.publicArticleStatus.set('loaded');
    });
    navigate('12');
    await expect(facade.loadPublicArticleById.mock.results[0].value).resolves.toBeUndefined();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.article-body img')?.getAttribute('onerror')).toBeNull();
  });

  it('removes previous article metadata while the next route loads and restores defaults on destruction', async () => {
    facade.loadPublicArticleById.mockImplementationOnce(async () => {
      facade.publicArticle.set(article);
      facade.publicArticleStatus.set('loaded');
    }).mockImplementationOnce(() => {
      facade.publicArticle.set(null);
      facade.publicArticleStatus.set('loading');
      return Promise.resolve();
    });
    navigate('12');
    await expect(facade.loadPublicArticleById.mock.results[0].value).resolves.toBeUndefined();
    fixture.detectChanges();
    navigate('13');
    expect(TestBed.inject(DOCUMENT).querySelector('link[rel="canonical"]')).toBeNull();
    expect(TestBed.inject(Meta).getTag('property="og:title"')).toBeNull();
    expect(TestBed.inject(Title).getTitle()).toBe(DEFAULT_SITE_TITLE);
    await expect(facade.loadPublicArticleById.mock.results[1].value).resolves.toBeUndefined();
    fixture.destroy();
    expect(TestBed.inject(Title).getTitle()).toBe(DEFAULT_SITE_TITLE);
    expect(TestBed.inject(Meta).getTag('name="robots"')).toBeNull();
  });
});
