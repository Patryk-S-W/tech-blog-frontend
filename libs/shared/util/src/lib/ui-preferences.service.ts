import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { DestroyRef, Injectable, InjectionToken, PLATFORM_ID, afterNextRender, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { Subject, filter, firstValueFrom } from 'rxjs';

export type UiLanguage = 'pl' | 'en';
export type UiTheme = 'dark' | 'light';
export const LANGUAGE_STORAGE_KEY = 'blog-language';
export const THEME_STORAGE_KEY = 'blog-theme';

export function uiLanguage(value: string | null | undefined): UiLanguage {
  return value === 'en' ? 'en' : 'pl';
}

export const INITIAL_UI_LANGUAGE = new InjectionToken<UiLanguage>('INITIAL_UI_LANGUAGE', {
  providedIn: 'root',
  factory: () => isPlatformBrowser(inject(PLATFORM_ID))
    ? uiLanguage(new URLSearchParams(inject(DOCUMENT).defaultView?.location.search ?? '').get('lang'))
    : 'pl',
});

@Injectable({ providedIn: 'root' })
export class UiPreferencesService {
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly destroyRef = inject(DestroyRef);
  private readonly selectedLanguage = signal(inject(INITIAL_UI_LANGUAGE));
  private readonly selectedTheme = signal<UiTheme>(
    this.browser && this.document.documentElement.dataset['theme'] === 'light' ? 'light' : 'dark',
  );
  private readonly changes = new Subject<UiLanguage>();
  private router?: Router;
  private transloco?: TranslocoService;
  readonly language = this.selectedLanguage.asReadonly();
  readonly theme = this.selectedTheme.asReadonly();
  readonly languageChanges = this.changes.asObservable();

  constructor() {
    this.document.documentElement.lang = this.language();
    if (this.browser) this.document.documentElement.dataset['theme'] = this.theme();
    const explicitLanguage = new URLSearchParams(this.document.defaultView?.location.search ?? '').has('lang');
    afterNextRender(() => {
      if (explicitLanguage) return;
      try {
        const saved = this.document.defaultView?.localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (saved === 'pl' || saved === 'en') this.setLanguage(saved);
      } catch { /* Storage may be unavailable in privacy modes. */ }
    });
  }

  async initialize(router: Router, transloco: TranslocoService): Promise<void> {
    this.router = router;
    this.transloco = transloco;
    transloco.setActiveLang(this.language());
    if (this.browser) {
      router.events.pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      ).subscribe((event) => {
        const params = router.parseUrl(event.urlAfterRedirects).queryParams;
        if (params['lang'] !== undefined) this.applyLanguage(uiLanguage(params['lang']));
        else this.updateLanguageUrl(this.language());
      });
    }
    await firstValueFrom(transloco.load(this.language()));
  }

  setLanguage(language: UiLanguage): void {
    if (language !== 'pl' && language !== 'en') return;
    this.applyLanguage(language);
    this.persist(LANGUAGE_STORAGE_KEY, language);
    this.updateLanguageUrl(language);
  }

  setTheme(theme: UiTheme): void {
    if (theme !== 'dark' && theme !== 'light') return;
    this.selectedTheme.set(theme);
    if (this.browser) this.document.documentElement.dataset['theme'] = theme;
    this.persist(THEME_STORAGE_KEY, theme);
  }

  toggleTheme(): void { this.setTheme(this.theme() === 'dark' ? 'light' : 'dark'); }

  private applyLanguage(language: UiLanguage): void {
    this.document.documentElement.lang = language;
    this.transloco?.setActiveLang(language);
    if (this.language() === language) return;
    this.selectedLanguage.set(language);
    this.changes.next(language);
  }

  private updateLanguageUrl(language: UiLanguage): void {
    if (!this.browser || !this.router) return;
    const location = this.router.navigated === false ? this.document.defaultView?.location : undefined;
    const currentUrl = location ? `${location.pathname}${location.search}${location.hash}` : this.router.url;
    const url = this.router.parseUrl(currentUrl);
    if (url.queryParams['lang'] === language) return;
    url.queryParams = { ...url.queryParams, lang: language };
    void this.router.navigateByUrl(url, { replaceUrl: true }).catch(() => {});
  }

  private persist(key: string, value: string): void {
    if (!this.browser) return;
    try { this.document.defaultView?.localStorage.setItem(key, value); }
    catch { /* Storage may be unavailable in privacy modes. */ }
  }
}
