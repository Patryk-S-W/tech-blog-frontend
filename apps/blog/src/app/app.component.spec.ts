import { TestBed, waitForAsync } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthFacade } from '@blog/auth/data-access';
import { signal } from '@angular/core';
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
  });
});
