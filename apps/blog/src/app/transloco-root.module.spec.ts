import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { TranslocoService } from '@ngneat/transloco';
import { firstValueFrom } from 'rxjs';
import { INITIAL_UI_LANGUAGE, UiPreferencesService } from '@blog/shared/util';
import { TranslocoHttpLoader, TranslocoRootModule } from './transloco-root.module';
import pl from '../assets/i18n/pl.json';
import en from '../assets/i18n/en.json';

describe('SSR translation initialization', () => {
  it.each(['pl', 'en'] as const)('preloads %s without relative HTTP requests', async (language) => {
    TestBed.configureTestingModule({
      imports: [TranslocoRootModule],
      providers: [provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: INITIAL_UI_LANGUAGE, useValue: language },
      ],
    });
    const translations = language === 'en' ? en : pl;
    const loader = TestBed.inject(TranslocoHttpLoader);
    expect(await firstValueFrom(loader.getTranslation(language))).toEqual(translations);
    const transloco = TestBed.inject(TranslocoService);
    await TestBed.inject(UiPreferencesService).initialize(TestBed.inject(Router), transloco);
    expect(transloco.getActiveLang()).toBe(language);
    expect(Object.keys(transloco.getTranslation(language)).length).toBeGreaterThan(0);
  });
});
