import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarComponent } from './navbar.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { AuthFacade } from '@blog/auth/data-access';
import { UiPreferencesService } from '@blog/shared/util';
import { TranslocoTestingModule } from '@ngneat/transloco';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let preferences: { language: ReturnType<typeof signal<'pl' | 'en'>>; theme: ReturnType<typeof signal<'dark' | 'light'>>; setLanguage: jest.Mock; toggleTheme: jest.Mock };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent, TranslocoTestingModule.forRoot({
        langs: { en: { preferences: { language: 'Language', polish: 'Polish', english: 'English', theme: 'Theme', dark: 'Dark', light: 'Light', switchLight: 'Use light theme', switchDark: 'Use dark theme' }, nav: { home: 'Home', projects: 'Projects', articles: 'Articles', recentArticles: 'Recent articles', hardware: 'Hardware', ai: 'AI', about: 'About me', login: 'Login', admin: 'Admin', logout: 'Log out', toggle: 'Toggle navigation' } } },
        translocoConfig: { availableLangs: ['en'], defaultLang: 'en' },
      })],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: UiPreferencesService,
          useValue: preferences = {
            language: signal<'pl' | 'en'>('pl'),
            theme: signal<'dark' | 'light'>('dark'),
            setLanguage: jest.fn(),
            toggleTheme: jest.fn(),
          },
        },
        {
          provide: AuthFacade,
          useValue: {
            isAuthenticated: signal(false),
            username: signal(''),
            logout: () => undefined,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('exposes persistent language and theme controls with current pressed state', () => {
    expect(fixture.nativeElement.querySelector('[aria-label="Polish"]').getAttribute('aria-pressed')).toBe('true');
    expect(fixture.nativeElement.querySelector('[aria-label="English"]').getAttribute('aria-pressed')).toBe('false');
    expect(fixture.nativeElement.querySelector('[aria-pressed="false"][aria-label="Use light theme"]')).toBeTruthy();

    fixture.nativeElement.querySelector('[aria-label="English"]').click();
    fixture.nativeElement.querySelector('[aria-label="Use light theme"]').click();
    expect(preferences.setLanguage).toHaveBeenCalledWith('en');
    expect(preferences.toggleTheme).toHaveBeenCalled();
  });
});
