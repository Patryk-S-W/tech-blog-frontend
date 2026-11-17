import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, InjectionToken, PLATFORM_ID, afterNextRender, inject } from '@angular/core';
import { Router } from '@angular/router';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { TranslocoService } from '@ngneat/transloco';
import { Subject, firstValueFrom } from 'rxjs';

export type UiLanguage = 'pl' | 'en';
export type UiTheme = 'dark' | 'light';
export const LANGUAGE_STORAGE_KEY = 'blog-language';
export const THEME_STORAGE_KEY = 'blog-theme';

export function uiLanguage(value: string | null | undefined): UiLanguage {
  return value === 'en' ? 'en' : 'pl';
}

export const INITIAL_UI_LANGUAGE = new InjectionToken<UiLanguage>('INITIAL_UI_LANGUAGE', {
  providedIn: 'root',
  factory: () => 'pl',
});

const UiPreferencesState = signalStore(
  withState(() => ({
    language: inject(INITIAL_UI_LANGUAGE),
    theme: (isPlatformBrowser(inject(PLATFORM_ID)) &&
      inject(DOCUMENT).documentElement.dataset['theme'] === 'light' ? 'light' : 'dark') as UiTheme,
  })),
  withMethods((store) => ({
    updateLanguage(language: UiLanguage): void { patchState(store, { language }); },
    updateTheme(theme: UiTheme): void { patchState(store, { theme }); },
  })),
);

@Injectable({ providedIn: 'root' })
export class UiPreferencesService extends UiPreferencesState {
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly changes = new Subject<UiLanguage>();
  private transloco?: TranslocoService;
  readonly languageChanges = this.changes.asObservable();

  constructor() {
    super();
    this.document.documentElement.lang = this.language();
    if (this.browser) this.document.documentElement.dataset['theme'] = this.theme();
    afterNextRender(() => {
      try {
        const saved = this.document.defaultView?.localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (saved === 'pl' || saved === 'en') this.setLanguage(saved);
      } catch { /* Storage may be unavailable in privacy modes. */ }
    });
  }

  async initialize(_router: Router, transloco: TranslocoService): Promise<void> {
    this.transloco = transloco;
    transloco.setActiveLang(this.language());
    await firstValueFrom(transloco.load(this.language()));
  }

  setLanguage(language: UiLanguage): void {
    if (language !== 'pl' && language !== 'en') return;
    this.applyLanguage(language);
    this.persist(LANGUAGE_STORAGE_KEY, language);
  }

  setTheme(theme: UiTheme): void {
    if (theme !== 'dark' && theme !== 'light') return;
    this.updateTheme(theme);
    if (this.browser) this.document.documentElement.dataset['theme'] = theme;
    this.persist(THEME_STORAGE_KEY, theme);
  }

  toggleTheme(): void { this.setTheme(this.theme() === 'dark' ? 'light' : 'dark'); }

  private applyLanguage(language: UiLanguage): void {
    this.document.documentElement.lang = language;
    this.transloco?.setActiveLang(language);
    if (this.language() === language) return;
    this.updateLanguage(language);
    this.changes.next(language);
  }

  private persist(key: string, value: string): void {
    if (!this.browser) return;
    try { this.document.defaultView?.localStorage.setItem(key, value); }
    catch { /* Storage may be unavailable in privacy modes. */ }
  }
}
