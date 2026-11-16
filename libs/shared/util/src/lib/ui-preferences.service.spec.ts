import { DOCUMENT } from '@angular/common';
import { Component, PLATFORM_ID, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router, provideRouter } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { Subject, of } from 'rxjs';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { INITIAL_UI_LANGUAGE, LANGUAGE_STORAGE_KEY, THEME_STORAGE_KEY, UiPreferencesService, uiLanguage } from './ui-preferences.service';

@Component({ template: '' })
class PreferencesHostComponent {
  readonly preferences = inject(UiPreferencesService);
}

describe('UI preferences', () => {
  beforeEach(() => {
    history.replaceState(null, '', '/');
    localStorage.removeItem(LANGUAGE_STORAGE_KEY);
    localStorage.removeItem(THEME_STORAGE_KEY);
    document.documentElement.dataset['theme'] = 'dark';
  });
  afterEach(() => {
    jest.restoreAllMocks();
    history.replaceState(null, '', '/');
  });

  it.each([null, '', 'PL', 'de', 'english'])('defaults non-whitelisted language %s to Polish', (value) => {
    expect(uiLanguage(value)).toBe('pl');
  });

  it.each(['pl', 'en'] as const)('takes explicit URL %s before saved language', async (language) => {
    history.replaceState(null, '', `/?lang=${language}`);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language === 'pl' ? 'en' : 'pl');
    const preferences = TestBed.inject(UiPreferencesService);
    expect(preferences.language()).toBe(language);
    expect(document.documentElement.lang).toBe(language);
    const fixture = TestBed.createComponent(PreferencesHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(preferences.language()).toBe(language);
  });

  it('defaults SSR to Polish without reading browser storage', () => {
    history.replaceState(null, '', '/?lang=en');
    const storage = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    expect(TestBed.inject(UiPreferencesService).language()).toBe('pl');
    expect(storage).not.toHaveBeenCalled();
  });

  it('uses the per-render server provider and updates document language', () => {
    TestBed.configureTestingModule({ providers: [
      { provide: PLATFORM_ID, useValue: 'server' },
      { provide: INITIAL_UI_LANGUAGE, useValue: 'en' },
    ] });
    expect(TestBed.inject(UiPreferencesService).language()).toBe('en');
    expect(TestBed.inject(DOCUMENT).documentElement.lang).toBe('en');
  });

  it.each([false, true])('reads saved language only after the first render, blocked=%s', async (blocked) => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en');
    if (blocked) jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    const preferences = TestBed.inject(UiPreferencesService);
    expect(preferences.language()).toBe('pl');
    const fixture = TestBed.createComponent(PreferencesHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.preferences.language()).toBe(blocked ? 'pl' : 'en');
  });

  it('merges language into the current URL and preserves it on internal navigation', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const parser = TestBed.inject(Router);
    const events = new Subject<NavigationEnd>();
    const router = {
      url: '/recent-articles?page=3&category=Tech#list', events,
      parseUrl: parser.parseUrl.bind(parser), navigateByUrl: jest.fn().mockResolvedValue(true),
    };
    const transloco = { setActiveLang: jest.fn(), load: jest.fn(() => of({})) };
    const preferences = TestBed.inject(UiPreferencesService);
    await preferences.initialize(router as unknown as Router, transloco as unknown as TranslocoService);
    preferences.setLanguage('en');
    const url = router.navigateByUrl.mock.calls[0][0];
    expect(url.queryParams).toEqual({ page: '3', category: 'Tech', lang: 'en' });
    expect(url.fragment).toBe('list');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
    router.url = '/about-me';
    events.next(new NavigationEnd(1, router.url, router.url));
    expect(router.navigateByUrl.mock.calls[1][0].queryParams).toEqual({ lang: 'en' });
    router.url = '/about-me?lang=pl';
    events.next(new NavigationEnd(2, router.url, router.url));
    expect(preferences.language()).toBe('pl');
    expect(transloco.setActiveLang).toHaveBeenLastCalledWith('pl');
    expect(router.navigateByUrl).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['/about-me?category=Hardware#skills', '/about-me?category=Hardware&lang=en#skills'],
    ['/blog/1?page=2&category=Hardware#body', '/blog/1?page=2&category=Hardware&lang=en#body'],
  ])('preserves bare initial route %s while restoring saved language', async (initialUrl, expectedUrl) => {
    history.replaceState(null, '', initialUrl);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en');
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const parser = TestBed.inject(Router);
    const router = {
      url: '/', navigated: false, events: new Subject<NavigationEnd>(),
      parseUrl: parser.parseUrl.bind(parser), navigateByUrl: jest.fn().mockResolvedValue(true),
    };
    const transloco = { setActiveLang: jest.fn(), load: jest.fn(() => of({})) };
    const preferences = TestBed.inject(UiPreferencesService);
    expect(preferences.language()).toBe('pl');
    await preferences.initialize(router as unknown as Router, transloco as unknown as TranslocoService);
    const fixture = TestBed.createComponent(PreferencesHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(preferences.language()).toBe('en');
    expect(router.navigateByUrl).toHaveBeenCalledTimes(1);
    expect(parser.serializeUrl(router.navigateByUrl.mock.calls[0][0])).toBe(expectedUrl);
    expect(router.navigateByUrl.mock.calls[0][1]).toEqual({ replaceUrl: true });
  });

  it('uses the resolved router URL after initial navigation rather than the browser location', async () => {
    history.replaceState(null, '', '/about-me');
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const parser = TestBed.inject(Router);
    const router = {
      url: '/recent-articles?page=3#list', navigated: true, events: new Subject<NavigationEnd>(),
      parseUrl: parser.parseUrl.bind(parser), navigateByUrl: jest.fn().mockResolvedValue(true),
    };
    const transloco = { setActiveLang: jest.fn(), load: jest.fn(() => of({})) };
    const preferences = TestBed.inject(UiPreferencesService);
    await preferences.initialize(router as unknown as Router, transloco as unknown as TranslocoService);
    preferences.setLanguage('en');
    expect(parser.serializeUrl(router.navigateByUrl.mock.calls[0][0])).toBe('/recent-articles?page=3&lang=en#list');
  });

  it('adopts the pre-painted theme, persists changes and tolerates blocked storage', () => {
    document.documentElement.dataset['theme'] = 'light';
    const preferences = TestBed.inject(UiPreferencesService);
    expect(preferences.theme()).toBe('light');
    preferences.toggleTheme();
    expect(document.documentElement.dataset['theme']).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(() => { preferences.setLanguage('en'); preferences.setTheme('light'); }).not.toThrow();
    expect(preferences.language()).toBe('en');
    expect(preferences.theme()).toBe('light');
  });

  it('guards the pre-paint script against blocked storage and unrecognized themes', () => {
    const html = readFileSync(resolve(__dirname, '../../../../../apps/blog/src/index.html'), 'utf8');
    const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
    expect(script).toBeDefined();
    const run = new Function('localStorage', 'document', script!);
    const root = { documentElement: { dataset: { theme: 'dark' } } };
    expect(() => run({ getItem: () => { throw new Error('blocked'); } }, root)).not.toThrow();
    run({ getItem: () => 'invalid' }, root);
    expect(root.documentElement.dataset.theme).toBe('dark');
    run({ getItem: () => 'light' }, root);
    expect(root.documentElement.dataset.theme).toBe('light');
  });
});
