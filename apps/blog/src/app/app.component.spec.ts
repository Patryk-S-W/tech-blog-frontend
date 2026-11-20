import { TestBed, waitForAsync } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthFacade } from '@blog/auth/data-access';
import { AnnouncementsFacade } from '@blog/articles/data-access';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NavbarComponent } from '@blog/shell/layout';
import { TranslocoTestingModule } from '@ngneat/transloco';

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AppComponent, TranslocoTestingModule.forRoot({
        langs: { en: { nav: { home: 'Home', projects: 'Projects', articles: 'Articles' }, footer: { social: 'Social media', copyright: 'Copyright' } } },
        translocoConfig: { availableLangs: ['en'], defaultLang: 'en' }, preloadLangs: true,
      })],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AnnouncementsFacade, useValue: { categories: signal(['Hardware']), loadCategories: jest.fn().mockResolvedValue(undefined) } },
        {
          provide: AuthFacade,
          useValue: { isAuthenticated: signal(false), username: signal('') },
        },
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
    fixture.detectChanges();
    expect(TestBed.inject(AnnouncementsFacade).loadCategories).toHaveBeenCalledTimes(1);
    expect(app.categories()).toEqual(['Hardware']);
    expect(fixture.debugElement.query(By.directive(NavbarComponent)).componentInstance.categories()).toEqual(['Hardware']);
  });
});
